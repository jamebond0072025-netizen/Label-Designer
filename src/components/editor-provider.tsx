
'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import type { fabric as FabricType } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import { SaveTemplateDialog } from './save-template-dialog';

type CanvasHistory = {
    json: string;
};

type AddObjectType = 
  | 'rect' | 'circle' 
  | 'placeholder-text' | 'static-text'
  | 'placeholder-image' | 'static-image'
  | 'barcode';

interface EditorContextType {
  canvas: FabricType.Canvas | null;
  activeObject: FabricType.Object | null;
  canvasObjects: FabricType.Object[];
  initCanvas: (el: HTMLCanvasElement, container: HTMLDivElement) => void;
  addObject: (type: AddObjectType) => void;
  updateObject: (id: string, properties: any) => void;
  updateObjectInRealTime: (id: string, properties: any) => void;
  deleteActiveObject: () => void;
  fabric: typeof FabricType | null;
  saveAsJson: () => void;
  loadFromJson: () => void;
  exportAsPng: () => void;
  exportAsJpg: () => void;
  exportAsPdf: () => void;
  bringForward: () => void;
  sendBackwards: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  setActiveObjectById: (id: string) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  setCanvasSize: (width: number, height: number) => void;
  setCanvasBackgroundColor: (color: string) => void;
  setCanvasBackgroundImage: (url: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  alignLeft: () => void;
  alignCenterHorizontal: () => void;
  alignRight: () => void;
  alignTop: () => void;
  alignCenterVertical: () => void;
  alignBottom: () => void;
  jsonData: string;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

const CUSTOM_PROPS = ['id', 'name', 'objectType', 'barcodeValue', 'isPlaceholder', 'borderRadius'];

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<FabricType.Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<FabricType.Object | null>(null);
  const [fabric, setFabric] = useState<typeof FabricType | null>(null);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [canvasObjects, setCanvasObjects] = useState<FabricType.Object[]>([]);
  const [zoom, setZoom] = useState(1);
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [jsonData, setJsonData] = useState('{}');

  // History state
  const [history, setHistory] = useState<CanvasHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isRecordingHistory = useRef(true);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;


  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('fabric').then((fabricModule) => {
        setFabric(fabricModule.fabric);
      });
    }
  }, []);
  
  const saveHistory = useCallback((canvasInstance: FabricType.Canvas) => {
    if (!isRecordingHistory.current) return;
    
    const json = JSON.stringify(canvasInstance.toJSON(CUSTOM_PROPS));
    const newHistory = history.slice(0, historyIndex + 1);
    
    // If the new state is the same as the last one, don't add it
    if (newHistory.length > 0 && newHistory[newHistory.length - 1].json === json) {
        return;
    }
    
    const historyEntry: CanvasHistory = { json };
    newHistory.push(historyEntry);

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const updateJsonData = (canvasInstance: FabricType.Canvas) => {
    const data: Record<string, any> = {};
    canvasInstance.getObjects().forEach(obj => {
        if (obj.get('isPlaceholder') && obj.name) {
            const key = obj.name;
            if (obj.get('objectType') === 'barcode') {
                 data[key] = obj.get('barcodeValue') || '123456789';
            } else if (obj.type === 'image') {
                data[key] = 'https://example.com/image.png';
            } else {
                data[key] = 'Sample Text';
            }
        }
    });
    setJsonData(JSON.stringify(data, null, 2));
  };
  
  const updateCanvasObjects = useCallback((canvasInstance: FabricType.Canvas) => {
    const objects = canvasInstance.getObjects().map(obj => {
        if (!obj.id) {
            obj.id = uuidv4();
        }
        return obj;
    });
    setCanvasObjects([...objects]);
    updateJsonData(canvasInstance);
  }, []);

  const fitToScreen = useCallback(() => {
    if (!canvas || !fabric || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth - 32;
    const containerHeight = container.clientHeight - 32;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    if (canvasWidth === 0 || canvasHeight === 0) return;

    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const newZoom = Math.min(scaleX, scaleY);

    setZoom(newZoom);
    canvas.setZoom(newZoom);

    const vpt = canvas.viewportTransform;
    if (vpt) {
        vpt[4] = (container.clientWidth - canvasWidth * newZoom) / 2;
        vpt[5] = (container.clientHeight - canvasHeight * newZoom) / 2;
        canvas.setViewportTransform(vpt);
    }

    canvas.renderAll();
  }, [canvas, fabric]);

  const initCanvas = useCallback((el: HTMLCanvasElement, container: HTMLDivElement) => {
    if (!fabric) return;
    
    containerRef.current = container;
    
    if(canvas) {
        canvas.dispose();
    }

    const canvasInstance = new fabric.Canvas(el, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      selection: true,
      defaultCursor: 'default',
      // Panning state
      isDragging: false,
      lastPosX: 0,
      lastPosY: 0,
    });
    
    setCanvas(canvasInstance);
    updateCanvasObjects(canvasInstance);

    const updateSelection = (e: FabricType.IEvent) => {
      setActiveObject(canvasInstance.getActiveObject() || null);
    };
    
    const onObjectModified = (e: FabricType.IEvent) => {
        setActiveObject(e.target || null);
        saveHistory(canvasInstance);
        updateCanvasObjects(canvasInstance);
    };

    const onObjectAddedOrRemoved = () => {
        saveHistory(canvasInstance);
        updateCanvasObjects(canvasInstance);
    }

    const onMouseDown = (opt: FabricType.IEvent) => {
        const e = opt.e;
        if (e.altKey === true) {
            canvasInstance.isDragging = true;
            canvasInstance.selection = false;
            canvasInstance.lastPosX = e.clientX;
            canvasInstance.lastPosY = e.clientY;
            canvasInstance.setCursor('grabbing');
        }
    }

    const onMouseMove = (opt: FabricType.IEvent) => {
        if (canvasInstance.isDragging) {
            const e = opt.e;
            const vpt = canvasInstance.viewportTransform;
            if (vpt) {
                vpt[4] += e.clientX - canvasInstance.lastPosX;
                vpt[5] += e.clientY - canvasInstance.lastPosY;
                canvasInstance.requestRenderAll();
                canvasInstance.lastPosX = e.clientX;
                canvasInstance.lastPosY = e.clientY;
            }
        }
    }

    const onMouseUp = () => {
        if (canvasInstance.isDragging) {
            canvasInstance.setViewportTransform(canvasInstance.viewportTransform!);
            canvasInstance.isDragging = false;
            canvasInstance.selection = true;
            canvasInstance.setCursor('default');
            canvasInstance.renderAll();
        }
    }
    
    setHistory([]);
    setHistoryIndex(-1);
    saveHistory(canvasInstance);

    canvasInstance.on('selection:created', updateSelection);
    canvasInstance.on('selection:updated', updateSelection);
    canvasInstance.on('selection:cleared', updateSelection);
    canvasInstance.on('object:modified', onObjectModified);
    canvasInstance.on('object:added', onObjectAddedOrRemoved);
    canvasInstance.on('object:removed', onObjectAddedOrRemoved);
    canvasInstance.on('mouse:down', onMouseDown);
    canvasInstance.on('mouse:move', onMouseMove);
    canvasInstance.on('mouse:up', onMouseUp);
    
    return () => {
        canvasInstance.off('selection:created', updateSelection);
        canvasInstance.off('selection:updated', updateSelection);
        canvasInstance.off('selection:cleared', updateSelection);
        canvasInstance.off('object:modified', onObjectModified);
        canvasInstance.off('object:added', onObjectAddedOrRemoved);
        canvasInstance.off('object:removed', onObjectAddedOrRemoved);
        canvasInstance.off('mouse:down', onMouseDown);
        canvasInstance.off('mouse:move', onMouseMove);
        canvasInstance.off('mouse:up', onMouseUp);
        canvasInstance.dispose();
    }

  }, [fabric, updateCanvasObjects, canvas, saveHistory]);

  const addObject = useCallback((type: AddObjectType) => {
    if (!canvas || !fabric) {
      toast({
        title: "Editor not ready",
        description: "The canvas or fabric library is not initialized yet.",
        variant: "destructive"
      });
      return;
    };
    let obj;
    
    const getUniqueKey = (base: string) => {
        const existingKeys = canvas.getObjects().map(o => o.name);
        let i = 1;
        while(existingKeys.includes(`${base}-${i}`)) {
            i++;
        }
        return `${base}-${i}`;
    }

    const commonProps = { id: uuidv4() };

    switch (type) {
      case 'rect':
        obj = new fabric.Rect({ ...commonProps, name: 'Rectangle', left: 50, top: 50, width: 100, height: 50, fill: '#F9A825' });
        break;
      case 'circle':
        obj = new fabric.Circle({ ...commonProps, name: 'Circle', left: 50, top: 50, radius: 40, fill: '#29ABE2' });
        break;
      case 'placeholder-text':
        const textKey = getUniqueKey('text');
        obj = new fabric.Textbox(`{{${textKey}}}`, { ...commonProps, name: textKey, left: 50, top: 50, width: 150, fontSize: 20, isPlaceholder: true });
        break;
      case 'static-text':
        obj = new fabric.Textbox('Static Text', { ...commonProps, name: 'Static Text', left: 50, top: 50, width: 150, fontSize: 20, isPlaceholder: false });
        break;
      case 'placeholder-image':
        const imageKey = getUniqueKey('image');
        fabric.Image.fromURL('https://placehold.co/400x300/EFEFEF/AAAAAA?text=Placeholder', (img) => {
            img.set({ ...commonProps, name: imageKey, left: 50, top: 50, isPlaceholder: true, stroke: '#000000', strokeWidth: 1 });
            img.scaleToWidth(200);
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
        return;
       case 'static-image':
        fabric.Image.fromURL('https://placehold.co/400x300/EFEFEF/AAAAAA?text=Static+Image', (img) => {
            img.set({ ...commonProps, name: 'Static Image', left: 50, top: 50, isPlaceholder: false, stroke: '#000000', strokeWidth: 1 });
            img.scaleToWidth(200);
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
        return;
      case 'barcode':
        const barcodeValue = '1234567890';
        const barcodeKey = getUniqueKey('barcode');
        const barcodeCanvas = document.createElement('canvas');
        try {
            JsBarcode(barcodeCanvas, barcodeValue, {
              format: 'CODE128',
              displayValue: true,
              fontSize: 20
            });
            const dataUrl = barcodeCanvas.toDataURL('image/png');
            fabric.Image.fromURL(dataUrl, (img) => {
                img.set({
                    ...commonProps,
                    name: barcodeKey,
                    left: 50,
                    top: 50,
                    objectType: 'barcode', // Custom property
                    barcodeValue: barcodeValue,
                    isPlaceholder: true,
                });
                img.scaleToWidth(200);
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
            });
        } catch (e) {
            console.error(e);
            toast({
                title: "Failed to create barcode",
                variant: "destructive"
            });
        }
        return;
    }

    if (obj) {
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  }, [canvas, fabric, toast]);

  const applyObjectProperties = useCallback((obj: FabricType.Object, properties: any) => {
    if (!fabric) return;
    
    if (properties.borderRadius !== undefined && obj.type === 'image') {
        const image = obj as FabricType.Image;
        const radius = properties.borderRadius;
        image.set('borderRadius', radius); // Store for state management
        
        if (radius > 0) {
            image.clipPath = new fabric.Rect({
                left: -image.width! / 2,
                top: -image.height! / 2,
                rx: radius / image.scaleX!,
                ry: radius / image.scaleY!,
                width: image.width,
                height: image.height,
            });
        } else {
            image.clipPath = undefined;
        }
        delete properties.borderRadius;
    }
    
    obj.set(properties);
    
    if (properties.width !== undefined) {
        obj.scaleToWidth(properties.width);
    }
    if (properties.height !== undefined) {
        obj.scaleToHeight(properties.height);
    }
  }, [fabric]);


  const updateObjectInRealTime = useCallback((id: string, properties: any) => {
      if (!canvas) return;
      const obj = canvas.getObjects().find((o) => o.id === id);
      if (obj) {
          applyObjectProperties(obj, properties);
          canvas.renderAll();
      }
  }, [canvas, applyObjectProperties]);

 const updateObject = useCallback((id: string, properties: any) => {
    if (!canvas || !fabric) return;
    const obj = canvas.getObjects().find((o) => o.id === id);
    if (obj) {
        if (properties.name && obj.get('isPlaceholder')) {
            const newKey = properties.name;
            const isNameTaken = canvas.getObjects().some(o => o.name === newKey && o.id !== id);
            
            if(isNameTaken) {
                toast({ title: "Key already exists", description: "Please use a unique key for each placeholder.", variant: "destructive" });
                canvas.setActiveObject(obj);
                canvas.renderAll();
                return;
            }

            if (obj.type === 'textbox') {
                (obj as FabricType.Textbox).set('text', `{{${newKey}}}`);
            }
        }

      if (obj.get('objectType') === 'barcode' && properties.barcodeValue) {
        const barcodeCanvas = document.createElement('canvas');
         try {
            JsBarcode(barcodeCanvas, properties.barcodeValue, {
              format: 'CODE128',
              displayValue: true,
              fontSize: 20
            });
            const dataUrl = barcodeCanvas.toDataURL('image/png');
            (obj as FabricType.Image).setSrc(dataUrl, () => {
                obj.set(properties);
                saveHistory(canvas);
                updateCanvasObjects(canvas);
                canvas.setActiveObject(obj);
                canvas.renderAll();
            }, { crossOrigin: 'anonymous' });
         } catch(e) {
            console.error(e);
            toast({ title: "Invalid barcode data", variant: "destructive" });
         }
      } else {
        applyObjectProperties(obj, properties);
        saveHistory(canvas);
        updateCanvasObjects(canvas);
        canvas.setActiveObject(obj);
        canvas.renderAll();
      }
    }
  }, [canvas, fabric, toast, updateCanvasObjects, saveHistory, applyObjectProperties]);
  
  const deleteActiveObject = useCallback(() => {
    if (!canvas || !activeObject) return;
    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setActiveObject(null);
  }, [canvas, activeObject]);

  const handleSave = useCallback((templateName: string) => {
    if (!canvas || !fabric) return;
    
    // Include background image in the JSON
    const backgroundImage = canvas.backgroundImage;
    let backgroundImageJSON = null;
    if (backgroundImage && backgroundImage instanceof fabric.Image) {
        backgroundImageJSON = backgroundImage.toJSON(CUSTOM_PROPS);
    }

    const data = {
        canvas: canvas.toJSON(CUSTOM_PROPS),
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        backgroundColor: canvas.backgroundColor,
        backgroundImage: backgroundImageJSON,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Template Saved!", description: `Saved as ${templateName}.json` });
    setSaveDialogOpen(false);
  }, [canvas, fabric, toast]);

  const saveAsJson = () => {
    setSaveDialogOpen(true);
  }

  const loadFromJson = useCallback(() => {
    if (!canvas || !fabric) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const jsonString = event.target?.result as string;
        const data = JSON.parse(jsonString);

        isRecordingHistory.current = false;
        
        canvas.setDimensions({ width: data.width, height: data.height });
        canvas.backgroundColor = data.backgroundColor;
        
        const loadCanvas = () => {
            canvas.loadFromJSON(data.canvas, () => {
              canvas.renderAll();
              updateCanvasObjects(canvas);
              canvas.getObjects().forEach(obj => {
                if (obj.get('objectType') === 'barcode') {
                  updateObject(obj.id!, { barcodeValue: obj.get('barcodeValue') });
                }
                if (obj.type === 'image' && obj.get('borderRadius')) {
                  updateObject(obj.id!, { borderRadius: obj.get('borderRadius') });
                }
              });
              isRecordingHistory.current = true;
              saveHistory(canvas);
              fitToScreen();
              toast({ title: "Template Loaded!" });
            }, (o: any, object: FabricType.Object) => {
                if (object.type === 'image' && o.borderRadius > 0) {
                    const image = object as FabricType.Image;
                    image.clipPath = new fabric.Rect({
                        left: -image.width! / 2,
                        top: -image.height! / 2,
                        rx: o.borderRadius / image.scaleX!,
                        ry: o.borderRadius / image.scaleY!,
                        width: image.width,
                        height: image.height,
                    });
                }
            });
        };

        // Load background image first if it exists
        if (data.backgroundImage) {
            fabric.Image.fromObject(data.backgroundImage).then(img => {
                canvas.setBackgroundImage(img, loadCanvas, {
                    scaleX: data.width / (img.width || 1),
                    scaleY: data.height / (img.height || 1),
                });
            }).catch(e => {
                console.error("Error loading background image", e);
                loadCanvas(); // Proceed even if bg image fails
            });
        } else {
            canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
            loadCanvas();
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [canvas, fabric, toast, updateObject, updateCanvasObjects, saveHistory, fitToScreen]);
  
  const loadFromHistory = useCallback((entry: CanvasHistory) => {
    if (!canvas) return;
    isRecordingHistory.current = false;
    canvas.loadFromJSON(entry.json, () => {
        canvas.renderAll();
        updateCanvasObjects(canvas);
        isRecordingHistory.current = true;
    });
  }, [canvas, updateCanvasObjects]);

  const undo = useCallback(() => {
    if (canUndo) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        loadFromHistory(history[newIndex]);
    }
  }, [canUndo, history, historyIndex, loadFromHistory]);

  const redo = useCallback(() => {
    if (canRedo) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        loadFromHistory(history[newIndex]);
    }
  }, [canRedo, history, historyIndex, loadFromHistory]);

  const exportCanvas = (format: 'png' | 'jpeg' | 'pdf') => {
    if (!canvas) return;

    const currentZoom = canvas.getZoom();
    const currentVpt = canvas.viewportTransform;

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    
    const dataUrl = canvas.toDataURL({
      format: format === 'pdf' ? 'png' : format,
      quality: 1,
      multiplier: 2
    });

    if (currentVpt) {
      canvas.setZoom(currentZoom);
      canvas.setViewportTransform(currentVpt);
      canvas.renderAll();
    }
    
    if (format === 'pdf') {
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('label-design.pdf');
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `label-design.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    toast({ title: `Exported as ${format.toUpperCase()}!` });
  };
  
  const bringForward = useCallback(() => {
    if (!canvas || !activeObject) return;
    canvas.bringForward(activeObject);
    canvas.renderAll();
    saveHistory(canvas);
    updateCanvasObjects(canvas);
  }, [canvas, activeObject, updateCanvasObjects, saveHistory]);

  const sendBackwards = useCallback(() => {
    if (!canvas || !activeObject) return;
    canvas.sendBackwards(activeObject);
    canvas.renderAll();
    saveHistory(canvas);
    updateCanvasObjects(canvas);
  }, [canvas, activeObject, updateCanvasObjects, saveHistory]);
  
  const bringToFront = useCallback(() => {
    if (!canvas || !activeObject) return;
    canvas.bringToFront(activeObject);
    canvas.renderAll();
    saveHistory(canvas);
    updateCanvasObjects(canvas);
  }, [canvas, activeObject, updateCanvasObjects, saveHistory]);

  const sendToBack = useCallback(() => {
    if (!canvas || !activeObject) return;
    canvas.sendToBack(activeObject);
    canvas.renderAll();
    saveHistory(canvas);
    updateCanvasObjects(canvas);
  }, [canvas, activeObject, updateCanvasObjects, saveHistory]);

  const toggleVisibility = useCallback((id: string) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => o.id === id);
    if (obj) {
      obj.set({ visible: !obj.visible });
      canvas.renderAll();
      saveHistory(canvas);
      updateCanvasObjects(canvas);
    }
  }, [canvas, updateCanvasObjects, saveHistory]);

  const toggleLock = useCallback((id: string) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => o.id === id);
    if (obj) {
      obj.set({
        lockMovementX: !obj.lockMovementX,
        lockMovementY: !obj.lockMovementY,
        lockRotation: !obj.lockRotation,
        lockScalingX: !obj.lockScalingX,
        lockScalingY: !obj.lockScalingY,
      });
      canvas.renderAll();
      saveHistory(canvas);
      updateCanvasObjects(canvas);
    }
  }, [canvas, updateCanvasObjects, saveHistory]);

  const setActiveObjectById = useCallback((id: string) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => o.id === id);
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  }, [canvas]);

  const zoomIn = () => {
    if (!canvas) return;
    const newZoom = Math.min(zoom * 1.1, 5);
    setZoom(newZoom);
    canvas.setZoom(newZoom);
    canvas.renderAll();
  };
  
  const zoomOut = () => {
    if (!canvas) return;
    const newZoom = Math.max(zoom * 0.9, 0.1);
    setZoom(newZoom);
    canvas.setZoom(newZoom);
    canvas.renderAll();
  };
  
  const setCanvasSize = useCallback((width: number, height: number) => {
    if (canvas) {
      canvas.setDimensions({ width, height });
      fitToScreen();
      canvas.renderAll();
      saveHistory(canvas);
      updateCanvasObjects(canvas);
    }
  }, [canvas, updateCanvasObjects, fitToScreen, saveHistory]);
  
  const setCanvasBackgroundColor = useCallback((color: string) => {
    if (canvas) {
      canvas.backgroundColor = color;
      canvas.renderAll();
      saveHistory(canvas);
      setCanvas(Object.create(canvas));
    }
  }, [canvas, saveHistory]);

  const setCanvasBackgroundImage = useCallback((url: string) => {
    if (!canvas || !fabric) return;
    if (!url) {
      canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
      saveHistory(canvas);
      return;
    }
    fabric.Image.fromURL(url, (img) => {
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width ? canvas.width / (img.width || 1) : 1,
        scaleY: canvas.height ? canvas.height / (img.height || 1) : 1,
      });
      saveHistory(canvas);
    }, { crossOrigin: 'anonymous' });
  }, [canvas, fabric, saveHistory]);
  
  const alignActiveObject = (alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
    if (!canvas || !activeObject) return;

    const obj = activeObject;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const objWidth = obj.getScaledWidth();
    const objHeight = obj.getScaledHeight();

    switch(alignment) {
        case 'left':
            obj.set({ left: 0 });
            break;
        case 'center-h':
            obj.set({ left: (canvasWidth - objWidth) / 2 });
            break;
        case 'right':
            obj.set({ left: canvasWidth - objWidth });
            break;
        case 'top':
            obj.set({ top: 0 });
            break;
        case 'center-v':
            obj.set({ top: (canvasHeight - objHeight) / 2 });
            break;
        case 'bottom':
            obj.set({ top: canvasHeight - objHeight });
            break;
    }
    obj.setCoords();
    canvas.renderAll();
    saveHistory(canvas);
  };

  const alignLeft = () => alignActiveObject('left');
  const alignCenterHorizontal = () => alignActiveObject('center-h');
  const alignRight = () => alignActiveObject('right');
  const alignTop = () => alignActiveObject('top');
  const alignCenterVertical = () => alignActiveObject('center-v');
  const alignBottom = () => alignActiveObject('bottom');

  const exportAsPng = () => exportCanvas('png');
  const exportAsJpg = () => exportCanvas('jpeg');
  const exportAsPdf = () => exportCanvas('pdf');

  const value = {
    canvas,
    activeObject,
    canvasObjects,
    initCanvas,
    addObject,
    updateObject,
    updateObjectInRealTime,
    deleteActiveObject,
    fabric,
    saveAsJson,
    loadFromJson,
    exportAsPng,
    exportAsJpg,
    exportAsPdf,
    bringForward: () => bringForward(),
    sendBackwards: () => sendBackwards(),
    bringToFront,
    sendToBack,
    toggleVisibility,
    toggleLock,
    setActiveObjectById,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    fitToScreen,
    setCanvasSize,
    setCanvasBackgroundColor,
    setCanvasBackgroundImage,
    undo,
    redo,
    canUndo,
    canRedo,
    alignLeft,
    alignCenterHorizontal,
    alignRight,
    alignTop,
    alignCenterVertical,
    alignBottom,
    jsonData,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
      <SaveTemplateDialog 
        isOpen={isSaveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSave}
      />
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

    

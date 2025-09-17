
'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { fabric as FabricType } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import { SaveTemplateDialog } from './save-template-dialog';

interface EditorContextType {
  canvas: FabricType.Canvas | null;
  activeObject: FabricType.Object | null;
  canvasObjects: FabricType.Object[];
  initCanvas: (el: HTMLCanvasElement) => void;
  addObject: (type: 'rect' | 'circle' | 'textbox' | 'image' | 'barcode') => void;
  updateObject: (id: string, properties: any) => void;
  deleteActiveObject: () => void;
  fabric: typeof FabricType | null;
  saveAsJson: () => void;
  loadFromJson: () => void;
  exportAsPng: () => void;
  exportAsJpg: () => void;
  exportAsPdf: () => void;
  applyJsonData: (jsonData: string) => void;
  bringForward: (id: string) => void;
  sendBackwards: (id: string) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  setActiveObjectById: (id: string) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  zoomIn: () => void;
  zoomOut: () => void;
  setCanvasSize: (width: number, height: number) => void;
  setCanvasBackgroundColor: (color: string) => void;
  setCanvasBackgroundImage: (url: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<FabricType.Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<FabricType.Object | null>(null);
  const [fabric, setFabric] = useState<typeof FabricType | null>(null);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [canvasObjects, setCanvasObjects] = useState<FabricType.Object[]>([]);
  const [zoom, setZoom] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('fabric').then((fabricModule) => {
        setFabric(fabricModule.fabric);
      });
    }
  }, []);

  const updateCanvasObjects = useCallback((canvasInstance: FabricType.Canvas) => {
    const objects = canvasInstance.getObjects().map(obj => {
        // Assign a unique ID if it doesn't have one
        if (!obj.id) {
            obj.id = uuidv4();
        }
        return obj;
    });
    setCanvasObjects([...objects]);
  }, []);

  const initCanvas = useCallback((el: HTMLCanvasElement) => {
    if (!fabric) return;
    
    // Dispose existing canvas if it exists
    if(canvas) {
        canvas.dispose();
    }

    const parent = el.parentElement;
    const canvasInstance = new fabric.Canvas(el, {
      width: parent?.clientWidth || 800,
      height: parent?.clientHeight || 600,
      backgroundColor: '#fff'
    });
    
    setCanvas(canvasInstance);
    updateCanvasObjects(canvasInstance);

    const updateSelection = (e: FabricType.IEvent) => {
      setActiveObject(canvasInstance.getActiveObject() || null);
    };
    
    const onObjectModified = (e: FabricType.IEvent) => {
        setActiveObject(e.target || null);
        updateCanvasObjects(canvasInstance);
    };

    const onObjectAddedOrRemoved = () => {
        updateCanvasObjects(canvasInstance);
    }

    canvasInstance.on('selection:created', updateSelection);
    canvasInstance.on('selection:updated', updateSelection);
    canvasInstance.on('selection:cleared', updateSelection);
    canvasInstance.on('object:modified', onObjectModified);
    canvasInstance.on('object:added', onObjectAddedOrRemoved);
    canvasInstance.on('object:removed', onObjectAddedOrRemoved);
    
     // Add sample objects for demonstration
    const rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'red',
        width: 200,
        height: 100,
    });
    canvasInstance.add(rect);

    const text = new fabric.Textbox('Hello world', {
        left: 350,
        top: 150,
        width: 150,
        fontSize: 20
    });
    canvasInstance.add(text);


    return () => {
        canvasInstance.off('selection:created', updateSelection);
        canvasInstance.off('selection:updated', updateSelection);
        canvasInstance.off('selection:cleared', updateSelection);
        canvasInstance.off('object:modified', onObjectModified);
        canvasInstance.off('object:added', onObjectAddedOrRemoved);
        canvasInstance.off('object:removed', onObjectAddedOrRemoved);
        canvasInstance.dispose();
    }

  }, [fabric, updateCanvasObjects, canvas]);

  const addObject = useCallback((type: 'rect' | 'circle' | 'textbox' | 'image' | 'barcode') => {
    if (!canvas || !fabric) {
      toast({
        title: "Editor not ready",
        description: "The canvas or fabric library is not initialized yet.",
        variant: "destructive"
      });
      return;
    };
    let obj;
    const existingKeys = canvas.getObjects().map(o => o.name);
    let i = 1;
    while(existingKeys.includes(`${type}-${i}`)) {
      i++;
    }
    const defaultKey = `${type}-${i}`;

    const commonProps = { name: defaultKey, id: uuidv4() };

    switch (type) {
      case 'rect':
        obj = new fabric.Rect({ ...commonProps, left: 50, top: 50, width: 100, height: 50, fill: '#F9A825' });
        break;
      case 'circle':
        obj = new fabric.Circle({ ...commonProps, left: 50, top: 50, radius: 40, fill: '#29ABE2' });
        break;
      case 'textbox':
        obj = new fabric.Textbox('New Text', { ...commonProps, left: 50, top: 50, width: 150, fontSize: 20 });
        break;
      case 'image':
        fabric.Image.fromURL('https://picsum.photos/seed/product/400/300', (img) => {
            img.set({ ...commonProps, left: 50, top: 50 });
            img.scaleToWidth(200);
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
        return;
      case 'barcode':
        const barcodeValue = '1234567890';
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
                    left: 50,
                    top: 50,
                    objectType: 'barcode', // Custom property
                    barcodeValue: barcodeValue
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

 const updateObject = useCallback((id: string, properties: any) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => o.id === id);
    if (obj) {
        if (obj.name !== properties.name && properties.name) {
            const isNameTaken = canvas.getObjects().some(o => o.name === properties.name && o.id !== id);
            if(isNameTaken) {
                toast({ title: "Key already exists", description: "Please use a unique key for each element.", variant: "destructive" });
                // Revert the name in the UI
                setActiveObject(null);
                setActiveObject(obj);
                return;
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
                canvas.renderAll();
                updateCanvasObjects(canvas);
                setActiveObject(null);
                setActiveObject(obj);
            }, { crossOrigin: 'anonymous' });
         } catch(e) {
            console.error(e);
            toast({ title: "Invalid barcode data", variant: "destructive" });
         }
      } else {
        obj.set(properties);

        if (properties.width !== undefined) {
            obj.scaleToWidth(properties.width);
        }
        if (properties.height !== undefined) {
            obj.scaleToHeight(properties.height);
        }
        
        canvas.renderAll();
        updateCanvasObjects(canvas);
        setActiveObject(null);
        setActiveObject(obj);
      }
    }
  }, [canvas, toast, updateCanvasObjects]);
  
  const deleteActiveObject = useCallback(() => {
    if (!canvas || !activeObject) return;
    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setActiveObject(null);
  }, [canvas, activeObject]);

  const handleSave = useCallback((templateName: string) => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON(['id', 'name', 'objectType', 'barcodeValue']));
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
  }, [canvas, toast]);

  const saveAsJson = () => {
    setSaveDialogOpen(true);
  }

  const loadFromJson = useCallback(() => {
    if (!canvas) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result as string;
        canvas.loadFromJSON(json, () => {
          canvas.renderAll();
          updateCanvasObjects(canvas);
          canvas.getObjects().forEach(obj => {
            if (obj.get('objectType') === 'barcode') {
              updateObject(obj.id!, { barcodeValue: obj.get('barcodeValue') });
            }
          });
          toast({ title: "Template Loaded!" });
        });
      };
      reader.readAsText(file);
    };
    input.click();
  }, [canvas, toast, updateObject, updateCanvasObjects]);

  const exportCanvas = (format: 'png' | 'jpeg' | 'pdf') => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: format === 'pdf' ? 'png' : format,
      quality: 1,
      multiplier: 2
    });

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

  const applyJsonData = useCallback((jsonData: string) => {
    if (!canvas) return;
    try {
      const data = JSON.parse(jsonData);
      canvas.getObjects().forEach(obj => {
        const key = obj.name;
        if (key && data[key]) {
          const value = data[key];
          let properties: { [key: string]: any } = {};

          if (typeof value === 'string') {
            switch(obj.type) {
                case 'textbox':
                    properties.text = value;
                    break;
                case 'image':
                    if (obj.get('objectType') === 'barcode') {
                        properties.barcodeValue = value;
                    } else {
                        (obj as FabricType.Image).setSrc(value, () => canvas.renderAll(), { crossOrigin: 'anonymous' });
                    }
                    break;
            }
          } else if (typeof value === 'object' && value !== null) {
              properties = value;
          }

          if (Object.keys(properties).length > 0) {
            updateObject(obj.id!, properties);
          }
        }
      });
      toast({ title: "Data Applied Successfully!" });
    } catch (error) {
      console.error("Failed to parse or apply JSON data", error);
      toast({
        title: "Invalid JSON",
        description: "Could not apply the data. Please check the JSON format.",
        variant: "destructive",
      });
    }
  }, [canvas, updateObject, toast]);

  const bringForward = useCallback((id: string) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => o.id === id);
    if (obj) {
      canvas.bringForward(obj);
      canvas.renderAll();
      updateCanvasObjects(canvas);
    }
  }, [canvas, updateCanvasObjects]);

  const sendBackwards = useCallback((id: string) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => o.id === id);
    if (obj) {
      canvas.sendBackwards(obj);
      canvas.renderAll();
      updateCanvasObjects(canvas);
    }
  }, [canvas, updateCanvasObjects]);

  const toggleVisibility = useCallback((id: string) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => o.id === id);
    if (obj) {
      obj.set({ visible: !obj.visible });
      canvas.renderAll();
      updateCanvasObjects(canvas);
    }
  }, [canvas, updateCanvasObjects]);

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
      updateCanvasObjects(canvas);
    }
  }, [canvas, updateCanvasObjects]);

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
      canvas.renderAll();
      updateCanvasObjects(canvas);
    }
  }, [canvas, updateCanvasObjects]);
  
  const setCanvasBackgroundColor = useCallback((color: string) => {
    if (canvas) {
      canvas.backgroundColor = color;
      canvas.renderAll();
       setCanvas(Object.create(canvas));
    }
  }, [canvas]);

  const setCanvasBackgroundImage = useCallback((url: string) => {
    if (!canvas || !fabric) return;
    if (!url) {
      canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
      return;
    }
    fabric.Image.fromURL(url, (img) => {
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width ? canvas.width / (img.width || 1) : 1,
        scaleY: canvas.height ? canvas.height / (img.height || 1) : 1,
      });
    }, { crossOrigin: 'anonymous' });
  }, [canvas, fabric]);

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
    deleteActiveObject,
    fabric,
    saveAsJson,
    loadFromJson,
    exportAsPng,
    exportAsJpg,
    exportAsPdf,
    applyJsonData,
    bringForward,
    sendBackwards,
    toggleVisibility,
    toggleLock,
    setActiveObjectById,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    setCanvasSize,
    setCanvasBackgroundColor,
    setCanvasBackgroundImage,
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

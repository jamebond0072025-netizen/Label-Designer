
'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import type { fabric as FabricType } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import { SaveTemplateDialog } from './save-template-dialog';
import { PrintPreviewDialog, PrintSettings } from './print-preview-dialog';

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
  deleteActiveObject: () => void;
  fabric: typeof FabricType | null;
  saveAsJson: () => void;
  loadFromJson: () => void;
  exportAsPng: () => void;
  exportAsJpg: () => void;
  exportAsPdf: () => void;
  exportBulkPdf: (jsonData: string, settings: Omit<PrintSettings, 'scale'> & { scale: number }) => void;
  applyJsonData: (jsonData: string) => void;
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
  setJsonData: React.Dispatch<React.SetStateAction<string>>;
  bulkJsonData: string;
  setBulkJsonData: React.Dispatch<React.SetStateAction<string>>;
  openPrintPreview: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

const CUSTOM_PROPS = ['id', 'name', 'objectType', 'barcodeValue', 'isPlaceholder'];

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<FabricType.Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<FabricType.Object | null>(null);
  const [fabric, setFabric] = useState<typeof FabricType | null>(null);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isPrintPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [canvasObjects, setCanvasObjects] = useState<FabricType.Object[]>([]);
  const [zoom, setZoom] = useState(1);
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [jsonData, setJsonData] = useState('{}');
  const [bulkJsonData, setBulkJsonData] = useState('[]');

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

  const updateCanvasObjects = useCallback((canvasInstance: FabricType.Canvas) => {
    const objects = canvasInstance.getObjects().map(obj => {
        if (!obj.id) {
            obj.id = uuidv4();
        }
        return obj;
    });
    setCanvasObjects([...objects]);
  }, []);

  const initCanvas = useCallback((el: HTMLCanvasElement, container: HTMLDivElement) => {
    if (!fabric) return;
    
    containerRef.current = container;
    
    if(canvas) {
        canvas.dispose();
    }

    const canvasInstance = new fabric.Canvas(el, {
      width: 800,
      height: 600,
      backgroundColor: '#fff',
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

    const updateJsonForNewPlaceholder = (key: string, type: 'text' | 'image' | 'barcode') => {
        const defaultValue = type === 'image' ? 'https://picsum.photos/seed/new/400/300' 
                             : type === 'barcode' ? '123456789'
                             : 'New Value';

        try {
            // Update single JSON
            const singleData = JSON.parse(jsonData);
            singleData[key] = defaultValue;
            setJsonData(JSON.stringify(singleData, null, 2));

            // Update bulk JSON
            const bulkData = JSON.parse(bulkJsonData);
            if (Array.isArray(bulkData) && bulkData.length > 0) {
                bulkData.forEach(item => {
                    item[key] = defaultValue;
                });
                setBulkJsonData(JSON.stringify(bulkData, null, 2));
            } else {
                 const newBulkData = [{ [key]: defaultValue }];
                 setBulkJsonData(JSON.stringify(newBulkData, null, 2));
            }
        } catch (e) {
            console.error("Failed to update JSON for new placeholder:", e);
        }
    };

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
        updateJsonForNewPlaceholder(textKey, 'text');
        break;
      case 'static-text':
        obj = new fabric.Textbox('Static Text', { ...commonProps, name: 'Static Text', left: 50, top: 50, width: 150, fontSize: 20, isPlaceholder: false });
        break;
      case 'placeholder-image':
        const imageKey = getUniqueKey('image');
        fabric.Image.fromURL('https://picsum.photos/seed/product/400/300', (img) => {
            img.set({ ...commonProps, name: imageKey, left: 50, top: 50, isPlaceholder: true });
            img.scaleToWidth(200);
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            updateJsonForNewPlaceholder(imageKey, 'image');
        }, { crossOrigin: 'anonymous' });
        return;
       case 'static-image':
        fabric.Image.fromURL('https://picsum.photos/seed/static/400/300', (img) => {
            img.set({ ...commonProps, name: 'Static Image', left: 50, top: 50, isPlaceholder: false });
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
                updateJsonForNewPlaceholder(barcodeKey, 'barcode');
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
  }, [canvas, fabric, toast, jsonData, bulkJsonData]);

 const updateObject = useCallback((id: string, properties: any) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => o.id === id);
    if (obj) {
        // If the key (name) is being changed for a placeholder
        if (properties.name && obj.get('isPlaceholder')) {
            const oldKey = obj.name;
            const newKey = properties.name;
            const isNameTaken = canvas.getObjects().some(o => o.name === newKey && o.id !== id);
            
            if(isNameTaken) {
                toast({ title: "Key already exists", description: "Please use a unique key for each placeholder.", variant: "destructive" });
                // Force a re-render of properties panel to show the original value
                setActiveObject(null);
                setActiveObject(obj);
                return;
            }
            
            // Update the JSON keys
            const updateJsonKey = (jsonString: string) => {
                try {
                    const data = JSON.parse(jsonString);
                    if (Array.isArray(data)) {
                        data.forEach(item => {
                            if (item.hasOwnProperty(oldKey)) {
                                item[newKey] = item[oldKey];
                                delete item[oldKey];
                            }
                        });
                    } else if (typeof data === 'object' && data !== null) {
                        if (data.hasOwnProperty(oldKey)) {
                            data[newKey] = data[oldKey];
                            delete data[oldKey];
                        }
                    }
                    return JSON.stringify(data, null, 2);
                } catch (e) {
                    console.error("Failed to update JSON key:", e);
                    return jsonString; // Return original on error
                }
            };

            setJsonData(updateJsonKey(jsonData));
            setBulkJsonData(updateJsonKey(bulkJsonData));

            // If it's a textbox, update the text to match the new key
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
                canvas.renderAll();
                saveHistory(canvas);
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
        saveHistory(canvas);
        updateCanvasObjects(canvas);
        setActiveObject(null);
        setActiveObject(obj);
      }
    }
  }, [canvas, toast, updateCanvasObjects, saveHistory, jsonData, bulkJsonData]);
  
  const deleteActiveObject = useCallback(() => {
    if (!canvas || !activeObject) return;
    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setActiveObject(null);
  }, [canvas, activeObject]);

  const handleSave = useCallback((templateName: string) => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON(CUSTOM_PROPS));
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
        isRecordingHistory.current = false;
        canvas.loadFromJSON(json, () => {
          canvas.renderAll();
          updateCanvasObjects(canvas);
          canvas.getObjects().forEach(obj => {
            if (obj.get('objectType') === 'barcode') {
              updateObject(obj.id!, { barcodeValue: obj.get('barcodeValue') });
            }
          });
          isRecordingHistory.current = true;
          saveHistory(canvas);
          toast({ title: "Template Loaded!" });
        });
      };
      reader.readAsText(file);
    };
    input.click();
  }, [canvas, toast, updateObject, updateCanvasObjects, saveHistory]);
  
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

    // Save current state
    const currentZoom = canvas.getZoom();
    const currentVpt = canvas.viewportTransform;

    // Reset zoom and viewport for export
    fitToScreen();


    const dataUrl = canvas.toDataURL({
      format: format === 'pdf' ? 'png' : format,
      quality: 1,
      multiplier: 2 // Export at 2x resolution for better quality
    });

    // Restore canvas state
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

  const _applyDataToCanvas = async (canvasInstance: FabricType.Canvas, data: Record<string, any>) => {
    const objects = canvasInstance.getObjects();
    for (const obj of objects) {
      const key = obj.name;
      if (key && obj.get('isPlaceholder') && data[key]) {
        const value = data[key];

        await new Promise<void>((resolve) => {
          if (typeof value === 'string') {
            switch (obj.type) {
              case 'textbox':
                const textbox = obj as FabricType.Textbox;
                textbox.set('text', value);
                // Make the textbox fit the new content
                if (textbox.width) {
                  textbox.set({ width: textbox.getMinWidth() });
                  textbox.setCoords();
                }
                resolve();
                break;
              case 'image':
                if (obj.get('objectType') === 'barcode') {
                  const barcodeCanvas = document.createElement('canvas');
                  try {
                    JsBarcode(barcodeCanvas, value, { format: 'CODE128', displayValue: true, fontSize: 20 });
                    (obj as FabricType.Image).setSrc(barcodeCanvas.toDataURL('image/png'), () => {
                      (obj as FabricType.Image).set('barcodeValue', value);
                      canvasInstance.renderAll();
                      resolve();
                    }, { crossOrigin: 'anonymous' });
                  } catch (e) {
                    console.error("Error generating barcode", e);
                    resolve();
                  }
                } else {
                  (obj as FabricType.Image).setSrc(value, () => {
                    canvasInstance.renderAll();
                    resolve();
                  }, { crossOrigin: 'anonymous' });
                }
                break;
              default:
                resolve();
            }
          } else if (typeof value === 'object' && value !== null) {
            obj.set(value);
            resolve();
          } else {
            resolve();
          }
        });
      }
    }
    canvasInstance.renderAll();
  };
  
  const applyJsonData = useCallback(async (jsonData: string) => {
    if (!canvas) return;
    try {
      const data = JSON.parse(jsonData);
      await _applyDataToCanvas(canvas, data);
      saveHistory(canvas);
      updateCanvasObjects(canvas);
      toast({ title: "Data Applied Successfully!" });
    } catch (error) {
      console.error("Failed to parse or apply JSON data", error);
      toast({
        title: "Invalid JSON",
        description: "Could not apply the data. Please check the JSON format.",
        variant: "destructive",
      });
    }
  }, [canvas, updateCanvasObjects, toast, saveHistory]);

  const exportBulkPdf = useCallback(async (jsonData: string, settings: Omit<PrintSettings, 'scale'> & { scale: number }) => {
    if (!canvas || !fabric) return;
    setPrintPreviewOpen(false);

    let dataArray;
    try {
        const parsedData = JSON.parse(jsonData);
        if (!Array.isArray(parsedData)) {
            throw new Error("JSON data is not an array.");
        }
        dataArray = parsedData;
    } catch (error: any) {
        toast({ title: "Invalid JSON Array", description: error.message, variant: "destructive" });
        return;
    }

    toast({ title: "Generating PDF...", description: `Processing ${dataArray.length} labels.` });

    const originalJson = canvas.toJSON(CUSTOM_PROPS);
    const initialLabelWidth = canvas.getWidth();
    const initialLabelHeight = canvas.getHeight();
    
    if (initialLabelWidth <= 0 || initialLabelHeight <= 0) {
        toast({ title: "Invalid Label Size", description: "Cannot export with zero width or height.", variant: "destructive" });
        return;
    }

    // A4 dimensions in pixels at 96 DPI
    const A4_WIDTH = 794;
    const A4_HEIGHT = 1122;
    const pageContentWidth = A4_WIDTH - settings.marginLeft - settings.marginRight;
    const pageContentHeight = A4_HEIGHT - settings.marginTop - settings.marginBottom;
    
    const labelWidth = initialLabelWidth * settings.scale;
    const labelHeight = initialLabelHeight * settings.scale;

    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4'
    });
    
    if (labelWidth <= 0 || labelHeight <= 0) {
        toast({ title: "Invalid Scaled Label Size", description: "Label dimensions after scaling are invalid.", variant: "destructive" });
        return;
    }
    
    const labelsPerRow = Math.floor((pageContentWidth + settings.spacingHorizontal) / (labelWidth + settings.spacingHorizontal));
    const labelsPerCol = Math.floor((pageContentHeight + settings.spacingVertical) / (labelHeight + settings.spacingVertical));
    
    if (labelsPerRow === 0 || labelsPerCol === 0) {
        toast({ title: "Label Too Large", description: "The label is too large to fit on an A4 page even after scaling.", variant: "destructive" });
        return;
    }
    const labelsPerPage = labelsPerRow * labelsPerCol;

    // Create a temporary canvas to do the rendering
    const tempCanvasEl = document.createElement('canvas');
    const tempCanvas = new fabric.Canvas(tempCanvasEl, {
        width: initialLabelWidth,
        height: initialLabelHeight,
    });
    
    let labelCount = 0;
    for (let i = 0; i < dataArray.length; i++) {
        const data = dataArray[i];
        
        if (i > 0 && i % labelsPerPage === 0) {
            pdf.addPage();
        }
        
        // Load the template
        await new Promise<void>(resolve => tempCanvas.loadFromJSON(originalJson, () => resolve()));
        
        // Apply data
        await _applyDataToCanvas(tempCanvas, data);

        // Add to PDF
        const dataUrl = tempCanvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
        
        const indexOnPage = i % labelsPerPage;
        const row = Math.floor(indexOnPage / labelsPerRow);
        const col = indexOnPage % labelsPerRow;

        const x = settings.marginLeft + col * (labelWidth + settings.spacingHorizontal);
        const y = settings.marginTop + row * (labelHeight + settings.spacingVertical);

        pdf.addImage(dataUrl, 'PNG', x, y, labelWidth, labelHeight);
        labelCount++;
    }
    
    pdf.save('bulk-labels.pdf');
    toast({ title: "PDF Generated!", description: `Your bulk labels PDF with ${labelCount} labels has been downloaded.` });

  }, [canvas, fabric, toast]);

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

    // Center the viewport
    const vpt = canvas.viewportTransform;
    if (vpt) {
        vpt[4] = (container.clientWidth - canvasWidth * newZoom) / 2;
        vpt[5] = (container.clientHeight - canvasHeight * newZoom) / 2;
        canvas.setViewportTransform(vpt);
    }

    canvas.renderAll();
  }, [canvas, fabric]);

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

  const openPrintPreview = () => {
    setPrintPreviewOpen(true);
  };

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
    exportBulkPdf,
    applyJsonData,
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
    setJsonData,
    bulkJsonData,
    setBulkJsonData,
    openPrintPreview,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
      <SaveTemplateDialog 
        isOpen={isSaveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSave}
      />
      <PrintPreviewDialog
        isOpen={isPrintPreviewOpen}
        onClose={() => setPrintPreviewOpen(false)}
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

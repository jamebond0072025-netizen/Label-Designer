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
  initCanvas: (canvas: FabricType.Canvas) => void;
  addObject: (type: 'rect' | 'circle' | 'textbox' | 'image' | 'barcode') => void;
  updateObject: (id: string, properties: any) => void;
  deleteActiveObject: () => void;
  fabric: typeof FabricType | null;
  saveAsJson: () => void;
  loadFromJson: () => void;
  exportAsPng: () => void;
  exportAsJpg: () => void;
  exportAsPdf: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<FabricType.Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<FabricType.Object | null>(null);
  const [fabric, setFabric] = useState<typeof FabricType | null>(null);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('fabric').then((fabricModule) => {
        setFabric(fabricModule.fabric);
      });
    }
  }, []);

  const initCanvas = useCallback((canvasInstance: FabricType.Canvas) => {
    setCanvas(canvasInstance);

    const updateSelection = (e: FabricType.IEvent) => {
      setActiveObject(canvasInstance.getActiveObject() || null);
    };

    canvasInstance.on('selection:created', updateSelection);
    canvasInstance.on('selection:updated', updateSelection);
    canvasInstance.on('selection:cleared', updateSelection);
    canvasInstance.on('object:modified', updateSelection);

  }, []);

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
    const commonProps = { name: uuidv4() };

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
    const obj = canvas.getObjects().find((o) => o.name === id);
    if (obj) {
      
      // Handle special case for barcode regeneration
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
                obj.set(properties); // set other props too
                canvas.renderAll();
            }, { crossOrigin: 'anonymous' });
         } catch(e) {
            console.error(e);
         }
      } else {
        obj.set(properties);

        if (properties.width !== undefined && obj.width) {
            obj.scaleX = properties.width / obj.width;
        }
        if (properties.height !== undefined && obj.height) {
            obj.scaleY = properties.height / obj.height;
        }
        
        canvas.renderAll();
      }
    }
  }, [canvas]);

  const deleteActiveObject = useCallback(() => {
    if (!canvas || !activeObject) return;
    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setActiveObject(null);
  }, [canvas, activeObject]);


  const handleSave = useCallback((templateName: string) => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON(['name', 'objectType', 'barcodeValue']));
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
          // Re-render barcode objects if any, as they might not load correctly from JSON
          canvas.getObjects().forEach(obj => {
            if (obj.get('objectType') === 'barcode') {
              updateObject(obj.name!, { barcodeValue: obj.get('barcodeValue') });
            }
          });
          toast({ title: "Template Loaded!" });
        });
      };
      reader.readAsText(file);
    };
    input.click();
  }, [canvas, toast, updateObject]);

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

  const exportAsPng = () => exportCanvas('png');
  const exportAsJpg = () => exportCanvas('jpeg');
  const exportAsPdf = () => exportCanvas('pdf');

  const value = {
    canvas,
    activeObject,
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

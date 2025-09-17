'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { fabric as FabricType } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface EditorContextType {
  canvas: FabricType.Canvas | null;
  activeObject: FabricType.Object | null;
  initCanvas: (canvas: FabricType.Canvas) => void;
  addObject: (type: 'rect' | 'circle' | 'textbox' | 'image' | 'barcode') => void;
  updateObject: (id: string, properties: any) => void;
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
  const { toast } = useToast();

  useEffect(() => {
    // Dynamically import fabric on the client side only
    if (typeof window !== 'undefined') {
      import('fabric').then((fabricModule) => {
        setFabric(fabricModule.fabric);
      });
    }
  }, []);

  const initCanvas = useCallback((canvasInstance: FabricType.Canvas) => {
    setCanvas(canvasInstance);

    canvasInstance.on('selection:created', (e) => {
      setActiveObject(e.selected?.[0] || null);
    });
    canvasInstance.on('selection:updated', (e) => {
      setActiveObject(e.selected?.[0] || null);
    });
    canvasInstance.on('selection:cleared', () => {
      setActiveObject(null);
    });
    canvasInstance.on('object:modified', (e) => {
        if (e.target) {
            setActiveObject(null); // Force re-render of properties panel
            setActiveObject(e.target);
        }
    });

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
        // Add a placeholder image
        fabric.Image.fromURL('https://picsum.photos/seed/product/400/300', (img) => {
            img.set({ ...commonProps, left: 50, top: 50 });
            img.scaleToWidth(200);
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        });
        return;
      case 'barcode':
        toast({
            title: "Coming Soon!",
            description: `Adding ${type} objects is not yet implemented.`,
        });
        return;
    }

    if (obj) {
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  }, [canvas, fabric, toast]);

  const updateObject = useCallback((id: string, properties: any) => {
    if (!canvas || !activeObject) return;

    // Find the object on the canvas by its unique ID (name)
    const obj = canvas.getObjects().find((o) => o.name === id);
    if (obj) {
      obj.set(properties);
      
      // Manually adjust width/height for scaling if that's what's being set
      if (properties.width !== undefined && obj.width) {
          obj.scaleX = properties.width / obj.width;
      }
      if (properties.height !== undefined && obj.height) {
          obj.scaleY = properties.height / obj.height;
      }

      canvas.renderAll();
      // Force a re-render of the properties panel by resetting the active object state
      setActiveObject(null);
      setActiveObject(obj);
    }
  }, [canvas, activeObject]);

  const saveAsJson = useCallback(() => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON(['name']));
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'label-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Template Saved!" });
  }, [canvas, toast]);

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
          toast({ title: "Template Loaded!" });
        });
      };
      reader.readAsText(file);
    };
    input.click();
  }, [canvas, toast]);

  const exportCanvas = (format: 'png' | 'jpeg' | 'pdf') => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: format === 'pdf' ? 'png' : format,
      quality: 1,
      multiplier: 2 // for better quality
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
    fabric,
    saveAsJson,
    loadFromJson,
    exportAsPng,
    exportAsJpg,
    exportAsPdf,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

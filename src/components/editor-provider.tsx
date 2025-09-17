'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';


interface EditorContextType {
  canvas: fabric.Canvas | null;
  activeObject: fabric.Object | null;
  initCanvas: (canvas: fabric.Canvas) => void;
  addObject: (type: 'rect' | 'circle' | 'textbox' | 'image' | 'barcode') => void;
  updateObject: (id: string, properties: any) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);

  const initCanvas = useCallback((canvasInstance: fabric.Canvas) => {
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
    if (!canvas) return;
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
    }

    if (obj) {
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  }, [canvas]);

  const updateObject = useCallback((id: string, properties: any) => {
    if (!canvas || !activeObject) return;

    // Find the object on the canvas by its unique ID (name)
    const obj = canvas.getObjects().find((o) => o.name === id);
    if (obj) {
      obj.set(properties);
      
      // Manually adjust width/height for scaling if that's what's being set
      if (properties.width !== undefined) {
          obj.scaleX = properties.width / (obj.width ?? 1);
      }
      if (properties.height !== undefined) {
          obj.scaleY = properties.height / (obj.height ?? 1);
      }

      canvas.renderAll();
      // Force a re-render of the properties panel by resetting the active object state
      setActiveObject(null);
      setActiveObject(obj);
    }
  }, [canvas, activeObject]);

  const value = {
    canvas,
    activeObject,
    initCanvas,
    addObject,
    updateObject
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

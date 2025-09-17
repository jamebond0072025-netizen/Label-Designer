'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useEditor } from '../editor-provider';
import { Skeleton } from '../ui/skeleton';

export function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { initCanvas, canvas, fabric } = useEditor();

  const handleResize = useCallback(() => {
    if (canvas && canvasRef.current) {
      const container = canvasRef.current.parentElement;
      if (container) {
        canvas.setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
        canvas.renderAll();
      }
    }
  }, [canvas]);


  useEffect(() => {
    if (canvasRef.current && fabric) {
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: canvasRef.current.parentElement?.clientWidth || 800,
            height: canvasRef.current.parentElement?.clientHeight || 600,
            backgroundColor: '#fff',
        });
        initCanvas(fabricCanvas);
        
        // Add sample objects for demonstration
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            fill: 'red',
            width: 200,
            height: 100,
        });
        fabricCanvas.add(rect);

        const text = new fabric.Textbox('Hello world', {
            left: 350,
            top: 150,
            width: 150,
            fontSize: 20
        });
        fabricCanvas.add(text);

        return () => {
            fabricCanvas.dispose();
        };
    }
  }, [initCanvas, fabric]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  if (!fabric) {
    return <Skeleton className="w-full h-full" />;
  }

  return <canvas ref={canvasRef} />;
}

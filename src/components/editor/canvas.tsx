'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useEditor } from '../editor-provider';

export function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { initCanvas, canvas } = useEditor();

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      initCanvas(canvasRef.current);
    }
  }, [canvasRef, initCanvas, canvas]);
  
  // This effect ensures that if the canvas instance is ever disposed of and recreated,
  // the ref is passed to the provider again.
  useEffect(() => {
      if (canvasRef.current && canvas && canvas.getElement() !== canvasRef.current) {
          initCanvas(canvasRef.current);
      }
  }, [canvas, initCanvas]);


  return <canvas ref={canvasRef} />;
}

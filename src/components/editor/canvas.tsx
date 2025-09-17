
'use client';

import { useRef, useEffect } from 'react';
import { useEditor } from '../editor-provider';

export function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { initCanvas, canvas } = useEditor();

  useEffect(() => {
    if (canvasRef.current && containerRef.current && !canvas) {
      initCanvas(canvasRef.current, containerRef.current);
    }
  }, [canvasRef, containerRef, initCanvas, canvas]);
  
  useEffect(() => {
      if (canvasRef.current && containerRef.current && canvas && canvas.getElement() !== canvasRef.current) {
          initCanvas(canvasRef.current, containerRef.current);
      }
  }, [canvas, initCanvas]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} />
    </div>
  );
}

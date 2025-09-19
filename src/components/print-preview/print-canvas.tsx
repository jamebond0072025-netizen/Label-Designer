
'use client';

import { useRef, useEffect } from 'react';
import { usePrintPreview } from '../print-preview-provider';

export function PrintCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { initCanvas, canvas } = usePrintPreview();

  useEffect(() => {
    if (canvasRef.current && containerRef.current && !canvas) {
      initCanvas(canvasRef.current, containerRef.current);
    }
  }, [canvasRef, containerRef, initCanvas, canvas]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-start justify-center p-8 overflow-auto bg-muted">
        <div className="shadow-2xl">
            <canvas ref={canvasRef} />
        </div>
    </div>
  );
}


"use client";

import dynamic from 'next/dynamic';
import { Toolbar } from './toolbar';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { useEditor } from '../editor-provider';
import React, { useRef, useLayoutEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

const FabricCanvas = dynamic(() => import('./canvas').then(mod => mod.FabricCanvas), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

export function EditorWorkspace() {
  const { canvas, fabric, zoom, setZoom, zoomIn, zoomOut } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);

  const fitCanvasToContainer = useCallback(() => {
    if (!canvas || !fabric || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth - 32; // 2rem padding
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
    const vpt = canvas.getViewportTransform();
    vpt[4] = (container.clientWidth - canvasWidth * newZoom) / 2;
    vpt[5] = (container.clientHeight - canvasHeight * newZoom) / 2;
    canvas.setViewportTransform(vpt);

    canvas.renderAll();
  }, [canvas, fabric, setZoom]);

  useLayoutEffect(() => {
    fitCanvasToContainer();
    
    const observer = new ResizeObserver(() => fitCanvasToContainer());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [fitCanvasToContainer]);
  
   useLayoutEffect(() => {
    // This effect runs specifically when the canvas dimensions change,
    // to ensure we re-fit it to the container.
    if(canvas) {
        fitCanvasToContainer();
    }
  }, [canvas?.width, canvas?.height, fitCanvasToContainer]);


  return (
    <div className="flex flex-col h-full bg-muted/50 p-4 gap-4 overflow-hidden">
      <Toolbar />
      <div ref={containerRef} className="flex-1 flex items-center justify-center relative">
        <Card className="shadow-inner absolute">
            <FabricCanvas />
        </Card>
      </div>
       <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground text-center">
        <Button variant="ghost" size="icon" onClick={zoomOut}><ZoomOut /></Button>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" onClick={zoomIn}><ZoomIn /></Button>
        <span className="mx-2">|</span>
        <span>Canvas: {canvas?.getWidth()}px x {canvas?.getHeight()}px</span>
      </div>
    </div>
  );
}


"use client";

import dynamic from 'next/dynamic';
import { Toolbar } from './toolbar';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { useEditor } from '../editor-provider';
import React, { useRef, useLayoutEffect } from 'react';
import { Button } from '../ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

const FabricCanvas = dynamic(() => import('./canvas').then(mod => mod.FabricCanvas), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

export function EditorWorkspace() {
  const { canvas, zoom, zoomIn, zoomOut, fitToScreen, setContainerRef } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerRef(containerRef.current);
    }
  }, [setContainerRef]);

  useLayoutEffect(() => {
    if (canvas) {
      fitToScreen();
      
      const handleResize = () => fitToScreen();
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [canvas, fitToScreen]);
  
  return (
    <div className="flex flex-col h-full bg-muted/50 p-4 gap-4 overflow-hidden">
      <Toolbar />
      <div ref={containerRef} className="flex-1 flex items-center justify-center relative overflow-hidden">
        <Card className="shadow-inner overflow-visible">
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

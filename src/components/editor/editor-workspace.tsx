
"use client";

import dynamic from 'next/dynamic';
import { Toolbar } from './toolbar';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { useEditor } from '../editor-provider';

const FabricCanvas = dynamic(() => import('./canvas').then(mod => mod.FabricCanvas), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

export function EditorWorkspace() {
  const { zoom, canvas } = useEditor();

  return (
    <div className="flex flex-col h-full bg-muted/50 p-4 gap-4 overflow-auto">
      <Toolbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card 
            className="shadow-inner overflow-visible"
            style={{
                width: canvas?.getWidth() || 800,
                height: canvas?.getHeight() || 600,
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-in-out',
            }}
        >
            <FabricCanvas />
        </Card>
      </div>
       <div className="text-sm text-muted-foreground text-center">
        Zoom: {Math.round(zoom * 100)}% | Canvas: {canvas?.getWidth()}px x {canvas?.getHeight()}px
      </div>
    </div>
  );
}

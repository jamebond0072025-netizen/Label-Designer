"use client";

import dynamic from 'next/dynamic';
import { Toolbar } from './toolbar';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

const FabricCanvas = dynamic(() => import('./canvas').then(mod => mod.FabricCanvas), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

export function EditorWorkspace() {
  return (
    <div className="flex flex-col h-full bg-muted/50 p-4 gap-4">
      <Toolbar />
      <div className="flex-1 relative">
        <Card className="w-full h-full shadow-inner overflow-hidden">
            <FabricCanvas />
        </Card>
      </div>
       <div className="text-sm text-muted-foreground">
        Zoom: 100% | Canvas: 800px x 600px
      </div>
    </div>
  );
}

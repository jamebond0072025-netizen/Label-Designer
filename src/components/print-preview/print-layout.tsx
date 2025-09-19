
'use client';

import { Suspense } from 'react';
import { PrintPreviewProvider } from '../print-preview-provider';
import { PrintNavbar } from './print-navbar';
import { PrintSettings } from './print-settings';
import { PrintCanvas } from './print-canvas';
import { Skeleton } from '../ui/skeleton';
import { SidebarProvider } from '../ui/sidebar';
import { PrintLeftSidebar } from './print-left-sidebar';
import { TooltipProvider } from '../ui/tooltip';

function PrintLayoutContent() {
    return (
        <PrintPreviewProvider>
            <TooltipProvider>
                <div className="flex flex-col h-screen bg-background">
                    <PrintNavbar />
                    <div className="flex flex-1 overflow-hidden">
                        <SidebarProvider id="print-left-sidebar" defaultOpen={true}>
                            <PrintLeftSidebar />
                        </SidebarProvider>
                        <main className="flex-1 flex flex-col overflow-auto">
                            <PrintCanvas />
                        </main>
                        <PrintSettings />
                    </div>
                </div>
            </TooltipProvider>
        </PrintPreviewProvider>
    );
}

export function PrintLayout() {
  return (
    <Suspense fallback={<Skeleton className="w-screen h-screen" />}>
      <PrintLayoutContent />
    </Suspense>
  );
}

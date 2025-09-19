
'use client';

import { Suspense } from 'react';
import { PrintPreviewProvider } from '../print-preview-provider';
import { PrintNavbar } from './print-navbar';
import { PrintSettings } from './print-settings';
import { PrintCanvas } from './print-canvas';
import { Skeleton } from '../ui/skeleton';

function PrintLayoutContent() {
    return (
        <PrintPreviewProvider>
            <div className="flex flex-col h-screen bg-background">
                <PrintNavbar />
                <div className="flex flex-1 overflow-hidden">
                    <PrintSettings />
                    <main className="flex-1 flex flex-col overflow-auto">
                        <PrintCanvas />
                    </main>
                </div>
            </div>
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

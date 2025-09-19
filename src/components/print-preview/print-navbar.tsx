
"use client";

import { usePrintPreview } from "@/components/print-preview-provider";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowLeft, Loader2 } from "lucide-react";
import Link from 'next/link';

export function PrintNavbar() {
  const { exportAsPdf, isLoading } = usePrintPreview();

  return (
    <header className="sticky w-full top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/"><ArrowLeft /></Link>
        </Button>
        <h1 className="text-xl font-bold">Print Preview</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="default" onClick={exportAsPdf} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="mr-2" />
          )}
          {isLoading ? 'Exporting...' : 'Export as PDF'}
        </Button>
      </div>
    </header>
  );
}

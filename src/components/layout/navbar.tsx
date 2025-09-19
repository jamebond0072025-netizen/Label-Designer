
"use client";

import { useEditor } from "@/components/editor-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, Printer } from "lucide-react";
import Link from 'next/link';

export function Navbar() {
  const {
    saveAsJson,
    loadFromJson,
    exportAsPng,
    exportAsJpg,
    exportAsPdf,
    canvas,
  } = useEditor();

  const handleSaveForPrint = () => {
    if (!canvas) return;

    const data = {
        canvas: canvas.toJSON(['id', 'name', 'objectType', 'barcodeValue', 'isPlaceholder', 'borderRadius']),
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        backgroundColor: canvas.backgroundColor,
        backgroundImage: canvas.backgroundImage?.toJSON(['id', 'name', 'objectType', 'barcodeValue', 'isPlaceholder', 'borderRadius']),
    };

    // Use local storage as a mock database for the template
    localStorage.setItem('__mock_template', JSON.stringify(data));

    // Redirect to the print preview page
    window.location.href = `/print-preview?templateId=mock-template&jsonId=mock-json`;
  };

  return (
    <header className="sticky w-full top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-xl font-bold">LabelForge</Link>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" onClick={saveAsJson}>
          Save File
        </Button>
        <Button variant="outline" onClick={loadFromJson}>
          Load File
        </Button>
         <Button variant="outline" onClick={handleSaveForPrint}>
          <Printer className="mr-2" /> Print
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default">
              <FileDown className="mr-2" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={exportAsPng}>Export as PNG</DropdownMenuItem>
            <DropdownMenuItem onClick={exportAsJpg}>Export as JPG</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportAsPdf}>Export as PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

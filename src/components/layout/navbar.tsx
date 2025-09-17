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
import { useSidebar } from "@/components/ui/sidebar";
import { FileDown, PanelLeftClose } from "lucide-react";

export function Navbar() {
  const { toggleSidebar } = useSidebar();
  const {
    saveAsJson,
    loadFromJson,
    exportAsPng,
    exportAsJpg,
    exportAsPdf,
  } = useEditor();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <PanelLeftClose className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-bold">LabelForge</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" onClick={saveAsJson}>
          Save
        </Button>
        <Button variant="outline" onClick={loadFromJson}>
          Load
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

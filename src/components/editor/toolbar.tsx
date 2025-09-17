"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Undo,
  Redo,
  Plus,
  Type,
  ImageIcon,
  RectangleHorizontal,
  Circle,
  Barcode,
  ZoomIn,
  ZoomOut,
  Maximize,
  FileDown,
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignTop,
  AlignVerticalSpaceAround,
  AlignBottom,
  ChevronsRight,
  ChevronsLeft,
  BringToFront,
  SendToBack,
} from "lucide-react";
import { useEditor } from "../editor-provider";


export function Toolbar() {
  const { addObject } = useEditor();

  return (
    <div className="bg-background rounded-lg border shadow-sm p-2 flex items-center gap-2 flex-wrap">
      <Button variant="ghost" size="icon"><Undo /></Button>
      <Button variant="ghost" size="icon"><Redo /></Button>
      
      <Separator orientation="vertical" className="h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline"><Plus className="mr-2" /> Add Element</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => addObject('textbox')}>
            <Type className="mr-2" /> Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addObject('image')}>
            <ImageIcon className="mr-2" /> Image Placeholder
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => addObject('rect')}>
            <RectangleHorizontal className="mr-2" /> Rectangle
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => addObject('circle')}>
            <Circle className="mr-2" /> Circle
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => addObject('barcode')}>
            <Barcode className="mr-2" /> Barcode
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6" />

       <Button variant="ghost" size="icon"><ZoomIn /></Button>
      <Button variant="ghost" size="icon"><ZoomOut /></Button>
      <Button variant="ghost" size="icon"><Maximize /></Button>

      <Separator orientation="vertical" className="h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost"><FileDown className="mr-2" /> File</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Save Template</DropdownMenuItem>
          <DropdownMenuItem>Load Template</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Export as PNG</DropdownMenuItem>
          <DropdownMenuItem>Export as JPG</DropdownMenuItem>
          <DropdownMenuItem>Export as PDF</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon"><AlignLeft /></Button>
        <Button variant="ghost" size="icon"><AlignCenterHorizontal /></Button>
        <Button variant="ghost" size="icon"><AlignRight /></Button>
        <Button variant="ghost" size="icon"><AlignTop /></Button>
        <Button variant="ghost" size="icon"><AlignVerticalSpaceAround /></Button>
        <Button variant="ghost" size="icon"><AlignBottom /></Button>
        <Button variant="ghost" size="icon"><BringToFront /></Button>
        <Button variant="ghost" size="icon"><SendToBack /></Button>
      </div>

    </div>
  );
}

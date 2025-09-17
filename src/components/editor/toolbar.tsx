
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignStartVertical,
  AlignVerticalJustifyCenter,
  AlignEndVertical,
  BringToFront,
  SendToBack,
} from "lucide-react";
import { useEditor } from "../editor-provider";


export function Toolbar() {
  const { 
    addObject, 
    zoomIn,
    zoomOut,
    fitToScreen,
  } = useEditor();

  return (
    <div className="bg-background rounded-lg border shadow-sm p-2 flex items-center gap-2 flex-wrap sticky top-0 z-10">
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

       <Button variant="ghost" size="icon" onClick={zoomIn}><ZoomIn /></Button>
      <Button variant="ghost" size="icon" onClick={zoomOut}><ZoomOut /></Button>
      <Button variant="ghost" size="icon" onClick={fitToScreen}><Maximize /></Button>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon"><AlignLeft /></Button>
        <Button variant="ghost" size="icon"><AlignCenterHorizontal /></Button>
        <Button variant="ghost" size="icon"><AlignRight /></Button>
        <Button variant="ghost" size="icon"><AlignStartVertical /></Button>
        <Button variant="ghost" size="icon"><AlignVerticalJustifyCenter /></Button>
        <Button variant="ghost" size="icon"><AlignEndVertical /></Button>
        <Button variant="ghost" size="icon"><BringToFront /></Button>
        <Button variant="ghost" size="icon"><SendToBack /></Button>
      </div>

    </div>
  );
}

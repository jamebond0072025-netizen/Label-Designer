
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <TooltipProvider>
      <div className="bg-background rounded-lg border shadow-sm p-2 flex items-center gap-2 flex-wrap sticky top-0 z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon"><Undo /></Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon"><Redo /></Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo</p>
          </TooltipContent>
        </Tooltip>
        
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

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={zoomIn}><ZoomIn /></Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom In</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={zoomOut}><ZoomOut /></Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={fitToScreen}><Maximize /></Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fit to Screen</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"><AlignLeft /></Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Left</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"><AlignCenterHorizontal /></Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Center Horizontally</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"><AlignRight /></Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Right</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"><AlignStartVertical /></Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Top</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"><AlignVerticalJustifyCenter /></Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Center Vertically</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"><AlignEndVertical /></Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Bottom</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"><BringToFront /></Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bring to Front</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"><SendToBack /></Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send to Back</p>
            </TooltipContent>
          </Tooltip>
        </div>

      </div>
    </TooltipProvider>
  );
}

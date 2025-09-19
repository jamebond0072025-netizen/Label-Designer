
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
  Text,
} from "lucide-react";
import { useEditor } from "../editor-provider";


export function Toolbar() {
  const { 
    addObject, 
    canUndo,
    undo,
    canRedo,
    redo,
    zoomIn,
    zoomOut,
    fitToScreen,
    alignLeft,
    alignCenterHorizontal,
    alignRight,
    alignTop,
    alignCenterVertical,
    alignBottom,
    bringToFront,
    sendToBack,
    activeObject,
  } = useEditor();
  
  const isObjectSelected = !!activeObject;

  return (
    <div className="bg-background rounded-lg border shadow-sm p-2 flex items-center gap-2 flex-wrap sticky top-0 z-10">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo}><Undo /></Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Undo (Ctrl+Z)</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo}><Redo /></Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Redo (Ctrl+Y)</p>
        </TooltipContent>
      </Tooltip>
      
      <Separator orientation="vertical" className="h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline"><Plus className="mr-2" /> Add Element</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => addObject('placeholder-text')}>
            <Type className="mr-2" /> Placeholder Text
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => addObject('static-text')}>
            <Text className="mr-2" /> Static Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addObject('placeholder-image')}>
            <ImageIcon className="mr-2" /> Placeholder Image
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => addObject('static-image')}>
            <ImageIcon className="mr-2" /> Static Image
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
        <TooltipContent side="bottom">
          <p>Zoom In</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={zoomOut}><ZoomOut /></Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Zoom Out</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={fitToScreen}><Maximize /></Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Fit to Screen</p>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={alignLeft} disabled={!isObjectSelected}><AlignLeft /></Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Align Left</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={alignCenterHorizontal} disabled={!isObjectSelected}><AlignCenterHorizontal /></Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Align Center Horizontally</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={alignRight} disabled={!isObjectSelected}><AlignRight /></Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Align Right</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={alignTop} disabled={!isObjectSelected}><AlignStartVertical /></Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Align Top</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={alignCenterVertical} disabled={!isObjectSelected}><AlignVerticalJustifyCenter /></Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Align Center Vertically</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={alignBottom} disabled={!isObjectSelected}><AlignEndVertical /></Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Align Bottom</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={bringToFront} disabled={!isObjectSelected}><BringToFront /></Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Bring to Front</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={sendToBack} disabled={!isObjectSelected}><SendToBack /></Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Send to Back</p>
          </TooltipContent>
        </Tooltip>
      </div>

    </div>
  );
}


"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "../ui/button";
import { Eye, Lock, Unlock, PanelLeft, EyeOff, BringToFront, SendToBack, Copy, Type, RectangleHorizontal, Circle, ImageIcon, Barcode, HelpCircle } from "lucide-react";
import { useEditor } from "../editor-provider";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { fabric } from 'fabric';

const getIconForLayer = (layer: fabric.Object) => {
  const objectType = layer.type;
  switch (objectType) {
    case 'textbox':
      return <Type className="h-5 w-5" />;
    case 'rect':
      return <RectangleHorizontal className="h-5 w-5" />;
    case 'circle':
      return <Circle className="h-5 w-5" />;
    case 'image':
      if (layer.get('objectType') === 'barcode') {
        return <Barcode className="h-5 w-5" />;
      }
      return <ImageIcon className="h-5 w-5" />;
    default:
      return <HelpCircle className="h-5 w-5" />;
  }
};


export function LeftSidebar() {
  const { toggleSidebar, state } = useSidebar();
  const { 
    canvasObjects,
    activeObject,
    setActiveObjectById,
    bringToFront,
    sendToBack,
    toggleVisibility,
    toggleLock,
    jsonData,
  } = useEditor();
  const { toast } = useToast();

  // Reverse the array for top-to-bottom layer display
  const reversedLayers = [...canvasObjects].reverse();
  
  const handleBringToFront = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveObjectById(id);
    bringToFront();
  }

  const handleSendToBack = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveObjectById(id);
    sendToBack();
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonData);
    toast({
        title: "Copied to clipboard!",
        description: "The JSON data schema has been copied.",
    });
  };

  return (
    <Sidebar>
       <SidebarHeader>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                       <PanelLeft />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Toggle Sidebar</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </SidebarHeader>
      <SidebarContent>
        {state === 'expanded' && (
            <Accordion type="multiple" defaultValue={["layers", "data"]} className="w-full">
            <AccordionItem value="layers">
                <AccordionTrigger className="px-4">Layers Panel</AccordionTrigger>
                <AccordionContent className="px-2">
                {reversedLayers.length > 0 ? (
                  <ul className="space-y-1 p-2">
                      <TooltipProvider>
                      {reversedLayers.map((layer, index) => {
                        const isLocked = !!layer.lockMovementX; // Check one lock property as a proxy
                        return (
                          <li 
                              key={layer.id} 
                              onClick={() => setActiveObjectById(layer.id!)}
                              className={cn(
                                  "flex items-center justify-between p-2 rounded-md hover:bg-accent/50 text-sm cursor-pointer",
                                  activeObject?.id === layer.id && "bg-accent"
                              )}
                          >
                              <span className="truncate">{layer.name || `Untitled ${layer.type}`}</span>
                              <div className="flex items-center gap-1">
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id!); }}>
                                          {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top"><p>{layer.visible ? 'Hide' : 'Show'}</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleLock(layer.id!); }}>
                                          {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top"><p>{isLocked ? 'Unlock' : 'Lock'}</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-6 w-6"
                                          onClick={(e) => handleBringToFront(e, layer.id!)}
                                          disabled={index === 0}
                                      >
                                          <BringToFront className="h-4 w-4" />
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top"><p>Bring to Front</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-6 w-6"
                                          onClick={(e) => handleSendToBack(e, layer.id!)}
                                          disabled={index === reversedLayers.length - 1}
                                      >
                                          <SendToBack className="h-4 w-4" />
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top"><p>Send to Back</p></TooltipContent>
                              </Tooltip>
                              </div>
                          </li>
                        );
                      })}
                      </TooltipProvider>
                  </ul>
                ) : (
                  <div className="text-center text-sm text-muted-foreground p-4">
                    <p>No elements on canvas.</p>
                    <p>Add an element to get started.</p>
                  </div>
                )}
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="data">
              <AccordionTrigger className="px-4">Data Schema</AccordionTrigger>
              <AccordionContent className="px-4 space-y-4">
                <div>
                  <Label htmlFor="json-data">Example JSON</Label>
                  <div className="relative">
                    <Textarea
                        id="json-data"
                        readOnly
                        className="mt-2 font-mono bg-muted/50"
                        rows={10}
                        value={jsonData}
                    />
                     <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 h-7 w-7"
                        onClick={handleCopyJson}
                      >
                        <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This is a read-only example of the JSON data structure your design expects, based on the placeholder elements you've added.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            </Accordion>
        )}
         {state === 'collapsed' && (
            <div className="flex flex-col items-center gap-2 p-2">
                <TooltipProvider>
                    {reversedLayers.map((layer) => (
                        <Tooltip key={layer.id}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={activeObject?.id === layer.id ? "secondary" : "ghost"}
                                    size="icon"
                                    onClick={() => setActiveObjectById(layer.id!)}
                                >
                                    {getIconForLayer(layer)}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{layer.name || `Untitled ${layer.type}`}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>
         )}
      </SidebarContent>
    </Sidebar>
  );
}

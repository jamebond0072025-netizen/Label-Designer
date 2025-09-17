
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
import { Eye, Lock, ChevronUp, ChevronDown, Unlock, PanelLeft, EyeOff, BringToFront, SendToBack } from "lucide-react";
import { useEditor } from "../editor-provider";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export function LeftSidebar() {
  const { toggleSidebar, state } = useSidebar();
  const { 
    canvasObjects,
    activeObject,
    setActiveObjectById,
    bringForward,
    sendBackwards,
    toggleVisibility,
    toggleLock,
  } = useEditor();

  // Reverse the array for top-to-bottom layer display
  const reversedLayers = [...canvasObjects].reverse();
  
  const handleBringForward = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveObjectById(id);
    // Timeout to ensure active object is set before action
    setTimeout(() => bringForward(), 0);
  }

  const handleSendBackwards = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveObjectById(id);
    // Timeout to ensure active object is set before action
    setTimeout(() => sendBackwards(), 0);
  }

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
                    <p>Toggle Layers Panel</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </SidebarHeader>
      <SidebarContent>
        {state === 'expanded' && (
            <Accordion type="multiple" defaultValue={["layers"]} className="w-full">
            <AccordionItem value="layers">
                <AccordionTrigger className="px-4">Layers Panel</AccordionTrigger>
                <AccordionContent className="px-2">
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
                                        onClick={(e) => handleBringForward(e, layer.id!)}
                                        disabled={index === 0}
                                    >
                                        <BringToFront className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top"><p>Bring Forward</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6"
                                        onClick={(e) => handleSendBackwards(e, layer.id!)}
                                        disabled={index === reversedLayers.length - 1}
                                    >
                                        <SendToBack className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top"><p>Send Backward</p></TooltipContent>
                            </Tooltip>
                            </div>
                        </li>
                      );
                    })}
                    </TooltipProvider>
                </ul>
                </AccordionContent>
            </AccordionItem>
            </Accordion>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

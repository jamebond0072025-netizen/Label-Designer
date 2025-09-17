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
import { Eye, Lock, ChevronUp, ChevronDown, Unlock, PanelLeft, EyeOff } from "lucide-react";
import { useEditor } from "../editor-provider";
import { cn } from "@/lib/utils";

export function LeftSidebar() {
  const { toggleSidebar, state } = useSidebar();
  const { 
    canvasObjects,
    activeObject,
    setActiveObjectById,
    bringForward,
    sendBackwards,
    toggleVisibility,
    toggleLock
  } = useEditor();

  // Reverse the array for top-to-bottom layer display
  const reversedLayers = [...canvasObjects].reverse();

  return (
    <Sidebar>
       <SidebarHeader>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
           <PanelLeft />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        {state === 'expanded' && (
            <Accordion type="multiple" defaultValue={["layers"]} className="w-full">
            <AccordionItem value="layers">
                <AccordionTrigger className="px-4">Layers Panel</AccordionTrigger>
                <AccordionContent className="px-2">
                <ul className="space-y-1 p-2">
                    {reversedLayers.map((layer, index) => {
                      const isLocked = !!layer.lockMovementX; // Check one lock property as a proxy
                      return (
                         <li 
                            key={layer.name} 
                            onClick={() => setActiveObjectById(layer.name!)}
                            className={cn(
                                "flex items-center justify-between p-2 rounded-md hover:bg-accent/50 text-sm cursor-pointer",
                                activeObject?.name === layer.name && "bg-accent"
                            )}
                         >
                            <span className="truncate">{layer.name || `Untitled ${layer.type}`}</span>
                            <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.name!); }}>
                                {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleLock(layer.name!); }}>
                                {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={(e) => { e.stopPropagation(); bringForward(layer.name!); }}
                                disabled={index === 0}
                            >
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={(e) => { e.stopPropagation(); sendBackwards(layer.name!); }}
                                disabled={index === reversedLayers.length - 1}
                            >
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                            </div>
                        </li>
                      );
                    })}
                </ul>
                </AccordionContent>
            </AccordionItem>
            </Accordion>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

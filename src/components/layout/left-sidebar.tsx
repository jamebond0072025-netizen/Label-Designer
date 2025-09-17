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
import { Eye, Lock, ChevronUp, ChevronDown, Unlock, PanelLeft, PanelRight } from "lucide-react";
import { useEditor } from "../editor-provider";

export function LeftSidebar() {
  const { toggleSidebar, state } = useSidebar();
  
  // Placeholder data, will be replaced by editor context
  const layers = [
    { id: 1, type: "Text", name: "Product Name", visible: true, locked: false },
    { id: 2, type: "Image", name: "logo.png", visible: true, locked: false },
    { id: 3, type: "Barcode", name: "QR Code", visible: false, locked: true },
    { id: 4, type: "Shape", name: "Rectangle", visible: true, locked: false },
  ];

  const templates = ["Shipping Label", "QR Badge", "Product Sticker"];

  return (
    <Sidebar>
       <SidebarHeader>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
           <PanelLeft />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        {state === 'expanded' && (
            <Accordion type="multiple" defaultValue={["layers", "templates"]} className="w-full">
            <AccordionItem value="layers">
                <AccordionTrigger className="px-4">Layers Panel</AccordionTrigger>
                <AccordionContent className="px-2">
                <ul className="space-y-2 p-2">
                    {layers.map((layer, index) => (
                    <li key={layer.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 text-sm">
                        <span className="truncate">{layer.name}</span>
                        <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            {layer.visible ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4 opacity-50" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            {layer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0}>
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === layers.length - 1}>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                        </div>
                    </li>
                    ))}
                </ul>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="templates">
                <AccordionTrigger className="px-4">Template Library</AccordionTrigger>
                <AccordionContent className="px-2">
                <ul className="space-y-2 p-2">
                    {templates.map(template => (
                    <li key={template}>
                        <Button variant="ghost" className="w-full justify-start">{template}</Button>
                    </li>
                    ))}
                </ul>
                </AccordionContent>
            </AccordionItem>
            </Accordion>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

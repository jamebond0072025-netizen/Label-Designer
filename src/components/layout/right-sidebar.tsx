"use client";

import { useState } from "react";
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
import { PropertiesPanel } from "../editor/properties-panel";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Sparkles, LoaderCircle, PanelRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useEditor } from "../editor-provider";

export function RightSidebar() {
  const { activeObject, applyJsonData, canvas } = useEditor();
  const { toggleSidebar, state } = useSidebar();
  const [jsonData, setJsonData] = useState('{\n  "text-1": "New Value",\n  "image-1": "https://picsum.photos/seed/new/400/300"\n}');

  const handleApplyJson = () => {
    applyJsonData(jsonData);
  };

  return (
    <Sidebar side="right">
      <SidebarHeader>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
           <PanelRight />
        </Button>
      </SidebarHeader>
      <SidebarContent className="p-0">
        {state === 'expanded' && (
            <Accordion type="multiple" defaultValue={["properties"]} className="w-full">
            <AccordionItem value="properties">
                <AccordionTrigger className="px-4">Properties</AccordionTrigger>
                <AccordionContent className="px-4">
                <PropertiesPanel key={activeObject?.name} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="canvas">
                <AccordionTrigger className="px-4">Canvas</AccordionTrigger>
                <AccordionContent className="px-4 space-y-4">
                <div>
                    <Label>Canvas Size</Label>
                    <div className="flex gap-2 mt-2">
                    <Input placeholder="Width" type="number" value={canvas?.getWidth()} onChange={(e) => canvas?.setWidth(parseInt(e.target.value))} />
                    <Input placeholder="Height" type="number" value={canvas?.getHeight()} onChange={(e) => canvas?.setHeight(parseInt(e.target.value))} />
                    </div>
                </div>
                <div>
                    <Label>Background Color</Label>
                    <Input type="color" value={canvas?.backgroundColor as string} onChange={(e) => {
                        if (canvas) {
                            canvas.backgroundColor = e.target.value;
                            canvas.renderAll();
                        }
                    }} className="p-1" />
                </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="data">
                <AccordionTrigger className="px-4">Data Binding</AccordionTrigger>
                <AccordionContent className="px-4 space-y-4">
                <div>
                    <Label htmlFor="json-data">Single Label Mode (JSON)</Label>
                    <Textarea 
                      id="json-data"
                      placeholder='{ "key-name": "New Value" }' 
                      className="mt-2 font-mono"
                      rows={6}
                      value={jsonData}
                      onChange={(e) => setJsonData(e.target.value)}
                    />
                    <Button className="mt-2 w-full" onClick={handleApplyJson}>Apply Data</Button>
                    <p className="text-xs text-muted-foreground mt-2">
                        Use the unique key of an element to update its content. For text, provide a string. For images or barcodes, provide a URL or new value.
                    </p>
                </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ai">
                <AccordionTrigger className="px-4">AI Suggestions</AccordionTrigger>
                <AccordionContent className="px-4 space-y-4">
                <Button className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get AI Suggestions
                </Button>
                <Alert>
                    <AlertTitle>Design Tip</AlertTitle>
                    <AlertDescription>
                        Consider increasing the font size of the product name for better readability from a distance.
                    </AlertDescription>
                </Alert>
                </AccordionContent>
            </AccordionItem>
            </Accordion>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

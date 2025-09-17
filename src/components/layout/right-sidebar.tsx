
"use client";

import { useState, useRef } from "react";
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
import { Textarea } from "../ui/textarea";
import { Sparkles, PanelRight, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useEditor } from "../editor-provider";

export function RightSidebar() {
  const {
    activeObject,
    applyJsonData,
    canvas,
    setCanvasSize,
    setCanvasBackgroundColor,
    setCanvasBackgroundImage,
  } = useEditor();
  const { toggleSidebar, state } = useSidebar();
  const [jsonData, setJsonData] = useState('{\n  "text-1": "New Value",\n  "image-1": "https://picsum.photos/seed/new/400/300"\n}');
  const [bgImageUrl, setBgImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplyJson = () => {
    applyJsonData(jsonData);
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setBgImageUrl(url);
        setCanvasBackgroundImage(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Sidebar side="right">
      <SidebarHeader>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <PanelRight />
        </Button>
      </SidebarHeader>
      <SidebarContent className="p-0">
        {state === "expanded" && (
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
                  <Label>Canvas Size (px)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input placeholder="Width" type="number" defaultValue={canvas?.getWidth()} onBlur={(e) => setCanvasSize(parseInt(e.target.value), canvas?.getHeight() || 600)} />
                    <Input placeholder="Height" type="number" defaultValue={canvas?.getHeight()} onBlur={(e) => setCanvasSize(canvas?.getWidth() || 800, parseInt(e.target.value))} />
                  </div>
                </div>
                <div>
                  <Label>Background Color</Label>
                  <Input type="color" defaultValue={canvas?.backgroundColor as string} onChange={(e) => setCanvasBackgroundColor(e.target.value)} className="p-1" />
                </div>
                <div>
                  <Label>Background Image</Label>
                   <div className="flex gap-2 mt-2">
                    <Input
                      type="text"
                      placeholder="Paste image URL"
                      value={bgImageUrl}
                      onChange={(e) => setBgImageUrl(e.target.value)}
                      onBlur={(e) => setCanvasBackgroundImage(e.target.value)}
                    />
                    <Button variant="outline" size="icon" onClick={triggerFileUpload}>
                        <Upload />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleBgImageUpload}
                    />
                   </div>
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

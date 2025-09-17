"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
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
import { Sparkles, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useEditor } from "../editor-provider";

export function RightSidebar() {
  const { activeObject } = useEditor();

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent className="p-0">
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
                <Label>Predefined Sizes</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button variant="outline" size="sm">A4 Portrait</Button>
                  <Button variant="outline" size="sm">A4 Landscape</Button>
                  <Button variant="outline" size="sm">16:9</Button>
                  <Button variant="outline" size="sm">9:16</Button>
                </div>
              </div>
              <div>
                <Label>Custom Size</Label>
                <div className="flex gap-2 mt-2">
                  <Input placeholder="Width" />
                  <Input placeholder="Height" />
                  <Button>Apply</Button>
                </div>
              </div>
              <div>
                 <Label>Background Image URL</Label>
                 <Input placeholder="https://..." className="mt-2" />
              </div>
               <div className="flex items-center justify-between">
                <Label>Show Grid</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label>Snap to Grid</Label>
                <Switch />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="data">
            <AccordionTrigger className="px-4">Data</AccordionTrigger>
            <AccordionContent className="px-4 space-y-4">
               <div>
                <Label>Single Label Mode (JSON)</Label>
                <Textarea placeholder='{ "name": "Product" }' className="mt-2 font-mono" />
                <Button className="mt-2 w-full">Apply</Button>
               </div>
               <div>
                <Label>Bulk Mode (JSON Array)</Label>
                <Textarea placeholder='[{ "name": "Product 1" }, { "name": "Product 2" }]' className="mt-2 font-mono" />
                <Button className="mt-2 w-full">
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin hidden" />
                  Generate PDF
                </Button>
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
      </SidebarContent>
    </Sidebar>
  );
}

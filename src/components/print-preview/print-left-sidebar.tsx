
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '../ui/button';
import { Copy, PanelLeft } from 'lucide-react';
import { usePrintPreview } from '../print-preview-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function PrintLeftSidebar() {
  const { toggleSidebar, state } = useSidebar();
  const { jsonData } = usePrintPreview();
  const { toast } = useToast();

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonData);
    toast({
        title: "Copied to clipboard!",
        description: "The JSON data has been copied.",
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
                    <p>Toggle Data Panel</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </SidebarHeader>
      <SidebarContent>
        {state === 'expanded' && (
            <Accordion type="single" defaultValue="data" collapsible className="w-full">
            <AccordionItem value="data">
              <AccordionTrigger className="px-4">Data Source</AccordionTrigger>
              <AccordionContent className="px-4 space-y-4">
                <div>
                  <Label htmlFor="json-data">JSON Data</Label>
                  <div className="relative">
                    <Textarea
                        id="json-data"
                        readOnly
                        className="mt-2 font-mono bg-muted/50 h-96"
                        rows={20}
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
                    This is the data that will be used to populate the labels in the final PDF export.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            </Accordion>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

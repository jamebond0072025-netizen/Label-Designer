
'use client';

import { useState, useRef, useEffect } from 'react';
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
import { PropertiesPanel } from '../editor/properties-panel';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PanelRight, ImageUp, FileDown } from 'lucide-react';
import { useEditor } from '../editor-provider';
import { predefinedSizes } from '@/lib/predefined-sizes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Separator } from '../ui/separator';

const DPI = 96;
const MM_TO_IN = 0.0393701;

export function RightSidebar() {
  const {
    activeObject,
    applyJsonData,
    exportBulkPdf,
    canvas,
    setCanvasSize,
    setCanvasBackgroundColor,
    setCanvasBackgroundImage,
    jsonData,
    setJsonData,
    bulkJsonData,
    setBulkJsonData,
  } = useEditor();
  const { toggleSidebar, state } = useSidebar();
  const [bgImageUrl, setBgImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [customWidth, setCustomWidth] = useState(canvas?.getWidth() || 800);
  const [customHeight, setCustomHeight] = useState(canvas?.getHeight() || 600);
  const [unit, setUnit] = useState<'px' | 'in' | 'mm'>('px');

  useEffect(() => {
    if (canvas) {
        const pxWidth = canvas.getWidth();
        const pxHeight = canvas.getHeight();
        if (unit === 'in') {
            setCustomWidth(pxWidth / DPI);
            setCustomHeight(pxHeight / DPI);
        } else if (unit === 'mm') {
            setCustomWidth((pxWidth / DPI) / MM_TO_IN);
            setCustomHeight((pxHeight / DPI) / MM_TO_IN);
        } else {
            setCustomWidth(pxWidth);
            setCustomHeight(pxHeight);
        }
    }
  }, [canvas, unit]);


  const handleApplyJson = () => {
    applyJsonData(jsonData);
  };
  
  const handleBulkGenerate = () => {
    exportBulkPdf(bulkJsonData);
  }

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

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    if (value !== 'custom') {
      const [width, height] = value.split('x').map(Number);
      if (!isNaN(width) && !isNaN(height)) {
        setCanvasSize(width, height);
      }
    }
  };

  const handleApplyCustomSize = () => {
    let widthInPx = customWidth;
    let heightInPx = customHeight;

    if (unit === 'in') {
      widthInPx = customWidth * DPI;
      heightInPx = customHeight * DPI;
    } else if (unit === 'mm') {
      widthInPx = customWidth * MM_TO_IN * DPI;
      heightInPx = customHeight * MM_TO_IN * DPI;
    }
    
    setCanvasSize(Math.round(widthInPx), Math.round(heightInPx));
  };
  
  const handleUnitChange = (newUnit: 'px' | 'in' | 'mm') => {
      if (!canvas) return;
      const pxWidth = canvas.getWidth();
      const pxHeight = canvas.getHeight();

      if (newUnit === 'in') {
          setCustomWidth(pxWidth / DPI);
          setCustomHeight(pxHeight / DPI);
      } else if (newUnit === 'mm') {
          setCustomWidth((pxWidth / DPI) / MM_TO_IN);
          setCustomHeight((pxHeight / DPI) / MM_TO_IN);
      } else {
          setCustomWidth(pxWidth);
          setCustomHeight(pxHeight);
      }
      setUnit(newUnit);
  };

  return (
    <Sidebar side="right">
      <SidebarHeader>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                      <PanelRight />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Toggle Properties Panel</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </SidebarHeader>
      <SidebarContent className="p-0">
        {state === 'expanded' && (
          <Accordion
            type="multiple"
            defaultValue={['properties']}
            className="w-full"
          >
            <AccordionItem value="properties">
              <AccordionTrigger className="px-4">Properties</AccordionTrigger>
              <AccordionContent className="px-4">
                <PropertiesPanel key={activeObject?.id} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="canvas">
              <AccordionTrigger className="px-4">Canvas</AccordionTrigger>
              <AccordionContent className="px-4 space-y-4">
                <div>
                  <Label>Size</Label>
                  <Select
                    onValueChange={handlePresetChange}
                    value={selectedPreset}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Select a preset size..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectGroup>
                        <SelectLabel>Page Sizes</SelectLabel>
                        {predefinedSizes
                          .filter((s) => s.category === 'Page')
                          .map((size) => (
                            <SelectItem
                              key={size.name}
                              value={`${size.width}x${size.height}`}
                            >
                              {size.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Label Sizes</SelectLabel>
                        {predefinedSizes
                          .filter((s) => s.category === 'Label')
                          .map((size) => (
                            <SelectItem
                              key={size.name}
                              value={`${size.width}x${size.height}`}
                            >
                              {size.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Cards</SelectLabel>
                        {predefinedSizes
                          .filter((s) => s.category === 'Card')
                          .map((size) => (
                            <SelectItem
                              key={size.name}
                              value={`${size.width}x${size.height}`}
                            >
                              {size.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {selectedPreset === 'custom' && (
                  <div className="p-4 border rounded-md space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Width</Label>
                        <Input
                          placeholder="Width"
                          type="number"
                          value={Math.round(customWidth * 100) / 100}
                          onChange={(e) => setCustomWidth(parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Height</Label>
                        <Input
                          placeholder="Height"
                          type="number"
                          value={Math.round(customHeight * 100) / 100}
                          onChange={(e) => setCustomHeight(parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                     <div>
                        <Label>Unit</Label>
                        <Select onValueChange={handleUnitChange} value={unit}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="px">Pixels (px)</SelectItem>
                                <SelectItem value="in">Inches (in)</SelectItem>
                                <SelectItem value="mm">Millimeters (mm)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full" onClick={handleApplyCustomSize}>Apply</Button>
                  </div>
                )}
                
                <div>
                  <Label>Background Color</Label>
                  <Input
                    type="color"
                    value={(canvas?.backgroundColor as string) || '#ffffff'}
                    onChange={(e) => setCanvasBackgroundColor(e.target.value)}
                    className="p-1 mt-2"
                  />
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
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={triggerFileUpload}
                                >
                                  <ImageUp className="h-4 w-4" />
                                  <span className="sr-only">Upload Image</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Upload from device</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
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
                  <Button className="mt-2 w-full" onClick={handleApplyJson}>
                    Apply Data
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use the unique key of an element to update its content. For
                    text, provide a string. For images or barcodes, provide a
                    URL or new value.
                  </p>
                </div>
                <Separator />
                <div>
                   <Label htmlFor="bulk-json-data">Bulk Generate Mode (JSON Array)</Label>
                   <Textarea
                    id="bulk-json-data"
                    placeholder='[ { "key": "value" }, { "key": "value" } ]'
                    className="mt-2 font-mono"
                    rows={8}
                    value={bulkJsonData}
                    onChange={(e) => setBulkJsonData(e.target.value)}
                  />
                   <Button className="mt-2 w-full" onClick={handleBulkGenerate}>
                     <FileDown className="mr-2 h-4 w-4" />
                    Generate & Download PDF
                  </Button>
                   <p className="text-xs text-muted-foreground mt-2">
                    Provide an array of JSON objects. Each object will generate one page in the final PDF.
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

    
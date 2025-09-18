
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEditor } from './editor-provider';
import { Slider } from './ui/slider';
import { FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface PrintSettings {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  spacingHorizontal: number;
  spacingVertical: number;
}

interface PrintPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// A4 dimensions in pixels at 96 DPI
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1122;

export function PrintPreviewDialog({ isOpen, onClose }: PrintPreviewDialogProps) {
  const { canvas, bulkJsonData, exportBulkPdf } = useEditor();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrintSettings>({
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    spacingHorizontal: 10,
    spacingVertical: 10,
  });

  const { labelsPerRow, labelsPerCol, labelWidth, labelHeight } = useMemo(() => {
    if (!canvas) return { labelsPerRow: 0, labelsPerCol: 0, labelWidth: 0, labelHeight: 0 };

    const initialLabelWidth = canvas.getWidth();
    const initialLabelHeight = canvas.getHeight();

    const pageContentWidth = A4_WIDTH_PX - settings.marginLeft - settings.marginRight;
    const pageContentHeight = A4_HEIGHT_PX - settings.marginTop - settings.marginBottom;

    let scale = 1;
    if (initialLabelWidth > pageContentWidth || initialLabelHeight > pageContentHeight) {
        const scaleX = pageContentWidth / initialLabelWidth;
        const scaleY = pageContentHeight / initialLabelHeight;
        scale = Math.min(scaleX, scaleY, 1);
    }
    
    const scaledLabelWidth = initialLabelWidth * scale;
    const scaledLabelHeight = initialLabelHeight * scale;

    const numRows = scaledLabelWidth > 0 ? Math.floor((pageContentWidth + settings.spacingHorizontal) / (scaledLabelWidth + settings.spacingHorizontal)) : 0;
    const numCols = scaledLabelHeight > 0 ? Math.floor((pageContentHeight + settings.spacingVertical) / (scaledLabelHeight + settings.spacingVertical)) : 0;
    
    return {
      labelsPerRow: numRows,
      labelsPerCol: numCols,
      labelWidth: scaledLabelWidth,
      labelHeight: scaledLabelHeight,
    };
  }, [canvas, settings]);

  const handleGenerateClick = () => {
    try {
        const data = JSON.parse(bulkJsonData);
        if (!Array.isArray(data)) {
            toast({ title: "Invalid Data", description: "Bulk data must be a JSON array.", variant: "destructive" });
            return;
        }
        exportBulkPdf(bulkJsonData, settings);
    } catch (e) {
        toast({ title: "Invalid JSON", description: "Could not parse bulk data. Please check the format.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Print Preview & Layout</DialogTitle>
          <DialogDescription>
            Adjust the layout settings for your bulk PDF generation. The preview shows how labels will be arranged on an A4 page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          {/* Controls */}
          <div className="md:col-span-1 space-y-4 overflow-y-auto p-1">
            <h3 className="text-lg font-semibold">Layout Settings</h3>
            <div className='space-y-2'>
                <Label>Top Margin: {settings.marginTop}px</Label>
                <Slider value={[settings.marginTop]} onValueChange={([val]) => setSettings(s => ({...s, marginTop: val}))} min={0} max={100} step={1} />
            </div>
             <div className='space-y-2'>
                <Label>Bottom Margin: {settings.marginBottom}px</Label>
                <Slider value={[settings.marginBottom]} onValueChange={([val]) => setSettings(s => ({...s, marginBottom: val}))} min={0} max={100} step={1} />
            </div>
             <div className='space-y-2'>
                <Label>Left Margin: {settings.marginLeft}px</Label>
                <Slider value={[settings.marginLeft]} onValueChange={([val]) => setSettings(s => ({...s, marginLeft: val}))} min={0} max={100} step={1} />
            </div>
             <div className='space-y-2'>
                <Label>Right Margin: {settings.marginRight}px</Label>
                <Slider value={[settings.marginRight]} onValueChange={([val]) => setSettings(s => ({...s, marginRight: val}))} min={0} max={100} step={1} />
            </div>
            <div className='space-y-2'>
                <Label>Horizontal Spacing: {settings.spacingHorizontal}px</Label>
                <Slider value={[settings.spacingHorizontal]} onValueChange={([val]) => setSettings(s => ({...s, spacingHorizontal: val}))} min={0} max={50} step={1} />
            </div>
             <div className='space-y-2'>
                <Label>Vertical Spacing: {settings.spacingVertical}px</Label>
                <Slider value={[settings.spacingVertical]} onValueChange={([val]) => setSettings(s => ({...s, spacingVertical: val}))} min={0} max={50} step={1} />
            </div>
            <div className='text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg'>
                <p>Labels per row: {labelsPerRow}</p>
                <p>Labels per column: {labelsPerCol}</p>
                <p>Total per page: {labelsPerRow * labelsPerCol}</p>
            </div>
          </div>

          {/* Preview */}
          <div className="md:col-span-2 bg-muted/50 p-4 flex items-center justify-center overflow-auto">
             <div 
                className="bg-white shadow-lg relative"
                style={{ width: `${A4_WIDTH_PX}px`, height: `${A4_HEIGHT_PX}px` }}
              >
                {/* Margins Visual */}
                <div 
                    className="absolute border-2 border-dashed border-blue-300"
                    style={{
                        top: `${settings.marginTop}px`,
                        bottom: `${settings.marginBottom}px`,
                        left: `${settings.marginLeft}px`,
                        right: `${settings.marginRight}px`,
                    }}
                />

                {/* Labels Grid */}
                <div className="absolute w-full h-full" style={{ top: `${settings.marginTop}px`, left: `${settings.marginLeft}px`}}>
                    {Array.from({ length: labelsPerRow * labelsPerCol }).map((_, i) => {
                        const row = Math.floor(i / labelsPerRow);
                        const col = i % labelsPerRow;
                        const x = col * (labelWidth + settings.spacingHorizontal);
                        const y = row * (labelHeight + settings.spacingVertical);
                        
                        return (
                            <div 
                                key={i}
                                className="absolute bg-gray-200 border border-gray-400 flex items-center justify-center text-xs text-gray-500"
                                style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                    width: `${labelWidth}px`,
                                    height: `${labelHeight}px`,
                                }}
                            >
                                Label {i + 1}
                            </div>
                        )
                    })}
                </div>
             </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleGenerateClick}>
            <FileDown className="mr-2" />
            Generate PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

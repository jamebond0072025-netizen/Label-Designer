
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
import { Label } from '@/components/ui/label';
import { useEditor } from './editor-provider';
import { Slider } from './ui/slider';
import { FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

export interface PrintSettings {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  spacingHorizontal: number;
  spacingVertical: number;
  scale: number;
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
    scale: 100, // as percentage
  });
  const [labelPreviewUrl, setLabelPreviewUrl] = useState('');
  
  const initialLabelWidth = useMemo(() => canvas?.getWidth() || 0, [canvas]);
  const initialLabelHeight = useMemo(() => canvas?.getHeight() || 0, [canvas]);

  // Set initial scale if label is too large & generate preview image
  useEffect(() => {
    if (!isOpen || !canvas) return;

    // Generate preview
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 0.8, multiplier: 1 });
    setLabelPreviewUrl(dataUrl);

    const pageContentWidth = A4_WIDTH_PX - settings.marginLeft - settings.marginRight;
    const pageContentHeight = A4_HEIGHT_PX - settings.marginTop - settings.marginBottom;

    let autoScale = 1;
    if (initialLabelWidth > pageContentWidth || initialLabelHeight > pageContentHeight) {
        const scaleX = pageContentWidth / initialLabelWidth;
        const scaleY = pageContentHeight / initialLabelHeight;
        autoScale = Math.min(scaleX, scaleY);
    }
    
    setSettings(s => ({ ...s, scale: Math.floor(autoScale * 100) }));
    
  }, [isOpen, canvas, initialLabelWidth, initialLabelHeight, settings.marginLeft, settings.marginRight, settings.marginTop, settings.marginBottom]);


  const { labelsPerRow, labelsPerCol, labelWidth, labelHeight } = useMemo(() => {
    if (!canvas) return { labelsPerRow: 0, labelsPerCol: 0, labelWidth: 0, labelHeight: 0 };

    const pageContentWidth = A4_WIDTH_PX - settings.marginLeft - settings.marginRight;
    const pageContentHeight = A4_HEIGHT_PX - settings.marginTop - settings.marginBottom;

    const scaleFactor = settings.scale / 100;
    const scaledLabelWidth = initialLabelWidth * scaleFactor;
    const scaledLabelHeight = initialLabelHeight * scaleFactor;
    
    if (scaledLabelWidth <= 0 || scaledLabelHeight <= 0) {
        return { labelsPerRow: 0, labelsPerCol: 0, labelWidth: 0, labelHeight: 0 };
    }

    const numRows = Math.floor((pageContentHeight + settings.spacingVertical) / (scaledLabelHeight + settings.spacingVertical));
    const numCols = Math.floor((pageContentWidth + settings.spacingHorizontal) / (scaledLabelWidth + settings.spacingHorizontal));
    
    return {
      labelsPerCol: numRows,
      labelsPerRow: numCols,
      labelWidth: scaledLabelWidth,
      labelHeight: scaledLabelHeight,
    };
  }, [canvas, settings, initialLabelWidth, initialLabelHeight]);

  const handleGenerateClick = () => {
    try {
        const data = JSON.parse(bulkJsonData);
        if (!Array.isArray(data)) {
            toast({ title: "Invalid Data", description: "Bulk data must be a JSON array.", variant: "destructive" });
            return;
        }
        // Pass scale as a decimal (e.g., 100% -> 1.0)
        exportBulkPdf(bulkJsonData, { ...settings, scale: settings.scale / 100 });
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
            <h3 className="text-lg font-semibold">Page Layout</h3>
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
            <Separator />
             <h3 className="text-lg font-semibold">Label Scaling</h3>
             <div className='space-y-2'>
                <Label>Scale: {settings.scale}%</Label>
                <Slider value={[settings.scale]} onValueChange={([val]) => setSettings(s => ({...s, scale: val}))} min={1} max={100} step={1} />
            </div>
             <div className='text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg space-y-1'>
                <p className="font-semibold">Original Size:</p>
                <p>{initialLabelWidth}px x {initialLabelHeight}px</p>
                <p className="font-semibold mt-2">Scaled Size:</p>
                <p>{Math.round(labelWidth)}px x {Math.round(labelHeight)}px</p>
            </div>
             <div className='text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg space-y-1'>
                <p>Labels per row: {labelsPerRow}</p>
                <p>Labels per column: {labelsPerCol}</p>
                <p className="font-semibold">Total per page: {labelsPerRow * labelsPerCol}</p>
            </div>
          </div>

          {/* Preview */}
          <div className="md:col-span-2 bg-muted/50 p-4 flex items-center justify-center overflow-auto">
             <div 
                className="bg-white shadow-lg relative"
                style={{ width: `${A4_WIDTH_PX}px`, height: `${A4_HEIGHT_PX}px`, transform: 'scale(0.8)', transformOrigin: 'center' }}
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

                        if ( (x + labelWidth) > (A4_WIDTH_PX - settings.marginLeft - settings.marginRight + 1) || (y + labelHeight) > (A4_HEIGHT_PX - settings.marginTop - settings.marginBottom + 1)) {
                            return null;
                        }
                        
                        return (
                            <div 
                                key={i}
                                className="absolute border border-gray-300 overflow-hidden"
                                style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                    width: `${labelWidth}px`,
                                    height: `${labelHeight}px`,
                                }}
                            >
                               {labelPreviewUrl && (
                                 <img src={labelPreviewUrl} alt="Label Preview" className="w-full h-full" />
                               )}
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


'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { fabric } from 'fabric';
import { Separator } from '@/components/ui/separator';

interface ImagePropertiesProps {
  object: fabric.Image;
  updateObject: (id: string, properties: any) => void;
  updateObjectInRealTime: (id: string, properties: any) => void;
}

export function ImageProperties({ object, updateObject, updateObjectInRealTime }: ImagePropertiesProps) {
  
  const handleUrlChange = (newUrl: string) => {
    if (object.id) {
        object.setSrc(newUrl, () => {
            if(object.canvas) {
                object.canvas.renderAll();
            }
        }, { crossOrigin: 'anonymous' });
    }
  };

  const handlePropertyChange = (prop: string, value: any) => {
    if (object.id) {
      updateObject(object.id, { [prop]: value });
    }
  };

  const borderRadius = object.get('borderRadius') || 0;
  const maxRadius = Math.min(object.width!, object.height!) / 2;
  const borderRadiusPercentage = maxRadius > 0 ? (borderRadius / maxRadius) * 100 : 0;

  const handleBorderRadiusChange = (percent: number) => {
    const clampedPercent = Math.max(0, Math.min(100, percent));
    const pixelValue = (clampedPercent / 100) * maxRadius;
    if (object.id) {
        updateObject(object.id, { borderRadius: pixelValue });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-src">Image URL</Label>
        <div className="flex gap-2">
            <Input 
                id="image-src"
                type="text"
                defaultValue={object.getSrc()}
                onBlur={(e) => handleUrlChange(e.target.value)}
            />
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
         <div>
          <Label htmlFor="image-opacity">Opacity (%)</Label>
          <Input 
              id="image-opacity"
              type="number"
              min={0} max={100}
              value={Math.round((object.opacity ?? 1) * 100)}
              onChange={(e) => handlePropertyChange('opacity', parseInt(e.target.value, 10) / 100)}
          />
        </div>
        <div>
          <Label htmlFor="image-border-radius">Border Radius (%)</Label>
          <Input 
              id="image-border-radius"
              type="number"
              min={0} max={100}
              value={Math.round(borderRadiusPercentage)}
              onChange={(e) => handleBorderRadiusChange(parseInt(e.target.value, 10))}
          />
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="image-stroke">Border Color</Label>
          <Input 
              id="image-stroke"
              type="color"
              value={object.stroke || '#000000'}
              onChange={(e) => handlePropertyChange('stroke', e.target.value)}
              className="p-1"
          />
        </div>
        <div>
          <Label htmlFor="image-stroke-width">Border Width</Label>
          <Input 
              id="image-stroke-width"
              type="number"
              value={object.strokeWidth || 0}
              onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value, 10))}
          />
        </div>
      </div>
    </div>
  );
}

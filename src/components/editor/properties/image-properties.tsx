
'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { fabric } from 'fabric';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';

interface ImagePropertiesProps {
  object: fabric.Image;
  updateObject: (id: string, properties: any) => void;
  updateObjectInRealTime: (id: string, properties: any) => void;
}

export function ImageProperties({ object, updateObject, updateObjectInRealTime }: ImagePropertiesProps) {
  
  const getBorderRadiusPercentage = (obj: fabric.Image) => {
    if (!obj.width || !obj.height) return 0;
    const borderRadius = obj.get('borderRadius') || 0;
    const maxRadius = Math.min(obj.width, obj.height) / 2;
    return maxRadius > 0 ? (borderRadius / maxRadius) * 100 : 0;
  };

  const [opacity, setOpacity] = useState(Math.round((object.opacity ?? 1) * 100));
  const [borderRadius, setBorderRadius] = useState(Math.round(getBorderRadiusPercentage(object)));

  useEffect(() => {
    setOpacity(Math.round((object.opacity ?? 1) * 100));
    setBorderRadius(Math.round(getBorderRadiusPercentage(object)));
  }, [object]);

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
  
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const newOpacity = isNaN(value) ? 100 : Math.max(0, Math.min(100, value));
    setOpacity(newOpacity);
    updateObjectInRealTime(object.id!, { opacity: newOpacity / 100 });
  };
  
  const handleBorderRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const newRadiusPercent = isNaN(value) ? 0 : Math.max(0, Math.min(100, value));
    setBorderRadius(newRadiusPercent);

    if (!object.width || !object.height) return;
    const maxRadius = Math.min(object.width, object.height) / 2;
    const pixelValue = (newRadiusPercent / 100) * maxRadius;
    updateObjectInRealTime(object.id!, { borderRadius: pixelValue });
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
              value={opacity}
              onChange={handleOpacityChange}
              onBlur={() => handlePropertyChange('opacity', opacity / 100)}
          />
        </div>
        <div>
          <Label htmlFor="image-border-radius">Border Radius (%)</Label>
          <Input 
              id="image-border-radius"
              type="number"
              min={0} max={100}
              value={borderRadius}
              onChange={handleBorderRadiusChange}
              onBlur={() => {
                  if (!object.width || !object.height) return;
                  const maxRadius = Math.min(object.width, object.height) / 2;
                  const pixelValue = (borderRadius / 100) * maxRadius;
                  handlePropertyChange('borderRadius', pixelValue);
              }}
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
              value={object.stroke || ''}
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

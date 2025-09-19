
'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { fabric } from 'fabric';
import { Slider } from '@/components/ui/slider';
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
      <div>
        <Label htmlFor="image-opacity">Opacity</Label>
        <Slider 
            id="image-opacity"
            min={0} max={1} step={0.01} 
            value={[object.opacity ?? 1]} 
            onValueChange={(value) => updateObjectInRealTime(object.id!, { opacity: value[0] })}
            onValueChangeCommit={(value) => handlePropertyChange('opacity', value[0])}
        />
      </div>
       <Separator />
      <div>
        <Label htmlFor="image-border-radius">Border Radius</Label>
        <Slider 
            id="image-border-radius"
            min={0} max={Math.min(object.width!, object.height!) / 2} step={1} 
            value={[borderRadius]} 
            onValueChange={(value) => updateObjectInRealTime(object.id!, { borderRadius: value[0] })}
            onValueChangeCommit={(value) => handlePropertyChange('borderRadius', value[0])}
        />
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

    


'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { fabric } from 'fabric';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

interface ImagePropertiesProps {
  object: fabric.Image;
  updateObject: (id: string, properties: any) => void;
}

export function ImageProperties({ object, updateObject }: ImagePropertiesProps) {
  
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
  
  const handleShadowPropertyChange = (prop: string, value: any) => {
    if (object.id) {
      const currentShadow = object.shadow as fabric.Shadow || new fabric.Shadow({});
      currentShadow.set({ [prop]: value });
      updateObject(object.id, { shadow: currentShadow });
    }
  };

  const shadow = object.shadow as fabric.Shadow;

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
            onValueChange={(value) => handlePropertyChange('opacity', value[0])}
        />
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="image-stroke">Border Color</Label>
          <Input 
              id="image-stroke"
              type="color"
              value={object.stroke}
              onChange={(e) => handlePropertyChange('stroke', e.target.value)}
              className="p-1"
          />
        </div>
        <div>
          <Label htmlFor="image-stroke-width">Border Width</Label>
          <Input 
              id="image-stroke-width"
              type="number"
              value={object.strokeWidth}
              onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value, 10))}
          />
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Shadow</h3>
        <div>
          <Label htmlFor="shadow-color">Color</Label>
          <Input 
            id="shadow-color"
            type="color"
            value={shadow?.color || '#000000'}
            onChange={(e) => handleShadowPropertyChange('color', e.target.value)}
            className="p-1"
          />
        </div>
        <div>
          <Label htmlFor="shadow-blur">Blur</Label>
          <Slider
            id="shadow-blur"
            min={0} max={50} step={1}
            value={[shadow?.blur || 0]}
            onValueChange={(val) => handleShadowPropertyChange('blur', val[0])}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="shadow-offset-x">Offset X</Label>
            <Input 
              id="shadow-offset-x"
              type="number"
              value={shadow?.offsetX || 0}
              onChange={(e) => handleShadowPropertyChange('offsetX', parseInt(e.target.value, 10))}
            />
          </div>
          <div>
            <Label htmlFor="shadow-offset-y">Offset Y</Label>
            <Input 
              id="shadow-offset-y"
              type="number"
              value={shadow?.offsetY || 0}
              onChange={(e) => handleShadowPropertyChange('offsetY', parseInt(e.target.value, 10))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

    
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { fabric } from 'fabric';

interface GeneralPropertiesProps {
  object: fabric.Object;
  updateObject: (id: string, properties: any) => void;
}

export function GeneralProperties({ object, updateObject }: GeneralPropertiesProps) {
    const handleInputChange = (prop: string, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && object.name) {
            updateObject(object.name, { [prop]: numValue });
        }
    };
    
    const handleSliderChange = (value: number[]) => {
        if (object.name) {
            updateObject(object.name, { angle: value[0] });
        }
    };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="pos-x" className="text-xs">X</Label>
          <Input id="pos-x" type="number" value={Math.round(object.left || 0)} onChange={(e) => handleInputChange('left', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="pos-y" className="text-xs">Y</Label>
          <Input id="pos-y" type="number" value={Math.round(object.top || 0)} onChange={(e) => handleInputChange('top', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="width" className="text-xs">Width</Label>
          <Input id="width" type="number" value={Math.round(object.getScaledWidth())} onChange={(e) => handleInputChange('width', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="height" className="text-xs">Height</Label>
          <Input id="height" type="number" value={Math.round(object.getScaledHeight())} onChange={(e) => handleInputChange('height', e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="rotation" className="text-xs">Rotation</Label>
        <Slider id="rotation" min={0} max={360} step={1} value={[Math.round(object.angle || 0)]} onValueChange={handleSliderChange} />
      </div>
    </div>
  );
}

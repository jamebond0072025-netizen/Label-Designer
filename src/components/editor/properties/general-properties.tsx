
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
    const isPlaceholder = object.get('isPlaceholder');

    const handleInputChange = (prop: string, value: string) => {
        const numValue = parseFloat(value);
        if (object.id) {
            if (prop === 'name') {
                 updateObject(object.id, { [prop]: value });
            }
            else if (isNaN(numValue)) {
                updateObject(object.id, { [prop]: value });
            } else {
                updateObject(object.id, { [prop]: numValue });
            }
        }
    };
    
    const handleSliderChange = (value: number[]) => {
        if (object.id) {
            updateObject(object.id, { angle: value[0] });
        }
    };

  return (
    <div className="space-y-4">
      {isPlaceholder ? (
        <div>
            <Label htmlFor="key" className="text-xs">Key</Label>
            <Input id="key" type="text" value={object.name} onChange={(e) => handleInputChange('name', e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">Unique identifier for data binding.</p>
        </div>
      ) : (
         <div>
            <Label htmlFor="name" className="text-xs">Name</Label>
            <Input id="name" type="text" value={object.name} onChange={(e) => handleInputChange('name', e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">Layer name.</p>
        </div>
      )}
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

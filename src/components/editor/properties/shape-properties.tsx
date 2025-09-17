
'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { fabric } from 'fabric';

interface ShapePropertiesProps {
  object: fabric.Object;
  updateObject: (id: string, properties: any) => void;
}

export function ShapeProperties({ object, updateObject }: ShapePropertiesProps) {
  
  const handlePropertyChange = (prop: string, value: any) => {
    if (object.id) {
      updateObject(object.id, { [prop]: value });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="shape-fill">Fill Color</Label>
        <Input 
            id="shape-fill"
            type="color"
            value={object.fill as string}
            onChange={(e) => handlePropertyChange('fill', e.target.value)}
            className="p-1"
        />
      </div>
      <div>
        <Label htmlFor="shape-stroke">Border Color</Label>
        <Input 
            id="shape-stroke"
            type="color"
            value={object.stroke as string}
            onChange={(e) => handlePropertyChange('stroke', e.target.value)}
            className="p-1"
        />
      </div>
      <div>
        <Label htmlFor="shape-stroke-width">Border Width</Label>
        <Input 
            id="shape-stroke-width"
            type="number"
            value={object.strokeWidth}
            onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value, 10))}
        />
      </div>
    </div>
  );
}

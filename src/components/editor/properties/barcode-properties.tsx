
'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { fabric } from 'fabric';

interface BarcodePropertiesProps {
  object: fabric.Object;
  updateObject: (id: string, properties: any) => void;
}

export function BarcodeProperties({ object, updateObject }: BarcodePropertiesProps) {
  
  const handlePropertyChange = (prop: string, value: any) => {
    if (object.id) {
      updateObject(object.id, { [prop]: value });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="barcode-value">Barcode Value</Label>
        <Input 
            id="barcode-value"
            type="text"
            value={object.get('barcodeValue') || ''}
            onChange={(e) => handlePropertyChange('barcodeValue', e.target.value)}
        />
      </div>
    </div>
  );
}

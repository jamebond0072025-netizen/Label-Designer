'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { fabric } from 'fabric';

interface ImagePropertiesProps {
  object: fabric.Image;
  updateObject: (id: string, properties: any) => void;
}

export function ImageProperties({ object, updateObject }: ImagePropertiesProps) {
  
  const handleUrlChange = (newUrl: string) => {
    if (object.name) {
        // Fabric's setSrc updates the image source
        object.setSrc(newUrl, () => {
            if(object.canvas) {
                object.canvas.renderAll();
            }
        }, { crossOrigin: 'anonymous' });
    }
  };

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
    </div>
  );
}

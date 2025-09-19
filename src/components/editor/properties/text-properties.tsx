
'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { fabric } from 'fabric';

interface TextPropertiesProps {
  object: fabric.Textbox;
  updateObject: (id: string, properties: any) => void;
}

export function TextProperties({ object, updateObject }: TextPropertiesProps) {
  
  const handlePropertyChange = (prop: string, value: any) => {
    if (object.id) {
      updateObject(object.id, { [prop]: value });
    }
  };
  
  const isPlaceholder = object.get('isPlaceholder');

  return (
    <div className="space-y-4">
      {!isPlaceholder && (
         <div>
            <Label htmlFor="text-content">Content</Label>
            <Textarea 
              id="text-content" 
              value={object.text} 
              onChange={(e) => handlePropertyChange('text', e.target.value)} 
              className="mt-1"
              disabled={isPlaceholder}
            />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="font-size">Font Size</Label>
          <Input 
            id="font-size" 
            type="number" 
            value={object.fontSize} 
            onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value, 10))}
          />
        </div>
        <div>
          <Label htmlFor="font-family">Font Family</Label>
          <Select 
            value={object.fontFamily} 
            onValueChange={(value) => handlePropertyChange('fontFamily', value)}
          >
            <SelectTrigger id="font-family">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Roboto">Roboto</SelectItem>
              <SelectItem value="Lato">Lato</SelectItem>
              <SelectItem value="Montserrat">Montserrat</SelectItem>
              <SelectItem value="Oswald">Oswald</SelectItem>
              <SelectItem value="Raleway">Raleway</SelectItem>
              <SelectItem value="Merriweather">Merriweather</SelectItem>
              <SelectItem value="Playfair Display">Playfair Display</SelectItem>
              <SelectItem value="Pacifico">Pacifico</SelectItem>
              <SelectItem value="Lobster">Lobster</SelectItem>
              <SelectItem value="Roboto Mono">Roboto Mono</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
       <div className="flex gap-2">
        <ToggleGroup 
          type="multiple" 
          variant="outline"
          value={[
            object.fontWeight === 'bold' ? 'bold' : '',
            object.fontStyle === 'italic' ? 'italic' : ''
          ]}
          onValueChange={(value) => {
            handlePropertyChange('fontWeight', value.includes('bold') ? 'bold' : 'normal');
            handlePropertyChange('fontStyle', value.includes('italic') ? 'italic' : 'normal');
          }}
        >
          <ToggleGroupItem value="bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
        </ToggleGroup>
         <ToggleGroup 
          type="single" 
          variant="outline"
          value={object.textAlign}
          onValueChange={(value) => handlePropertyChange('textAlign', value)}
        >
          <ToggleGroupItem value="left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div>
        <Label htmlFor="text-color">Color</Label>
        <Input 
            id="text-color"
            type="color"
            value={object.fill as string}
            onChange={(e) => handlePropertyChange('fill', e.target.value)}
            className="p-1"
        />
      </div>
    </div>
  );
}


'use client';

import { useEditor } from '../editor-provider';
import { TextProperties } from './properties/text-properties';
import { ShapeProperties } from './properties/shape-properties';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { GeneralProperties } from './properties/general-properties';
import { BarcodeProperties } from './properties/barcode-properties';
import { ImageProperties } from './properties/image-properties';

export function PropertiesPanel() {
  const { activeObject, updateObject, updateObjectInRealTime, deleteActiveObject } = useEditor();

  if (!activeObject) {
    return (
      <div className="text-sm text-muted-foreground text-center p-4">
        Select an object to see its properties.
      </div>
    );
  }

  const renderProperties = () => {
    const objectType = activeObject.type;
    switch (objectType) {
      case 'textbox':
        return <TextProperties object={activeObject as fabric.Textbox} updateObject={updateObject} />;
      case 'rect':
      case 'circle':
        return <ShapeProperties object={activeObject} updateObject={updateObject} />;
      case 'image':
         // Custom property `objectType` is used to identify barcodes
        if (activeObject.get('objectType') === 'barcode') {
          return <BarcodeProperties object={activeObject} updateObject={updateObject} />;
        }
        return <ImageProperties object={activeObject as fabric.Image} updateObject={updateObject} updateObjectInRealTime={updateObjectInRealTime} />;
      default:
        return (
          <div className="text-sm text-muted-foreground">
            No specific properties for type: {objectType}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <GeneralProperties object={activeObject} updateObject={updateObject} />
      <Separator />
      {renderProperties()}
      <Separator />
      <Button variant="destructive" className="w-full mt-4" onClick={deleteActiveObject}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Object
      </Button>
    </div>
  );
}

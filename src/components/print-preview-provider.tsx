
'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { fabric as FabricType } from 'fabric';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import { predefinedSizes } from '@/lib/predefined-sizes';

interface PrintSettings {
  pageSize: string;
  marginTop: number;
  marginLeft: number;
  gapHorizontal: number;
  gapVertical: number;
}

interface PrintPreviewContextType {
  canvas: FabricType.Canvas | null;
  initCanvas: (el: HTMLCanvasElement, container: HTMLDivElement) => void;
  fabric: typeof FabricType.fabric | null;
  settings: PrintSettings;
  setSettings: React.Dispatch<React.SetStateAction<PrintSettings>>;
  exportAsPdf: () => void;
  isLoading: boolean;
}

const PrintPreviewContext = createContext<PrintPreviewContextType | undefined>(undefined);

const CUSTOM_PROPS = ['id', 'name', 'objectType', 'barcodeValue', 'isPlaceholder', 'borderRadius'];

// MOCK: Hardcoded template data
const MOCK_TEMPLATE_JSON = {
    "version": "5.3.0",
    "objects": [
        {
            "type": "textbox",
            "version": "5.3.0",
            "originX": "left",
            "originY": "top",
            "left": 20,
            "top": 20,
            "width": 200,
            "height": 22.6,
            "fill": "#000000",
            "stroke": null,
            "strokeWidth": 1,
            "fontFamily": "Inter",
            "fontSize": 20,
            "text": "{{text-1}}",
            "textAlign": "left",
            "id": "e0a6b2c8",
            "name": "text-1",
            "isPlaceholder": true
        },
        {
            "type": "image",
            "version": "5.3.0",
            "originX": "left",
            "originY": "top",
            "left": 20,
            "top": 50,
            "width": 200,
            "height": 75,
            "id": "a9b3c1d4",
            "name": "barcode-1",
            "objectType": "barcode",
            "barcodeValue": "1234567890",
            "isPlaceholder": true
        },
         {
            "type": "image",
            "version": "5.3.0",
            "originX": "left",
            "originY": "top",
            "left": 230,
            "top": 20,
            "width": 150,
            "height": 112.5,
            "scaleX": 0.75,
            "scaleY": 0.75,
            "src": "https://placehold.co/400x300/EFEFEF/AAAAAA?text=Placeholder",
            "crossOrigin": "anonymous",
            "id": "c5d8e2f1",
            "name": "image-1",
            "isPlaceholder": true
        }
    ]
};
const MOCK_LABEL_WIDTH = 400;
const MOCK_LABEL_HEIGHT = 150;


// MOCK: This would typically be fetched based on the jsonId from the URL
const MOCK_JSON_DATA = [
  { "text-1": "John Doe", "barcode-1": "123456", "image-1": "https://picsum.photos/seed/1/400/300" },
  { "text-1": "Jane Smith", "barcode-1": "789012", "image-1": "https://picsum.photos/seed/2/400/300" },
  { "text-1": "Peter Jones", "barcode-1": "345678", "image-1": "https://picsum.photos/seed/3/400/300" },
  { "text-1": "Mary Williams", "barcode-1": "901234", "image-1": "https://picsum.photos/seed/4/400/300" },
  { "text-1": "David Brown", "barcode-1": "567890", "image-1": "https://picsum.photos/seed/5/400/300" },
  { "text-1": "Sarah Taylor", "barcode-1": "112233", "image-1": "https://picsum.photos/seed/6/400/300" },
  { "text-1": "James Wilson", "barcode-1": "445566", "image-1": "https://picsum.photos/seed/7/400/300" },
  { "text-1": "Linda Martinez", "barcode-1": "778899", "image-1": "https://picsum.photos/seed/8/400/300" },
  { "text-1": "Robert Anderson", "barcode-1": "101112", "image-1": "https://picsum.photos/seed/9/400/300" },
  { "text-1": "Patricia Thomas", "barcode-1": "131415", "image-1": "https://picsum.photos/seed/10/400/300" },
];

export const PrintPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<FabricType.Canvas | null>(null);
  const [fabric, setFabric] = useState<typeof FabricType.fabric | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [settings, setSettings] = useState<PrintSettings>({
    pageSize: 'A4',
    marginTop: 20,
    marginLeft: 20,
    gapHorizontal: 10,
    gapVertical: 10,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('fabric').then((fabricModule) => {
        setFabric(fabricModule.fabric);
      });
    }
  }, []);

  const initCanvas = useCallback((el: HTMLCanvasElement, container: HTMLDivElement) => {
    if (!fabric) return;

    if (canvas) {
      canvas.dispose();
    }

    const pageSize = predefinedSizes.find(s => s.name.startsWith(settings.pageSize));
    const width = pageSize ? pageSize.width : 794; // A4 width default
    const height = pageSize ? pageSize.height : 1122; // A4 height default

    const canvasInstance = new fabric.Canvas(el, {
      width: width,
      height: height,
      backgroundColor: '#ffffff',
      selection: false,
    });

    setCanvas(canvasInstance);

    return () => {
      canvasInstance.dispose();
    };
  }, [fabric, settings.pageSize, canvas]);
  
  const createLabelAsImage = useCallback(async (
    fabricInstance: typeof FabricType.fabric,
    templateJson: any,
    labelWidth: number,
    labelHeight: number,
    record: Record<string, string>
  ): Promise<FabricType.Image> => {
    const labelCanvas = new fabricInstance.StaticCanvas(null, {
      width: labelWidth,
      height: labelHeight,
    });

    const loadCanvasPromise = new Promise<void>((resolve) => {
      labelCanvas.loadFromJSON(templateJson, () => resolve());
    });
    await loadCanvasPromise;

    const updatePromises: Promise<any>[] = [];

    for (const obj of labelCanvas.getObjects()) {
      if (obj.get('isPlaceholder') && obj.name && record[obj.name]) {
        const value = record[obj.name];
        if (obj.type === 'textbox') {
          (obj as FabricType.Textbox).set('text', value);
        } else if (obj.get('objectType') === 'barcode') {
          const barcodeCanvasEl = document.createElement('canvas');
          try {
            JsBarcode(barcodeCanvasEl, value, { format: 'CODE128', displayValue: true, fontSize: 20 });
            const dataUrl = barcodeCanvasEl.toDataURL('image/png');
            const p = new Promise<void>(resolveImg => {
              (obj as FabricType.Image).setSrc(dataUrl, () => resolveImg(), { crossOrigin: 'anonymous' });
            });
            updatePromises.push(p);
          } catch (e) {
            console.error("Failed to generate barcode for value:", value, e);
          }
        } else if (obj.type === 'image') {
          const p = new Promise<void>(resolveImg => {
            (obj as FabricType.Image).setSrc(value, () => resolveImg(), { crossOrigin: 'anonymous' });
          });
          updatePromises.push(p);
        }
      }
    }

    await Promise.all(updatePromises);
    labelCanvas.renderAll();

    return new Promise<FabricType.Image>((resolve) => {
      const dataURL = labelCanvas.toDataURL({ format: 'png' });
      fabricInstance.Image.fromURL(dataURL, (img) => {
        resolve(img);
      }, { crossOrigin: 'anonymous' });
    });
  }, []);


  const renderLabels = useCallback(async () => {
    if (!canvas || !fabric) return;

    setIsLoading(true);
    canvas.clear();
    
    // In a real app, you would fetch these from a server. Here we use mock data.
    const templateJson = MOCK_TEMPLATE_JSON;
    const labelData = MOCK_JSON_DATA;

    if (!templateJson) {
      toast({ title: 'Error', description: 'No template found.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    
    const labelWidth = MOCK_LABEL_WIDTH;
    const labelHeight = MOCK_LABEL_HEIGHT;

    let currentX = settings.marginLeft;
    let currentY = settings.marginTop;

    for (const record of labelData) {
      if (currentY + labelHeight > canvas.height!) {
        break; // No more space on the page
      }

      const labelImage = await createLabelAsImage(fabric, templateJson, labelWidth, labelHeight, record);
      
      labelImage.set({
          left: currentX,
          top: currentY,
          selectable: false,
          evented: false,
      });
      canvas.add(labelImage);
      
      currentX += labelWidth + settings.gapHorizontal;
      if (currentX + labelWidth > canvas.width!) {
        currentX = settings.marginLeft;
        currentY += labelHeight + settings.gapVertical;
      }
    }
    
    canvas.renderAll();
    setIsLoading(false);

  }, [canvas, fabric, settings, toast, createLabelAsImage]);


  useEffect(() => {
    if (canvas && fabric) {
        const pageSize = predefinedSizes.find(s => s.name.startsWith(settings.pageSize));
        const width = pageSize ? pageSize.width : 794;
        const height = pageSize ? pageSize.height : 1122;
        canvas.setDimensions({ width, height });
        renderLabels();
    }
  }, [settings, canvas, fabric]);


  const exportAsPdf = () => {
    if (!canvas) return;

    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2 // Higher resolution
    });
    
    const pdf = new jsPDF({
      orientation: canvas.width! > canvas.height! ? 'l' : 'p',
      unit: 'px',
      format: [canvas.width!, canvas.height!]
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.width!, canvas.height!);
    pdf.save('print-preview.pdf');
    toast({ title: 'Exported as PDF!' });
  };


  const value = {
    canvas,
    initCanvas,
    fabric,
    settings,
    setSettings,
    exportAsPdf,
    isLoading
  };

  return (
    <PrintPreviewContext.Provider value={value}>
      {children}
    </PrintPreviewContext.Provider>
  );
};

export const usePrintPreview = () => {
  const context = useContext(PrintPreviewContext);
  if (context === undefined) {
    throw new Error('usePrintPreview must be used within a PrintPreviewProvider');
  }
  return context;
};

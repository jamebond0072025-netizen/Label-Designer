
'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import type { fabric as FabricType } from 'fabric';
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
  scale: number;
}

interface PrintPreviewContextType {
  canvas: FabricType.Canvas | null;
  initCanvas: (el: HTMLCanvasElement, container: HTMLDivElement) => void;
  fabric: typeof FabricType.fabric | null;
  settings: PrintSettings;
  setSettings: React.Dispatch<React.SetStateAction<PrintSettings>>;
  exportAsPdf: () => void;
  isLoading: boolean;
  jsonData: Record<string, string>[];
  showRealData: boolean;
  setShowRealData: React.Dispatch<React.SetStateAction<boolean>>;
}

const PrintPreviewContext = createContext<PrintPreviewContextType | undefined>(undefined);

const MOCK_TEMPLATE_JSON = {
    "version": "5.3.0",
    "objects": [
        {
            "type": "textbox", "version": "5.3.0", "originX": "left", "originY": "top", "left": 20, "top": 20, "width": 200, "height": 22.6, "fill": "#000000",
            "stroke": null, "strokeWidth": 1, "fontFamily": "Inter", "fontSize": 20, "text": "{{text-1}}", "textAlign": "left", "id": "e0a6b2c8", "name": "text-1", "isPlaceholder": true
        },
        {
            "type": "image", "version": "5.3.0", "originX": "left", "originY": "top", "left": 20, "top": 50, "width": 200, "height": 75, "id": "a9b3c1d4", "name": "barcode-1",
            "objectType": "barcode", "barcodeValue": "barcode-1", "isPlaceholder": true
        },
         {
            "type": "image", "version": "5.3.0", "originX": "left", "originY": "top", "left": 230, "top": 20, "width": 150, "height": 112.5, "scaleX": 0.75, "scaleY": 0.75,
            "src": "https://placehold.co/400x300/EFEFEF/AAAAAA?text=image-1", "crossOrigin": "anonymous", "id": "c5d8e2f1", "name": "image-1", "isPlaceholder": true
        }
    ],
    "width": 400, "height": 150
};

const MOCK_JSON_DATA = [
    { "text-1": "First Item", "barcode-1": "123456789012", "image-1": "https://picsum.photos/seed/1/400/300" },
    { "text-1": "Second Item", "barcode-1": "987654321098", "image-1": "https://picsum.photos/seed/2/400/300" },
    { "text-1": "Third Item", "barcode-1": "112233445566", "image-1": "https://picsum.photos/seed/3/400/300" },
    { "text-1": "Fourth Item", "barcode-1": "778899001122", "image-1": "https://picsum.photos/seed/4/400/300" },
    { "text-1": "Fifth Item", "barcode-1": "334455667788", "image-1": "https://picsum.photos/seed/5/400/300" },
    { "text-1": "Sixth Item", "barcode-1": "990011223344", "image-1": "https://picsum.photos/seed/6/400/300" },
    { "text-1": "Seventh Item", "barcode-1": "556677889900", "image-1": "https://picsum.photos/seed/7/400/300" },
    { "text-1": "Eighth Item", "barcode-1": "121212121212", "image-1": "https://picsum.photos/seed/8/400/300" },
    { "text-1": "Ninth Item", "barcode-1": "343434343434", "image-1": "https://picsum.photos/seed/9/400/300" },
    { "text-1": "Tenth Item", "barcode-1": "565656565656", "image-1": "https://picsum.photos/seed/10/400/300" },
    { "text-1": "Eleventh Item", "barcode-1": "123456789012", "image-1": "https://picsum.photos/seed/11/400/300" },
    { "text-1": "Twelfth Item", "barcode-1": "987654321098", "image-1": "https://picsum.photos/seed/12/400/300" },
    { "text-1": "Thirteenth Item", "barcode-1": "112233445566", "image-1": "https://picsum.photos/seed/13/400/300" },
    { "text-1": "Fourteenth Item", "barcode-1": "778899001122", "image-1": "https://picsum.photos/seed/14/400/300" },
    { "text-1": "Fifteenth Item", "barcode-1": "334455667788", "image-1": "https://picsum.photos/seed/15/400/300" }
];

export const PrintPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<FabricType.Canvas | null>(null);
  const [fabric, setFabric] = useState<typeof FabricType.fabric | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCanvasInitialized, setIsCanvasInitialized] = useState(false);
  const { toast } = useToast();
  const [showRealData, setShowRealData] = useState(false);

  const [settings, setSettings] = useState<PrintSettings>({
    pageSize: 'A4',
    marginTop: 20,
    marginLeft: 20,
    gapHorizontal: 10,
    gapVertical: 10,
    scale: 1,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('fabric').then((fabricModule) => {
        setFabric(fabricModule.fabric);
      });
    }
  }, []);

  const initCanvas = useCallback((el: HTMLCanvasElement, container: HTMLDivElement) => {
    if (!fabric || isCanvasInitialized) return;

    const pageSize = predefinedSizes.find(s => s.name.startsWith(settings.pageSize));
    const width = pageSize ? pageSize.width : 794;
    const height = pageSize ? pageSize.height : 1122;

    const canvasInstance = new fabric.Canvas(el, {
      width, height, backgroundColor: '#ffffff', selection: false,
    });
    setCanvas(canvasInstance);
    setIsCanvasInitialized(true);
    
    return () => {
        canvasInstance.dispose();
        setIsCanvasInitialized(false);
    }
  }, [fabric, settings.pageSize, isCanvasInitialized]);

  const createLabelAsImage = useCallback(async (
    fabricInstance: typeof FabricType.fabric,
    templateJson: any,
    record: Record<string, string>
  ): Promise<FabricType.Image> => {
    
    const labelCanvas = new fabricInstance.StaticCanvas(null, {
      width: templateJson.width,
      height: templateJson.height,
    });

    const clonedObjects = JSON.parse(JSON.stringify(templateJson.objects));

    await new Promise<void>((resolve) => labelCanvas.loadFromJSON({ objects: clonedObjects }, () => resolve()));

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
            updatePromises.push(new Promise<void>(res => (obj as FabricType.Image).setSrc(dataUrl, () => res(), { crossOrigin: 'anonymous' })));
          } catch (e) { console.error("Barcode generation failed:", value, e); }
        } else if (obj.type === 'image') {
          updatePromises.push(new Promise<void>(res => (obj as FabricType.Image).setSrc(value, () => res(), { crossOrigin: 'anonymous' })));
        }
      }
    }

    await Promise.all(updatePromises);
    labelCanvas.renderAll();

    const dataURL = labelCanvas.toDataURL({
        format: 'png',
        multiplier: 2, // Increase resolution for better quality
    });
    
    labelCanvas.dispose();

    return new Promise<FabricType.Image>((resolve) => {
      fabricInstance.Image.fromURL(dataURL, (img) => {
        resolve(img);
      }, { crossOrigin: 'anonymous' });
    });
  }, []);
  
  const renderLabels = useCallback(async () => {
    if (!canvas || !fabric) return;
    setIsLoading(true);
    canvas.clear();

    const templateJson = MOCK_TEMPLATE_JSON;
    const data = MOCK_JSON_DATA;

    const scaledWidth = templateJson.width * settings.scale;
    const scaledHeight = templateJson.height * settings.scale;
    
    let currentX = settings.marginLeft;
    let currentY = settings.marginTop;

    const labelsToRender = showRealData ? data.length : 50; 
    let masterLabelImage: FabricType.Image | null = null;
    let placeholderRect: FabricType.Rect | null = null;
    
    if (showRealData && data.length > 0) {
        // Since each label is unique, we can't use a master image.
    } else {
        placeholderRect = new fabric.Rect({
            width: scaledWidth,
            height: scaledHeight,
            fill: '#f0f0f0',
            stroke: '#cccccc',
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
        });
    }

    for (let i = 0; i < labelsToRender; i++) {
        if (currentY + scaledHeight > canvas.getHeight()) {
            break; 
        }

        if (showRealData) {
            const record = data[i];
            if (!record) continue;
            
            const labelImage = await createLabelAsImage(fabric, templateJson, record);
            labelImage.scaleToWidth(scaledWidth);
            labelImage.set({ left: currentX, top: currentY, selectable: false, evented: false });
            canvas.add(labelImage);
        } else {
            if (placeholderRect) {
                const placeholderClone = await new Promise<FabricType.Rect>(resolve => placeholderRect!.clone(resolve));
                placeholderClone.set({ left: currentX, top: currentY });
                canvas.add(placeholderClone);
            }
        }

        currentX += scaledWidth + settings.gapHorizontal;

        if (currentX + scaledWidth > canvas.getWidth()) {
            currentX = settings.marginLeft;
            currentY += scaledHeight + settings.gapVertical;
        }
    }
    
    canvas.renderAll();
    setIsLoading(false);
  }, [canvas, fabric, settings, showRealData, createLabelAsImage]);

  useEffect(() => {
    if (fabric && canvas) {
        const pageSize = predefinedSizes.find(s => s.name.startsWith(settings.pageSize));
        const width = pageSize ? pageSize.width : 794;
        const height = pageSize ? pageSize.height : 1122;
        if (canvas.getWidth() !== width || canvas.getHeight() !== height) {
            canvas.setDimensions({ width, height });
        }
        renderLabels();
    }
  }, [settings, showRealData, fabric, canvas, renderLabels]);

  const exportAsPdf = async () => {
    if (!fabric) return;
    toast({ title: 'Generating PDF...', description: 'Please wait, this may take a moment.' });
    setIsLoading(true);

    const pageSize = predefinedSizes.find(s => s.name.startsWith(settings.pageSize));
    const pageW = pageSize ? pageSize.width : 794;
    const pageH = pageSize ? pageSize.height : 1122;
    
    const pdf = new jsPDF({
      orientation: pageW > pageH ? 'l' : 'p',
      unit: 'px',
      format: [pageW, pageH]
    });
    pdf.deletePage(1); // Remove default blank page

    let dataToProcess = [...MOCK_JSON_DATA];
    let isFirstPage = true;

    while(dataToProcess.length > 0) {
        if (!isFirstPage) {
          pdf.addPage([pageW, pageH], pageW > pageH ? 'l' : 'p');
        } else {
          // For the first page, jspdf adds one by default if we delete the initial one.
          // If we are going to add pages, let's start with a clean slate.
          // This logic seems a bit redundant after deleting page 1, but jspdf can be quirky.
          // A safer approach is to manage page adding explicitly.
          pdf.addPage([pageW, pageH], pageW > pageH ? 'l' : 'p');
          isFirstPage = false;
        }

        const pageCanvas = new fabric.StaticCanvas(null, {
            width: pageW,
            height: pageH,
            backgroundColor: '#ffffff'
        });

        let currentX = settings.marginLeft;
        let currentY = settings.marginTop;
        
        const scaledWidth = MOCK_TEMPLATE_JSON.width * settings.scale;
        const scaledHeight = MOCK_TEMPLATE_JSON.height * settings.scale;

        while(dataToProcess.length > 0) {
            // Check if the next label fits on the current page
            if (currentY + scaledHeight > pageH) {
                break; // Move to the next page
            }
            
            const record = dataToProcess.shift();
            if (!record) continue;

            const labelImage = await createLabelAsImage(fabric, MOCK_TEMPLATE_JSON, record);
            labelImage.scaleToWidth(scaledWidth);
            labelImage.set({ left: currentX, top: currentY });
            pageCanvas.add(labelImage);

            currentX += scaledWidth + settings.gapHorizontal;
            if (currentX + scaledWidth > pageW) {
                currentX = settings.marginLeft;
                currentY += scaledHeight + settings.gapVertical;
            }
        }
        
        await new Promise<void>(resolve => {
            pageCanvas.renderAll();
            setTimeout(resolve, 100); 
        });
        
        const dataUrl = pageCanvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
        pdf.addImage(dataUrl, 'PNG', 0, 0, pageW, pageH);
        pageCanvas.dispose();
    }
    
    pdf.save('print-labels.pdf');
    toast({ title: 'Exported as PDF!' });
    setIsLoading(false);
  };

  const value = {
    canvas,
    initCanvas,
    fabric,
    settings,
    setSettings,
    exportAsPdf,
    isLoading,
    jsonData: MOCK_JSON_DATA,
    showRealData,
    setShowRealData,
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

    
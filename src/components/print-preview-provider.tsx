
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
            "type": "rect",
            "version": "5.3.0",
            "originX": "left",
            "originY": "top",
            "left": 174.5,
            "top": 260,
            "width": 250,
            "height": 2,
            "fill": "#e0e0e0",
            "stroke": null,
            "strokeWidth": 1,
            "id": "separator-line"
        },
        {
            "type": "image",
            "version": "5.3.0",
            "originX": "left",
            "originY": "top",
            "left": 50,
            "top": 30,
            "width": 500,
            "height": 200,
            "scaleX": 0.8,
            "scaleY": 0.8,
            "src": "https://placehold.co/500x250/EFEFEF/AAAAAA?text=Product+Image",
            "crossOrigin": "anonymous",
            "id": "c5d8e2f1",
            "name": "image-1",
            "isPlaceholder": true
        },
        {
            "type": "textbox",
            "version": "5.3.0",
            "originX": "left",
            "originY": "top",
            "left": 100,
            "top": 210,
            "width": 400,
            "height": 45.2,
            "fill": "#333333",
            "stroke": null,
            "strokeWidth": 1,
            "fontFamily": "Helvetica",
            "fontWeight": "bold",
            "fontSize": 40,
            "text": "{{text-1}}",
            "textAlign": "center",
            "id": "e0a6b2c8",
            "name": "text-1",
            "isPlaceholder": true
        },
        {
            "type": "image",
            "version": "5.3.0",
            "originX": "left",
            "originY": "top",
            "left": 150,
            "top": 280,
            "width": 300,
            "height": 90,
            "id": "a9b3c1d4",
            "name": "barcode-1",
            "objectType": "barcode",
            "barcodeValue": "barcode-1",
            "isPlaceholder": true
        }
    ],
    "width": 600,
    "height": 400
};

const MOCK_JSON_DATA = [
    { "text-1": "Classic Leather Wallet", "barcode-1": "123456789012", "image-1": "https://picsum.photos/seed/product1/500/250" },
    { "text-1": "Stainless Steel Watch", "barcode-1": "987654321098", "image-1": "https://picsum.photos/seed/product2/500/250" },
    { "text-1": "Organic Green Tea", "barcode-1": "112233445566", "image-1": "https://picsum.photos/seed/product3/500/250" },
    { "text-1": "Wireless Headphones", "barcode-1": "778899001122", "image-1": "https://picsum.photos/seed/product4/500/250" },
    { "text-1": "Scented Soy Candle", "barcode-1": "334455667788", "image-1": "https://picsum.photos/seed/product5/500/250" },
    { "text-1": "Handmade Ceramic Mug", "barcode-1": "990011223344", "image-1": "https://picsum.photos/seed/product6/500/250" },
    { "text-1": "Gourmet Coffee Beans", "barcode-1": "556677889900", "image-1": "https://picsum.photos/seed/product7/500/250" },
    { "text-1": "Plush Cotton Towel", "barcode-1": "121212121212", "image-1": "https://picsum.photos/seed/product8/500/250" },
    { "text-1": "Yoga Mat", "barcode-1": "343434343434", "image-1": "https://picsum.photos/seed/product9/500/250" },
    { "text-1": "Eco-Friendly Water Bottle", "barcode-1": "565656565656", "image-1": "https://picsum.photos/seed/product10/500/250" },
    { "text-1": "Silk Sleep Mask", "barcode-1": "123456789012", "image-1": "https://picsum.photos/seed/product11/500/250" },
    { "text-1": "Artisan Chocolate Bar", "barcode-1": "987654321098", "image-1": "https://picsum.photos/seed/product12/500/250" },
    { "text-1": "Bamboo Toothbrush Set", "barcode-1": "112233445566", "image-1": "https://picsum.photos/seed/product13/500/250" },
    { "text-1": "Leather Bound Journal", "barcode-1": "778899001122", "image-1": "https://picsum.photos/seed/product14/500/250" },
    { "text-1": "Miniature Desk Plant", "barcode-1": "334455667788", "image-1": "https://picsum.photos/seed/product15/500/250" }
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

  const renderLabels = useCallback(async () => {
    if (!canvas || !fabric || !isCanvasInitialized) return;
    setIsLoading(true);
    canvas.clear();

    const templateJson = MOCK_TEMPLATE_JSON;
    const data = MOCK_JSON_DATA;

    const scaledWidth = templateJson.width * settings.scale;
    const scaledHeight = templateJson.height * settings.scale;
    
    let currentX = settings.marginLeft;
    let currentY = settings.marginTop;

    const labelsToRender = showRealData ? data.length : 50; 
    let placeholderRect: FabricType.Rect | null = null;
    
    if (!showRealData) {
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
  }, [canvas, fabric, settings, showRealData, isCanvasInitialized]);
  
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
  
  useEffect(() => {
    if (fabric && canvas) {
        const pageSize = predefinedSizes.find(s => s.name.startsWith(settings.pageSize));
        const width = pageSize ? pageSize.width : 794;
        const height = pageSize ? pageSize.height : 1122;
        if (canvas.getWidth() !== width || canvas.getHeight() !== height) {
            canvas.setDimensions({ width, height });
        }
    }
    renderLabels();
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
    pdf.deletePage(1);

    let dataToProcess = [...MOCK_JSON_DATA];
    let isFirstPage = true;

    while(dataToProcess.length > 0) {
        pdf.addPage([pageW, pageH], pageW > pageH ? 'l' : 'p');
        
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
            if (currentY + scaledHeight > pageH) {
                break;
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

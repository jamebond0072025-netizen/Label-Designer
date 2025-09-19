
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
  labelWidth: number;
  labelHeight: number;
}

interface PrintPreviewContextType {
  canvas: FabricType.Canvas | null;
  initCanvas: (el: HTMLCanvasElement, container: HTMLDivElement) => void;
  fabric: typeof FabricType.fabric | null;
  settings: PrintSettings;
  setSettings: React.Dispatch<React.SetStateAction<PrintSettings>>;
  exportAsPdf: () => void;
  isLoading: boolean;
  jsonData: string;
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
    { "text-1": "Tenth Item", "barcode-1": "565656565656", "image-1": "https://picsum.photos/seed/10/400/300" }
];

export const PrintPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<FabricType.Canvas | null>(null);
  const [fabric, setFabric] = useState<typeof FabricType.fabric | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [settings, setSettings] = useState<PrintSettings>({
    pageSize: 'A4',
    marginTop: 20,
    marginLeft: 20,
    gapHorizontal: 10,
    gapVertical: 10,
    labelWidth: MOCK_TEMPLATE_JSON.width,
    labelHeight: MOCK_TEMPLATE_JSON.height,
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
    if (canvas) canvas.dispose();

    const pageSize = predefinedSizes.find(s => s.name.startsWith(settings.pageSize));
    const width = pageSize ? pageSize.width : 794;
    const height = pageSize ? pageSize.height : 1122;

    const canvasInstance = new fabric.Canvas(el, {
      width, height, backgroundColor: '#ffffff', selection: false,
    });
    setCanvas(canvasInstance);
    return () => canvasInstance.dispose();
  }, [fabric, settings.pageSize, canvas]);

  const createLabelAsImage = useCallback(async (
    fabricInstance: typeof FabricType.fabric,
    templateJson: any,
    record: Record<string, string>,
    targetWidth: number,
    targetHeight: number
  ): Promise<FabricType.Image> => {
    
    const labelCanvas = new fabricInstance.StaticCanvas(null, {
      width: templateJson.width,
      height: templateJson.height,
    });

    await new Promise<void>((resolve) => labelCanvas.loadFromJSON({ objects: templateJson.objects }, () => resolve()));

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

    // Create a container canvas of the target size
    const containerCanvas = new fabricInstance.StaticCanvas(null, {
        width: targetWidth,
        height: targetHeight,
        backgroundColor: 'transparent',
    });

    // Add the rendered label to the container (it will be clipped if larger)
    labelCanvas.cloneAsImage((img) => {
        img.set({ left: 0, top: 0 });
        containerCanvas.add(img);
        containerCanvas.renderAll();
    });

    const dataURL = containerCanvas.toDataURL({ format: 'png' });
    
    labelCanvas.dispose();
    containerCanvas.dispose();

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
    
    const sampleRecord: Record<string, string> = {};
    templateJson.objects.forEach((obj: any) => {
        if (obj.isPlaceholder && obj.name) {
             sampleRecord[obj.name] = `{{${obj.name}}}`;
        }
    });

    const singleLabelImage = await createLabelAsImage(fabric, templateJson, sampleRecord, settings.labelWidth, settings.labelHeight);

    let currentX = settings.marginLeft;
    let currentY = settings.marginTop;

    while (currentY + settings.labelHeight <= canvas.height!) {
        while (currentX + settings.labelWidth <= canvas.width!) {
            await new Promise<void>(resolve => {
                singleLabelImage.clone((clonedImg: FabricType.Image) => {
                    clonedImg.set({ left: currentX, top: currentY, selectable: false, evented: false });
                    canvas.add(clonedImg);
                    resolve();
                });
            });
            currentX += settings.labelWidth + settings.gapHorizontal;
        }
        currentX = settings.marginLeft;
        currentY += settings.labelHeight + settings.gapVertical;
    }


    canvas.renderAll();
    setIsLoading(false);
  }, [canvas, fabric, settings, createLabelAsImage]);

  useEffect(() => {
    if (canvas && fabric) {
        const pageSize = predefinedSizes.find(s => s.name.startsWith(settings.pageSize));
        const width = pageSize ? pageSize.width : 794;
        const height = pageSize ? pageSize.height : 1122;
        canvas.setDimensions({ width, height });
        renderLabels();
    }
  }, [settings, canvas, fabric, renderLabels]);

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
    pdf.deletePage(1); // Start with a clean slate

    let dataToProcess = [...MOCK_JSON_DATA];
    let pageNumber = 0;

    while(dataToProcess.length > 0) {
        pageNumber++;
        if (pageNumber > 1) {
            pdf.addPage([pageW, pageH], pageW > pageH ? 'l' : 'p');
        }

        const pageCanvas = new fabric.StaticCanvas(null, {
            width: pageW,
            height: pageH,
            backgroundColor: '#ffffff'
        });

        let currentX = settings.marginLeft;
        let currentY = settings.marginTop;
        let canFitMore = true;

        while(canFitMore && dataToProcess.length > 0) {
            const record = dataToProcess.shift();
            if (!record) continue;

            const labelImage = await createLabelAsImage(fabric, MOCK_TEMPLATE_JSON, record, settings.labelWidth, settings.labelHeight);
            labelImage.set({ left: currentX, top: currentY });
            pageCanvas.add(labelImage);

            currentX += settings.labelWidth + settings.gapHorizontal;
            if (currentX + settings.labelWidth > pageW) {
                currentX = settings.marginLeft;
                currentY += settings.labelHeight + settings.gapVertical;
                if (currentY + settings.labelHeight > pageH) {
                    canFitMore = false;
                }
            }
        }
        
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
    jsonData: JSON.stringify(MOCK_JSON_DATA, null, 2),
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

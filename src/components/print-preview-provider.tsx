
'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
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
  fabric: typeof FabricType | null;
  settings: PrintSettings;
  setSettings: React.Dispatch<React.SetStateAction<PrintSettings>>;
  exportAsPdf: () => void;
  isLoading: boolean;
}

const PrintPreviewContext = createContext<PrintPreviewContextType | undefined>(undefined);

const CUSTOM_PROPS = ['id', 'name', 'objectType', 'barcodeValue', 'isPlaceholder', 'borderRadius'];

export const PrintPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<FabricType.Canvas | null>(null);
  const [fabric, setFabric] = useState<typeof FabricType | null>(null);
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

  const renderLabels = useCallback(async () => {
    if (!canvas || !fabric) return;

    setIsLoading(true);
    canvas.clear();
    
    // In a real app, you would fetch these from a server using the IDs from the URL
    // For now, we use mock data.
    const templateId = searchParams.get('templateId');
    const jsonId = searchParams.get('jsonId');

    // MOCK: Fetch template. Using local storage as a mock database.
    const mockTemplateData = localStorage.getItem('__mock_template');
    
    // MOCK: Fetch JSON data.
    const mockJsonData = [
      { "text-1": "John Doe", "barcode-1": "123456", "image-1": "https://picsum.photos/seed/1/400/300" },
      { "text-1": "Jane Smith", "barcode-1": "789012", "image-1": "https://picsum.photos/seed/2/400/300" },
      { "text-1": "Peter Jones", "barcode-1": "345678", "image-1": "https://picsum.photos/seed/3/400/300" },
      { "text-1": "Mary Williams", "barcode-1": "901234", "image-1": "https://picsum.photos/seed/4/400/300" },
      { "text-1": "David Brown", "barcode-1": "567890", "image-1": "https://picsum.photos/seed/5/400/300" },
    ];

    if (!mockTemplateData) {
      toast({ title: 'Error', description: 'No template found. Please save a template first in the editor.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    
    const templateJson = JSON.parse(mockTemplateData);
    const labelWidth = templateJson.width;
    const labelHeight = templateJson.height;

    let currentX = settings.marginLeft;
    let currentY = settings.marginTop;

    for (const record of mockJsonData) {
      if (currentY + labelHeight > canvas.height!) {
        break; // No more space on the page
      }

      const labelCanvas = new fabric.StaticCanvas(null, {
        width: labelWidth,
        height: labelHeight,
      });

      // Create a promise to await canvas loading
      const loadPromise = new Promise<void>((resolve) => {
          labelCanvas.loadFromJSON(templateJson.canvas, async () => {
            for (const obj of labelCanvas.getObjects()) {
                if (obj.get('isPlaceholder') && obj.name && record[obj.name]) {
                    const value = record[obj.name];
                    if (obj.type === 'textbox') {
                        (obj as FabricType.Textbox).set('text', value);
                    } else if (obj.get('objectType') === 'barcode') {
                         const barcodeCanvasEl = document.createElement('canvas');
                         JsBarcode(barcodeCanvasEl, value, { format: 'CODE128', displayValue: true, fontSize: 20 });
                         const dataUrl = barcodeCanvasEl.toDataURL('image/png');
                         await (obj as FabricType.Image).setSrc(dataUrl, () => {}, { crossOrigin: 'anonymous' });
                    } else if (obj.type === 'image') {
                        await (obj as FabricType.Image).setSrc(value, () => {}, { crossOrigin: 'anonymous' });
                    }
                }
            }
            labelCanvas.renderAll();
            resolve();
          });
      });
      
      await loadPromise;


      const group = await new Promise<FabricType.Group>((resolve) => {
        labelCanvas.cloneAsImage((image: FabricType.Image) => {
            const group = new fabric.Group([image], {
              left: currentX,
              top: currentY,
              selectable: false,
              evented: false,
            });
            resolve(group);
        });
      });

      canvas.add(group);
      
      currentX += labelWidth + settings.gapHorizontal;
      if (currentX + labelWidth > canvas.width!) {
        currentX = settings.marginLeft;
        currentY += labelHeight + settings.gapVertical;
      }
    }
    
    canvas.renderAll();
    setIsLoading(false);

  }, [canvas, fabric, settings, searchParams, toast]);


  useEffect(() => {
    if (canvas) {
        const pageSize = predefinedSizes.find(s => s.name.startsWith(settings.pageSize));
        const width = pageSize ? pageSize.width : 794;
        const height = pageSize ? pageSize.height : 1122;
        canvas.setDimensions({ width, height });
        renderLabels();
    }
  }, [settings, canvas, renderLabels]);


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

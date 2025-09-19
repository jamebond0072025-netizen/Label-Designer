
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface DataViewerProps {
    data: Record<string, string>[];
}

export function DataViewer({ data }: DataViewerProps) {
    if (!data || data.length === 0) {
        return (
            <div className="p-4 text-sm text-muted-foreground">
                No data to display.
            </div>
        );
    }
    
    const defaultOpenValue = data.length > 0 ? 'item-0' : undefined;

    return (
        <Accordion type="single" defaultValue={defaultOpenValue} collapsible className="w-full px-2">
            <div className="px-2 pb-2 text-lg font-semibold">Data Source</div>
            {data.map((record, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="px-2 text-sm">
                        Record {index + 1}
                    </AccordionTrigger>
                    <AccordionContent className="px-2">
                        <div className="space-y-2 rounded-md border bg-muted/50 p-2 text-xs">
                            {Object.entries(record).map(([key, value]) => (
                                <div key={key} className="grid grid-cols-3 gap-2">
                                    <span className="font-semibold truncate col-span-1">{key}</span>
                                    <span className="truncate col-span-2">{value}</span>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}

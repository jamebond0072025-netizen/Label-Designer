
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '../ui/button';
import { PanelLeft } from 'lucide-react';
import { usePrintPreview } from '../print-preview-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { DataViewer } from './data-viewer';

export function PrintLeftSidebar() {
  const { toggleSidebar, state } = useSidebar();
  const { jsonData } = usePrintPreview();

  return (
    <Sidebar>
       <SidebarHeader>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                       <PanelLeft />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Toggle Data Panel</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </SidebarHeader>
      <SidebarContent>
        {state === 'expanded' && <DataViewer data={jsonData} />}
      </SidebarContent>
    </Sidebar>
  );
}

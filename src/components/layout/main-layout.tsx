"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { EditorProvider } from "@/components/editor-provider";
import { Navbar } from "./navbar";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { EditorWorkspace } from "../editor/editor-workspace";
import { useState } from "react";

export function MainLayout() {
  const [open, setOpen] = useState(true);

  return (
    <EditorProvider>
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <div className="flex flex-col h-screen bg-muted/30">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <LeftSidebar />
            <SidebarInset className="flex-1 flex flex-col !min-h-0 overflow-auto p-0 md:p-0 md:m-0 md:rounded-none">
              <EditorWorkspace />
            </SidebarInset>
            <RightSidebar />
          </div>
        </div>
      </SidebarProvider>
    </EditorProvider>
  );
}

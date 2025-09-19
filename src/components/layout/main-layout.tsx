
"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { EditorProvider } from "@/components/editor-provider";
import { Navbar } from "./navbar";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { EditorWorkspace } from "../editor/editor-workspace";

export function MainLayout() {
  return (
    <EditorProvider>
      <div className="flex flex-col h-screen bg-background">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <SidebarProvider id="left-sidebar" defaultOpen={false}>
            <LeftSidebar />
          </SidebarProvider>
          <main className="flex-1 flex flex-col overflow-auto">
            <EditorWorkspace />
          </main>
          <SidebarProvider id="right-sidebar">
            <RightSidebar />
          </SidebarProvider>
        </div>
      </div>
    </EditorProvider>
  );
}

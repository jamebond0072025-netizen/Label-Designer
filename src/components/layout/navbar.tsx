"use client";

import { PanelLeftClose } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
      <div className="flex items-center gap-2">
        <PanelLeftClose className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">LabelForge</h1>
      </div>
    </header>
  );
}

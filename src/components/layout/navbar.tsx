"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PanelLeftClose,
  Search,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Palette,
  User,
} from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
      <div className="flex items-center gap-2">
        <PanelLeftClose className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">LabelForge</h1>
      </div>
      <nav className="hidden md:flex items-center gap-4 ml-8 text-sm font-medium">
        <a href="#" className="text-foreground">Dashboard</a>
        <a href="#" className="text-muted-foreground">Templates</a>
        <a href="#" className="text-muted-foreground">Design</a>
        <a href="#" className="text-muted-foreground">Data Manager</a>
        <a href="#" className="text-muted-foreground">Exports</a>
      </nav>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
          <DropdownMenuItem><Palette className="mr-2 h-4 w-4" /> Preferences</DropdownMenuItem>
          <DropdownMenuItem><HelpCircle className="mr-2 h-4 w-4" /> Help</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem><LogOut className="mr-2 h-4 w-4" /> Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

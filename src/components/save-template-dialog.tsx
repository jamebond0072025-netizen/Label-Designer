'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateName: string) => void;
}

export function SaveTemplateDialog({ isOpen, onClose, onSave }: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState('my-label-template');

  const handleSaveClick = () => {
    if (templateName.trim()) {
      onSave(templateName.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Template</DialogTitle>
          <DialogDescription>
            Enter a name for your new template.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template-name" className="text-right">
              Name
            </Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveClick}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

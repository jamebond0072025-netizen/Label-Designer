
'use client';

import { usePrintPreview } from '../print-preview-provider';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { predefinedSizes } from '@/lib/predefined-sizes';
import { Separator } from '../ui/separator';

export function PrintSettings() {
  const { settings, setSettings, isLoading } = usePrintPreview();

  const handleSettingChange = (key: keyof typeof settings, value: string | number) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(numValue)) return;
    setSettings(prev => ({ ...prev, [key]: numValue }));
  };
  
  const handlePageSizeChange = (value: string) => {
    setSettings(prev => ({ ...prev, pageSize: value }));
  };

  return (
    <aside className="w-80 border-l bg-background p-4 flex flex-col gap-6 overflow-y-auto">
      <h2 className="text-lg font-semibold">Print Settings</h2>
      {isLoading && <p className="text-sm text-muted-foreground">Rendering preview...</p>}
      <div className="space-y-4" style={{ opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
        <div>
          <Label htmlFor="page-size">Page Size</Label>
          <Select
            value={settings.pageSize}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger id="page-size">
              <SelectValue placeholder="Select page size" />
            </SelectTrigger>
            <SelectContent>
              {predefinedSizes.filter(s => s.category === 'Page').map(size => (
                <SelectItem key={size.name} value={size.name.split(' ')[0]}>
                  {size.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="label-width">Label Width (px)</Label>
              <Input
                id="label-width"
                type="number"
                value={settings.labelWidth}
                onChange={(e) => handleSettingChange('labelWidth', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="label-height">Label Height (px)</Label>
              <Input
                id="label-height"
                type="number"
                value={settings.labelHeight}
                onChange={(e) => handleSettingChange('labelHeight', e.target.value)}
              />
            </div>
        </div>
        <Separator />
        <div>
          <Label htmlFor="margin-top">Top Margin (px)</Label>
          <Input
            id="margin-top"
            type="number"
            value={settings.marginTop}
            onChange={(e) => handleSettingChange('marginTop', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="margin-left">Left Margin (px)</Label>
          <Input
            id="margin-left"
            type="number"
            value={settings.marginLeft}
            onChange={(e) => handleSettingChange('marginLeft', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="gap-horizontal">Horizontal Spacing (px)</Label>
          <Input
            id="gap-horizontal"
            type="number"
            value={settings.gapHorizontal}
            onChange={(e) => handleSettingChange('gapHorizontal', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="gap-vertical">Vertical Spacing (px)</Label>
          <Input
            id="gap-vertical"
            type="number"
            value={settings.gapVertical}
            onChange={(e) => handleSettingChange('gapVertical', e.target.value)}
          />
        </div>
      </div>
    </aside>
  );
}

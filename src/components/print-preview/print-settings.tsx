
'use client';

import { usePrintPreview } from '../print-preview-provider';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { predefinedSizes } from '@/lib/predefined-sizes';

export function PrintSettings() {
  const { settings, setSettings, isLoading } = usePrintPreview();

  const handleSettingChange = (key: keyof typeof settings, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <aside className="w-80 border-r bg-background p-4 flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Print Settings</h2>
      {isLoading && <p className="text-sm text-muted-foreground">Loading labels...</p>}
      <div className="space-y-4" style={{ opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
        <div>
          <Label htmlFor="page-size">Page Size</Label>
          <Select
            value={settings.pageSize}
            onValueChange={(value) => handleSettingChange('pageSize', value)}
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
        <div>
          <Label htmlFor="margin-top">Top Margin (px)</Label>
          <Input
            id="margin-top"
            type="number"
            value={settings.marginTop}
            onChange={(e) => handleSettingChange('marginTop', parseInt(e.target.value, 10))}
          />
        </div>
        <div>
          <Label htmlFor="margin-left">Left Margin (px)</Label>
          <Input
            id="margin-left"
            type="number"
            value={settings.marginLeft}
            onChange={(e) => handleSettingChange('marginLeft', parseInt(e.target.value, 10))}
          />
        </div>
        <div>
          <Label htmlFor="gap-horizontal">Horizontal Spacing (px)</Label>
          <Input
            id="gap-horizontal"
            type="number"
            value={settings.gapHorizontal}
            onChange={(e) => handleSettingChange('gapHorizontal', parseInt(e.target.value, 10))}
          />
        </div>
        <div>
          <Label htmlFor="gap-vertical">Vertical Spacing (px)</Label>
          <Input
            id="gap-vertical"
            type="number"
            value={settings.gapVertical}
            onChange={(e) => handleSettingChange('gapVertical', parseInt(e.target.value, 10))}
          />
        </div>
      </div>
    </aside>
  );
}


'use client';

import { usePrintPreview } from '../print-preview-provider';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { predefinedSizes } from '@/lib/predefined-sizes';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';

export function PrintSettings() {
  const { settings, setSettings, isLoading, showRealData, setShowRealData } = usePrintPreview();

  const handleSettingChange = (key: keyof typeof settings, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return;
    setSettings(prev => ({ ...prev, [key]: numValue }));
  };
  
  const handlePageSizeChange = (value: string) => {
    setSettings(prev => ({ ...prev, pageSize: value }));
  };

  const handleScaleChange = (value: number[]) => {
    setSettings(prev => ({ ...prev, scale: value[0] }));
  };

  return (
    <aside className="w-80 border-l bg-background p-4 flex flex-col gap-6 overflow-y-auto">
      <h2 className="text-lg font-semibold">Print Settings</h2>
      {isLoading && <p className="text-sm text-muted-foreground">Rendering preview...</p>}
      <div className="space-y-4" style={{ opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
        <div className="flex items-center justify-between">
            <Label htmlFor="preview-mode">Show Real Data</Label>
            <Switch
                id="preview-mode"
                checked={showRealData}
                onCheckedChange={setShowRealData}
            />
        </div>
        <Separator />
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
        <div>
            <div className="flex justify-between items-center mb-2">
                 <Label htmlFor="label-scale">Label Scale</Label>
                 <span>{Math.round(settings.scale * 100)}%</span>
            </div>
            <Slider
                id="label-scale"
                min={0.1}
                max={2}
                step={0.05}
                value={[settings.scale]}
                onValueChange={handleScaleChange}
            />
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

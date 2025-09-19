
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DUMMY_TEMPLATES, Template } from '@/lib/dummy-templates';
import { useEditor } from '@/components/editor-provider';
import { Button } from '@/components/ui/button';

export default function TemplatesPage() {
  const router = useRouter();

  const handleTemplateClick = (template: Template) => {
    // In a real app, you would likely load the template design into the editor
    // For now, we just log it and redirect.
    console.log('Selected Template:', template.name);
    router.push('/'); // Redirect to the main editor page
  };

  // Group templates by category
  const templatesByCategory = DUMMY_TEMPLATES.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Label Templates</h1>
        <Button onClick={() => router.push('/')}>Go to Editor</Button>
      </div>
      
      <div className="space-y-8">
        {Object.entries(templatesByCategory).map(([category, templates]) => (
          <div key={category}>
            <h2 className="text-2xl font-semibold mb-4 capitalize">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleTemplateClick(template)}
                >
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* In a real app, you'd show a preview image here */}
                    <div className="bg-muted h-40 w-full rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Template Preview</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

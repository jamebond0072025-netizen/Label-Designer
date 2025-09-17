// All dimensions are in pixels, assuming 96 DPI

export type PredefinedSize = {
    name: string;
    width: number;
    height: number;
    category: 'Page' | 'Label' | 'Card';
};

export const predefinedSizes: PredefinedSize[] = [
    // Page Sizes
    { name: 'Letter (8.5 x 11 in)', width: 816, height: 1056, category: 'Page' },
    { name: 'A4 (210 x 297 mm)', width: 794, height: 1122, category: 'Page' },
    { name: 'Legal (8.5 x 14 in)', width: 816, height: 1344, category: 'Page' },
    { name: 'Tabloid (11 x 17 in)', width: 1056, height: 1632, category: 'Page' },

    // Common Label Sizes (Avery)
    { name: 'Avery 5160 (2.625 x 1 in)', width: 252, height: 96, category: 'Label' },
    { name: 'Avery 5163 (4 x 2 in)', width: 384, height: 192, category: 'Label' },
    { name: 'Avery 22807 (2 in Circle)', width: 192, height: 192, category: 'Label' },

    // Other Common Sizes
    { name: 'Business Card (3.5 x 2 in)', width: 336, height: 192, category: 'Card' },
    { name: '4x6 Postcard', width: 576, height: 384, category: 'Card' },
];

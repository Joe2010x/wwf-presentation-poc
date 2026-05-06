export interface BrandColors {
    primary: string;
    secondary: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
}
export interface Fonts {
    heading: string;
    subheading: string;
    body: string;
    caption: string;
}
export interface LogoUsage {
    minClearSpace: string;
    minWidth: string;
    placement: string[];
}
export interface SlideTemplate {
    background: string;
    [key: string]: string | string[];
}
export interface SlideTemplates {
    titleSlide: SlideTemplate;
    contentSlide: SlideTemplate;
    imageSlide: SlideTemplate;
}
export interface BrandGuidelines {
    version: string;
    lastUpdated: string;
    colors: BrandColors;
    fonts: Fonts;
    logoUsage: LogoUsage;
    slideTemplates: SlideTemplates;
}
/**
 * Loads brand guidelines from the JSON configuration file.
 * @returns A Promise that resolves to the BrandGuidelines object.
 * @throws Error if the file cannot be read or parsed.
 */
export declare function loadBrandGuidelines(): Promise<BrandGuidelines>;
//# sourceMappingURL=brand-loader.d.ts.map
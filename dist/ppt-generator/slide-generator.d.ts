type PptxPresentation = any;
type PptxSlide = any;
/**
 * Interface for title slide data
 */
export interface TitleSlideData {
    title: string;
    subtitle: string;
}
/**
 * Interface for content slide data
 */
export interface ContentSlideData {
    headline: string;
    bullets: string[];
}
/**
 * Interface for image slide data
 */
export interface ImageSlideData {
    imagePath?: string;
    imageUrl?: string;
    attribution: string;
    caption?: string;
    searchQuery?: string;
    useRandomImage?: boolean;
}
/**
 * Interface for closing slide data
 */
export interface ClosingSlideData {
    message: string;
    subtitle?: string;
}
/**
 * Add a title slide with title and subtitle
 */
export declare function addTitleSlide(pptx: PptxPresentation, slideData: TitleSlideData): Promise<PptxSlide>;
/**
 * Add a content slide with headline and bullet points
 */
export declare function addContentSlide(pptx: PptxPresentation, slideData: ContentSlideData): Promise<PptxSlide>;
/**
 * Add an image slide with image and attribution
 */
export declare function addImageSlide(pptx: PptxPresentation, slideData: ImageSlideData): Promise<PptxSlide>;
/**
 * Add a closing slide with thank you message
 */
export declare function addClosingSlide(pptx: PptxPresentation, slideData: ClosingSlideData): Promise<PptxSlide>;
export {};
//# sourceMappingURL=slide-generator.d.ts.map
import { TitleSlideData, ContentSlideData, ImageSlideData, ClosingSlideData } from "./slide-generator.js";
import { SlidePlan } from "./slide-plan-manager.js";
/**
 * Slide configuration interface for CLI-driven presentations
 */
interface SlideConfig {
    type: "title" | "content" | "image" | "closing";
    data: TitleSlideData | ContentSlideData | ImageSlideData | ClosingSlideData;
}
/**
 * Presentation configuration interface
 */
interface PresentationConfig {
    title: string;
    subtitle?: string;
    slides: SlideConfig[];
    output?: string;
}
/**
 * Create a presentation from configuration
 */
declare function createPresentationFromConfig(config: PresentationConfig): Promise<{
    slidePlan: SlidePlan;
    filename: string;
}>;
/**
 * Main demo presentation (when no arguments provided)
 */
declare function createDemoPresentation(): Promise<void>;
export { createDemoPresentation, createPresentationFromConfig, PresentationConfig, SlideConfig };
//# sourceMappingURL=index.d.ts.map
/**
 * Slide plan interface for saving presentation structure
 */
export interface SlidePlan {
    id: string;
    title: string;
    subtitle?: string;
    createdAt: string;
    slides: SlidePlanItem[];
    metadata: {
        author: string;
        company: string;
        totalSlides: number;
    };
}
export interface SlidePlanItem {
    type: "title" | "content" | "image" | "closing";
    order: number;
    content: Record<string, any>;
}
/**
 * Create and save a new slide plan
 */
export declare function createSlidePlan(title: string, slides: SlidePlanItem[], subtitle?: string, author?: string, company?: string): Promise<SlidePlan>;
/**
 * Load a slide plan by ID
 */
export declare function loadSlidePlan(id: string): Promise<SlidePlan | null>;
/**
 * List all slide plans
 */
export declare function listSlidePlans(): Promise<SlidePlan[]>;
/**
 * Delete a slide plan by ID
 */
export declare function deleteSlidePlan(id: string): Promise<boolean>;
/**
 * Convert presentation config to slide plan items
 */
export declare function configToSlidePlanItems(config: any): SlidePlanItem[];
/**
 * Convert slide plan to presentation config
 */
export declare function slidePlanToConfig(slidePlan: SlidePlan): any;
//# sourceMappingURL=slide-plan-manager.d.ts.map
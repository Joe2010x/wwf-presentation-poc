/**
 * Interface for slide content from LLM
 */
export interface LLMSlideContent {
    type: "title" | "content" | "image" | "closing";
    data: Record<string, any>;
}
/**
 * Interface for presentation structure from LLM
 */
export interface LLMPresentationStructure {
    title: string;
    subtitle?: string;
    slides: LLMSlideContent[];
}
/**
 * Generate presentation structure from natural language prompt
 */
export declare function generatePresentationFromPrompt(prompt: string, temperature?: number): Promise<LLMPresentationStructure>;
/**
 * Generate a presentation with retry logic
 */
export declare function generatePresentationWithRetry(prompt: string, temperature?: number, maxRetries?: number): Promise<LLMPresentationStructure>;
//# sourceMappingURL=openrouter-client.d.ts.map
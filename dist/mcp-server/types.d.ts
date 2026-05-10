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
export interface Image {
    id: string;
    filename: string;
    category: string;
    tags: string[];
    description: string;
    photographer: string;
    license: string;
    resolution: string;
    path: string;
    source?: 'local' | 'unsplash' | string;
}
export interface ImageSource {
    name: string;
    description: string;
    enabled: boolean;
    requiresAuth?: boolean;
    attribution?: string;
}
export interface ExternalSourceInfo {
    description: string;
    tools: string[];
    attributionTemplate: string;
    licenseInfo: string;
}
export interface ImageRepository {
    version: string;
    lastUpdated: string;
    sources?: Record<string, ImageSource>;
    images: Image[];
    categories: string[];
    totalImages: number;
    externalSources?: Record<string, ExternalSourceInfo>;
}
export interface Partner {
    id: string;
    name: string;
    logoFile: string;
    path: string;
    partnershipLevel: string;
    website: string;
    active: boolean;
}
export interface PartnerLogos {
    version: string;
    lastUpdated: string;
    partners: Partner[];
    partnershipLevels: string[];
    totalPartners: number;
    activePartners: number;
}
export interface Symbol {
    id: string;
    name: string;
    filename: string;
    path: string;
    tags: string[];
    description: string;
}
export interface SlideContent {
    slideNumber: number;
    slideType: string;
    title?: string;
    content?: string;
    imageUrl?: string;
    imageId?: string;
    partnerLogos?: string[];
    photoCredits?: string[];
}
export interface SlidePlan {
    title: string;
    subtitle?: string;
    presenter?: string;
    date?: string;
    slides: SlideContent[];
}
export interface ValidationResult {
    isValid: boolean;
    issues: string[];
    warnings: string[];
}
export interface PresentationResult {
    success: boolean;
    outputPath: string;
    message: string;
    slideCount: number;
}
export interface Article {
    id: string;
    filename: string;
    title: string;
    author: string;
    publishedDate: string;
    source: string;
    sourceUrl: string;
    category: string;
    tags: string[];
    readingTime: number;
    wordCount: number;
}
export interface ArticleContent {
    article: Article;
    content: string;
}
export interface ArticleSummary {
    article: Article;
    summary: string;
    keyPoints: string[];
    targetAudience?: string;
}
export interface ArticleRepository {
    version: string;
    lastUpdated: string;
    totalArticles: number;
    categories: string[];
    articles: Article[];
}
export interface ArticleSearchOptions {
    query?: string;
    category?: string;
    tags?: string[];
    limit?: number;
}
export interface RelatedArticlesRequest {
    articleId: string;
    count?: number;
    useLLM?: boolean;
}
export interface SummarizeRequest {
    articleId: string;
    maxLength?: number;
    style?: 'bullet' | 'paragraph' | 'executive';
}
//# sourceMappingURL=types.d.ts.map
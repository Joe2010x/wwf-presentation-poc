import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

/**
 * Article summary result interface
 */
export interface ArticleSummaryResult {
  articleId: string;
  title: string;
  summary: string;
  keyPoints: string[];
  sourceUrl: string;
  author: string;
  publishedDate: string;
}

/**
 * Summarization options
 */
export interface SummarizationOptions {
  maxLength?: number; // Maximum length in words
  style?: 'bullet' | 'paragraph' | 'executive';
  focusArea?: string; // Focus on specific aspect
}

/**
 * Article Summarizer Service
 * Uses LLM to summarize articles and extract key points
 */
class ArticleSummarizerService {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = OPENROUTER_API_KEY || '';
    this.model = OPENROUTER_MODEL;
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Summarize article content using LLM
   * @param articleId - The article identifier
   * @param content - The full article content
   * @param title - The article title
   * @param options - Summarization options
   * @returns ArticleSummaryResult with summary and key points
   */
  async summarizeArticle(
    articleId: string,
    content: string,
    title: string,
    options: SummarizationOptions = {}
  ): Promise<ArticleSummaryResult> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env file.');
    }

    const {
      maxLength = 150,
      style = 'bullet',
      focusArea
    } = options;

    // Build the prompt based on style
    let prompt = this.buildPrompt(title, content, style, maxLength, focusArea);

    try {
      console.log(`📝 Summarizing article: "${title}"...`);

      const response = await this.callLLM(prompt);
      
      // Parse the response
      const result = this.parseSummaryResponse(response, articleId, title);
      
      console.log(`✅ Summary generated: ${result.keyPoints.length} key points`);
      
      return result;
    } catch (error) {
      console.error('Error summarizing article:', error);
      throw new Error(`Failed to summarize article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find related articles based on content analysis
   * @param sourceArticle - The source article content
   * @param candidateArticles - Array of candidate articles to compare
   * @param count - Number of related articles to return
   * @returns Array of related article IDs
   */
  async findRelatedArticles(
    sourceArticle: { title: string; content: string; tags: string[] },
    candidateArticles: Array<{ id: string; title: string; content: string; tags: string[] }>,
    count: number = 3
  ): Promise<string[]> {
    if (!this.apiKey) {
      // Fallback to tag-based matching if LLM not configured
      return this.findRelatedByTags(sourceArticle, candidateArticles, count);
    }

    const prompt = this.buildRelatedArticlesPrompt(sourceArticle, candidateArticles, count);

    try {
      console.log(`🔍 Finding related articles for: "${sourceArticle.title}"...`);

      const response = await this.callLLM(prompt);
      
      // Parse the response to extract article IDs
      const relatedIds = this.parseRelatedArticlesResponse(response, candidateArticles);
      
      console.log(`✅ Found ${relatedIds.length} related articles`);
      
      return relatedIds;
    } catch (error) {
      console.warn('LLM-based related articles failed, falling back to tag matching:', error);
      return this.findRelatedByTags(sourceArticle, candidateArticles, count);
    }
  }

  /**
   * Build the summarization prompt
   */
  private buildPrompt(
    title: string,
    content: string,
    style: string,
    maxLength: number,
    focusArea?: string
  ): string {
    let prompt = `You are a professional content summarizer. Summarize the following article for a presentation slide.

Article Title: ${title}

Article Content:
${content}

`;

    switch (style) {
      case 'bullet':
        prompt += `Provide a summary in the following format:
- A brief 1-2 sentence overview
- 3-5 key bullet points highlighting the most important information
- Keep each bullet point concise (max 15 words each)
- Total summary should be approximately ${maxLength} words`;
        break;
      
      case 'paragraph':
        prompt += `Provide a concise paragraph summary of approximately ${maxLength} words.
Focus on the main message and key findings.`;
        break;
      
      case 'executive':
        prompt += `Provide an executive summary suitable for decision-makers:
- Start with the main conclusion or finding
- Include 3 key supporting points
- End with implications or call to action
- Keep it professional and concise (${maxLength} words max)`;
        break;
    }

    if (focusArea) {
      prompt += `\n\nFocus specifically on: ${focusArea}`;
    }

    prompt += `\n\nReturn ONLY the summary, no additional commentary.`;

    return prompt;
  }

  /**
   * Build prompt for finding related articles
   */
  private buildRelatedArticlesPrompt(
    sourceArticle: { title: string; content: string; tags: string[] },
    candidateArticles: Array<{ id: string; title: string; content: string; tags: string[] }>,
    count: number
  ): string {
    let prompt = `Analyze the following source article and find the ${count} most related articles from the candidate list.

Source Article:
Title: ${sourceArticle.title}
Tags: ${sourceArticle.tags.join(', ')}
Content: ${sourceArticle.content.substring(0, 500)}...

Candidate Articles:
${candidateArticles.map((article, i) => 
  `${i + 1}. ID: ${article.id}
   Title: ${article.title}
   Tags: ${article.tags.join(', ')}
   Content: ${article.content.substring(0, 200)}...
`).join('\n')}

Return ONLY a comma-separated list of the ${count} most related article IDs, ordered by relevance.
Example format: art_001, art_003, art_005`;

    return prompt;
  }

  /**
   * Call the LLM API
   */
  private async callLLM(prompt: string): Promise<string> {
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
      'X-OpenRouter-Title': 'WWF Article Summarizer'
    };

    const body = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes conservation and environmental articles for presentations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * Parse the summary response from LLM
   */
  private parseSummaryResponse(
    response: string,
    articleId: string,
    title: string
  ): ArticleSummaryResult {
    // Extract key points (lines starting with - or *)
    const lines = response.split('\n').filter(line => line.trim());
    const keyPoints = lines
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.trim().substring(1).trim())
      .filter(line => {
        const normalized = line.replace(/\*/g, '').trim().toLowerCase();
        return normalized.length > 0 &&
          !normalized.endsWith(':') &&
          !['overview', 'key points', 'summary', 'takeaways'].includes(normalized);
      });

    // If no bullet points found, use the full response as summary
    const summary = keyPoints.length > 0 
      ? response
      : response.split('\n').slice(0, 3).join(' ');

    return {
      articleId,
      title,
      summary: response.trim(),
      keyPoints: keyPoints.length > 0 ? keyPoints : [response.trim()],
      sourceUrl: '',
      author: '',
      publishedDate: ''
    };
  }

  /**
   * Parse related articles response
   */
  private parseRelatedArticlesResponse(
    response: string,
    candidateArticles: Array<{ id: string; title: string; content: string; tags: string[] }>
  ): string[] {
    // Extract article IDs from response
    const ids = response
      .split(',')
      .map(id => id.trim())
      .filter(id => candidateArticles.some(article => article.id === id));

    return ids;
  }

  /**
   * Fallback: Find related articles by tag matching
   */
  private findRelatedByTags(
    sourceArticle: { title: string; content: string; tags: string[] },
    candidateArticles: Array<{ id: string; title: string; content: string; tags: string[] }>,
    count: number
  ): string[] {
    // Calculate tag overlap scores
    const scored = candidateArticles.map(article => {
      const overlap = article.tags.filter(tag => 
        sourceArticle.tags.some(st => st.toLowerCase() === tag.toLowerCase())
      ).length;
      return { id: article.id, score: overlap };
    });

    // Sort by score and return top N
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.id);
  }
}

// Export singleton instance
export const articleSummarizer = new ArticleSummarizerService();

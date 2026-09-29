// ============================================
// AI — Puter AI wrapper for insights
// ============================================

/**
 * Generate AI insights about content-product performance
 */
export async function generateInsight(prompt) {
  try {
    const response = await puter.ai.chat(
      `You are Triggerly AI, a helpful assistant for SuperProfile content creators. 
       You help analyze content-product performance and suggest optimizations.
       Keep responses concise, actionable, and friendly. Use bullet points when listing suggestions.
       
       ${prompt}`
    );
    return response?.message?.content || response?.toString() || 'No insight available.';
  } catch (e) {
    console.error('AI error:', e);
    return 'AI insights are temporarily unavailable. Please try again.';
  }
}

/**
 * Generate structured trigger suggestions based on products and content
 */
export async function suggestTriggers(products = [], content = []) {
  const prompt = `You are Triggerly's AI strategist for SuperProfile creators.
Analyze these products: ${JSON.stringify(products.slice(0, 5))}
And this content: ${JSON.stringify(content.slice(0, 5))}

Suggest 3 high-converting automation triggers that link content to products.
Respond in this exact JSON format (valid JSON array only, no other text):
[
  {
    "title": "Tutorial Blog to Web Dev Course",
    "sourceContent": "Tutorial Blog",
    "targetProduct": "Web Dev Course",
    "price": "$999",
    "rule": "auto-link",
    "reason": "Blogs are great for SEO and detailed step-by-step explanations that naturally lead readers into a full paid course."
  }
]`;

  try {
    const raw = await generateInsight(prompt);
    
    // Attempt 1: Direct JSON parsing
    const jsonMatch = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // Attempt 2: Text parsing for numbered list with markdown (e.g. 1. **Content -> Product ($Price)**)
    const textParsed = parseMarkdownSuggestions(raw);
    if (textParsed.length > 0) return textParsed;
  } catch (e) {
    console.warn('Error generating or parsing suggestions:', e);
  }

  // Robust fallback with creator-focused defaults
  return [
    {
      title: "Tutorial Blog ➔ Web Dev Course",
      sourceContent: "Tutorial Blog",
      targetProduct: "Web Dev Course",
      price: "$999",
      rule: "auto-link",
      reason: "Blogs are great for SEO and detailed step-by-step explanations. You can naturally include walkthroughs that lead readers to a full course for structured learning."
    },
    {
      title: "YouTube Video ➔ Web Dev Course",
      sourceContent: "YouTube Video",
      targetProduct: "Web Dev Course",
      price: "$999",
      rule: "ai-match",
      reason: "Video tutorials build trust fast and let viewers see real outcomes. Series can end with a strong CTA to the course for the full curriculum."
    },
    {
      title: "YouTube Video ➔ Design Templates",
      sourceContent: "YouTube Video",
      targetProduct: "Design Templates",
      price: "$499",
      rule: "match-tag",
      reason: "YouTube is ideal for quick demos—showing templates in action before/after saves time and pairs well with a lower commitment product."
    }
  ];
}

function parseMarkdownSuggestions(text) {
  if (!text || typeof text !== 'string') return [];
  const items = [];
  // Split on numbered items: e.g. "1. ", "2. "
  const blocks = text.split(/(?:^|\n)(?=\d+[\.\)]\s+)/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed || !/^\d+[\.\)]/.test(trimmed)) continue;

    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    const header = lines[0].replace(/^\d+[\.\)]\s*/, '').replace(/[\*\_]/g, '').trim();
    
    // Extract source and target (e.g. "Tutorial Blog -> Web Dev Course ($999)")
    const parts = header.split(/->|➔|→|to/i);
    const sourceContent = parts[0]?.trim() || 'Content';
    let targetProduct = parts[1]?.trim() || 'Product';
    
    // Extract price if available (e.g. "($999)" or "$999")
    let price = '';
    const priceMatch = targetProduct.match(/\(\s*(\$[\d,\.]+)\s*\)/) || targetProduct.match(/(\$[\d,\.]+)/);
    if (priceMatch) {
      price = priceMatch[1];
      targetProduct = targetProduct.replace(/\(\s*\$[\d,\.]+\s*\)/, '').trim();
    }

    // Extract reason from remaining lines
    const reasonText = lines.slice(1).join(' ')
      .replace(/^[\s\-\*•]+Why it works:?[\s\*]*/i, '')
      .replace(/[\*\_]/g, '')
      .replace(/^[\s\-\*•]+/, '')
      .trim();

    items.push({
      title: `${sourceContent} ➔ ${targetProduct}`,
      sourceContent,
      targetProduct,
      price: price || 'Featured',
      rule: 'auto-link',
      reason: reasonText || 'Automates product recommendations based on engaged audience traffic.'
    });
  }

  return items;
}

/**
 * Analyze trigger performance
 */
export async function analyzePerformance(triggers, results) {
  const prompt = `Analyze this performance data for a SuperProfile creator:
  
  Active triggers: ${triggers.length}
  Total actions run: ${results.length}
  Recent results: ${JSON.stringify(results.slice(0, 3))}
  
  Provide a brief performance summary and 2-3 specific, actionable recommendations 
  to improve content-product conversion rates.`;
  
  return await generateInsight(prompt);
}

/**
 * Chat with AI assistant
 */
export async function chat(message, context = '') {
  const prompt = `${context ? 'Context: ' + context + '\n\n' : ''}User question: ${message}`;
  return await generateInsight(prompt);
}

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
 * Generate trigger suggestions based on products and content
 */
export async function suggestTriggers(products, content) {
  const prompt = `Based on these products: ${JSON.stringify(products.slice(0, 5))}
  And this content: ${JSON.stringify(content.slice(0, 5))}
  
  Suggest 3 smart product-content pairings that would likely drive more purchases. 
  For each, explain briefly why this pairing would work well.
  Format as a numbered list.`;
  
  return await generateInsight(prompt);
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

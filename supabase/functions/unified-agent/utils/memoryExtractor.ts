/**
 * Lightweight memory extraction from agent responses
 * Only stores durable facts/preferences, not every chat message
 */

const MEMORY_KEYWORDS = [
  'prefer', 'preference', 'always', 'never', 'usually', 'typically',
  'system', 'setup', 'configuration', 'config', 'environment',
  'project', 'team', 'workflow', 'process', 'standard',
  'default', 'defaults', 'convention', 'policy'
];

const EXCLUDE_KEYWORDS = [
  'today', 'yesterday', 'now', 'recent', 'just', 'currently',
  'temporary', 'temp', 'test', 'testing', 'debug'
];

export function shouldStoreMemory(answer: string, query: string): boolean {
  const answerLower = answer.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Check if answer contains memory-worthy keywords
  const hasMemoryKeyword = MEMORY_KEYWORDS.some(keyword => 
    answerLower.includes(keyword) || queryLower.includes(keyword)
  );
  
  // Exclude if it's temporary/transient
  const isTemporary = EXCLUDE_KEYWORDS.some(keyword =>
    answerLower.includes(keyword) || queryLower.includes(keyword)
  );
  
  // Only store if it's memory-worthy and not temporary
  return hasMemoryKeyword && !isTemporary;
}

export function extractMemory(answer: string, query: string): {
  fact: string;
  tags: string[];
  confidence: number;
} | null {
  if (!shouldStoreMemory(answer, query)) {
    return null;
  }
  
  // Extract a concise fact (first sentence or up to 200 chars)
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const fact = sentences[0]?.trim().substring(0, 200) || answer.substring(0, 200);
  
  // Extract tags from query and answer
  const tags: string[] = [];
  
  // Add tags from common patterns
  if (query.toLowerCase().includes('prefer') || answer.toLowerCase().includes('prefer')) {
    tags.push('preference');
  }
  if (query.toLowerCase().includes('system') || answer.toLowerCase().includes('system')) {
    tags.push('system');
  }
  if (query.toLowerCase().includes('config') || answer.toLowerCase().includes('config')) {
    tags.push('configuration');
  }
  if (query.toLowerCase().includes('project') || answer.toLowerCase().includes('project')) {
    tags.push('project');
  }
  
  // Default confidence based on answer length and clarity
  let confidence = 0.7;
  if (fact.length > 50 && fact.length < 150) {
    confidence = 0.8;
  }
  if (sentences.length > 0 && sentences[0].length < 100) {
    confidence = 0.9;
  }
  
  return {
    fact,
    tags: tags.length > 0 ? tags : ['general'],
    confidence
  };
}

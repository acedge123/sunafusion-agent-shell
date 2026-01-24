/**
 * Detects if a query appears to be a "heavy task" that should use the backend agentpress
 * instead of the quick Edge unified-agent.
 */

const HEAVY_TASK_KEYWORDS = [
  'deploy',
  'sandbox',
  'run code',
  'refactor',
  'multi-step',
  'iterate',
  'crawl',
  'scan all repos',
  'generate pr',
  'ci',
  'migrations',
  'run scripts',
  'execute',
  'build',
  'test',
  'long task',
  'complex task',
  'multi-file',
  'codebase',
  'repository',
  'git',
  'commit',
  'pull request'
];

export function detectHeavyTask(query: string): boolean {
  const queryLower = query.toLowerCase();
  return HEAVY_TASK_KEYWORDS.some(keyword => queryLower.includes(keyword));
}

export function getHeavyTaskSuggestion(query: string): string | null {
  if (detectHeavyTask(query)) {
    const matchedKeywords = HEAVY_TASK_KEYWORDS.filter(keyword => 
      query.toLowerCase().includes(keyword)
    );
    
    if (matchedKeywords.length > 0) {
      return `This looks like a heavy task (${matchedKeywords[0]}). Switch to Heavy mode?`;
    }
    return "This looks like a heavy task. Switch to Heavy mode?";
  }
  return null;
}

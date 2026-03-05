import corpus from '../tests/llm/evals/corpus.json';

export function retrieveChunks(query: string, topK: number = 1): string[] {
  const keywords = query.toLowerCase().split(' ');
  const scored = corpus.map(doc => {
    const content = doc.content.toLowerCase();
    const score = keywords.filter(kw => content.includes(kw)).length;
    return { doc, score };
  });
  
  // Sort by score descending
  const sorted = scored.sort((a, b) => b.score - a.score);
  
  // If top score is 0, return empty array (no relevant context)
  if (sorted[0].score === 0) {
    return [];
  }
  
  const top = sorted.slice(0, topK);
  return top.map(item => item.doc.content);
}
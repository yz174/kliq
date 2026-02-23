/** Cosine similarity between two equal-length vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// Rank a list of items with embeddings against a query embedding.
 
export function rankByCosine<T extends { embedding?: number[] }>(
  items: T[],
  queryEmbedding: number[]
): Array<T & { score: number }> {
  return items
    .filter((item) => item.embedding && item.embedding.length > 0)
    .map((item) => ({
      ...item,
      score: cosineSimilarity(item.embedding!, queryEmbedding),
    }))
    .sort((a, b) => b.score - a.score);
}

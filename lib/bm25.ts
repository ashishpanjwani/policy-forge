const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "in", "to", "for", "is", "are", "be",
  "as", "at", "by", "this", "that", "with", "from", "on", "it", "its",
  "shall", "will", "may", "such", "any", "all", "not", "no", "if", "where",
  "which", "been", "has", "have", "had", "was", "were", "their", "they",
  "also", "under", "upon", "each", "into", "then", "than", "but",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9₹%/\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
}

export class BM25Index {
  private docs: string[][] = [];
  private idf = new Map<string, number>();
  private avgDocLen = 0;

  constructor(private k1 = 1.5, private b = 0.75) {}

  add(text: string) {
    this.docs.push(tokenize(text));
  }

  build() {
    const N = this.docs.length;
    if (N === 0) return;
    this.avgDocLen = this.docs.reduce((sum, d) => sum + d.length, 0) / N;

    const df = new Map<string, number>();
    for (const doc of this.docs) {
      for (const term of Array.from(new Set(doc))) {
        df.set(term, (df.get(term) || 0) + 1);
      }
    }
    df.forEach((count, term) => {
      this.idf.set(term, Math.log((N - count + 0.5) / (count + 0.5) + 1));
    });
  }

  search(query: string, k = 6): number[] {
    if (this.docs.length === 0) return [];
    const qTerms = tokenize(query);
    if (qTerms.length === 0) return [];

    const scores = this.docs.map((doc, i) => {
      const docLen = doc.length;
      const tf = new Map<string, number>();
      doc.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));

      const score = qTerms.reduce((sum, term) => {
        const freq = tf.get(term) || 0;
        if (freq === 0) return sum;
        const idfScore = this.idf.get(term) || 0;
        const tfScore =
          (freq * (this.k1 + 1)) /
          (freq + this.k1 * (1 - this.b + (this.b * docLen) / this.avgDocLen));
        return sum + idfScore * tfScore;
      }, 0);

      return { i, score };
    });

    return scores
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(s => s.i);
  }
}

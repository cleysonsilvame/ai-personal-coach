export type SimilarTask = {
  id: string;
  title: string;
  description: string | null;
  estimated_time: string | null;
  similarity_score: number;
  chunk_content: string;
};

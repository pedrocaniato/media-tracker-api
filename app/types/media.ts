export interface NormalizedMedia {
  uniqueId: string;
  title: string;
  type: 'filme' | 'serie' | 'livro';
  releaseYear: string;
  posterUrl?: string;
  authors?: string[];
}
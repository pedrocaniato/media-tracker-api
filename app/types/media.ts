export interface NormalizedMedia {
  uniqueId: string;
  type: "filme" | "serie" | "livro";
  title: string;
  releaseYear: string;
  posterUrl?: string;
  authors?: string[];

  status?: "VISTO" | "ASSISTINDO" | "QUERO_VER";
  isFavorite?: boolean;
}

export interface UserMedia extends NormalizedMedia {
  id: string;
  userId: string;
  rating?: number;
  review?: string;
  updatedAt: string;
}

export interface MediaDetails extends NormalizedMedia {
  backdropUrl?: string;
  overview?: string;
}


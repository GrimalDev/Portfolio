export type Article = {
  id?: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  img?: string;
  created_at?: Date|string;
  modified_at?: Date|string;
}

export type ArticlesSearchOptions = {
  pageNumber?: number|"all";
  customSearch?: string;
  categories?: number[];
}
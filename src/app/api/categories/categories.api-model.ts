export type ApiCategoryNode = {
  id: number;
  name: string;
  subcategories?: Array<{ id: number; name: string }>;
};

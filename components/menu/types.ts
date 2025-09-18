export type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number | null;
  categoryId?: string | null;
};

export type CategorySectionProps = {
  title: string;
  products: Product[];
};

import ProductCard from "@/components/product/productCard";
import Title from "@/components/utils/title";

type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number | null;
};

export default function ProductArea({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  const vazio = !products || products.length === 0;

  return (
    <div id={title.toLowerCase().replace(/\s+/g, "-")} className="px-4">
      <Title title={title} />
      {vazio ? (
        <p className="text-center text-[20px] font-semibold text-cyan-800 mt-4">
          Nothing for now.
        </p>
      ) : (
        <div className="flex justify-center flex-wrap gap-5">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              image={p.imageUrl || ""}
              name={p.name}
              text={p.description}
              price={p.price ?? undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

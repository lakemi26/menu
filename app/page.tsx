// app/menu/page.tsx
import { adminDb } from "@/app/firebase/admin";
import ProductArea from "@/components/product/productArea";
import type { Product } from "@/components/menu/types";

export const runtime = "nodejs";
export const revalidate = 0;

type CategoryDoc = {
  id: string;
  name: string;
  slug: string;
  order?: number | null;
};

const ORDERED_SLUGS = [
  "entradas",
  "pizza-broto",
  "pizzas",
  "pizzas-doces-broto",
  "pizzas-doces",
  "bebidas",
  "outros",
] as const;

export default async function MenuPage() {
  // categorias
  const catSnap = await adminDb.collection("categories").get();
  const categories = catSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<CategoryDoc, "id">),
  })) as CategoryDoc[];

  const slugToCat = new Map(categories.map((c) => [c.slug, c]));

  // produtos
  const prodSnap = await adminDb
    .collection("products")
    .orderBy("createdAt", "desc")
    .get();

  const products = prodSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Product, "id">),
  })) as Product[];

  return (
    <div className="space-y-12 mt-6">
      {ORDERED_SLUGS.map((slug) => {
        const cat = slugToCat.get(slug);
        const catId = cat?.id ?? null;
        const list = products.filter(
          (p) => (p.categoryId ?? null) === (catId ?? null)
        );

        if (list.length === 0) return null;

        return (
          <ProductArea key={slug} title={cat?.name ?? slug} products={list} />
        );
      })}
    </div>
  );
}

// Para sessões separadas com componentes diferentes

// app/menu/page.tsx
// import { adminDb } from "@/app/firebase/admin";
// import ProductArea from "@/components/product/productArea";
// import PizzaSalgadaSection from "@/components/menu/PizzaSalgadaSection";
// import PizzaDoceSection from "@/components/menu/PizzaDoceSection";
// import type { Product } from "@/components/menu/types";

// export const runtime = "nodejs";
// export const revalidate = 0;

// type CategoryDoc = {
//   id: string;
//   name: string;
//   slug: string;
// };

// export default async function MenuPage() {
//   // categorias
//   const catSnap = await adminDb.collection("categories").get();
//   const categories = catSnap.docs.map((d) => ({
//     id: d.id,
//     ...(d.data() as Omit<CategoryDoc, "id">),
//   })) as CategoryDoc[];

//   const slugToCat = new Map(categories.map((c) => [c.slug, c]));

//   // produtos
//   const prodSnap = await adminDb
//     .collection("products")
//     .orderBy("createdAt", "desc")
//     .get();

//   const products = prodSnap.docs.map((d) => ({
//     id: d.id,
//     ...(d.data() as Omit<Product, "id">),
//   })) as Product[];

//   // pega categorias específicas
//   const pizzasSalgadasId = slugToCat.get("pizzas")?.id ?? null;
//   const pizzasDocesId = slugToCat.get("pizzas-doces")?.id ?? null;

//   const pizzasSalgadas = products.filter((p) => p.categoryId === pizzasSalgadasId);
//   const pizzasDoces = products.filter((p) => p.categoryId === pizzasDocesId);

//   return (
//     <div className="space-y-12 mt-6">
//       {pizzasSalgadas.length > 0 && (
//         <PizzaSalgadaSection products={pizzasSalgadas} />
//       )}

//       {pizzasDoces.length > 0 && (
//         <PizzaDoceSection products={pizzasDoces} />
//       )}

//       {/* outras categorias podem continuar com ProductArea normal */}
//       <ProductArea
//         title="Bebidas"
//         products={products.filter((p) => p.categoryId === slugToCat.get("bebidas")?.id)}
//       />
//     </div>
//   );
// }

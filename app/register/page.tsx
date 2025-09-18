import { adminDb } from "@/app/firebase/admin";
import AddProduct from "@/components/product/addProduct";
import EditProduct from "@/components/product/editProduct";
import { ensureSeedCategoriesOnce } from "@/app/server/ensureCategories";

export const runtime = "nodejs";
export const revalidate = 0;

type CategoryRaw = {
  name?: string;
  slug?: string;
  order?: number | null;
  [k: string]: any;
};
type ProductRaw = {
  imageUrl?: string;
  name?: string;
  description?: string;
  price?: number | null;
  categoryId?: string | null;
  [k: string]: any;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  order?: number | null;
};
type Product = {
  id: string;
  imageUrl?: string;
  name: string;
  description: string;
  price: number | null;
  categoryId: string | null;
};

export default async function Register() {
  await ensureSeedCategoriesOnce();

  // --- categorias (plain objects) ---
  const catSnap = await adminDb
    .collection("categories")
    .orderBy("order", "asc")
    .get();
  const categories = catSnap.docs.map((d) => {
    const data = d.data() as CategoryRaw;
    return {
      id: d.id,
      name: data.name ?? "",
      slug: data.slug ?? "",
      order: data.order ?? null,
    } as Category;
  });

  // versão “limpa” para os forms (apenas id+name)
  const categoriesForForm = categories.map((c) => ({ id: c.id, name: c.name }));

  // --- produtos (plain objects) ---
  const prodSnap = await adminDb
    .collection("products")
    .orderBy("createdAt", "desc")
    .get();
  const products = prodSnap.docs.map((d) => {
    const data = d.data() as ProductRaw;
    return {
      id: d.id,
      imageUrl: data.imageUrl ?? undefined,
      name: data.name ?? "",
      description: data.description ?? "",
      price: data.price ?? null,
      categoryId: (data.categoryId ?? null) as string | null,
    } as Product;
  });

  // --- agrupar por categoria ---
  const byCat = new Map<string | null, Product[]>();
  for (const p of products) {
    const k = p.categoryId ?? null;
    const arr = byCat.get(k) ?? [];
    arr.push(p);
    byCat.set(k, arr);
  }

  // (opcional) ordenar produtos por nome dentro de cada categoria
  for (const arr of byCat.values()) {
    arr.sort((a, b) => a.name.localeCompare(b.name));
  }

  const uncategorized = byCat.get(null) ?? [];

  return (
    <div className="space-y-10 mt-7 p-5">
      {/* Header + botão de novo produto */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-cyan-700">Produtos</h2>
          <AddProduct categories={categoriesForForm} />
        </div>

        {/* Se não tiver nada mesmo */}
        {products.length === 0 && (
          <p className="text-cyan-900">Nenhum produto cadastrado ainda.</p>
        )}
      </section>

      {/* Seção “Sem categoria” */}
      {uncategorized.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Sem categoria</h3>
          <div className="flex flex-wrap gap-5 justify-center">
            {uncategorized.map((p) => (
              <EditProduct
                key={p.id}
                id={p.id}
                imageUrl={p.imageUrl}
                name={p.name}
                description={p.description}
                price={p.price}
                categoryId={p.categoryId}
                categories={categoriesForForm}
              />
            ))}
          </div>
        </section>
      )}

      {/* Demais categorias na ordem definida no Firestore (order asc) */}
      {categories.map((c) => {
        const list = byCat.get(c.id) ?? [];
        if (list.length === 0) return null;

        return (
          <section key={c.id} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">{c.name}</h3>
            <div className="flex flex-wrap gap-5 justify-center">
              {list.map((p) => (
                <EditProduct
                  key={p.id}
                  id={p.id}
                  imageUrl={p.imageUrl}
                  name={p.name}
                  description={p.description}
                  price={p.price}
                  categoryId={p.categoryId}
                  categories={categoriesForForm}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

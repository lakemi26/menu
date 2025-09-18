import { adminDb } from "@/app/firebase/admin";

type BaseCat = { name: string; slug: string; order: number };

// troque para "seed_categories_v2" quando mudar a lista oficial
const SEED_FLAG_ID = "seed_categories_v1";

// suas categorias oficiais (ordem/nomes controlados por você)
const BASE: BaseCat[] = [
  { name: "Entradas", slug: "entradas", order: 1 },
  { name: "Pizza Broto", slug: "pizza-broto", order: 2 },
  { name: "Pizzas", slug: "pizzas", order: 3 },
  { name: "Pizzas Doces (Broto)", slug: "pizzas-doces-broto", order: 4 },
  { name: "Pizzas Doces", slug: "pizzas-doces", order: 5 },
  { name: "Bebidas", slug: "bebidas", order: 6 },
  { name: "Outros", slug: "outros", order: 7 },
];

// Chame esta função no topo de uma página server (ex.: /cadastro ou /page)
export async function ensureSeedCategoriesOnce() {
  const flagRef = adminDb.collection("meta").doc(SEED_FLAG_ID);

  // 1) faz UMA leitura do flag (antes de escrever qualquer coisa)
  const hasRun = (await flagRef.get()).exists;
  if (hasRun) return;

  // 2) usa BATCH com docID = slug (idempotente, sem transação)
  const batch = adminDb.batch();
  const catCol = adminDb.collection("categories");

  for (const item of BASE) {
    const docRef = catCol.doc(item.slug); // <- slug como ID, evita duplicação
    batch.set(
      docRef,
      {
        name: item.name,
        slug: item.slug,
        order: item.order,
        // se já existir, atualiza; se não, cria
        updatedAt: new Date(),
        createdAt: new Date(), // será ignorado se já existir (por causa do merge abaixo)
      },
      { merge: true }
    );
  }

  // grava o flag por último, junto no batch
  batch.set(flagRef, { doneAt: new Date(), version: SEED_FLAG_ID });

  await batch.commit();
}

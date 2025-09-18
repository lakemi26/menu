"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/app/firebase/admin";
import { getServerUser } from "@/app/firebase/auth/getServerUser";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

function isPresent(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Rode UMA VEZ para criar/garantir as categorias oficiais no Firestore
export async function seedCategories() {
  const user = await getServerUser();
  if (!user) throw new Error("unauthorized");

  const BASE = [
    { name: "Entradas", slug: "entradas", order: 1 },
    { name: "Pizza Broto", slug: "pizza-broto", order: 2 },
    { name: "Pizzas", slug: "pizzas", order: 3 },
    { name: "Pizzas Doces (Broto)", slug: "pizzas-doces-broto", order: 4 },
    { name: "Pizzas Doces", slug: "pizzas-doces", order: 5 },
    { name: "Bebidas", slug: "bebidas", order: 6 },
    { name: "Outros", slug: "outros", order: 7 },
  ] as const;

  const col = adminDb.collection("categories");

  for (const item of BASE) {
    const snap = await col.where("slug", "==", item.slug).limit(1).get();
    if (snap.empty) {
      await col.add({
        name: item.name,
        slug: item.slug,
        order: item.order,
        createdAt: new Date(),
        createdBy: { uid: user.uid, email: user.email ?? null },
      });
    } else {
      // mantém nome / ordem alinhados com o oficial
      await snap.docs[0].ref.update({
        name: item.name,
        order: item.order,
        updatedAt: new Date(),
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/register");
}

async function uploadToCloudinary(file: File, folder = "menu/products") {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: "image" }, (err, res) =>
        err ? reject(err) : resolve(res)
      )
      .end(buffer);
  });
  return {
    secureUrl: result.secure_url as string,
    publicId: result.public_id as string,
  };
}

/* ============ PRODUCTS ============ */

export async function registerProduct(formData: FormData): Promise<void> {
  const user = await getServerUser();
  if (!user) throw new Error("unauthorized");

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const priceStr = (formData.get("price") as string) ?? "";
  const categoryId = (formData.get("categoryId") as string)?.trim() || null;
  const image = formData.get("image") as File | null;

  if (!name || !description || !image) throw new Error("missing-fields");

  let price: number | null = null;
  if (isPresent(priceStr)) {
    const parsed = Number(priceStr.trim());
    if (Number.isNaN(parsed)) throw new Error("invalid-price");
    price = parsed;
  }

  const { secureUrl, publicId } = await uploadToCloudinary(
    image,
    "menu/products"
  );

  await adminDb.collection("products").add({
    name,
    description,
    price, // number | null
    categoryId, // string | null
    imageUrl: secureUrl,
    imagePublicId: publicId,
    createdAt: new Date(),
    createdBy: { uid: user.uid, email: user.email ?? null },
  });

  revalidatePath("/");
  revalidatePath("/register");
}

export async function updateProduct(formData: FormData): Promise<void> {
  const user = await getServerUser();
  if (!user) throw new Error("unauthorized");

  const id = (formData.get("productId") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const priceRaw = formData.get("price") as string | null; // pode não vir
  const categoryId = (formData.get("categoryId") as string)?.trim() || null;
  const newImage = formData.get("image") as File | null;

  if (!id || !name || !description) throw new Error("missing-fields");

  const docRef = adminDb.collection("products").doc(id);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error("not-found");

  const patch: Record<string, any> = {
    name,
    description,
    categoryId, // pode ser null
    updatedAt: new Date(),
  };

  // preço opcional: só mexe se o campo vier no form
  if (priceRaw !== null) {
    const s = priceRaw.trim();
    if (s === "") {
      patch.price = null; // limpar preço
    } else {
      const parsed = Number(s);
      if (Number.isNaN(parsed)) throw new Error("invalid-price");
      patch.price = parsed;
    }
  }

  if (newImage && newImage.size > 0) {
    const oldPublicId = (snap.data()?.imagePublicId as string) || undefined;
    const { secureUrl, publicId } = await uploadToCloudinary(
      newImage,
      "menu/products"
    );
    patch.imageUrl = secureUrl;
    patch.imagePublicId = publicId;
    if (oldPublicId)
      await cloudinary.uploader.destroy(oldPublicId).catch(() => {});
  }

  await docRef.update(patch);

  revalidatePath("/");
  revalidatePath("/register");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const user = await getServerUser();
  if (!user) throw new Error("unauthorized");

  const id = (formData.get("productId") as string)?.trim();
  if (!id) throw new Error("missing-id");

  const docRef = adminDb.collection("products").doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return;

  const publicId = (snap.data()?.imagePublicId as string) || undefined;

  await docRef.delete();
  if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});

  revalidatePath("/");
  revalidatePath("/register");
}

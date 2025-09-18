"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Modal, { ModalHandle } from "./modal";
import { updateProduct, deleteProduct } from "@/actions/productActions";
import { useFormStatus } from "react-dom";

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="py-1 px-2 bg-cyan-600 rounded-sm text-white font-semibold w-[20vw] lg:w-[8vw] m-auto disabled:opacity-60"
      type="submit"
      disabled={pending}
    >
      {pending ? "Enviando..." : label}
    </button>
  );
}

type Category = { id: string; name: string };

interface EditProps {
  id: string;
  imageUrl?: string;
  name: string;
  description: string;
  price: number | null;
  categoryId: string | null;
  categories: Category[];
}

export default function EditProduct({
  id,
  imageUrl,
  name,
  description,
  price,
  categoryId,
  categories,
}: EditProps) {
  const editModalRef = useRef<ModalHandle>(null);
  const deleteModalRef = useRef<ModalHandle>(null);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2 border-2 border-dashed rounded-xl border-cyan-600 hover:border-solid justify-center items-center w-[300px] h-[480px] p-2">
      <div className="w-[280px] h-[180px] overflow-hidden rounded-2xl">
        <Image
          src={imageUrl || "/logo_img.png"}
          alt="Product image"
          width={300}
          height={200}
          style={{
            objectFit: "cover",
            objectPosition: "center",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
      <h2 className="text-cyan-700 font-bold text-2xl">{name}</h2>
      <div className="text-center text-cyan-900 h-[30%] w-full break-words overflow-y-auto px-1">
        <p>{description}</p>
        <p className="mt-1">
          {price != null ? (
            <span className="font-semibold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(price)}
            </span>
          ) : (
            <span className="text-sm italic text-gray-500">
              Price on request
            </span>
          )}
        </p>
      </div>

      {/* EDITAR */}
      <Modal ref={editModalRef} titulo="Edit product">
        <div className="w-[75vw] md:w-[50vw] lg:w-[30vw]">
          <form
            action={async (fd) => {
              try {
                await updateProduct(fd);
                editModalRef.current?.close?.();
                setPreview(null);
              } catch {
                alert("Não foi possível salvar.");
              }
            }}
            className="flex flex-col gap-3 mt-5"
          >
            <input type="hidden" name="productId" value={id} />

            <label className="text-cyan-700">New image (optional)</label>
            {preview && (
              <div className="flex justify-center mt-2">
                <Image
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md border-2 border-cyan-700"
                  width={300}
                  height={300}
                  unoptimized
                />
              </div>
            )}
            <input
              type="file"
              name="image"
              accept="image/*"
              className="border-2 rounded-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />

            <label htmlFor="edit-name" className="text-cyan-700">
              Name
            </label>
            <input
              id="edit-name"
              type="text"
              name="name"
              defaultValue={name}
              className="border-2 rounded-sm"
              required
            />

            <label htmlFor="edit-description" className="text-cyan-700">
              Description
            </label>
            <textarea
              id="edit-description"
              name="description"
              defaultValue={description}
              className="border-2 rounded-sm resize-none"
              required
            />

            <label htmlFor="edit-price" className="text-cyan-700">
              Price (optional)
            </label>
            <input
              id="edit-price"
              type="number"
              name="price"
              step="0.01"
              defaultValue={price ?? undefined}
              placeholder="Leave empty to remove"
              className="border-2 rounded-sm"
            />

            <label htmlFor="edit-categoryId" className="text-cyan-700">
              Category
            </label>
            <select
              id="edit-categoryId"
              name="categoryId"
              defaultValue={categoryId ?? ""}
              className="border-2 rounded-sm"
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <SubmitBtn label="Save" />
          </form>
        </div>
      </Modal>

      {/* DELETE */}
      <Modal ref={deleteModalRef} titulo="Are you sure?">
        <div className="w-[75vw] md:w-[50vw] lg:w-[20vw]">
          <form
            action={async (fd) => {
              try {
                await deleteProduct(fd);
                deleteModalRef.current?.close?.();
              } catch {
                alert("Can not be deleted.");
              }
            }}
            className="flex flex-col gap-5 mt-5"
          >
            <input type="hidden" name="productId" value={id} />
            <div className="flex gap-3 justify-center">
              <SubmitBtn label="Yes" />
              <button
                type="button"
                onClick={() => deleteModalRef.current?.close()}
                className="bg-gray-200 text-gray-700 font-semibold py-1 px-4 rounded-sm hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <div className="flex gap-3">
        <button
          onClick={() => editModalRef.current?.open()}
          className="underline text-cyan-700"
        >
          Edit
        </button>
        <button
          onClick={() => deleteModalRef.current?.open()}
          className="underline text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

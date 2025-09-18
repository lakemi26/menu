"use client";

import React, { useRef, useState } from "react";
import Modal, { ModalHandle } from "./modal";
import Image from "next/image";
import { registerProduct } from "@/actions/productActions";
import { useFormStatus } from "react-dom";

type Category = { id: string; name: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="py-1 px-2 bg-cyan-600 rounded-sm text-white font-semibold w-[20vw] lg:w-[8vw] m-auto disabled:opacity-60"
      type="submit"
      disabled={pending}
    >
      {pending ? "Enviando..." : "Enviar"}
    </button>
  );
}

export default function AddProduct({ categories }: { categories: Category[] }) {
  const addModalRef = useRef<ModalHandle>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div>
      <button
        className="py-1 px-2 bg-cyan-600 rounded-sm text-white font-semibold"
        onClick={() => addModalRef.current?.open()}
      >
        Add product
      </button>

      <Modal ref={addModalRef} titulo="Adicionar produto">
        <div className="w-[75vw] md:w-[50vw] lg:w-[30vw] ">
          <form
            action={async (fd) => {
              try {
                await registerProduct(fd);
                addModalRef.current?.close?.();
                setPreview(null);
              } catch {
                alert("Não foi possível cadastrar. Tente novamente.");
              }
            }}
            className="flex flex-col gap-3 mt-5"
          >
            <label htmlFor="image" className="text-cyan-700">
              Imagem
            </label>
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
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="border-2 rounded-sm"
              required
            />

            <label htmlFor="name" className="text-cyan-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="border-2 rounded-sm"
              required
            />

            <label htmlFor="description" className="text-cyan-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="border-2 rounded-sm resize-none"
              required
            />

            <label htmlFor="price" className="text-cyan-700">
              Price (optional)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              step="0.01"
              className="border-2 rounded-sm"
              placeholder="Ex.: 39.90"
            />

            <label htmlFor="categoryId" className="text-cyan-700">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className="border-2 rounded-sm"
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <SubmitButton />
          </form>
        </div>
      </Modal>
    </div>
  );
}

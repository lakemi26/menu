import Image from "next/image";

interface ProductProps {
  image?: string;
  name: string;
  text: string;
  price?: number | null;
}

const ProductCard = ({ image, name, text, price }: ProductProps) => {
  const priceLabel =
    price != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price)
      : "Price on request";

  return (
    <div className="flex flex-col gap-2 border-2 border-dashed rounded-xl border-black hover:border-solid justify-center items-center w-[300px] h-[350px] p-2">
      <div className="w-[280px] h-[180px] overflow-hidden rounded-2xl">
        <Image
          src={image || "/logo_clinsp_img.png"}
          alt="Food image"
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
      <h2 className="text-black font-bold text-2xl">{name}</h2>
      <div className="text-center text-black h-[30%] w-full break-words overflow-y-auto px-1">
        <p>{text}</p>
        <p className="mt-1 font-semibold">{priceLabel}</p>
      </div>
    </div>
  );
};

export default ProductCard;

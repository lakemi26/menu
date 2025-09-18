import Image from "next/image";

interface TitleProps {
  title: string;
}

const Title = ({ title }: TitleProps) => {
  return (
    <div className="flex gap-2 items-center ml-8 md:ml-18 lg:ml-20 xl:ml-35 mt-30 mb-15">
      <h1 className=" font-bold text-4xl ">{title}</h1>
    </div>
  );
};

export default Title;

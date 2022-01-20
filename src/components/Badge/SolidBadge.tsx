import React from "react";

type TProps = {
  active?: boolean;
  onClick?: () => void;
  title: string;
};

function SolidBadge({ active, onClick, title }: TProps) {
  return (
    <button
      className={`px-3 py-1 font-semibold rounded-full text-sm outline-none ${
        active ? "text-white bg-indigo-600" : "text-indigo-600"
      }`}
      onClick={onClick}
    >
      {title}
    </button>
  );
}

export default SolidBadge;

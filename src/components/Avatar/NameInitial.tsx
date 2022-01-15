import React from "react";
import { getNameInitial } from "utils/helper";

type TProps = {
  className?: string;
  name: string;
};

function NameInitial({ className, name }: TProps) {
  return (
    <div
      className={`h-8 w-8 rounded-full flex items-center justify-center overflow-hidden bg-indigo-500 text-white uppercase text-lg ${className}`}
    >
      {getNameInitial(name)}
    </div>
  );
}

export default NameInitial;

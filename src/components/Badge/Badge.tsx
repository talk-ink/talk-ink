import React from "react";

type Props = React.PropsWithChildren<{
  active?: boolean;
  title: string;
}>;

function Badge({ active, title }: Props) {
  return (
    <a
      className={`text-sm py-1.5 px-3 ${
        active ? "bg-cyan-100 hover:bg-slate-300" : "hover:bg-slate-100"
      }  rounded-full text-cyan-800 cursor-pointer`}
    >
      {title}
    </a>
  );
}

export default Badge;

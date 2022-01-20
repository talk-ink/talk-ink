import React from "react";
import { Link } from "react-router-dom";

type Props = React.PropsWithChildren<{
  active?: boolean;
  title: string;
  link: string;
}>;

function Badge({ active, title, link }: Props) {
  return (
    <Link
      to={link}
      className={`text-sm py-1.5 px-3 ${
        active ? "bg-indigo-100 hover:bg-slate-300" : "hover:bg-slate-100"
      }  rounded-full text-indigo-800 cursor-pointer`}
    >
      {title}
    </Link>
  );
}

export default Badge;

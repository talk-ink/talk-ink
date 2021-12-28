import React from "react";

type Props = React.PropsWithChildren<{
  children?: React.ReactNode;
}>;

function Menu({ children }: Props) {
  return <ul className="flex flex-col">{children}</ul>;
}

export default Menu;

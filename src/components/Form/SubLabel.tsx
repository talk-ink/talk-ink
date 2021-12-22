import React from "react";

type Props = React.PropsWithChildren<{
  children?: React.ReactNode;
}>;

function SubLabel({ children }: Props) {
  return <small className="text-xs text-red-500">{children}</small>;
}

export default SubLabel;

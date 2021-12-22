import React from "react";

type Props = React.PropsWithChildren<{
  children: React.ReactNode;
  className?: string;
}>;

function FormControl({ children, className }: Props) {
  return (
    <div className={`flex flex-col items-start mb-2 ${className}`}>
      {children}
    </div>
  );
}

export default FormControl;

import React from "react";

type Props = React.PropsWithChildren<{
  htmlFor?: string;
  className?: string;
  children?: React.ReactNode;
}>;

function FormLabel({ htmlFor, className, children }: Props) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm mb-1 text-neutral-500 ${className}`}
    >
      {children}
    </label>
  );
}

export default FormLabel;

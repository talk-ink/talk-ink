import React from "react";

type Props = React.PropsWithChildren<{
  htmlFor?: string;
  className?: string;
  children?: React.ReactNode;
  required?: boolean;
}>;

function FormLabel({ htmlFor, className, children, required }: Props) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm mb-1 text-neutral-500 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export default FormLabel;

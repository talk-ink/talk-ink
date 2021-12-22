import React from "react";

type Props = React.PropsWithChildren<{
  name?: string;
  type?: string;
  className?: string;
}>;

function TextInput({ name, type = "text", className }: Props) {
  return (
    <input
      id={name}
      type={type}
      name={name}
      className={`w-full text-sm p-2 rounded-md outline-0 border border-neutral-200 focus:border-neutral-300 ${className}`}
    />
  );
}

export default TextInput;

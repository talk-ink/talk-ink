import React from "react";

type Props = React.PropsWithChildren<{
  name?: string;
  type?: string;
  className?: string;
  onChange?(event: React.ChangeEvent): void;
  onBlur?: (event: React.ChangeEvent) => void;
  value?: string;
  placeholder?: string;
}>;

function TextInput({
  name,
  type = "text",
  className,
  onBlur = () => {},
  onChange = () => {},
  value,
  placeholder,
}: Props) {
  return (
    <input
      id={name}
      type={type}
      name={name}
      className={`w-full text-sm p-2 rounded-md outline-0 border border-neutral-200 focus:border-neutral-300 ${className}`}
      onBlur={onBlur}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
    />
  );
}

export default TextInput;

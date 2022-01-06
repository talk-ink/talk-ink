import React from "react";

type Props = React.PropsWithChildren<{
  name?: string;
  type?: string;
  className?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  value?: string | number;
  placeholder?: string;
  defaultValue?: string | number;
}>;

function TextInput({
  name,
  type = "text",
  className,
  onBlur = () => {},
  onChange = () => {},
  value,
  placeholder,
  defaultValue,
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
      defaultValue={defaultValue}
    />
  );
}

export default TextInput;

import React from "react";

interface Props extends React.HTMLProps<HTMLInputElement> {
  name?: string;
  type?: string;
  className?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  value?: string | number;
  placeholder?: string;
  defaultValue?: string | number;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
}

function TextInput({
  name,
  type = "text",
  className,
  onBlur = () => {},
  onChange = () => {},
  value,
  placeholder,
  defaultValue,
  onClick,
  ...rest
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
      onClick={onClick}
      {...rest}
    />
  );
}

export default TextInput;

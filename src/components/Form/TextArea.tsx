import React from "react";

type Props = React.PropsWithChildren<{
  name?: string;
  className?: string;
  onChange?(event: React.ChangeEvent): void;
  onBlur?: (event: React.ChangeEvent) => void;
  value?: string;
  placeholder?: string;
}>;
function TextArea({
  name,
  className,
  onBlur = () => {},
  onChange = () => {},
  value,
  placeholder,
}: Props) {
  return (
    <textarea
      id={name}
      name={name}
      className={`w-full text-sm p-2 rounded-md outline-0 border border-neutral-200 focus:border-neutral-300 ${className}`}
      onBlur={onBlur}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
    />
  );
}

export default TextArea;

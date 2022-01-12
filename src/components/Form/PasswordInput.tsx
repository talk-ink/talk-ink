import React, { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";

type Props = React.PropsWithChildren<{
  name?: string;
  className?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  value?: string | number;
  placeholder?: string;
  defaultValue?: string | number;
}>;

function PasswordInput({
  name,
  className,
  onBlur = () => {},
  onChange = () => {},
  value,
  placeholder,
  defaultValue,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div
      className={`w-full flex items-center justify-between rounded-md outline-0 border border-neutral-200 focus:border-neutral-300 ${className} overflow-hidden p-1.5`}
    >
      <input
        id={name}
        type={showPassword ? "text" : "password"}
        name={name}
        className={`w-full pl-1 text-sm outline-0`}
        onBlur={onBlur}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
      <button
        className="py-1 px-3 flex items-center justify-center rounded hover:bg-neutral-200 outline-none"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {!showPassword && <BsEyeSlash className="text-neutral-500" />}
        {showPassword && <BsEye className="text-neutral-500" />}
      </button>
    </div>
  );
}

export default PasswordInput;

import React from "react";

type TProps = React.PropsWithChildren<{
  children?: React.ReactNode;
  className?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
}>;

function Upload({ children, className, onChange, disabled }: TProps) {
  return (
    <label
      className={`px-3 py-2 bg-neutral-100 rounded-md cursor-pointer hover:bg-neutral-200 ${
        disabled ? "opacity-80 cursor-not-allowed" : ""
      } ${className} `}
    >
      {children}
      <input
        type="file"
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />
    </label>
  );
}

export default Upload;

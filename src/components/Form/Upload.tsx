import React from "react";

type TProps = React.PropsWithChildren<{
  children?: React.ReactNode;
  className?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}>;

function Upload({ children, className, onChange }: TProps) {
  return (
    <label
      className={`${className} px-3 py-2 bg-neutral-100 rounded-md cursor-pointer hover:bg-neutral-200`}
    >
      {children}
      <input type="file" className="hidden" onChange={onChange} />
    </label>
  );
}

export default Upload;

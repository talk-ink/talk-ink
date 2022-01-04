import React from "react";

type TProps = React.PropsWithChildren<{
  children?: React.ReactNode;
  className?: string;
}>;

function Upload({ children, className }: TProps) {
  return (
    <label
      className={`${className} px-3 py-2 bg-neutral-100 rounded-md cursor-pointer hover:bg-neutral-200`}
    >
      {children}
      <input type="file" className="hidden" />
    </label>
  );
}

export default Upload;

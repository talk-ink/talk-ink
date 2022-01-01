import React from "react";

type Props = React.PropsWithChildren<{
  header?: React.ReactNode;
  className?: string;
}>;

function MainContentContainer({ children, className, header }: Props) {
  return (
    <div className="w-full h-screen flex flex-col items-center overflow-auto relative">
      {header}
      <div className={`w-11/12 px-10 pt-20 ${className}`}>{children}</div>
    </div>
  );
}

export default MainContentContainer;

import React from "react";

type Props = React.PropsWithChildren<{
  header?: React.ReactNode;
  className?: string;
  listRef?: React.LegacyRef<HTMLDivElement>;
}>;

function MainContentContainer({ children, className, header, listRef }: Props) {
  return (
    <div className="w-full h-screen flex flex-col items-center md:overflow-auto ">
      {header}
      <div className={`w-full md:w-11/12 px-5 md:px-10 pt-20 ${className} `}>
        {children}
      </div>
      <div ref={listRef} />
    </div>
  );
}

export default MainContentContainer;

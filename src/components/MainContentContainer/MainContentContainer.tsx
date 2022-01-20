import React from "react";

type Props = React.PropsWithChildren<{
  header?: React.ReactNode;
  className?: string;
  listRef?: React.LegacyRef<HTMLDivElement>;
}>;

function MainContentContainer({ children, className, header, listRef }: Props) {
  return (
    <div className="w-full h-screen items-center md:overflow-auto ">
      {header}
      <div
        className={`max-w-4xl px-5 md:ml-auto md:mr-auto pt-20 ${className} `}
      >
        {children}
      </div>
    </div>
  );
}

export default MainContentContainer;

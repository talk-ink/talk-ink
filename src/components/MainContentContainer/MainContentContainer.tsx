import React from "react";

type Props = React.PropsWithChildren<{
  header?: React.ReactNode;
  className?: string;
  listRef?: React.LegacyRef<HTMLDivElement>;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
}>;

function MainContentContainer({
  children,
  className,
  header,
  listRef,
  onScroll,
}: Props) {
  return (
    <div
      className="w-full h-screen items-center md:overflow-auto"
      onScroll={(e) => {
        if (onScroll) onScroll(e);
      }}
    >
      {header}
      <div
        className={`max-w-4xl px-4 md:px-5 md:ml-auto md:mr-auto py-20 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export default MainContentContainer;

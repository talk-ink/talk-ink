import React from "react";

type Props = React.PropsWithChildren<{
  header?: React.ReactNode;
  className?: string;
  listRef?: React.LegacyRef<HTMLDivElement>;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  resetPadding?: boolean;
}>;

function MainContentContainer({
  children,
  className,
  header,
  listRef,
  onScroll,
  resetPadding,
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
        className={`max-w-4xl md:ml-auto md:mr-auto ${
          !resetPadding ? "md:px-5 pt-20 pb-1 md:py-20" : ""
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export default MainContentContainer;

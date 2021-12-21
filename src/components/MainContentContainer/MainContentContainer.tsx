import React from "react";

type Props = React.PropsWithChildren<{}>;

function MainContentContainer({ children }: Props) {
  return (
    <div className="w-full h-screen flex justify-center  overflow-auto">
      <div className="min-h-screen w-11/12 px-10 pt-20">{children}</div>
    </div>
  );
}

export default MainContentContainer;

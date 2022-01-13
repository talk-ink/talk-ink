import React, { useState } from "react";

type TProps = React.PropsWithChildren<{
  children?: React.ReactNode;
}>;

function Tooltip({ children }: TProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="absolute -top-5 right-52 bg-slate-800">
        <p className="text-sm text-white whitespace-nowrap">tooltip</p>
      </div>
      {children}
    </div>
  );
}

export default Tooltip;

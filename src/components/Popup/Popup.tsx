import React, { useState } from "react";

type Props = React.PropsWithChildren<{
  children?: React.ReactNode;
  content?: React.ReactNode;
  position?: "left" | "right" | "bottom" | "top";
}>;

function Popup({ children, content, position = "left" }: Props) {
  const [showPopup, setShowPopup] = useState(false);
  const popupPosition: any = {
    left: "top-0 -left-2 transform -translate-x-full",
    right: "top-0 -right-2 transform translate-x-full",
    bottom: "-bottom-2 right-0 transform translate-y-full",
    top: "-top-2 right-0 transform -translate-y-full",
  };
  return (
    <div
      className="relative z-10"
      onClick={() => {
        setShowPopup((prev) => !prev);
      }}
    >
      {showPopup && (
        <div
          className={`absolute ${popupPosition[position]} w-60 shadow rounded-xl bg-white p-3`}
        >
          {content}
        </div>
      )}
      {children}
    </div>
  );
}

export default Popup;

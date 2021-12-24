import React, { useState } from "react";

type Props = React.PropsWithChildren<{
  children?: React.ReactNode;
  content?: React.ReactNode;
  position?: "left" | "right";
}>;

function Popup({ children, content, position = "left" }: Props) {
  const [showPopup, setShowPopup] = useState(false);
  return (
    <div
      className="relative"
      onClick={() => {
        setShowPopup((prev) => !prev);
      }}
    >
      {showPopup && (
        <div
          className={`absolute top-0 ${
            position === "left" && "-left-2 transform -translate-x-full"
          } ${
            position === "right" && "-right-2 transform translate-x-full"
          } w-60 shadow rounded-xl bg-white p-3`}
        >
          {content}
        </div>
      )}
      {children}
    </div>
  );
}

export default Popup;

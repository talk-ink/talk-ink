import React from "react";

interface IProps {
  src: string;
  size?: "small" | "medium";
}

const Avatar: React.FC<IProps> = ({ src, size = "medium" }) => {
  const avatarWidth = {
    small: "h-6 w-8",
    medium: "h-8 w-8 ",
  };

  return (
    <div className={`${avatarWidth[size]} rounded-full overflow-hidden`}>
      <img src={src} className="h-8 w-8" alt="img" />
    </div>
  );
};

export default Avatar;

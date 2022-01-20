import React from "react";

type TProps = {
  className?: string;
  source: string;
  size?: "small" | "medium" | "large";
};

function ProfileImage({ className, source, size = "medium" }: TProps) {
  const sizeStr = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-10 w-10",
  };
  return (
    <div
      className={`${sizeStr[size]} rounded-full flex items-center justify-center overflow-hidden ${className}`}
    >
      <img
        src={source}
        alt="profile image"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export default ProfileImage;

import React from "react";

type TProps = {
  className?: string;
  source: string;
};

function ProfileImage({ className, source }: TProps) {
  return (
    <div
      className={`h-8 w-8 rounded-full flex items-center justify-center overflow-hidden ${className}`}
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

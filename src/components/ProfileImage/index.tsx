import NameInitial from "components/Avatar/NameInitial";
import React, { useState } from "react";

type TProps = {
  className?: string;
  source: string;
  size?: "small" | "medium" | "large";
  alt?: string;
};

function ProfileImage({ className, source, size = "medium", alt }: TProps) {
  const [loading, setLoading] = useState<boolean>(true);

  const sizeStr = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-10 w-10",
  };
  return (
    <>
      {loading && (
        <NameInitial size={size} name={alt} className={`${className}`} />
      )}
      <div
        className={`${sizeStr[size]} ${
          loading ? "hidden" : ""
        } rounded-full flex items-center justify-center overflow-hidden ${className}`}
      >
        <img
          src={source}
          alt="profile"
          className="h-full w-full object-cover"
          onLoad={() => setLoading(false)}
        />
      </div>
    </>
  );
}

export default ProfileImage;

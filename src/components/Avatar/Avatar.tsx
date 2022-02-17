import React, { useEffect, useState } from "react";
import NameInitial from "./NameInitial";

interface IProps {
  src: string;
  size?: "small" | "medium" | "large";
  alt?: string;
}

const Avatar: React.FC<IProps> = ({ src, size = "medium", alt }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const avatarWidth = {
    small: "h-6 w-6",
    medium: "h-8 w-8 ",
    large: "h-10 w-10",
  };

  useEffect(() => {
    return () => {
      setLoading(true);
    };
  }, [alt]);

  return (
    <>
      {loading && <NameInitial size={size} name={alt} />}
      <div
        className={`${avatarWidth[size]} rounded-full overflow-hidden  ${
          loading ? "hidden" : ""
        }`}
      >
        <img
          src={src}
          className={`h-full w-full object-cover`}
          alt="avatar"
          onLoad={() => {
            setLoading(false);
          }}
        />
      </div>
    </>
  );
};

export default Avatar;

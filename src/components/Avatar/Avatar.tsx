import React from "react";
import PropTypes from "prop-types";

interface IProps {
  src: string;
}

const Avatar: React.FC<IProps> = ({ src }) => {
  return (
    <div className="h-8 w-8 rounded-full overflow-hidden">
      <img
        src={src || "https://picsum.photos/100"}
        className="h-8 w-8"
        alt="img"
      />
    </div>
  );
};

export default Avatar;

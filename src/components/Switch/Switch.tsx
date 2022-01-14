import React, { useEffect, useState } from "react";

type TProps = {
  value?: boolean;
  onChange?: (value?: boolean) => void;
};

function Switch({ value = false, onChange = () => {} }: TProps) {
  return (
    <div
      className={`w-12 h-6 ${
        value ? "bg-indigo-500" : "bg-neutral-300"
      } relative rounded-full cursor-pointer`}
      onClick={() => {
        onChange(!value);
      }}
    >
      <div
        className={`h-4 w-4 bg-white absolute top-1/2 ${
          value ? "right-1" : "left-1"
        } transform -translate-y-1/2 rounded-full`}
      ></div>
    </div>
  );
}

export default Switch;

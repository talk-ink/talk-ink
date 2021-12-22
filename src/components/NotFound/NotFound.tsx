import React from "react";
import { MdMiscellaneousServices } from "react-icons/md";

function NotFound() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <MdMiscellaneousServices size={150} className="text-neutral-300" />
        <code className="text-neutral-500 text-sm mt-2">
          Content Not Found (404)
        </code>
      </div>
    </div>
  );
}

export default NotFound;

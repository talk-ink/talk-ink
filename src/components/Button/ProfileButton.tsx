import React from "react";
import { HiChevronDown } from "react-icons/hi";

function ProfileButton() {
  return (
    <button className="flex items-center hover:bg-neutral-200 px-3 h-10 rounded-md">
      <div className="w-6 h-6 bg-[#a8a8a8] rounded-md flex items-center justify-center">
        <p className="text-white uppercase font-bold text-sm">I</p>
      </div>
      <p className="font-bold px-2 text-sm">Iruhaa</p>
      <HiChevronDown className="text-neutral-400 -mb-1" />
    </button>
  );
}

export default ProfileButton;

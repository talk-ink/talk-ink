import React from "react";

function SectionHeader() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex flex-col items-center justify-center after:block after:h-1 md:after:h-2 after:w-28 after:mt-3 after:bg-accent">
        <h2 className="font-montserrat text-center whitespace-nowrap font-extrabold md:text-4xl text-2xl">
          Why Talk.ink?
        </h2>
      </div>
    </div>
  );
}

export default SectionHeader;

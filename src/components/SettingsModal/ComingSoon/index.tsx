import React from "react";

import MaintenanceImage from "assets/image/maintenance.svg";

function ComingSoonSettings() {
  return (
    <div className="h-[60vh] w-full flex flex-col items-center justify-center">
      <img
        src={MaintenanceImage}
        alt="coming soon"
        className="w-6/12 object-cover"
      />

      <h3 className="text-xl text-neutral-500 mt-4 font-bold">Coming soon</h3>
    </div>
  );
}

export default ComingSoonSettings;

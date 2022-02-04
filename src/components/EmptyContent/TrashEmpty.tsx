import React from "react";

import TrashEmptyImage from "assets/image/trash_empty.svg";

function TrashEmpty() {
  return (
    <div className="w-full flex flex-col items-center justify-center mt-32">
      <img className="w-96" src={TrashEmptyImage} alt="inbox empty" />

      <p className="text-neutral-500 w-96 text-center">
        Hmmm, clean as it should be
      </p>
    </div>
  );
}

export default TrashEmpty;

import React from "react";

import SearchEmptyImage from "assets/image/search_empty.svg";

function SearchEmpty() {
  return (
    <div className="w-full flex flex-col items-center justify-center mt-32">
      <img className="w-96" src={SearchEmptyImage} alt="inbox empty" />

      <p className="text-neutral-500 w-96 text-center">
        There is nothing to show
      </p>
    </div>
  );
}

export default SearchEmpty;

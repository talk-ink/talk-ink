import React from "react";

import { HiChevronLeft } from "react-icons/hi";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import Button from "components/Button/Button";
import { createBrowserHistory } from "history";

function Compose() {
  let history = createBrowserHistory();
  return (
    <MainContentContainer
      className="pt-10 h-full"
      header={
        <div className="w-full py-4 px-3 sticky top-0 grid grid-cols-3 border-b border-b-neutral-100 bg-white">
          <div>
            <Button
              className=" hover:bg-neutral-200 flex items-center"
              onClick={() => {
                history.back();
              }}
            >
              <HiChevronLeft size={18} className="text-neutral-500 mr-2 " />
              <p className="text-xs text-neutral-500 font-medium">General</p>
            </Button>
          </div>
          <div className="flex items-center justify-center">
            <h1 className="text-md font-bold">New Thread</h1>
          </div>
          <div></div>
        </div>
      }
    >
      <div className="w-full h-5/6 px-14">
        <div className="w-full h-full border border-neutral-300 rounded-lg"></div>
      </div>
    </MainContentContainer>
  );
}

export default Compose;

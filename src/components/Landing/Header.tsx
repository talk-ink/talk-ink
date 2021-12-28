import React from "react";
import { GoMarkGithub } from "react-icons/go";
import { Link } from "react-router-dom";

import Button from "components/Button/Button";
import Brand from "assets/image/landing/brand.svg";
import GetStartedButton from "./GetStartedButton";
import GithubButton from "./GithubButton";

function LandingHeader() {
  return (
    <header className="sticky top-0 bg-white">
      <div className="h-20 flex items-center justify-between overflow-hidden max-w-[1400px] px-20 2xl:px-0 m-auto">
        <div>
          <Link to="/">
            <div className="">
              <img className="w-40" src={Brand} />
            </div>
          </Link>
        </div>
        <div className="flex items-center justify-end gap-2">
          <GetStartedButton />
          <GithubButton />
        </div>
      </div>
    </header>
  );
}

export default LandingHeader;

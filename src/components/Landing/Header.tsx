import React from "react";
import { GoMarkGithub } from "react-icons/go";
import { Link } from "react-router-dom";

import Button from "components/Button/Button";
import Brand from "assets/image/landing/brand.svg";
import GetStartedButton from "./GetStartedButton";
import GithubButton from "./GithubButton";

function LandingHeader() {
  return (
    <header className="flex h-20 items-center justify-between px-20 sticky top-0 bg-white overflow-hidden">
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
    </header>
  );
}

export default LandingHeader;

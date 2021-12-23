import React from "react";
import Button from "components/Button/Button";
import { Link } from "react-router-dom";

function LandingHeader() {
  return (
    <header className="flex h-16 items-center justify-between px-20 sticky top-0 bg-white">
      <div>
        <Link to="/">
          <div className="relative flex items-center">
            <div className="h-9 w-9 absolute left-0 bg-cyan-500 -skew-y-6 rounded"></div>
            <h1 className="ml-1 text-cyan-500 text-2xl font-semibold relative z-10">
              <span className="italic font-bold text-white">Ta </span>lk.Ink
            </h1>
          </div>
        </Link>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Link to="/login">
          <Button className="text-sm font-medium hover:bg-neutral-100">
            Log In
          </Button>
        </Link>
        <Link to="/register">
          <Button className="text-sm bg-cyan-500 hover:bg-cyan-600 text-white font-medium">
            Sign Up
          </Button>
        </Link>
      </div>
    </header>
  );
}

export default LandingHeader;

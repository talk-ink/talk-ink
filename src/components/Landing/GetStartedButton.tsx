import Button from "components/Button/Button";
import React from "react";
import { Link } from "react-router-dom";

function GetStartedButton() {
  return (
    <Link to="/login">
      <Button className="text-xs md:text-sm bg-accent text-white font-roboto font-medium rounded px-5 py-5 border border-accent">
        Get Started
      </Button>
    </Link>
  );
}

export default GetStartedButton;

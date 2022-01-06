import Button from "components/Button/Button";
import React from "react";
import { GoMarkGithub } from "react-icons/go";

function GithubButton() {
  return (
    <Button
      className="text-xs md:text-sm flex items-center justify-center px-5 py-5 border rounded border-neutral-700"
      onClick={() => {
        window.open("https://github.com/talk-ink/talk-ink");
      }}
    >
      <GoMarkGithub size={22} className="text-accent" />
      <p className="text-xs md:text-sm font-robot font-medium ml-2 -mb-1">
        Github
      </p>
    </Button>
  );
}

export default GithubButton;

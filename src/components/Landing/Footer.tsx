import React from "react";

import {
  FaTwitter,
  FaFacebookF,
  FaGithub,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";

type Props = {
  link: string;
  type: string;
};

function IconLink({ link, type }: Props) {
  let Icon = FaGithub;

  switch (type) {
    case "github":
      Icon = FaGithub;
      break;
    case "twitter":
      Icon = FaTwitter;
      break;
    case "facebook":
      Icon = FaFacebookF;
      break;
    case "youtube":
      Icon = FaYoutube;

      break;
    case "linkedin":
      Icon = FaLinkedinIn;

      break;
    case "instagram":
      Icon = RiInstagramFill;

      break;

    default:
      break;
  }

  return (
    <a href={link}>
      <Icon size={20} className="text-neutral-400" />
    </a>
  );
}

function LandingFooter() {
  return (
    <footer className=" border-t border-neutral-300">
      <div className="max-w-[1400px] flex items-center justify-between h-14 m-auto px-20 2xl:px-0">
        <div>
          <p className="text-sm text-neutral-400">© 2021 Talk.ink</p>
        </div>
        <div className="flex gap-4">
          <div>
            <p className="text-sm text-neutral-400">Join us on</p>
          </div>
          <div className="grid grid-cols-6 gap-4">
            <IconLink
              link="https://github.com/talk-ink/talk-ink"
              type="github"
            />
            <IconLink link="#" type="twitter" />
            <IconLink link="#" type="facebook" />
            <IconLink link="#" type="youtube" />
            <IconLink link="#" type="linkedin" />
            <IconLink link="#" type="instagram" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;

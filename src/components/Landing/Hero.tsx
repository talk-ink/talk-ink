import React from "react";
import { Link } from "react-router-dom";

import Button from "components/Button/Button";

import HeroImage from "assets/image/landing/hero1.svg";
import { GoMarkGithub } from "react-icons/go";
import GetStartedButton from "./GetStartedButton";
import GithubButton from "./GithubButton";

function LandingHero() {
  return (
    <section className="w-full pt-10 md:pt-20 grid md:grid-cols-2 justify-center items-start ">
      <div className="text-center md:text-left">
        <h1 className="font-montserrat text-2xl md:text-5xl 2xl:text-6xl font-extrabold mb-2">
          <span className="text-accent">Simple</span> as Email
        </h1>
        <h1 className="font-montserrat text-2xl md:text-5xl 2xl:text-6xl  font-extrabold mb-2">
          <span className="text-accent">Readable</span> as Thread
        </h1>
        <h1 className="font-montserrat text-2xl md:text-5xl 2xl:text-6xl  font-extrabold mb-2">
          <span className="text-accent">Realtime</span> as Chat
        </h1>

        <p className="font-montserrat text-neutral-600 text-md md:text-xl 2xl:text-2xl mt-4 mb-10">
          an Open Source Team Communication Tools, Finally!
        </p>
        <div className="flex items-center gap-2 justify-center md:justify-start mb-10 md:mb-0">
          <GetStartedButton />
          <GithubButton />
        </div>
      </div>
      <div>
        <img className="w-full" src={HeroImage} />
      </div>
    </section>
  );
}

export default LandingHero;

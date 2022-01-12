import React from "react";
import GetStartedButton from "./GetStartedButton";

function FooterHero() {
  return (
    <div className="flex flex-col justify-center items-center mt-32 mb-52">
      <h1 className="font-montserrat font-bold text-2xl md:text-6xl text-center mb-4 md:mb-8">
        Ready for
      </h1>
      <h1 className="font-montserrat font-bold text-2xl md:text-6xl text-center mb-6 md:mb-10">
        Better Communication?
      </h1>
      <GetStartedButton />
    </div>
  );
}

export default FooterHero;

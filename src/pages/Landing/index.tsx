import React from "react";

import LandingHeader from "components/Landing/Header";
import LandingHero from "components/Landing/Hero";
import SectionHeader from "components/Landing/SectionHeader";
import SectionContent from "components/Landing/SectionContent";
import FooterHero from "components/Landing/FooterHero";
import LandingFooter from "components/Landing/Footer";

function LandingPage() {
  return (
    <div className="min-h-screen text-slightGray overflow-hidden">
      <LandingHeader />
      <main className="grid grid-cols-1 items-center justify-center max-w-[1400px] m-auto px-20 2xl:px-0">
        <LandingHero />
        <SectionHeader />
        <SectionContent
          header="Simple as Email"
          subHeader="Your inbox gathers all threads only you’re part of, and mark it done as you go."
        />
        <SectionContent
          header="Readable as Thread"
          subHeader="Go to channel, create a thread, and start deep discussion without worrying important topic got burried."
          reverse
        />
        <SectionContent
          header="Realtime as Chat"
          subHeader="the discussion will notify you realtime or you can catch up in your time."
        />
        <FooterHero />
      </main>
      <LandingFooter />
    </div>
  );
}

export default LandingPage;

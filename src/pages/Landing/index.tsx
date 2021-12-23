import React from "react";

import LandingHeader from "components/Landing/Header";
import LandingHero from "components/Landing/Hero";

function LandingPage() {
  return (
    <div className="min-h-screen w-screen text-slightGray">
      <LandingHeader />
      <main className="px-5">
        <LandingHero />
      </main>
    </div>
  );
}

export default LandingPage;

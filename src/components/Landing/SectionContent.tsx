import React from "react";

import HeroTemplate from "assets/image/landing/hero-temp.svg";

type Props = React.PropsWithChildren<{
  header?: string;
  subHeader?: string;
  reverse?: boolean;
}>;

function SectionContent({ header, subHeader, reverse }: Props) {
  return (
    <div className="grid grid-cols-2 gap-20 items-start mb-20">
      <div className={`${reverse && "order-2"}`}>
        <img src={HeroTemplate} className="w-full" />
      </div>
      <div className={`${reverse && "order-1"}`}>
        <h2 className="font-montserrat font-extrabold text-4xl mb-2">
          {header}
        </h2>
        <p className="font-montserrat font-medium text-2xl 2xl:text-3xl">
          {subHeader}
        </p>
      </div>
    </div>
  );
}

export default SectionContent;

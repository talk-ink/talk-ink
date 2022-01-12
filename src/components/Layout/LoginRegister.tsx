import React from "react";
import { Link } from "react-router-dom";

import Logo from "../../assets/image/logo512.png";

type TProps = React.PropsWithChildren<{
  hero: string;
  title: string;
}>;

const LoginRegister: React.FC<TProps> = ({ hero, title, children }) => {
  return (
    <div className="lg:flex">
      <div className="lg:w-1/2 xl:max-w-screen-sm">
        <div className="py-12 bg-white lg:bg-white flex justify-start pl-12 lg:px-12">
          <div className="cursor-pointer flex items-center">
            <div>
              <Link to="/">
                <img src={Logo} alt="Logo" className="w-3/12" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-10 px-12 sm:px-24 md:px-48 lg:px-12 lg:mt-16 xl:px-24 xl:max-w-2xl">
          <h2
            className="text-center text-4xl text-indigo-900 font-display font-semibold lg:text-left xl:text-5xl
            xl:text-bold"
          >
            {title}
          </h2>
          <div className="mt-12">{children}</div>
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center bg-indigo-100 flex-1 h-screen">
        <div className="max-w-md transform duration-200 hover:scale-110 cursor-pointer">
          <img src={hero} alt="hero" />
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;

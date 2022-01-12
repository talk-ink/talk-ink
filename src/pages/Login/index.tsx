import React, { useMemo, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import { KontenbaseResponse } from "@kontenbase/sdk";

import Button from "components/Button/Button";
import FormControl from "components/Form/FormControl";
import FormLabel from "components/Form/FormLabel";
import TextInput from "components/Form/TextInput";
import SubLabel from "components/Form/SubLabel";

import { kontenbase } from "lib/client";
import { setAuthToken, setAuthUser } from "features/auth";
import { loginValidation } from "utils/validators";
import { useAppDispatch } from "hooks/useAppDispatch";
import { Login, User, Workspace } from "types";
import { useToast } from "hooks/useToast";
import Logo from "../../assets/image/logo512.png";
import Hero from "../../assets/image/landing/thread.svg";

const initialValues: Login = {
  email: "",
  password: "",
};

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const [showToast] = useToast();

  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const onSubmit = async (values: Login) => {
    setApiLoading(true);
    try {
      const { data } = await kontenbase.auth.login(values);

      const { data: userData } = await kontenbase.auth.profile();

      if (!data) throw new Error("Invalid login");
      if (!userData) throw new Error("Invalid user");

      if (userData) {
        const user: User = userData;

        let toWorkspaceId: string = "";

        if (params.inviteId) {
          const { data: workspaceData }: KontenbaseResponse<Workspace> =
            await kontenbase
              .service("Workspaces")
              .find({ where: { inviteId: params.inviteId } });

          if (workspaceData?.length > 0) {
            toWorkspaceId = `${workspaceData[0]._id}/join_channels`;
          } else {
            return showToast({ message: "Invite link not valid!" });
          }
        } else {
          const { data: workspaceData }: KontenbaseResponse<Workspace> =
            await kontenbase
              .service("Workspaces")
              .find({ where: { peoples: user.id } });

          if (workspaceData?.length > 0) {
            toWorkspaceId = `${workspaceData[0]._id}/inbox`;
          } else {
            toWorkspaceId = `create_workspace`;
          }
        }

        dispatch(setAuthToken({ token: data?.token }));
        dispatch(setAuthUser(user));

        navigate(`/a/${toWorkspaceId}`);
      }
    } catch (error: any) {
      console.log("err", error);

      setApiError(`${error?.message}`);
    } finally {
      setApiLoading(false);
    }
  };

  const handleLink = () => {
    if (params.inviteId) return `/j/${params.inviteId}/register`;
    return "/register";
  };

  const formik = useFormik({
    initialValues,
    validationSchema: loginValidation,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const isDisabled: boolean =
    !formik.values.email ||
    !formik.values.password ||
    !!formik.errors.email ||
    !!formik.errors.password ||
    apiLoading;

  return (
    <div className="lg:flex">
      <div className="lg:w-1/2 xl:max-w-screen-sm">
        <div className="py-12 bg-white lg:bg-white flex justify-center lg:justify-start lg:px-12">
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
            Log in
          </h2>
          <div className="mt-12">
            <form onSubmit={formik.handleSubmit}>
              <div>
                <div className="text-sm font-bold text-gray-700 tracking-wide">
                  Email Address
                </div>
                <input
                  className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                  placeholder="Enter Your Email"
                  name="email"
                  type="email"
                  onChange={formik.handleChange("email")}
                  onBlur={formik.handleBlur("email")}
                  value={formik.values.email}
                />
                {formik.errors.email && (
                  <SubLabel>{formik.errors.email}</SubLabel>
                )}
              </div>
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-bold text-gray-700 tracking-wide">
                    Password
                  </div>
                  <div>
                    <span
                      className="text-xs font-display font-semibold text-indigo-600 hover:text-indigo-800
                                    cursor-pointer"
                    >
                      Forgot Password?
                    </span>
                  </div>
                </div>
                <input
                  className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                  placeholder="Enter your password"
                  type="password"
                  onChange={formik.handleChange("password")}
                  onBlur={formik.handleBlur("password")}
                  value={formik.values.password}
                />
                {formik.errors.password && (
                  <SubLabel>{formik.errors.password}</SubLabel>
                )}
              </div>
              <div className="mt-10">
                <button
                  type="submit"
                  className="bg-indigo-500 text-gray-100 p-4 w-full rounded-full tracking-wide
                            font-semibold font-display focus:outline-none focus:shadow-outline hover:bg-indigo-600
                            shadow-lg"
                  disabled={isDisabled}
                >
                  Log In
                </button>
              </div>
            </form>
            <div className="mt-12 text-sm font-display font-semibold text-gray-700 text-center">
              Don't have an account ?{" "}
              <Link to={handleLink()}>
                <span className="cursor-pointer text-indigo-600 hover:text-indigo-800">
                  Sign up
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center bg-indigo-100 flex-1 h-screen">
        <div className="max-w-md transform duration-200 hover:scale-110 cursor-pointer">
          <img src={Hero} alt="hero" />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

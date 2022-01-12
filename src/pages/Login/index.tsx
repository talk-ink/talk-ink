import React, { useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import { KontenbaseResponse } from "@kontenbase/sdk";

import SubLabel from "components/Form/SubLabel";
import Layout from "components/Layout/LoginRegister";

import { kontenbase } from "lib/client";
import { setAuthToken, setAuthUser } from "features/auth";
import { loginValidation } from "utils/validators";
import { useAppDispatch } from "hooks/useAppDispatch";
import { Login, TUserProfile, User, Workspace, WorkspaceResponse } from "types";
import { useToast } from "hooks/useToast";
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
      const { user: userLogin, token } = await kontenbase.auth.login(values);

      const { user: userData } = await kontenbase.auth.user();

      if (!userLogin) throw new Error("Invalid login");
      if (!userData) throw new Error("Invalid user");

      if (userData) {
        const user: TUserProfile = userData;

        let toWorkspaceId: string = "";

        if (params.inviteId) {
          const { data: workspaceData }: KontenbaseResponse<WorkspaceResponse> =
            await kontenbase
              .service("Workspaces")
              .find({ where: { inviteId: params.inviteId } });

          if (workspaceData?.length > 0) {
            let invitedEmails: string[] = [];

            if (workspaceData[0].invitedEmails) {
              invitedEmails = JSON.parse(workspaceData[0].invitedEmails);
            }

            if (
              user.id === workspaceData[0]?.createdBy?._id ||
              workspaceData[0]?.peoples.includes(user.id)
            ) {
              toWorkspaceId = `${workspaceData[0]._id}/inbox`;
            } else if (!invitedEmails.includes(user.email)) {
              return showToast({ message: "Invite link not valid!" });
            } else {
              toWorkspaceId = `${workspaceData[0]._id}/join_channels`;
            }
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

        dispatch(setAuthToken({ token }));
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
    <Layout hero={Hero} title="Login">
      {apiError && (
        <div className="mt-3 mb-5 px-3 py-2 text-sm rounded-md bg-red-200 text-center text-red-500">
          {apiError}
        </div>
      )}
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
          {formik.errors.email && <SubLabel>{formik.errors.email}</SubLabel>}
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
    </Layout>
  );
}

export default LoginPage;

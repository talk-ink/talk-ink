import React, { useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";

import SubLabel from "components/Form/SubLabel";
import Hero from "../../assets/image/landing/email.svg";
import Layout from "components/Layout/LoginRegister";

import {
  Register,
  TUserProfile,
  User,
  Workspace,
  WorkspaceResponse,
} from "types";
import { registerValidation } from "utils/validators";
import { kontenbase } from "lib/client";
import { useAppDispatch } from "hooks/useAppDispatch";
import { setAuthToken, setAuthUser } from "features/auth";
import { KontenbaseResponse } from "@kontenbase/sdk";
import OneSignal from "react-onesignal";

const initialValues: Register = {
  email: "",
  firstName: "",
  password: "",
};

function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const onSubmit = async (values: Register) => {
    setApiLoading(true);
    try {
      const { user: userRegister, token } = await kontenbase.auth.register(
        values
      );
      const { user: userData } = await kontenbase.auth.user();

      if (!userRegister) throw new Error("Invalid register");
      if (!userData) throw new Error("Invalid user");

      if (userData) {
        OneSignal.setExternalUserId(userData.id).then(() =>
          OneSignal.setSubscription(true)
        );
        const user: TUserProfile = userData;

        let toWorkspaceId = "create_workspace";

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

            if (invitedEmails.includes(user.email))
              toWorkspaceId = `${workspaceData[0]._id}/join_channels`;
          }
        }

        dispatch(setAuthToken({ token }));
        dispatch(setAuthUser(user));

        navigate(`/a/${toWorkspaceId}`);
      }
    } catch (error: any) {
      console.log("error");
      setApiError(`${error.message}`);
    } finally {
      setApiLoading(false);
    }
  };

  const handleLink = () => {
    if (params.inviteId) return `/j/${params.inviteId}/login`;
    return "/login";
  };

  const formik = useFormik({
    initialValues,
    validationSchema: registerValidation,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const isDisabled: boolean =
    !formik.values.email ||
    !formik.values.firstName ||
    !formik.values.password ||
    !!formik.errors.email ||
    !!formik.errors.firstName ||
    !!formik.errors.password ||
    apiLoading;

  return (
    <Layout hero={Hero} title="Register">
      {apiError && (
        <div className="mt-3 mb-5 px-3 py-2 text-sm rounded-md bg-red-200 text-center text-red-500">
          {apiError}
        </div>
      )}
      <form onSubmit={formik.handleSubmit}>
        <div>
          <div className="text-sm font-bold text-gray-700 tracking-wide">
            Full Name
          </div>
          <input
            className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
            placeholder="Enter Your Full Name"
            name="firstName"
            type="text"
            onChange={formik.handleChange("firstName")}
            onBlur={formik.handleBlur("firstName")}
            value={formik.values.firstName}
          />
          {formik.errors.firstName && (
            <SubLabel>{formik.errors.firstName}</SubLabel>
          )}
        </div>
        <div className="mt-8">
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
                            font-semibold font-display focus:outline-none focus:shadow-outline hover:bg-indigo-500
                            shadow-lg"
            disabled={isDisabled}
          >
            Sign up
          </button>
        </div>
      </form>
      <div className="mt-12 text-sm font-display font-semibold text-gray-700 text-center">
        Already have account ?{" "}
        <Link to={handleLink()}>
          <span className="cursor-pointer text-indigo-600 hover:text-indigo-800">
            Login
          </span>
        </Link>
      </div>
    </Layout>
  );
}

export default RegisterPage;

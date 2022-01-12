import React, { useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";

import Button from "components/Button/Button";
import FormControl from "components/Form/FormControl";
import FormLabel from "components/Form/FormLabel";
import TextInput from "components/Form/TextInput";
import SubLabel from "components/Form/SubLabel";

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
    <div className="w-screen h-screen flex items-center justify-center text-slightGray px-5 md:px-0">
      <div className="w-full md:w-5/12 bg-slate-100 border border-neutral-200 rounded-md px-5 md:px-20 py-16 flex flex-col justify-center">
        <h1 className="text-3xl font-semibold">Register</h1>
        {apiError && (
          <div className="mt-3 -mb-5 px-3 py-2 text-sm rounded-md bg-red-200 text-center text-red-500">
            {apiError}
          </div>
        )}
        <form onSubmit={formik.handleSubmit} className="mt-8">
          <FormControl>
            <FormLabel htmlFor="fullName">Fullname</FormLabel>
            <TextInput
              name="fullName"
              type="text"
              onChange={formik.handleChange("firstName")}
              onBlur={formik.handleBlur("firstName")}
            />
            {formik.errors.firstName && (
              <SubLabel>{formik.errors.firstName}</SubLabel>
            )}
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextInput
              name="email"
              type="email"
              onChange={formik.handleChange("email")}
              onBlur={formik.handleBlur("email")}
            />{" "}
            {formik.errors.email && <SubLabel>{formik.errors.email}</SubLabel>}
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextInput
              name="password"
              type="password"
              onChange={formik.handleChange("password")}
              onBlur={formik.handleBlur("password")}
            />{" "}
            {formik.errors.password && (
              <SubLabel>{formik.errors.password}</SubLabel>
            )}
          </FormControl>

          <FormControl>
            <div className="flex items-center">
              <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 text-center text-white font-medium text-sm mr-2"
                disabled={isDisabled}
              >
                Register
              </Button>
              <Link to={handleLink()}>
                <p className="text-sm text-cyan-500">Sign In</p>
              </Link>
            </div>
          </FormControl>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;

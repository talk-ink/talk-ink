import React from "react";

import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { KontenbaseResponse } from "@kontenbase/sdk";

import Button from "components/Button/Button";
import FormControl from "components/Form/FormControl";
import FormLabel from "components/Form/FormLabel";
import TextInput from "components/Form/TextInput";
import SubLabel from "components/Form/SubLabel";

import { kontenbase } from "lib/client";
import { setAuthLoading, setAuthToken, setAuthUser } from "features/auth";
import { loginValidation } from "utils/validators";
import { useAppDispatch } from "hooks/useAppDispatch";
import { Login, User, Workspace } from "types";
import {
  ProfileResponse,
  AuthResponseFailure,
  ProfileResponseSuccess,
} from "@kontenbase/sdk/dist/main/auth";

const initialValues: Login = {
  email: "",
  password: "",
};

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues,
    validationSchema: loginValidation,
    onSubmit: (values, error) => {
      if (values) {
        onSubmit(values);
      }
    },
  });

  const onSubmit = async (values: Login) => {
    try {
      const { data } = await kontenbase.auth.login({
        email: values.email,
        password: values.password,
      });

      const { data: userData } = await kontenbase.auth.profile();

      if (!data) throw new Error("Invalid login");
      if (!userData) throw new Error("Invalid user");

      if (userData) {
        const user: User = userData;
        const { data: workspaceData }: KontenbaseResponse<Workspace> =
          await kontenbase
            .service("Workspaces")
            .find({ where: { peoples: user.id } });

        let toWorkspaceId: string = "";

        if (workspaceData?.length > 0) {
          toWorkspaceId = workspaceData[0]._id;
        } else {
          toWorkspaceId = `create_workspace`;
        }

        dispatch(setAuthToken({ token: data?.token }));
        dispatch(setAuthUser(user));

        navigate(`/a/${toWorkspaceId}`);
      }
    } catch (error) {
      console.log("err", error);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center text-slightGray">
      <div className="w-5/12 bg-slate-100 border border-neutral-200 rounded-md px-20 py-16 flex flex-col justify-center">
        <h1 className="text-3xl font-semibold mb-8">Login</h1>
        <div>
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextInput
              name="email"
              type="email"
              onChange={formik.handleChange("email")}
              onBlur={formik.handleBlur("email")}
              value={formik.values.email}
            />
            {formik.errors.email && <SubLabel>{formik.errors.email}</SubLabel>}
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextInput
              name="password"
              type="password"
              onChange={formik.handleChange("password")}
              onBlur={formik.handleBlur("password")}
              value={formik.values.password}
            />
            {formik.errors.password && (
              <SubLabel>{formik.errors.password}</SubLabel>
            )}
          </FormControl>

          <FormControl>
            <div className="flex items-center">
              <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 text-center text-white font-medium text-sm mr-2"
                onClick={formik.handleSubmit}
              >
                Login
              </Button>
              <Link to="/register">
                <p className="text-sm text-cyan-500">Register</p>
              </Link>
            </div>
          </FormControl>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

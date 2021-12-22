import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";

import Button from "components/Button/Button";
import FormControl from "components/Form/FormControl";
import FormLabel from "components/Form/FormLabel";
import TextInput from "components/Form/TextInput";
import SubLabel from "components/Form/SubLabel";

import { Register, User } from "types";
import { registerValidation } from "utils/validators";
import { kontenbase } from "lib/client";
import { useAppDispatch } from "hooks/useAppDispatch";
import { setAuthToken, setAuthUser } from "features/auth";

const initialValues: Register = {
  email: "",
  firstName: "",
  password: "",
};

function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const onSubmit = async (values: Register) => {
    setApiLoading(true);
    try {
      const { data } = await kontenbase.auth.register(values);
      const { data: userData } = await kontenbase.auth.profile();

      if (!data) throw new Error("Invalid register");
      if (!userData) throw new Error("Invalid user");

      if (userData) {
        const user: User = userData;

        dispatch(setAuthToken({ token: data?.token }));
        dispatch(setAuthUser(user));

        navigate(`/a/create_workspace`);
      }
    } catch (error: any) {
      console.log("error");
      setApiError(`${error.message}`);
    } finally {
      setApiLoading(false);
    }
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
    <div className="w-screen h-screen flex items-center justify-center text-slightGray">
      <div className="w-5/12 bg-slate-100 border border-neutral-200 rounded-md px-20 py-16 flex flex-col justify-center">
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
              <Link to="/login">
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

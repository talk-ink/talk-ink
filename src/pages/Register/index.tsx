import React from "react";

import { Link } from "react-router-dom";

import Button from "components/Button/Button";
import FormControl from "components/Form/FormControl";
import FormLabel from "components/Form/FormLabel";
import TextInput from "components/Form/TextInput";

function RegisterPage() {
  return (
    <div className="w-screen h-screen flex items-center justify-center text-slightGray">
      <div className="w-5/12 bg-slate-100 border border-neutral-200 rounded-md px-20 py-16 flex flex-col justify-center">
        <h1 className="text-3xl font-semibold mb-8">Register</h1>
        <div>
          <FormControl>
            <FormLabel htmlFor="fullName">Fullname</FormLabel>
            <TextInput name="fullName" type="text" />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextInput name="email" type="email" />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextInput name="password" type="password" />
          </FormControl>

          <FormControl>
            <div className="flex items-center">
              <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 text-center text-white font-medium text-sm mr-2"
                onClick={() => {
                  console.log("sbm");
                }}
              >
                Register
              </Button>
              <Link to="/login">
                <p className="text-sm text-cyan-500">Sign In</p>
              </Link>
            </div>
          </FormControl>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

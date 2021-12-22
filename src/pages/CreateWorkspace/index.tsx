import React, { useState } from "react";

import { useNavigate } from "react-router";
import { useFormik } from "formik";

import { Workspace } from "types";
import { createWorkspaceValidation } from "utils/validators";
import FormControl from "components/Form/FormControl";
import FormLabel from "components/Form/FormLabel";
import TextInput from "components/Form/TextInput";
import SubLabel from "components/Form/SubLabel";
import Button from "components/Button/Button";
import { useAppSelector } from "hooks/useAppSelector";
import { kontenbase } from "lib/client";

const initialValues: Workspace = {
  name: "",
  domain: "",
};

function CreateWorkspacePage() {
  const auth = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const [apiLoading, setApiLoading] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema: createWorkspaceValidation,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const onSubmit = async (values: Workspace) => {
    setApiLoading(true);
    try {
      const { data } = await kontenbase
        .service("Workspaces")
        .create({ name: values.name, peoples: auth.user.id });

      if (data) {
        const generalChannel = await kontenbase.service("Channels").create({
          name: "General",
          workspace: data?.id,
          members: auth.user.id,
        });
        const domainChannel = await kontenbase.service("Channels").create({
          name: values.domain,
          workspace: data?.id,
          members: auth.user.id,
        });

        if (generalChannel && domainChannel) {
          navigate(`/a/${data?.id}/inbox`);
        }
      }
    } catch (error) {
      console.log("err", error);
    } finally {
      setApiLoading(false);
    }
  };
  const isDisabled =
    !formik.values.name ||
    !formik.values.domain ||
    !!formik.errors.name ||
    !!formik.errors.domain ||
    apiLoading;

  return (
    <div className="w-screen h-screen flex items-center justify-center text-slightGray">
      <div className="w-5/12 bg-slate-100 border border-neutral-200 rounded-md px-20 py-16 flex flex-col justify-center">
        <h1 className="text-3xl font-semibold">Login</h1>

        <form onSubmit={formik.handleSubmit} className="mt-8">
          <FormControl>
            <FormLabel htmlFor="name">Workspace/Team name</FormLabel>
            <TextInput
              name="name"
              type="name"
              onChange={formik.handleChange("name")}
              onBlur={formik.handleBlur("name")}
              value={formik.values.name}
            />
            {formik.errors.name && <SubLabel>{formik.errors.name}</SubLabel>}
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="domain">Domain name</FormLabel>
            <TextInput
              name="domain"
              type="domain"
              onChange={formik.handleChange("domain")}
              onBlur={formik.handleBlur("domain")}
              value={formik.values.domain}
            />
            {formik.errors.domain && (
              <SubLabel>{formik.errors.domain}</SubLabel>
            )}
          </FormControl>

          <FormControl>
            <div className="flex items-center">
              <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 text-center text-white font-medium text-sm mr-2"
                disabled={isDisabled}
              >
                Create Workspace
              </Button>
            </div>
          </FormControl>
        </form>
      </div>
    </div>
  );
}

export default CreateWorkspacePage;

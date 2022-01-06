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
import { useAppDispatch } from "hooks/useAppDispatch";
import { addWorkspace } from "features/workspaces";
import { useToast } from "hooks/useToast";

const initialValues: Workspace = {
  name: "",
  project: "",
};

function CreateWorkspacePage() {
  const navigate = useNavigate();
  const [showToast] = useToast();

  const auth = useAppSelector((state) => state.auth);

  const dispatch = useAppDispatch();

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

      dispatch(addWorkspace(data));

      if (data) {
        const generalChannel = await kontenbase.service("Channels").create({
          name: "General",
          workspace: data?._id,
          members: auth.user.id,
          privacy: "public",
        });
        const projectChannel = await kontenbase.service("Channels").create({
          name: values.project,
          workspace: data?._id,
          members: auth.user.id,
          privacy: "public",
        });

        if (generalChannel && projectChannel) {
          navigate(`/a/${data?._id}/inbox`);
        }
      }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    } finally {
      setApiLoading(false);
    }
  };
  const isDisabled =
    !formik.values.name ||
    !formik.values.project ||
    !!formik.errors.name ||
    !!formik.errors.project ||
    apiLoading;

  return (
    <div className="w-screen h-screen flex items-center justify-center text-slightGray px-5 md:px-0">
      <div className="w-full md:w-5/12 bg-slate-100 border border-neutral-200 rounded-md px-5 md:px-20 py-16 flex flex-col justify-center">
        <h1 className="text-3xl font-semibold">Create Workspace/Team</h1>

        <form onSubmit={formik.handleSubmit} className="mt-8">
          <FormControl>
            <FormLabel htmlFor="name">Workspace/Team name</FormLabel>
            <TextInput
              name="name"
              onChange={formik.handleChange("name")}
              onBlur={formik.handleBlur("name")}
              value={formik.values.name}
              placeholder="E.g Iruha Team"
            />
            {formik.errors.name && <SubLabel>{formik.errors.name}</SubLabel>}
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="project">Project name</FormLabel>
            <TextInput
              name="project"
              onChange={formik.handleChange("project")}
              onBlur={formik.handleBlur("project")}
              value={formik.values.project}
              placeholder="E.g CRM App or Web apps"
            />
            {formik.errors.project && (
              <SubLabel>{formik.errors.project}</SubLabel>
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

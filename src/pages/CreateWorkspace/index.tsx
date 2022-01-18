import React, { useState } from "react";

import { useNavigate } from "react-router";
import { useFormik } from "formik";

import { Workspace } from "types";
import { createWorkspaceValidation } from "utils/validators";
import SubLabel from "components/Form/SubLabel";
import { useAppSelector } from "hooks/useAppSelector";
import { kontenbase } from "lib/client";
import { useAppDispatch } from "hooks/useAppDispatch";
import { addWorkspace } from "features/workspaces";
import { useToast } from "hooks/useToast";

import Layout from "components/Layout/LoginRegister";
import Hero from "../../assets/image/landing/chat.svg";
import { updateUser } from "features/auth";

const initialValues: Workspace = {
  name: "",
  // project: "",
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
        .create({ name: values.name, peoples: auth.user._id });

      dispatch(addWorkspace(data));
      dispatch(
        updateUser({ workspaces: [...auth.user.workspaces, data?._id] })
      );

      if (data) {
        const generalChannel = await kontenbase.service("Channels").create({
          name: "General",
          workspace: data?._id,
          members: auth.user._id,
          privacy: "public",
        });

        await kontenbase.service("Channels").create({
          name: "Random",
          workspace: data?._id,
          members: auth.user._id,
          privacy: "public",
        });
        // const projectChannel = await kontenbase.service("Channels").create({
        //   name: values.project,
        //   workspace: data?._id,
        //   members: auth.user._id,
        //   privacy: "public",
        // });

        // if (generalChannel && projectChannel) {
        //   navigate(`/a/${data?._id}/inbox`);
        // }

        if (generalChannel) {
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
  // const isDisabled =
  //   !formik.values.name ||
  //   !formik.values.project ||
  //   !!formik.errors.name ||
  //   !!formik.errors.project ||
  //   apiLoading;

  const isDisabled = !formik.values.name || !!formik.errors.name || apiLoading;

  return (
    <Layout hero={Hero} title="Workspace">
      <form onSubmit={formik.handleSubmit}>
        <div>
          <div className="text-sm font-bold text-gray-700 tracking-wide">
            Workspace Name
          </div>
          <input
            className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
            onChange={formik.handleChange("name")}
            onBlur={formik.handleBlur("name")}
            value={formik.values.name}
            placeholder="Your workspace name"
          />
          {formik.errors.name && <SubLabel>{formik.errors.name}</SubLabel>}
        </div>

        {/* <div className="mt-8">
          <div className="flex justify-between items-center">
            <div className="text-sm font-bold text-gray-700 tracking-wide">
              Project Name
            </div>
          </div>
          <input
            className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
            name="project"
            onChange={formik.handleChange("project")}
            onBlur={formik.handleBlur("project")}
            value={formik.values.project}
            placeholder="First project name"
          />
          {formik.errors.project && (
            <SubLabel>{formik.errors.project}</SubLabel>
          )}
        </div> */}
        <div className="mt-10">
          <button
            type="submit"
            className="bg-indigo-500 text-gray-100 p-4 w-full rounded-full tracking-wide
                            font-semibold font-display focus:outline-none focus:shadow-outline hover:bg-indigo-500
                            shadow-lg"
            disabled={isDisabled}
          >
            Create Workspace
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default CreateWorkspacePage;

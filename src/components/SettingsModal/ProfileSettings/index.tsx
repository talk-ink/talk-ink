import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import Switch from "components/Switch/Switch";
import { useAppSelector } from "hooks/useAppSelector";
import { SettingsModalRouteState } from "types";
import TextInput from "components/Form/TextInput";
import Button from "components/Button/Button";
import { useFormik } from "formik";
import { profileSettingsValidation } from "utils/validators";
import { useAppDispatch } from "hooks/useAppDispatch";
import { kontenbase } from "lib/client";
import { updateWorkspace } from "features/workspaces";
import { updateUser } from "features/auth";
import { useToast } from "hooks/useToast";

type TypeInitialValues = {
  about: string;
  contact?: string;
};

type TProps = {
  currentRoute: SettingsModalRouteState;
  setCurrentRoute: Dispatch<SetStateAction<SettingsModalRouteState>>;
};

function ProfileSettings({ currentRoute, setCurrentRoute }: TProps) {
  const [showToast] = useToast();
  const params = useParams();

  const workspace = useAppSelector((state) => state.workspace);
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const workspaceData = useMemo(() => {
    return workspace.workspaces.find((data) => data._id === params.workspaceId);
  }, [workspace.workspaces, params.workspaceId]);

  const isHideEmail = useMemo(() => {
    return workspaceData?.hideEmail?.includes(auth.user.id);
  }, [workspaceData]);

  const [displayEmail, setDisplayEmail] = useState(!isHideEmail);

  const initialValues = {
    about: auth.user?.about || "",
    contact: auth.user?.contact || "",
  };

  const onSubmit = async (values: TypeInitialValues) => {
    try {
      await kontenbase.auth.update({ ...values });
      let hideEmail: string[] = [];

      if (workspaceData.hideEmail) {
        hideEmail = workspaceData.hideEmail;
      }

      if (!displayEmail) {
        if (!isHideEmail) {
          hideEmail = [...hideEmail, auth.user.id];
        }
      } else {
        hideEmail = hideEmail.filter((email) => email !== auth.user.id);
      }

      if (!displayEmail) {
        await kontenbase
          .service("Workspaces")
          .link(params.workspaceId, { hideEmail: auth.user.id });
      } else {
        await kontenbase
          .service("Workspaces")
          .unlink(params.workspaceId, { hideEmail: auth.user.id });
      }

      dispatch(updateWorkspace({ _id: params.workspaceId, hideEmail }));
      dispatch(updateUser({ ...values }));
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error)}` });
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: profileSettingsValidation,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const showSubmit =
    isHideEmail !== !displayEmail ||
    auth.user.about !== formik.values.about ||
    auth.user.contact !== formik.values.contact;

  return (
    <form
      className="w-full min-h-[65vh] flex flex-col justify-between"
      onSubmit={formik.handleSubmit}
    >
      <div>
        <p className="text-sm mb-5">
          Let <span className="font-bold">{workspaceData.name}</span> members
          get to know you by personalizing your profile. Switch workspaces to
          edit your other workspace profiles.
        </p>
        <p className="text-sm font-semibold mb-2">Display email</p>
        <div className="w-96 p-2 border border-neutral-300 rounded">
          <p className="text-sm">{auth.user.email}</p>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Displayed in your{" "}
          <span className="font-bold ">{workspaceData.name}</span> profile and
          used for email notifications.
        </p>
        <div className="flex gap-2 items-center my-5">
          <Switch
            value={displayEmail}
            onChange={(values) => {
              setDisplayEmail(values);
            }}
          />
          <p className="text-sm">Display email on profile</p>
        </div>
        <div className="flex flex-col mb-3">
          <p className="text-sm font-semibold mb-2">About</p>
          <TextInput
            className="max-w-sm"
            onBlur={formik.handleBlur("about")}
            onChange={formik.handleChange("about")}
            value={formik.values.about}
          />
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-semibold mb-2">Contact</p>
          <TextInput
            className="max-w-sm"
            onBlur={formik.handleBlur("contact")}
            onChange={formik.handleChange("contact")}
            value={formik.values.contact}
          />
          <small className="text-neutral-500 text-xs mt-2">
            Phone number, social media, snail mail address — wherever others can
            find you.
          </small>
        </div>
      </div>

      {showSubmit && (
        <div className="w-full h-14 mt-10 flex items-center  justify-end p-1">
          <div className="flex items-center justify-end gap-2">
            <Button
              className="text-sm flex items-center justify-center hover:bg-neutral-50 min-w-[5rem]"
              onClick={() => {
                formik.setFieldValue("about", auth.user.about || "");
                formik.setFieldValue("contact", auth.user.contact || "");
                setDisplayEmail(isHideEmail);
              }}
            >
              Cancel
            </Button>
            <Button
              className="text-sm flex items-center justify-center bg-cyan-500 min-w-[5rem] text-white"
              type="submit"
            >
              Update
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

export default ProfileSettings;

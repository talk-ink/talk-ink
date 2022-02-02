import React, { useMemo, useState } from "react";

import FormControl from "components/Form/FormControl";
import FormLabel from "components/Form/FormLabel";
import TextArea from "components/Form/TextArea";
import TextInput from "components/Form/TextInput";
import { useFormik } from "formik";
import { Channel, CreateChannel } from "types";
import { createChannelValidation } from "utils/validators";
import Button from "components/Button/Button";
import SubLabel from "components/Form/SubLabel";
import Switch from "components/Switch/Switch";
import AddNewChannelMember from "./AddNewChannelMember";

const initialValues: CreateChannel = {
  name: "",
  description: "",
  privacy: "public",
  members: undefined,
};

type TProps = React.PropsWithChildren<{
  onSubmit: (values: CreateChannel) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
  editedData?: Channel;
}>;

type FormRoute = "general" | "inviteMember";

function ChannelForm({ onSubmit, loading, onCancel, editedData }: TProps) {
  const formik = useFormik({
    initialValues: editedData
      ? {
          name: editedData.name,
          description: editedData.description ?? "",
          privacy: editedData.privacy,
        }
      : initialValues,
    validationSchema: createChannelValidation,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });

  const [currentRoute, setCurrentRoute] = useState<{
    before: FormRoute;
    current: FormRoute;
  }>({
    before: "general",
    current: "general",
  });

  const [isMemberEmpty, setIsMemberEmpty] = useState(false);

  const isEdit: boolean = useMemo(() => {
    return !!editedData;
  }, [editedData]);

  const isDisabled: boolean =
    !formik.values.name ||
    !formik.values.privacy ||
    !!formik.errors.name ||
    !!formik.errors.description ||
    !!formik.errors.privacy ||
    loading;

  return (
    <form onSubmit={formik.handleSubmit}>
      {currentRoute.current === "general" && (
        <>
          <FormControl>
            <FormLabel htmlFor="name" required>
              Name
            </FormLabel>
            <TextInput
              name="name"
              onChange={formik.handleChange("name")}
              onBlur={formik.handleBlur("name")}
              value={formik.values.name || ""}
            />
            {formik.errors.name && <SubLabel>{formik.errors.name}</SubLabel>}
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="description">Description</FormLabel>
            <TextArea
              name="description"
              onChange={formik.handleChange("description")}
              onBlur={formik.handleBlur("description")}
              value={formik.values.description || ""}
            />{" "}
            {formik.errors.description && (
              <SubLabel>{formik.errors.description}</SubLabel>
            )}
          </FormControl>
          <FormControl>
            <FormLabel required>Make private</FormLabel>
            <div className="flex items-center justify-between gap-3 w-full">
              <p className="text-sm text-indigo-500">
                When a channel is set to private, it can only be viewed or
                joined by invitation.
              </p>
              <Switch
                value={formik.values.privacy !== "public" ?? false}
                onChange={(values) => {
                  if (!values) {
                    formik.setFieldValue("privacy", "public");
                  } else {
                    formik.setFieldValue("privacy", "private");
                  }
                }}
              />
            </div>

            {formik.errors.privacy && (
              <SubLabel>{formik.errors.privacy}</SubLabel>
            )}
          </FormControl>
        </>
      )}
      {currentRoute.current === "inviteMember" && (
        <AddNewChannelMember
          setIsMemberEmpty={setIsMemberEmpty}
          formik={formik}
        />
      )}
      <div className="pt-2 flex items-center justify-end gap-2">
        <Button
          className="text-sm flex items-center justify-center hover:bg-neutral-50 min-w-[5rem]"
          onClick={() => {
            if (currentRoute.current === "general") {
              onCancel();
            } else {
              setCurrentRoute((prev) => ({ ...prev, current: prev.before }));
            }
          }}
        >
          Cancel
        </Button>
        {(isEdit || currentRoute.current === "inviteMember") && (
          <Button
            className="text-sm flex items-center justify-center bg-indigo-500 min-w-[5rem] text-white"
            disabled={isDisabled || isMemberEmpty}
            type="submit"
          >
            Save
          </Button>
        )}
        {!isEdit && currentRoute.current === "general" && (
          <Button
            className="text-sm flex items-center justify-center bg-indigo-500 min-w-[5rem] text-white"
            disabled={isDisabled}
            onClick={() =>
              setCurrentRoute((prev) => ({ ...prev, current: "inviteMember" }))
            }
          >
            Next
          </Button>
        )}
      </div>
    </form>
  );
}

export default ChannelForm;

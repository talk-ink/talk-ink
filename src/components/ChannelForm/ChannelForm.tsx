import React from "react";

import FormControl from "components/Form/FormControl";
import FormLabel from "components/Form/FormLabel";
import TextArea from "components/Form/TextArea";
import TextInput from "components/Form/TextInput";
import { useFormik } from "formik";
import { Channel, CreateChannel } from "types";
import { createChannelValidation } from "utils/validators";
import Button from "components/Button/Button";
import SubLabel from "components/Form/SubLabel";

const initialValues: CreateChannel = {
  name: "",
  description: "",
  privacy: "public",
};

type TProps = React.PropsWithChildren<{
  onSubmit: (values: CreateChannel) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
  editedData?: Channel;
}>;

function ChannelForm({ onSubmit, loading, onCancel, editedData }: TProps) {
  const formik = useFormik({
    initialValues: editedData
      ? {
          name: editedData.name,
          description: editedData.description,
          privacy: editedData.privacy,
        }
      : initialValues,
    validationSchema: createChannelValidation,
    onSubmit: (values) => {
      console.log("awe");
      onSubmit(values);
    },
    enableReinitialize: true,
  });

  const isDisabled: boolean =
    !formik.values.name ||
    !formik.values.privacy ||
    !!formik.errors.name ||
    !!formik.errors.description ||
    !!formik.errors.privacy ||
    loading;

  return (
    <form onSubmit={formik.handleSubmit}>
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
        <FormLabel required>Privacy</FormLabel>
        <select
          value={formik.values.privacy}
          onChange={formik.handleChange("privacy")}
          onBlur={formik.handleBlur("privacy")}
          className="w-full text-sm p-2 rounded-md outline-0 border bg-white border-neutral-200 focus:border-neutral-300"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        {formik.errors.privacy && <SubLabel>{formik.errors.privacy}</SubLabel>}
      </FormControl>
      <div className="pt-2 flex items-center justify-end gap-2">
        <Button
          className="text-sm flex items-center justify-center hover:bg-neutral-50 min-w-[5rem]"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          className="text-sm flex items-center justify-center bg-indigo-500 min-w-[5rem] text-white"
          disabled={isDisabled}
          type="submit"
        >
          {!editedData ? "Create" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export default ChannelForm;

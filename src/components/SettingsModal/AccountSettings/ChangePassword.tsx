import { useFormik } from "formik";
import { BiErrorCircle } from "react-icons/bi";

import Button from "components/Button/Button";
import PasswordInput from "components/Form/PasswordInput";
import SubLabel from "components/Form/SubLabel";

import { useToast } from "hooks/useToast";
import { changePasswordValidation } from "utils/validators";

type TypeInitialValues = {
  newPassword: string;
  confirmPassword: string;
};

type TProps = {
  onCancel: () => void;
};

function ChangePassword({ onCancel }: TProps) {
  const [showToast] = useToast();
  const initialValues: TypeInitialValues = {
    newPassword: "",
    confirmPassword: "",
  };

  const onSubmit = async (values: TypeInitialValues) => {
    try {
      //   if (values.newPassword !== values.confirmPassword)
      //     throw new Error("The passwords you entered do not match.");
      //   const update = await kontenbase.auth.update({
      //     password: values.newPassword,
      //   });
      //   if (update.data) {
      //     showToast({ message: "Password changed!" });
      //     onCancel();
      //   }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    }
  };
  const formik = useFormik({
    initialValues,
    validationSchema: changePasswordValidation,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const showButton =
    formik.values.newPassword &&
    formik.values.confirmPassword &&
    formik.values.newPassword === formik.values.confirmPassword &&
    (!formik.errors.newPassword || !formik.errors.confirmPassword);
  return (
    <form onSubmit={formik.handleSubmit}>
      <p className="text-sm font-semibold mb-1">New Password</p>
      <div className="flex flex-col mb-5">
        <PasswordInput
          className="max-w-sm"
          onBlur={formik.handleBlur("newPassword")}
          onChange={formik.handleChange("newPassword")}
        />
        {formik.errors.newPassword && (
          <SubLabel>{formik.errors.newPassword}</SubLabel>
        )}
      </div>
      <p className="text-sm font-semibold mb-1">Confirm Password</p>
      <div className="flex flex-col mb-5">
        <PasswordInput
          className="max-w-sm"
          onBlur={formik.handleBlur("confirmPassword")}
          onChange={formik.handleChange("confirmPassword")}
        />
        {formik.errors.confirmPassword && (
          <SubLabel>{formik.errors.confirmPassword}</SubLabel>
        )}
      </div>
      {formik.values.newPassword === formik.values.confirmPassword && (
        <p className="text-sm text-neutral-500">
          Your password needs to be at least 8 characters long.
        </p>
      )}
      {formik.values.newPassword !== formik.values.confirmPassword && (
        <div className="flex gap-2 items-center mt-2">
          <BiErrorCircle size={20} className="text-red-700" />
          <p className="text-sm -mb-1">
            The passwords you entered do not match.
          </p>
        </div>
      )}

      {showButton && (
        <div className="w-full h-14 mt-10 flex items-center  justify-end p-1">
          <div className="flex items-center justify-end gap-2">
            <Button
              className="text-sm flex items-center justify-center hover:bg-neutral-50 min-w-[5rem]"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              className="text-sm flex items-center justify-center bg-indigo-500 min-w-[5rem] text-white"
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

export default ChangePassword;

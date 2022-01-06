import Button from "components/Button/Button";
import TextInput from "components/Form/TextInput";
import Upload from "components/Form/Upload";
import { updateUser } from "features/auth";
import { useFormik } from "formik";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import { useToast } from "hooks/useToast";
import { kontenbase } from "lib/client";
import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import { BiErrorCircle } from "react-icons/bi";
import { RiAccountCircleFill } from "react-icons/ri";
import { SettingsModalRouteState } from "types";
import { MAX_IMAGE_SIZE, SUPPORTED_IMAGE_TYPE } from "utils/constants";
import {
  beforeUploadImage,
  getBase64,
  getNameInitial,
  resizeFile,
} from "utils/helper";
import { updateAccount } from "utils/validators";

type TypeInitialValues = {
  firstName: string;
  avatar?: File | null | undefined;
};

type TProps = {
  currentRoute: SettingsModalRouteState;
  setCurrentRoute: Dispatch<SetStateAction<SettingsModalRouteState>>;
};

function AccountSettings({ currentRoute, setCurrentRoute }: TProps) {
  const [showToast] = useToast();

  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [profilePreview, setProfilePreview] = useState(null);

  const userData = useMemo(() => {
    return auth.user;
  }, [auth.user]);

  const initialValues: TypeInitialValues = {
    firstName: userData.firstName,
  };

  const uploadFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file: File = e.target.files[0];
    const check = beforeUploadImage({
      file,
      types: SUPPORTED_IMAGE_TYPE,
      maxSize: MAX_IMAGE_SIZE,
    });
    if (check.error) {
      return formik.setFieldError("avatar", check.message);
    }
    if (!check.error) {
      formik.setFieldValue("avatar", e.target.files[0]);
      getBase64(e.target.files[0], (result) => {
        setProfilePreview(result);
        dispatch(updateUser({ avatar: result }));
      });

      try {
        const name = `${userData.firstName
          .toString()
          .toLowerCase()
          .replace("/s/g", "-")}-logo`;
        const resized = await resizeFile(file, 500);
        const uploadImage = await kontenbase.storage.upload(resized);
        const createAttachment = await kontenbase
          .service("Attachments")
          .create({
            name,
            ext: uploadImage.data.mimeType,
            file: uploadImage.data.url,
          });
        const submitUpdate = await kontenbase.auth.updateProfile({
          avatar: createAttachment.data._id,
        });
      } catch (error) {
        console.log("err", error);
        showToast({ message: `${JSON.stringify(error)}` });
      }
    }
  };

  const removePhotoHandler = async () => {
    try {
      dispatch(updateUser({ avatar: null }));
      const removeAvatar = await kontenbase.auth.updateProfile({
        avatar: null,
      });
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error)}` });
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: updateAccount,
    onSubmit: (values) => {},
  });

  return (
    <div className="min-h-[50vh] overflow-auto">
      <form onSubmit={formik.handleSubmit}>
        <div className="border-b border-neutral-100 pb-5">
          <p className="text-sm font-semibold">Photo</p>
          <div className="my-5">
            <div className="flex items-end ">
              <div className="h-24 w-24 rounded-full flex items-center justify-center overflow-hidden">
                {!profilePreview && !userData.avatar && (
                  <RiAccountCircleFill size={96} className="text-neutral-200" />
                )}
                {(profilePreview || userData?.avatar) && (
                  <img
                    src={profilePreview || userData?.avatar}
                    alt="logo"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="ml-5 ">
                <div className="flex gap-2 items-center">
                  <Upload
                    onChange={uploadFile}
                    className="h-8 py-0 flex items-center justify-center"
                  >
                    <span className="text-sm font-semibold">Upload photo</span>
                  </Upload>
                  {(profilePreview || userData.avatar) && (
                    <Button
                      className="border border-red-400 text-sm text-red-500 font-semibold hover:border-red-700 hover:text-red-700"
                      onClick={removePhotoHandler}
                    >
                      Remove photo
                    </Button>
                  )}
                </div>
                <p className="text-sm text-neutral-500 my-3">
                  Pick an image up to 4MB
                </p>
              </div>
            </div>
            {formik.errors.avatar && (
              <div className="flex gap-2 items-center mt-2">
                <BiErrorCircle size={20} className="text-red-700" />
                <p className="text-sm -mb-1">{formik.errors.avatar}</p>
              </div>
            )}
          </div>
          <p className="text-sm font-semibold mb-1">Name</p>
          <div className="flex flex-col">
            <TextInput
              className="max-w-sm"
              defaultValue={userData.firstName}
              onBlur={formik.handleBlur("firstName")}
              onChange={formik.handleChange("firstName")}
            />
          </div>
        </div>
        {/* <div>
          <h3 className="text-lg font-bold my-5">Danger zone</h3>
        </div> */}

        {formik.values.firstName !== userData.firstName && (
          <div className="w-full h-14 mt-10 flex items-center  justify-end p-1">
            <div className="flex items-center justify-end gap-2">
              <Button
                className="text-sm flex items-center justify-center hover:bg-neutral-50 min-w-[5rem]"
                // onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                className="text-sm flex items-center justify-center bg-cyan-500 min-w-[5rem] text-white"
                //   disabled={isDisabled}
                type="submit"
              >
                Update
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default AccountSettings;

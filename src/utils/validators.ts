import * as yup from "yup";

export const loginValidation = yup.object().shape({
  email: yup.string().min(8).max(40).required().label("Email"),
  password: yup.string().min(6).max(16).required().label("Password"),
});

export const registerValidation = yup.object().shape({
  email: yup.string().min(8).max(40).required().label("Email"),
  firstName: yup.string().min(2).max(80).required().label("Fullname"),
  password: yup.string().min(6).max(16).required().label("Password"),
});

export const createWorkspaceValidation = yup.object().shape({
  name: yup.string().max(40).required().label("Workspace name"),
  // project: yup.string().max(40).required().label("Project name"),
});

export const createThreadValidation = yup.object().shape({
  name: yup.string().max(300).required(),
  content: yup.string().required(),
});

export const createChannelValidation = yup.object().shape({
  name: yup.string().max(40).required().label("Channel name"),
  description: yup.string().max(300).typeError("").label("Description"),
  privacy: yup
    .string()
    .oneOf(["public", "private"])
    .required()
    .label("Privacy"),
});

export const updateWorkspaceGeneral = yup.object().shape({
  name: yup.string().max(40).required().label("Workspace name"),
});
export const updateAccount = yup.object().shape({
  firstName: yup.string().max(40).required(),
});

export const changePasswordValidation = yup.object().shape({
  newPassword: yup.string().min(8).max(24).required(),
  confirmPassword: yup.string().min(8).max(24).required(),
});

export const profileSettingsValidation = yup.object().shape({
  about: yup.string().max(100),
  contact: yup.string().max(100),
});

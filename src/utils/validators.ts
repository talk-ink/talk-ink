import * as yup from "yup";

export const loginValidation = yup.object().shape({
  email: yup.string().min(8).max(40).required(),
  password: yup.string().min(6).max(16).required(),
});

export const registerValidation = yup.object().shape({
  email: yup.string().min(8).max(40).required(),
  firstName: yup.string().min(8).max(80).required(),
  password: yup.string().min(6).max(16).required(),
});

export const createWorkspaceValidation = yup.object().shape({
  name: yup.string().max(40).required(),
  project: yup.string().max(40).required(),
});

export const createThreadValidation = yup.object().shape({
  name: yup.string().max(300).required(),
  content: yup.string().required(),
});

export const createChannelValidation = yup.object().shape({
  name: yup.string().max(40).required(),
  description: yup.string().max(300).required(),
  privacy: yup.string().oneOf(["public", "private"]).required(),
});

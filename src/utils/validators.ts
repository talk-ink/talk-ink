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
  domain: yup.string().max(40).required(),
});

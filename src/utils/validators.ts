import * as yup from "yup";

export const loginValidation = yup.object().shape({
  email: yup.string().required(),
  password: yup.string().required(),
});

export const registerValidation = yup.object().shape({
  email: yup.string().required(),
  firstName: yup.string().required(),
  password: yup.string().required(),
});

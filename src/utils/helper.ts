import { SendEmail } from "types";
import axios, { AxiosResponse } from "axios";

const EMAIL_API: string = process.env.REACT_APP_EMAIL_API;

export const getNameInitial = (name: string): string => {
  const splitted = name.split(" ");
  if (splitted[1]) return splitted[0][0] + splitted[1][0];
  return name[0];
};

export const sendEmail = async ({
  email,
  subject,
  message,
}: SendEmail): Promise<AxiosResponse> => {
  const send = await axios.post(EMAIL_API, { email, subject, message });
  return send;
};

export const randomString = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

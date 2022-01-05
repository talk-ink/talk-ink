import { SendEmail } from "types";
import axios, { AxiosResponse } from "axios";

const EMAIL_API: string = process.env.REACT_APP_EMAIL_API;

export const getNameInitial = (name: string): string => {
  if (name) {
    const splitted = name.split(" ");
    if (splitted[1]) return splitted[0][0] + splitted[1][0];
    return name[0];
  }
};

export const sendEmail = async ({
  emails,
  subject,
  message,
}: SendEmail): Promise<AxiosResponse> => {
  const send = await axios.post(EMAIL_API, { emails, subject, message });
  return send;
};

export const randomString = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const inviteWorkspaceTemplate = (inviteLink: string): string => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Workspace Invitation</title>
</head>
<body>
    
    <a href="${inviteLink}"clicktracking="off">Join Workspace</a>

</body>
</html>
  `;
};

export const getBase64 = (
  img: File,
  callback: (result: string | ArrayBuffer) => void
) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

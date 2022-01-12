import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import { useDebounce } from "use-debounce";

import Button from "components/Button/Button";
import { Workspace } from "types";
import { useToast } from "hooks/useToast";
import {
  inviteWorkspaceTemplate,
  sendEmail,
  validateEmail,
} from "utils/helper";
import ClosableBadge from "components/Badge/ClosableBadge";
import { BiErrorCircle } from "react-icons/bi";

type TProps = {
  workspaceData: Workspace;
  onCancel: () => void;
};

function InvitePeopleForm({ onCancel, workspaceData }: TProps) {
  const [showToast] = useToast();

  const [emailStr, setEmailStr] = useState("");
  const [emailArr, setEmailArr] = useState([]);
  const [emailError, setEmailError] = useState("");

  const [apiLoading, setApiLoading] = useState(false);

  const sendInviteHandler = async () => {
    setApiLoading(true);
    try {
      const sendBulkEmail = await sendEmail({
        emails: emailArr,
        subject: "Workspace Invitation",
        message: inviteWorkspaceTemplate({
          inviteLink: `${process.env.REACT_APP_FRONTEND_URL}/j/${
            workspaceData?.inviteId ?? ""
          }/login`,
          workspaceName: workspaceData.name,
        }),
      });

      if (sendBulkEmail.data) {
        showToast({ message: "User invited!" });
      }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error)}` });
    } finally {
      setApiLoading(false);
      setEmailStr("");
      setEmailArr([]);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col justify-between">
      <div>
        <div>
          <p className="text-sm font-semibold">Invite by email</p>
          <p className="text-sm">
            New people will be added to the workspace as member
          </p>
        </div>
        <div className="mt-3">
          <div className="w-full text-sm p-2 rounded-md outline-0 border border-neutral-200 focus:border-neutral-300 flex flex-wrap gap-2">
            {emailArr.map((email, idx) => (
              <ClosableBadge
                key={idx}
                text={email}
                onClose={() => {
                  setEmailArr((prev) => prev.filter((item) => item !== email));
                }}
              />
            ))}

            <input
              type="text"
              className="flex-1 outline-none h-6"
              onKeyDown={(e) => {
                if (e.key === ",") {
                  if (emailArr.includes(emailStr)) {
                    setEmailStr("");
                    return;
                  }
                  if (!validateEmail(emailStr)) {
                    setEmailError(
                      "The email address you are currently entering is invalid."
                    );
                    return;
                  }
                  setEmailArr((prev) => [...prev, emailStr]);
                  setEmailStr("");
                  setEmailError("");
                }
              }}
              value={emailStr}
              onChange={(e) =>
                e.target.value !== "," && setEmailStr(e.target.value)
              }
              placeholder="Separate multiple emails with commas"
            />
          </div>
          {emailError && (
            <div className="flex gap-2 items-center mt-2">
              <BiErrorCircle size={20} className="text-red-700" />
              <p className="text-sm -mb-1">{emailError}</p>
            </div>
          )}
        </div>
      </div>
      <div className="pt-2 flex items-center justify-end gap-2">
        <Button
          className="text-sm flex items-center justify-center hover:bg-neutral-50 min-w-[5rem]"
          onClick={() => onCancel()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="text-sm flex items-center justify-center bg-cyan-500 min-w-[5rem] text-white"
          disabled={emailArr.length === 0 || apiLoading}
          onClick={sendInviteHandler}
        >
          Invite
        </Button>
      </div>
    </div>
  );
}

export default InvitePeopleForm;

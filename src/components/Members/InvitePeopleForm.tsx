import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import { useDebounce } from "use-debounce";

import Button from "components/Button/Button";
import { Workspace } from "types";
import { useToast } from "hooks/useToast";
import { inviteWorkspaceTemplate, sendEmail } from "utils/helper";

type TProps = {
  workspaceData: Workspace;
  setShowInvitePeople: Dispatch<SetStateAction<boolean>>;
};

function InvitePeopleForm({ setShowInvitePeople, workspaceData }: TProps) {
  const [showToast] = useToast();
  const [emailStr, setEmailStr] = useState("");
  const [emailArr, setEmailArr] = useState([]);

  const [apiLoading, setApiLoading] = useState(false);

  const [emailStrDebounce] = useDebounce(emailStr, 100);

  const sendInviteHandler = async () => {
    setApiLoading(true);
    try {
      const sendBulkEmail = await sendEmail({
        emails: emailArr,
        subject: "Workspace Invitation",
        message: inviteWorkspaceTemplate(
          `${process.env.REACT_APP_FRONTEND_URL}/j/${
            workspaceData?.inviteId ?? ""
          }/login`
        ),
      });

      if (sendBulkEmail.data) {
        showToast({ message: "User invited!" });
      }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error)}` });
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    let splitted = emailStrDebounce.split(",");

    if (splitted.length === 1 && !splitted[0]) {
      setEmailArr([]);
    } else {
      setEmailArr(splitted);
    }
  }, [emailStrDebounce]);

  return (
    <div className="min-h-[50vh] flex flex-col justify-between">
      <div>
        <div>
          <p className="text-sm font-semibold">Invite by email</p>
          <p className="text-sm">
            New people will be added to the team as member
          </p>
        </div>
        <div className="mt-3">
          <textarea
            className="w-full text-sm p-2 rounded-md outline-0 border border-neutral-200 focus:border-neutral-300"
            onChange={(e) => setEmailStr(e.target.value)}
          />
        </div>
      </div>
      <div className="pt-2 flex items-center justify-end gap-2">
        <Button
          className="text-sm flex items-center justify-center hover:bg-neutral-50 min-w-[5rem]"
          onClick={() => setShowInvitePeople(false)}
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

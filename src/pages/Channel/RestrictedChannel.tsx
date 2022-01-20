import React from "react";

import PrivateImage from "assets/image/private.svg";
import Button from "components/Button/Button";
import { useNavigate, useParams } from "react-router-dom";

function RestrictedChannelPage() {
  const params = useParams();
  const navigate = useNavigate();
  return (
    <div>
      <div className="w-full flex flex-col items-center justify-center h-full">
        <img className="w-96" src={PrivateImage} alt="restricted channel" />

        <p className="font-semibold text-slate-900 w-96 text-center">
          This channel is private
        </p>
        <p className="text-neutral-500 w-96 text-center">
          To access the channel, you'll need to be invited by a member
        </p>
        <Button
          className="text-sm text-white bg-indigo-500 mt-5"
          onClick={() => {
            navigate(`/a/${params.workspaceId}/inbox`);
          }}
        >
          Back to inbox
        </Button>
      </div>
    </div>
  );
}

export default RestrictedChannelPage;

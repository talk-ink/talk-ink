import React from "react";

import NotFoundImage from "assets/image/not_found.svg";
import Button from "components/Button/Button";
import { useNavigate, useParams } from "react-router-dom";

function NotFoundChannelPage() {
  const params = useParams();
  const navigate = useNavigate();
  return (
    <div>
      <div className="w-full flex flex-col items-center justify-center h-full">
        <img className="w-96" src={NotFoundImage} alt="not found channel" />

        <p className="font-semibold text-slate-900 w-96 text-center">
          Channel couldn't be found
        </p>
        <p className="text-neutral-500 w-96 text-center">
          It may have been deleted, or the link could be wrong
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

export default NotFoundChannelPage;

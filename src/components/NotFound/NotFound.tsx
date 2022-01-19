import Button from "components/Button/Button";
import { useAppSelector } from "hooks/useAppSelector";
import React from "react";
import { MdMiscellaneousServices } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

type TLocationState = {
  state?: {
    params?: {
      message: string;
    };
  };
};

function NotFound() {
  const navigate = useNavigate();
  const location: TLocationState = useLocation();

  const auth = useAppSelector((state) => state.auth);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <MdMiscellaneousServices size={150} className="text-neutral-300" />
        <code className="text-neutral-500 text-sm mt-2">
          Content Not Found (404){" "}
          {location?.state?.params?.message
            ? `- ${location?.state?.params?.message}`
            : ""}
        </code>
        {auth.user && (
          <Button
            className="text-sm text-white bg-indigo-500 mt-5"
            onClick={() => {
              navigate(`/a/${auth.user.workspaces[0]}/inbox`);
            }}
          >
            Back to dashboard
          </Button>
        )}
      </div>
    </div>
  );
}

export default NotFound;

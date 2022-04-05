import { useEffect } from "react";

import { KontenbaseResponse } from "@kontenbase/sdk";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import FullscreenLoading from "components/Loading/FullscreenLoading";
import { useAppSelector } from "hooks/useAppSelector";

import { kontenbase } from "lib/client";
import { WorkspaceResponse } from "types";
import { useToast } from "hooks/useToast";
import { hybridLookup } from "utils/helper";

function InvitedWorkspacePage() {
  const [showToast] = useToast();

  const params = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);

  const getWorkspaceData = async () => {
    try {
      const { data: workspaceData, error } = await kontenbase
        .service("Workspaces")
        .find({
          where: { inviteId: params.inviteId },
          // @ts-ignore
          lookup: "*",
        });

      if (error) throw new Error(error.message);

      let newWorkspaceData = hybridLookup(workspaceData);

      let toWorkspaceId = "";
      if (workspaceData.length > 0) {
        if (newWorkspaceData[0].peoples.includes(auth.user._id)) {
          toWorkspaceId = `${newWorkspaceData[0]._id}/inbox`;
        } else {
          toWorkspaceId = `${newWorkspaceData[0]._id}/join_channels`;
        }
      } else {
        return navigate(`/404`);
      }

      navigate(`/a/${toWorkspaceId}`);
    } catch (error) {
      if (error instanceof Error) {
        showToast({ message: `${JSON.stringify(error?.message)}` });
      }
    }
  };

  useEffect(() => {
    if (!auth.token) {
      return navigate(`${pathname}/login`);
    }
    getWorkspaceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.inviteIdm, auth]);

  return <FullscreenLoading />;
}

export default InvitedWorkspacePage;

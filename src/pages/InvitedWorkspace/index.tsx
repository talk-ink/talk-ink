import { useEffect } from "react";

import { KontenbaseResponse } from "@kontenbase/sdk";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import FullscreenLoading from "components/Loading/FullscreenLoading";
import { useAppSelector } from "hooks/useAppSelector";

import { kontenbase } from "lib/client";
import { WorkspaceResponse } from "types";

function InvitedWorkspacePage() {
  const params = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);

  const getWorkspaceData = async () => {
    try {
      const { data: workspaceData }: KontenbaseResponse<WorkspaceResponse> =
        await kontenbase
          .service("Workspaces")
          .find({ where: { inviteId: params.inviteId } });

      let toWorkspaceId = "";
      if (workspaceData.length > 0) {
        if (workspaceData[0].peoples.includes(auth.user._id)) {
          toWorkspaceId = `${workspaceData[0]._id}/inbox`;
        } else {
          toWorkspaceId = `${workspaceData[0]._id}/join_channels`;
        }
      } else {
        return navigate(`/404`);
      }

      navigate(`/a/${toWorkspaceId}`);
    } catch (error) {
      console.log("err", error);
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

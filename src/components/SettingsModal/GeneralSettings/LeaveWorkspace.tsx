import React, { useMemo, useState } from "react";

import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import { useNavigate, useParams } from "react-router-dom";
import Button from "components/Button/Button";
import { useToast } from "hooks/useToast";
import { leaveWorkspace } from "features/workspaces";
import { kontenbase } from "lib/client";

function LeaveWorkspace() {
  const [showToast] = useToast();

  const params = useParams();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);
  const workspace = useAppSelector((state) => state.workspace);
  const channel = useAppSelector((state) => state.channel);
  const dispatch = useAppDispatch();

  const userId: string = auth.user._id;

  const [isConfirmed, setIsConfirmed] = useState(false);

  const workspaceData = useMemo(() => {
    return workspace.workspaces.find((data) => data._id === params.workspaceId);
  }, [workspace.workspaces, params.workspaceId]);

  const handleLeaveWorkspace = async () => {
    const leaveBulkChannelHandler = () => {
      const join = channel.channels.map(async (data) => {
        const joinChannel = await kontenbase
          .service("Channels")
          .unlink(data._id, {
            members: userId,
          });
        return joinChannel.data;
      });

      return Promise.all(join);
    };
    try {
      const newWorkspaces = workspace.workspaces.filter(
        (data) => data._id !== workspaceData._id
      );

      const leave = await kontenbase
        .service("Workspaces")
        .unlink(workspaceData._id, { peoples: userId });
      if (leave.error) throw new Error(leave.error.message);

      const { error: updateError } = await kontenbase
        .service("Workspaces")
        .updateById(workspaceData._id, { name: workspaceData.name });
      if (updateError) throw new Error(updateError.message);

      const leaveChannels = await leaveBulkChannelHandler();

      if (leave.data && leaveChannels) {
        if (newWorkspaces.length > 0) {
          navigate(`/a/${newWorkspaces[0]._id}/inbox`);
        } else {
          navigate(`/a/create_workspace`);
        }
        dispatch(leaveWorkspace({ _id: workspaceData._id }));
      }
      window.location.reload();
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error)}` });
    }
  };

  return (
    <div className="p-1">
      <p className="text-sm font-semibold">
        Are you sure you want to leave the{" "}
        <span className="italic">{workspaceData.name}</span> workspace?
      </p>
      <p className="text-sm">
        By leaving, you’ll immediately lose access to the workspace. Everything
        you have posted will remain accessible. You’ll need to be re-invited to
        join again. Learn more.
      </p>
      <div className="my-3">
        <input
          type="checkbox"
          id="confirmation"
          className="cursor-pointer"
          checked={isConfirmed}
          onChange={() => setIsConfirmed((prev) => !prev)}
        />
        <label htmlFor="confirmation" className="text-sm ml-2 cursor-pointer">
          Yes, I’m absolutely sure.
        </label>
      </div>
      <Button
        className="bg-red-400 hover:bg-red-700 text-sm font-semibold text-white"
        disabled={!isConfirmed}
        onClick={handleLeaveWorkspace}
      >
        Leave workspace
      </Button>
    </div>
  );
}

export default LeaveWorkspace;

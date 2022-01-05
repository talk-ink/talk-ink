import React, { useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import TextInput from "components/Form/TextInput";
import Button from "components/Button/Button";
import { useDebounce } from "use-debounce";

import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import { useToast } from "hooks/useToast";

import { kontenbase } from "lib/client";
import { leaveWorkspace } from "features/workspaces";

function DeleteWorkspace() {
  const [showToast] = useToast();

  const params = useParams();
  const navigate = useNavigate();

  const workspace = useAppSelector((state) => state.workspace);
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const userId: string = auth.user.id;

  const [inputValue, setInputValue] = useState("");
  const [inputValueDebounce] = useDebounce(inputValue, 100);

  const workspaceData = useMemo(() => {
    return workspace.workspaces.find((data) => data._id === params.workspaceId);
  }, [workspace.workspaces, params.workspaceId]);

  const handleDeleteWorkspace = async () => {
    try {
      const newWorkspaces = workspace.workspaces.filter(
        (data) => data._id !== workspaceData._id
      );
      const leave = await kontenbase
        .service("Workspaces")
        .deleteById(workspaceData._id);
      if (leave.data) {
        if (newWorkspaces.length > 0) {
          navigate(`/a/${newWorkspaces[0]._id}/inbox`);
          window.location.reload();
        } else {
          navigate(`/a/create_workspace`);
        }
        dispatch(leaveWorkspace({ _id: workspaceData._id }));
      }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error)}` });
    }
  };

  const isDisabled =
    !inputValueDebounce || inputValueDebounce !== workspaceData.name;

  return (
    <div className="p-1">
      <p className="text-sm font-semibold">
        Are you sure you want to delete the{" "}
        <span className="italic">{workspaceData.name}</span> workspace
        permanently?
      </p>
      <p className="text-sm">
        This will immediately delete all channels, threads, messages, and files
        for every member. This cannot be undone. Learn more.
      </p>
      <div className="flex flex-col my-3">
        <small className="text-neutral-500 text-xs mb-2">
          Please type <span className="font-bold">{workspaceData.name}</span> to
          delete workspace
        </small>
        <TextInput
          className="max-w-sm"
          placeholder="Input workspace name"
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />
      </div>
      <Button
        className="bg-red-400 hover:bg-red-700 text-sm font-semibold text-white"
        disabled={isDisabled}
        onClick={handleDeleteWorkspace}
      >
        Delete workspace
      </Button>
    </div>
  );
}

export default DeleteWorkspace;

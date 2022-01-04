import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

import { useAppSelector } from "hooks/useAppSelector";
import { getNameInitial } from "utils/helper";
import Upload from "components/Form/Upload";
import TextInput from "components/Form/TextInput";
import Button from "components/Button/Button";

function GeneralSettings() {
  const params = useParams();

  const workspace = useAppSelector((state) => state.workspace);

  const workspaceData = useMemo(() => {
    return workspace.workspaces.find((data) => data._id === params.workspaceId);
  }, [workspace.workspaces, params.workspaceId]);

  return (
    <div className="min-h-[50vh]">
      <div className="border-b border-neutral-100 pb-5">
        <p className="text-sm font-semibold">Logo</p>
        <div className="flex items-end my-5">
          <div className="h-24 w-24 rounded-xl bg-[#a8a8a8] flex items-center justify-center">
            <p className="text-6xl text-white uppercase">
              {getNameInitial(workspaceData.name)}
            </p>
          </div>
          <div className="ml-5 ">
            <Upload className="">
              <span className="text-sm font-semibold">Upload logo</span>
            </Upload>
            <p className="text-sm text-neutral-500 my-3">
              Pick an image up to 4MB
            </p>
          </div>
        </div>
        <p className="text-sm font-semibold">Team name</p>
        <div className="flex flex-col">
          <TextInput className="max-w-sm" />
          <small className="text-neutral-500 text-xs mt-2">
            The name of your group or company. Keep it simple.
          </small>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold my-5">Danger zone</h3>
        <div className="my-5">
          <p className="text-sm font-semibold mb-2">Leave team</p>
          <p className="text-sm">
            You can’t be removed from your team without an admin. If you still
            want to leave, promote someone else to admin first.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">Delete team</p>
          <p className="text-sm">
            This will immediately and permanently delete the Iruhaa team and its
            data for everyone — including all channels, threads, messages, and
            files. This cannot be undone. Learn more.
          </p>
          <Button className="border border-red-400 text-sm text-red-500 font-semibold hover:border-red-700 hover:text-red-700 mt-2">
            Delete team
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GeneralSettings;

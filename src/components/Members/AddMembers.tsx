import React, {
  SetStateAction,
  useEffect,
  useMemo,
  useState,
  Dispatch,
} from "react";

import { useParams } from "react-router-dom";
import copy from "copy-to-clipboard";

import ContentSkeleton from "components/Loading/ContentSkeleton";
import { fetchMembers } from "features/members/slice";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import Button from "components/Button/Button";
import MemberList from "./MemberList";
import InvitePeopleForm from "./InvitePeopleForm";
import { useToast } from "hooks/useToast";
import { updateWorkspace } from "features/workspaces";
import { randomString } from "utils/helper";
import { kontenbase } from "lib/client";
import { SettingsModalRouteState } from "types";

type TProps = {
  currentRoute: SettingsModalRouteState;
  setCurrentRoute: Dispatch<SetStateAction<SettingsModalRouteState>>;
};

function AddMembers({ currentRoute, setCurrentRoute }: TProps) {
  const params = useParams();
  const [showToast] = useToast();

  const auth = useAppSelector((state) => state.auth);
  const member = useAppSelector((state) => state.member);
  const workspace = useAppSelector((state) => state.workspace);
  const dispatch = useAppDispatch();

  const showInvitePeople = useMemo(() => {
    return currentRoute.current === "invitePeople";
  }, [currentRoute]);

  const [apiLoading, setApiLoading] = useState<boolean>(false);

  const workspaceData = useMemo(() => {
    return workspace.workspaces.find((data) => data._id === params.workspaceId);
  }, [workspace.workspaces, params.workspaceId]);

  const memberData = useMemo(() => {
    return member.members;
  }, [params.workspaceId, member.members]);

  const invitedEmails = useMemo(() => {
    const memberEmails = member.members.map((data) => data.email);
    return workspaceData.invitedEmails.filter(
      (data) => !memberEmails.includes(data)
    );
  }, [params.workspaceId, member.members, workspaceData]);

  const workspaceInviteIdHandler = async () => {
    setApiLoading(true);
    try {
      const inviteId = randomString();
      const update = await kontenbase
        .service("Workspaces")
        .updateById(workspaceData._id, {
          inviteId,
        });

      if (update.data) {
        dispatch(updateWorkspace({ _id: workspaceData._id, inviteId }));
      }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchMembers({ workspaceId: params.workspaceId }));
  }, [params.workspaceId]);

  useEffect(() => {
    if (workspaceData && !workspaceData?.inviteId) {
      workspaceInviteIdHandler();
    }
  }, [params.workspaceId, workspaceData]);

  const loading = member.loading;

  return (
    <div className="h-full">
      {!showInvitePeople && (
        <>
          <div className="w-full border-b border-neutral-100 pb-3 pt-0">
            <p className="text-sm font-semibold">Invite link</p>
            <p className="text-sm text-neutral-500">
              Share this link with others to grant access to your team!{" "}
              <span
                className="text-red-500 text-sm cursor-pointer hover:underline"
                onClick={() => {
                  if (!apiLoading) {
                    workspaceInviteIdHandler();
                  }
                }}
              >
                Reset Link
              </span>
            </p>
            <div
              className={`w-6/12 rounded border border-neutral-100 p-2 flex justify-between ${
                apiLoading && "opacity-30"
              }`}
            >
              <div className="overflow-hidden whitespace-nowrap text-ellipsis flex-grow-0">
                <p className="text-sm">{`${
                  process.env.REACT_APP_FRONTEND_URL
                }/j/${workspaceData?.inviteId ?? ""}/login`}</p>
              </div>

              <div className="h-full px-2 flex-shrink-0">
                <p
                  className="text-cyan-600 text-sm cursor-pointer hover:underline"
                  onClick={() => {
                    if (workspaceData.inviteId && !apiLoading) {
                      copy(
                        `${process.env.REACT_APP_FRONTEND_URL}/j/${
                          workspaceData?.inviteId ?? ""
                        }`
                      );
                      showToast({ message: "Link copied!" });
                    }
                  }}
                >
                  Copy Link
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between my-4">
            <div>
              <p className="text-sm font-semibold">
                Members ({member.members.length})
              </p>
            </div>
            <div>
              <Button
                className="text-sm text-white bg-cyan-600"
                onClick={() => {
                  setCurrentRoute((prev) => ({
                    ...prev,
                    current: "invitePeople",
                  }));
                }}
              >
                Invite People
              </Button>
            </div>
          </div>
          <div>
            {loading ? (
              <ContentSkeleton count={2} />
            ) : (
              <>
                {auth.user.id === workspaceData?.createdBy?._id && (
                  <>
                    {invitedEmails.map((data, idx) => (
                      <MemberList
                        key={idx}
                        data={{
                          firstName: data,
                          email: data,
                        }}
                        hideEmail
                        invited
                      />
                    ))}
                  </>
                )}

                {memberData.map((data, idx) => (
                  <MemberList
                    key={idx}
                    data={data}
                    hideEmail={workspaceData?.hideEmail?.includes(data._id)}
                  />
                ))}
              </>
            )}
          </div>
        </>
      )}
      {showInvitePeople && (
        <InvitePeopleForm
          onCancel={() => {
            setCurrentRoute((prev) => ({
              route: prev.route,
              current: prev.route,
            }));
          }}
          workspaceData={workspaceData}
        />
      )}
    </div>
  );
}

export default AddMembers;

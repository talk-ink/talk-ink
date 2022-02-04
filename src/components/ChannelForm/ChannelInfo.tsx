import React, { useEffect, useMemo, useState } from "react";

import Button from "components/Button/Button";
import ChannelForm from "./ChannelForm";

import { useAppDispatch } from "hooks/useAppDispatch";
import { useToast } from "hooks/useToast";

import { updateChannel } from "features/channels/slice";
import { kontenbase } from "lib/client";
import { Channel, CreateChannel, Member } from "types";
import { useAppSelector } from "hooks/useAppSelector";
import { fetchMembers } from "features/members";
import { useParams } from "react-router-dom";
import NameInitial from "components/Avatar/NameInitial";
import ProfileImage from "components/ProfileImage";
import { getNameInitial } from "utils/helper";

type TProps = {
  data: Channel;
  onClose: () => void;
  showManageMemberModal?: (channel?: Channel) => void;
};

function ChannelInfo({ data, onClose, showManageMemberModal }: TProps) {
  const [showToast] = useToast();
  const params = useParams();

  const auth = useAppSelector((state) => state.auth);
  const member = useAppSelector((state) => state.member);
  const workspace = useAppSelector((state) => state.workspace);
  const channel = useAppSelector((state) => state.channel);
  const dispatch = useAppDispatch();

  const [edit, setEdit] = useState(false);

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((item) => item._id === data._id);
  }, [channel.channels, data]);

  const memberList: Member[] = useMemo(() => {
    const notJoined = member.members.filter((item) =>
      channelData?.members.includes(item._id)
    );
    return notJoined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId, member.members, channelData]);

  const workspaceData = useMemo(() => {
    return workspace.workspaces.find((data) => data._id === params.workspaceId);
  }, [workspace.workspaces, params.workspaceId]);

  const isAdmin = useMemo(() => {
    return (
      workspaceData.createdBy?._id === auth.user?._id ||
      channelData?.createdBy?._id === auth.user?._id
    );
  }, [workspaceData, channelData, auth.user._id]);

  const onSubmit = async (value: CreateChannel) => {
    try {
      await kontenbase.service("Channels").updateById(data._id, value);

      dispatch(updateChannel({ _id: data._id, ...value }));
      onClose();
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    }
  };
  const privacyStr = {
    public: "Public",
    private: "Private",
  };

  useEffect(() => {
    dispatch(fetchMembers({ workspaceId: params.workspaceId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId, channelData]);

  return (
    <div className="pt-2 pb-3">
      {!edit && (
        <>
          <div className="flex justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold">{data.name}</h2>
              <p className="text-sm text-neutral-500">
                {privacyStr[data.privacy]}
              </p>
            </div>
            <div>
              {isAdmin && (
                <Button
                  className="text-sm font-semibold bg-neutral-100 hover:bg-neutral-200"
                  onClick={() => {
                    setEdit(true);
                  }}
                >
                  Edit Channel
                </Button>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Description</p>
            <p className="text-xs">{data.description || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Manage members</p>
            <div className="flex items-center">
              <div className="flex justify-start">
                {memberList.map(
                  (member, idx) =>
                    idx <= 3 && (
                      <div key={idx}>
                        {member._id === auth.user._id && (
                          <>
                            {!auth.user.avatar && (
                              <NameInitial
                                key={member._id}
                                name={getNameInitial(auth.user.firstName)}
                                className="border-2 border-white -mr-2 bg-red-400"
                              />
                            )}
                            {auth.user.avatar && (
                              <ProfileImage
                                key={member._id}
                                className="border-2 border-white -mr-2 bg-red-400"
                                source={auth.user.avatar}
                              />
                            )}
                          </>
                        )}
                        {member._id !== auth.user._id && (
                          <>
                            {!member.avatar && (
                              <NameInitial
                                key={member._id}
                                name={getNameInitial(member.firstName)}
                                className="border-2 border-white -mr-2 bg-red-400"
                              />
                            )}
                            {member.avatar && (
                              <ProfileImage
                                key={member._id}
                                className="border-2 border-white -mr-2 bg-red-400"
                                source={member.avatar[0].url}
                              />
                            )}
                          </>
                        )}
                      </div>
                    )
                )}
              </div>
              {isAdmin && (
                <span
                  className="text-indigo-500 hover:underline cursor-pointer ml-6"
                  onClick={() => {
                    onClose();
                    showManageMemberModal(channelData);
                  }}
                >
                  Edit
                </span>
              )}
            </div>
          </div>
        </>
      )}
      {edit && (
        <ChannelForm
          onSubmit={onSubmit}
          loading={false}
          onCancel={() => {
            setEdit(false);
          }}
          editedData={data}
        />
      )}
    </div>
  );
}

export default ChannelInfo;

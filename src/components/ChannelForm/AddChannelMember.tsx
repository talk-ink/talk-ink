import React, { useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";
import { useDebounce } from "use-debounce";

import MemberSuggestion from "components/Suggestion/Member";
import SuggestionMemberList from "components/Suggestion/Member/List";
import MemberList from "components/Members/MemberList";

import { useAppSelector } from "hooks/useAppSelector";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useToast } from "hooks/useToast";

import { Channel, Member } from "types";
import { fetchMembers } from "features/members";
import { addChannelMember, removeChannelMember } from "features/channels/slice";
import { kontenbase } from "lib/client";

type TProps = {
  data: Channel;
};

function AddChannelMember({ data }: TProps) {
  const [showToast] = useToast();
  const params = useParams();

  const auth = useAppSelector((state) => state.auth);
  const member = useAppSelector((state) => state.member);
  const channel = useAppSelector((state) => state.channel);
  const dispatch = useAppDispatch();

  const [search, setSearch] = useState("");
  const [searchDebounce] = useDebounce(search, 100);

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((item) => item._id === data._id);
  }, [channel.channels, params.channelId, data]);

  const notJoinedMemberData: Member[] = useMemo(() => {
    const notJoined = member.members.filter(
      (item) => !channelData?.members.includes(item._id)
    );
    if (!searchDebounce) return notJoined;
    const trimValue = searchDebounce.trim();
    return notJoined.filter(
      (data) =>
        data.firstName.includes(trimValue) || data.email.includes(trimValue)
    );
  }, [params.workspaceId, member.members, searchDebounce, channelData]);

  const joinedMemberData: Member[] = useMemo(() => {
    const notJoined = member.members.filter((item) =>
      channelData?.members.includes(item._id)
    );
    return notJoined;
  }, [params.workspaceId, member.members, channelData]);

  const inviteMemberHandler = async (id: string) => {
    try {
      const { data: inviteData } = await kontenbase
        .service("Channels")
        .link(data._id, { members: id });

      if (inviteData)
        dispatch(addChannelMember({ _id: data._id, memberId: id }));
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  const removeMemberHandler = async ({
    type,
    memberId,
  }: {
    type: "leave" | "remove";
    memberId: string;
  }) => {
    try {
      const { data: removeData } = await kontenbase
        .service("Channels")
        .unlink(data._id, { members: memberId });
      if (removeData) {
        dispatch(
          removeChannelMember({
            _id: params.channelId,
            memberId,
          })
        );
      }
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  useEffect(() => {
    dispatch(fetchMembers({ workspaceId: params.workspaceId }));
  }, [params.workspaceId, channelData]);

  return (
    <div className="h-[50vh] overflow-auto">
      <p className="text-sm font-semibold">Add members</p>
      <MemberSuggestion onChange={(e) => setSearch(e.target.value)}>
        {notJoinedMemberData.map((data, idx) => (
          <SuggestionMemberList
            key={idx}
            data={data}
            onClick={() => {
              inviteMemberHandler(data._id);
            }}
          />
        ))}
      </MemberSuggestion>
      <div className="w-full h-[40vh] mt-2 border rounded border-gray-200 overflow-auto px-2">
        {joinedMemberData.map((data, idx) => (
          <MemberList
            data={data}
            key={idx}
            hideEmail
            leftContent={
              <div className="pr-2">
                <span
                  className="text-indigo-500 hover:underline cursor-pointer"
                  onClick={() => {
                    if (auth.user._id === data._id) {
                      removeMemberHandler({
                        type: "leave",
                        memberId: data._id,
                      });
                    } else {
                      removeMemberHandler({
                        type: "remove",
                        memberId: data._id,
                      });
                    }
                  }}
                >
                  {auth.user._id === data._id ? "Leave" : "Remove"}
                </span>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}

export default AddChannelMember;

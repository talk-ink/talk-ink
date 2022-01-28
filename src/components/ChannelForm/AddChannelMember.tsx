import React, { useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { Popover } from "@headlessui/react";

import SuggestionMemberList from "components/Suggestion/Member/List";
import MemberList from "components/Members/MemberList";
import Button from "components/Button/Button";
import Suggestion from "components/Suggestion";
import ClosableBadge from "components/Badge/ClosableBadge";

import { useAppSelector } from "hooks/useAppSelector";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useToast } from "hooks/useToast";

import { Channel, Member } from "types";
import { removeChannelMember, updateChannel } from "features/channels/slice";
import { kontenbase } from "lib/client";
import { createUniqueArray } from "utils/helper";

type TProps = {
  data: Channel;
  onClose: () => void;
};

function AddChannelMember({ data, onClose }: TProps) {
  const [showToast] = useToast();
  const navigate = useNavigate();
  const params = useParams();

  const auth = useAppSelector((state) => state.auth);
  const member = useAppSelector((state) => state.member);
  const channel = useAppSelector((state) => state.channel);
  const dispatch = useAppDispatch();

  const [search, setSearch] = useState("");
  const [searchDebounce] = useDebounce(search, 100);

  const [invitedList, setInvitedList] = useState<Member[]>([]);

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((item) => item._id === data._id);
  }, [channel.channels, data]);

  const notJoinedMemberData: Member[] = useMemo(() => {
    const notJoined = member.members.filter(
      (item) =>
        !channelData?.members.includes(item._id) &&
        invitedList.findIndex((data) => data._id === item._id) < 0
    );
    if (!searchDebounce) return notJoined;
    const trimValue = searchDebounce.trim();
    return notJoined.filter(
      (data) =>
        data.firstName.includes(trimValue) || data.email.includes(trimValue)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.workspaceId,
    member.members,
    searchDebounce,
    channelData,
    invitedList,
  ]);

  const joinedMemberData: Member[] = useMemo(() => {
    const notJoined = member.members.filter((item) =>
      channelData?.members.includes(item._id)
    );
    return notJoined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId, member.members, channelData]);

  const inviteMemberHandler = async () => {
    try {
      if (invitedList.length === 0)
        return showToast({ message: "Invited member is empty" });

      const ids: string[] = invitedList.map((data) => data._id);
      const members = createUniqueArray([...channelData.members, ...ids]);
      const { data: inviteData } = await kontenbase
        .service("Channels")
        .updateById(data._id, { members });

      if (inviteData) {
        dispatch(updateChannel({ _id: data._id, members }));
        setSearch("");
        setInvitedList([]);
      }
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
      const { data: removeData, error: removeError } = await kontenbase
        .service("Channels")
        .unlink(data._id, { members: memberId });
      if (removeError) throw new Error(removeError.message);

      const { error: updateError } = await kontenbase
        .service("Channels")
        .updateById(data._id, { name: channelData.name });
      if (updateError) throw new Error(updateError.message);

      if (removeData) {
        dispatch(
          removeChannelMember({
            _id: data._id,
            memberId,
          })
        );

        if (type === "leave") {
          onClose();
          navigate(`/a/${params.workspaceId}/inbox`);
        }
      }
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  return (
    <div className="min-h-[50vh] overflow-auto">
      <p className="text-sm font-semibold">Add members</p>
      <Suggestion
        header={
          <div className="w-full text-sm p-2 rounded-md outline-0 border border-neutral-200 focus:border-neutral-300 flex flex-wrap gap-2">
            {invitedList.map((item, idx) => (
              <ClosableBadge
                key={idx}
                text={item.firstName}
                onClose={() => {
                  setInvitedList((prev) =>
                    prev.filter((data) => data._id !== item._id)
                  );
                }}
              />
            ))}

            <input
              type="text"
              className="flex-1 outline-none h-6"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
            />
          </div>
        }
      >
        {notJoinedMemberData.map((data, idx) => (
          <SuggestionMemberList
            key={idx}
            data={data}
            onClick={() => {
              setInvitedList((prev) => [...prev, data]);
              setSearch("");
            }}
          />
        ))}
      </Suggestion>
      <div className="flex justify-end mt-2">
        <Button
          className="text-white bg-indigo-500 text-sm px-5"
          onClick={inviteMemberHandler}
        >
          Add
        </Button>
      </div>
      <div className="w-full h-[40vh] mt-2 overflow-auto px-2">
        {joinedMemberData.map((data, idx) => (
          <MemberList
            data={data}
            key={idx}
            hideEmail
            leftContent={
              <div className="pr-2">
                <Popover className="relative">
                  <Popover.Button as={React.Fragment}>
                    <span className="text-indigo-500 hover:underline cursor-pointer text-sm">
                      {auth.user._id === data._id ? "Leave" : "Remove"}
                    </span>
                  </Popover.Button>

                  <Popover.Panel className="absolute z-10 right-0 ">
                    {({ close }) => (
                      <div className="w-60 bg-white p-2 border rounded border-gray-200 relative z-10">
                        <p className="text-sm">
                          Are you sure want to{" "}
                          {auth.user._id === data._id ? "leave" : "remove"}?
                        </p>
                        <div className="flex items-center justify-end mt-2 gap-2">
                          <Button
                            className="bg-gray-100 text-xs h-6"
                            onClick={() => close()}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="bg-indigo-500 text-white text-xs h-6 px-4"
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
                              close();
                            }}
                          >
                            Yes
                          </Button>
                        </div>
                      </div>
                    )}
                  </Popover.Panel>
                </Popover>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}

export default AddChannelMember;

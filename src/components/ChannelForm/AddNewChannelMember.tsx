import React, { useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { FormikProps } from "formik";

import SuggestionMemberList from "components/Suggestion/Member/List";
import MemberList from "components/Members/MemberList";
import Suggestion from "components/Suggestion";
import ClosableBadge from "components/Badge/ClosableBadge";
import Button from "components/Button/Button";

import { useAppSelector } from "hooks/useAppSelector";
import { useToast } from "hooks/useToast";

import { CreateChannel, Member } from "types";
import { createUniqueArray } from "utils/helper";

type TProps = {
  setIsMemberEmpty: React.Dispatch<React.SetStateAction<boolean>>;
  formik: FormikProps<CreateChannel>;
};

function AddNewChannelMember({ setIsMemberEmpty, formik }: TProps) {
  const [showToast] = useToast();
  const params = useParams();

  const auth = useAppSelector((state) => state.auth);
  const member = useAppSelector((state) => state.member);

  const [joinedMemberIds, setJoinedMemberIds] = useState<string[]>(
    member.members.map((data) => data._id)
  );

  const [search, setSearch] = useState("");
  const [searchDebounce] = useDebounce(search, 100);

  const [invitedList, setInvitedList] = useState<Member[]>([]);

  const notJoinedMemberData: Member[] = useMemo(() => {
    const notJoined = member.members.filter(
      (item) =>
        !joinedMemberIds.includes(item._id) &&
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
    joinedMemberIds,
    invitedList,
  ]);

  const joinedMemberData: Member[] = useMemo(() => {
    const notJoined = member.members.filter((item) =>
      joinedMemberIds.includes(item._id)
    );
    return notJoined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId, member.members, joinedMemberIds]);

  const inviteMemberHandler = () => {
    try {
      const ids: string[] = invitedList.map((data) => data._id);
      const members = createUniqueArray([...joinedMemberIds, ...ids]);

      setJoinedMemberIds(members);
      setInvitedList([]);
      setSearch("");
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
      setJoinedMemberIds((prev) => prev.filter((data) => data !== memberId));
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  useEffect(() => {
    if (joinedMemberIds.length === 0) {
      setIsMemberEmpty(true);
    } else {
      setIsMemberEmpty(false);
    }
    formik.setFieldValue("members", joinedMemberIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinedMemberIds]);

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
          onClick={() => {
            inviteMemberHandler();
          }}
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
                <span
                  className="text-indigo-500 hover:underline cursor-pointer text-sm"
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

export default AddNewChannelMember;

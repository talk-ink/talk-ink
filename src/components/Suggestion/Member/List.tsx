import React from "react";

import { Menu } from "@headlessui/react";

import NameInitial from "components/Avatar/NameInitial";
import ProfileImage from "components/ProfileImage";

import { Member } from "types";
import { getNameInitial } from "utils/helper";

type TProps = {
  data: Member;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

function SuggestionMemberList({ data, onClick }: TProps) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          className={`flex items-center ${
            active ? "bg-indigo-100" : ""
          } p-2 outline-none w-full mt-1 first:mt-0`}
          onClick={onClick}
        >
          {!data.avatar && (
            <NameInitial name={getNameInitial(data.firstName)} size="small" />
          )}
          {data.avatar && (
            <ProfileImage source={data.avatar[0].url} size="small" />
          )}
          <p className="text-sm ml-2">{data?.firstName}</p>
        </button>
      )}
    </Menu.Item>
  );
}

export default SuggestionMemberList;

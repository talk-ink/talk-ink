import NameInitial from "components/Avatar/NameInitial";
import ProfileImage from "components/ProfileImage";
import React from "react";
import { Member, User } from "types";
import { getNameInitial } from "utils/helper";

type TProps = {
  data: Member;
  hideEmail: boolean;
  invited?: boolean;
};

function MemberList({ data, hideEmail, invited }: TProps) {
  return (
    <div className="border-b border-neutral-100 py-3 first:border-t flex items-center justify-between">
      <div className="flex items-center">
        <div className="mr-2">
          {!data.avatar && (
            <NameInitial name={getNameInitial(data.firstName)} />
          )}
          {data.avatar && <ProfileImage source={data.avatar[0].url} />}
        </div>
        <div>
          <div className="flex items-center">
            <p className={!hideEmail && "-mb-2"}>{data.firstName}</p>
            {invited && (
              <div className="px-2 py-1 bg-rose-500 ml-3 flex items-center justify-center rounded-full">
                <small className="text-xs text-white">Pending</small>
              </div>
            )}
          </div>
          {!hideEmail && (
            <small className="text-xs text-neutral-500">{data.email}</small>
          )}
        </div>
      </div>
      <div></div>
    </div>
  );
}

export default MemberList;

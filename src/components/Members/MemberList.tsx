import NameInitial from "components/Avatar/NameInitial";
import ProfileImage from "components/ProfileImage";
import React from "react";
import { Member, User } from "types";
import { getNameInitial } from "utils/helper";

type TProps = {
  data: Member;
  hideEmail: boolean;
};

function MemberList({ data, hideEmail }: TProps) {
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
          <p className={!hideEmail && "-mb-2"}>{data.firstName}</p>
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

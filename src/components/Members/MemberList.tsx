import NameInitial from "components/Avatar/NameInitial";
import React from "react";
import { User } from "types";
import { getNameInitial } from "utils/helper";

type TProps = {
  data: User;
};

function MemberList({ data }: TProps) {
  return (
    <div className="border-b border-neutral-100 py-3 first:border-t flex items-center justify-between">
      <div className="flex items-center">
        <div className="mr-2">
          <NameInitial name="Ilham Adiputra" />
        </div>
        <div>
          <p className="-mb-2">{data.firstName}</p>
          <small className="text-xs text-neutral-500">{data.email}</small>
        </div>
      </div>
      <div></div>
    </div>
  );
}

export default MemberList;

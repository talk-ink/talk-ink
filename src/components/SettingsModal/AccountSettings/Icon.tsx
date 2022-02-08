import React, { useState } from "react";

import { RiAccountCircleFill } from "react-icons/ri";

import { useAppSelector } from "hooks/useAppSelector";

type Props = {};

const AccountSettingsIcon = (props: Props) => {
  const auth = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState<boolean>(true);

  return (
    <>
      {(loading || !auth.user.avatar) && (
        <RiAccountCircleFill size={20} className="text-neutral-400" />
      )}
      <div
        className={`h-[20px] w-[20px] rounded-full overflow-hidden ${
          loading || !auth.user.avatar ? "hidden" : ""
        }`}
      >
        <img
          src={auth.user.avatar}
          alt="avatar"
          className="h-full w-full object-cover"
          onLoad={() => {
            setLoading(false);
          }}
        />
      </div>
    </>
  );
};

export default AccountSettingsIcon;

import React from "react";

import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { useMediaQuery } from "react-responsive";

import Avatar from "components/Avatar/Avatar";
import IconButton from "components/Button/IconButton";

import { Member } from "types";
import { getShortName } from "utils/helper";

type Props = {
  data?: Member;
};

const MessageHeader = ({ data }: Props) => {
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });
  const navigate = useNavigate();

  return (
    <div className="w-full py-4 px-2 md:px-3 sticky top-0 grid grid-cols-2 border-b border-b-neutral-100 bg-white z-50">
      <div className="grid-cols-1 flex items-center gap-3">
        {isMobile && (
          <IconButton size="medium" onClick={() => navigate(-1)}>
            <BiArrowBack className="text-slate-800" size={20} />
          </IconButton>
        )}

        <Avatar
          src={data?.avatar?.[0]?.url}
          alt={data?.firstName}
          size={isMobile ? "small" : "medium"}
        />
        <p className="font-semibold whitespace-nowrap text-sm md:text-base">
          {isMobile ? getShortName(data?.firstName) : data?.firstName}
        </p>
      </div>
    </div>
  );
};

export default MessageHeader;

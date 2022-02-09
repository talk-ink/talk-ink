import { KontenbaseResponse } from "@kontenbase/sdk";
import { BsEye } from "react-icons/bs";
import { kontenbase } from "lib/client";

import Button from "components/Button/Button";

import { useAppDispatch } from "hooks/useAppDispatch";
import { useToast } from "hooks/useToast";

import { updateChannel } from "features/channels/slice";
import { Channel } from "types";
import { useMediaQuery } from "react-responsive";

type Props = {
  data: Channel;
  userId: string;
};

function ChannelBadge({ data, userId }: Props) {
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });

  const [showToast] = useToast();

  const dispatch = useAppDispatch();

  const joinChannelHandler = async () => {
    try {
      const joinChannel: KontenbaseResponse<Channel> = await kontenbase
        .service("Channels")
        .link(data._id, { members: userId });

      dispatch(updateChannel({ _id: data._id, ...joinChannel.data }));
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error)}` });
    }
  };
  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 p-3 bg-slate-800 rounded-md flex items-center justify-between">
      <div className="flex items-center mr-5">
        <BsEye className="text-white mr-2" size={18} />
        <p className="text-sm text-white font-semibold max-w-xs whitespace-nowrap overflow-hidden text-ellipsis mr-1">
          You’re previewing #{data?.name}.
        </p>
        <p className="text-sm text-white hidden md:inline">
          Join to reply and compose.
        </p>
      </div>
      <Button
        className="text-xs md:text-sm text-white bg-indigo-500"
        onClick={joinChannelHandler}
      >
        {isMobile ? "Join" : ` Join Channel`}
      </Button>
    </div>
  );
}

export default ChannelBadge;

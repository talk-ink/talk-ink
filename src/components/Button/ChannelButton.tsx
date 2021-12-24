import React, { Dispatch, SetStateAction } from "react";
import { BiDotsHorizontalRounded, BiPlus } from "react-icons/bi";

import Menu from "components/Menu/Menu";
import MenuItem from "components/Menu/MenuItem";
import Popup from "components/Popup/Popup";

type Props = React.PropsWithChildren<{
  onClick?: () => void;
  onOptionClick?: () => void;
  setCreateChannelModal: Dispatch<SetStateAction<boolean>>;
}>;

function ChannelButton({
  onClick = () => {},
  onOptionClick = () => {},
  setCreateChannelModal,
}: Props) {
  return (
    <div className="w-full rounded h-9 hover:bg-neutral-100 flex items-center justify-between group">
      <button className="pl-3 h-full w-full text-left" onClick={onClick}>
        <p className="font-bold text-xs text-neutral-500">Channels</p>
      </button>

      <Popup
        content={
          <div>
            <Menu>
              <MenuItem
                icon={<BiPlus size={20} className="text-neutral-400" />}
                onClick={() => {
                  setCreateChannelModal(true);
                }}
                title="Create new channel"
              />
            </Menu>
          </div>
        }
        position="bottom"
      >
        <button
          className="hidden h-7 w-8 group-hover:flex items-center justify-center hover:bg-neutral-300 rounded-md"
          onClick={onOptionClick}
        >
          <BiDotsHorizontalRounded size={18} className="text-neutral-500" />
        </button>
      </Popup>
    </div>
  );
}

export default ChannelButton;

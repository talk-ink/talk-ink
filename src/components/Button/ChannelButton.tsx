import React, { Dispatch, SetStateAction } from "react";
import { BiDotsHorizontalRounded, BiPlus } from "react-icons/bi";

import Menu from "components/Menu/Menu";
import MenuItem from "components/Menu/MenuItem";
import Popup from "components/Popup/Popup";
import IconButton from "./IconButton";

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
        <IconButton
          className="hidden group-hover:flex"
          size="medium"
          onClick={onOptionClick}
        >
          <BiDotsHorizontalRounded size={18} className="text-neutral-500" />
        </IconButton>
      </Popup>
    </div>
  );
}

export default ChannelButton;

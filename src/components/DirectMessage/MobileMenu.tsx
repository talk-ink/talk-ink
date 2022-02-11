import { Dialog } from "@headlessui/react";
import { BiEditAlt, BiTrash } from "react-icons/bi";

import MenuItem from "components/Menu/MenuItem";

import { setMessageMenu } from "features/mobileMenu/slice";
import { useAppDispatch } from "hooks/useAppDispatch";

type Props = { openMenu: boolean; onClose: () => void };

const MessageMenu = ({ openMenu, onClose }: Props) => {
  const dispatch = useAppDispatch();

  return (
    <Dialog open={openMenu} onClose={onClose} className="fixed z-50 inset-0 ">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        {openMenu && (
          <div className="relative bg-white rounded w-screen mt-auto p-3 pb-20">
            <MenuItem
              icon={<BiEditAlt size={20} className="text-neutral-400" />}
              onClick={() => {
                dispatch(setMessageMenu({ type: "edit" }));
              }}
              title="Edit message"
            />
            <MenuItem
              icon={<BiTrash size={20} className="text-neutral-400" />}
              onClick={() => {
                dispatch(setMessageMenu({ type: "delete" }));
              }}
              title="Delete message"
            />
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default MessageMenu;

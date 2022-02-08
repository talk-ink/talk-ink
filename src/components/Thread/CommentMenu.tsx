import { useMemo } from "react";

import { Dialog } from "@headlessui/react";
import { HiOutlineReply } from "react-icons/hi";
import { BiEditAlt, BiTrash } from "react-icons/bi";
import { VscReactions } from "react-icons/vsc";

import Divider from "components/Divider/Divider";
import MenuItem from "components/Menu/MenuItem";

import { setCommentMenu } from "features/mobileMenu/slice";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";

type Props = { openMenu: boolean; onClose: () => void };

const CommentMenu = ({ openMenu, onClose }: Props) => {
  const auth = useAppSelector((state) => state.auth);
  const mobileMenu = useAppSelector((state) => state.mobileMenu);

  const dispatch = useAppDispatch();

  const isMyComment = useMemo(() => {
    return auth?.user?._id === mobileMenu?.comment?.data?.createdBy?._id;
  }, [auth.user._id, mobileMenu.comment?.data]);

  return (
    <Dialog open={openMenu} onClose={onClose} className="fixed z-50 inset-0 ">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        {openMenu && (
          <div className="relative bg-white rounded w-screen mt-auto p-3 pb-20">
            <>
              {mobileMenu?.comment?.category === "comment" && (
                <>
                  <MenuItem
                    icon={
                      <VscReactions size={20} className="text-neutral-400" />
                    }
                    onClick={() => {
                      dispatch(setCommentMenu({ type: "reaction" }));
                    }}
                    title="Add Reaction"
                  />
                  <MenuItem
                    icon={
                      <HiOutlineReply size={20} className="text-neutral-400" />
                    }
                    onClick={() => {
                      dispatch(setCommentMenu({ type: "reply" }));
                    }}
                    title="Reply"
                  />
                </>
              )}
              {isMyComment && (
                <>
                  {mobileMenu?.comment?.category === "comment" && <Divider />}
                  <MenuItem
                    icon={<BiEditAlt size={20} className="text-neutral-400" />}
                    onClick={() => {
                      dispatch(setCommentMenu({ type: "edit" }));
                    }}
                    title="Edit Comment"
                  />
                  <MenuItem
                    icon={<BiTrash size={20} className="text-neutral-400" />}
                    onClick={() => {
                      dispatch(setCommentMenu({ type: "delete" }));
                    }}
                    title="Delete Comment"
                  />
                </>
              )}
            </>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default CommentMenu;

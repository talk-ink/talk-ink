import { Dialog } from "@headlessui/react";
import { SelectedThreadTypes } from "components/ContentItem/ContentItem";
import Divider from "components/Divider/Divider";
import MenuItem from "components/Menu/MenuItem";
import { addReadThread, deleteReadThread } from "features/auth";
import { deleteThread, updateThread } from "features/threads";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import { useToast } from "hooks/useToast";
import { kontenbase } from "lib/client";
import React from "react";
import {
  BiCheck,
  BiCheckCircle,
  BiCircle,
  BiEdit,
  BiRecycle,
  BiTrash,
} from "react-icons/bi";
import { BsArrowUpCircle } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { Thread } from "types";

type Props = {
  openMenu: boolean;
  onClose: () => void;
  dataSource?: Thread;
  setSelectedThread?: React.Dispatch<
    React.SetStateAction<{
      thread: Thread;
      type: SelectedThreadTypes;
    }>
  >;
  isRead?: boolean;
  from?: "regular" | "trash";
};

const MobileMenuThread = ({
  openMenu,
  onClose,
  dataSource,
  setSelectedThread,
  isRead,
  from = "regular",
}: Props) => {
  const [showToast] = useToast();

  const navigate = useNavigate();
  const params = useParams();

  const isFromTalkink = dataSource?.name === "Welcome to Talk.ink";

  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleReadUnread = async ({ type }: { type: "read" | "unread" }) => {
    try {
      switch (type) {
        case "read":
          await kontenbase
            .service("Threads")
            .link(dataSource._id, { readedUsers: auth.user._id });
          dispatch(addReadThread(dataSource._id));
          break;
        case "unread":
          await kontenbase
            .service("Threads")
            .unlink(dataSource._id, { readedUsers: auth.user._id });
          dispatch(deleteReadThread(dataSource._id));
          break;
        default:
          break;
      }
    } catch (error: any) {
      console.log("err", error);
    } finally {
      onClose();
    }
  };
  const reopenThreadHandler = async () => {
    try {
      const { data, error } = await kontenbase
        .service("Threads")
        .updateById(dataSource._id, { isClosed: false });
      if (error) throw new Error(error?.message);

      if (data) {
        dispatch(updateThread({ ...dataSource, isClosed: false }));
        navigate(
          `/a/${params.workspaceId}/ch/${dataSource?.channel?.[0]}/t/${dataSource._id}`
        );
      }
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    } finally {
      onClose();
    }
  };

  const restoreThreadHandler = async () => {
    try {
      const { data, error } = await kontenbase
        .service("Threads")
        .updateById(dataSource._id, { isDeleted: false });
      if (error) throw new Error(error?.message);

      if (data) {
        dispatch(deleteThread(dataSource));
        showToast({
          message: `"${dataSource?.name}" thread has been restored`,
        });
      }
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    } finally {
      onClose();
    }
  };

  return (
    <Dialog open={openMenu} onClose={onClose} className="fixed z-50 inset-0 ">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        {openMenu && (
          <div className="relative bg-white rounded w-screen mt-auto p-3 pb-20">
            {from === "regular" && (
              <>
                {isRead && (
                  <MenuItem
                    icon={<BiCircle size={20} className="text-neutral-400" />}
                    title="Mark unread"
                    onClick={() => {
                      handleReadUnread({ type: "unread" });
                    }}
                    className="w-full"
                  />
                )}
                {!isRead && (
                  <MenuItem
                    icon={<BiCheck size={20} className="text-neutral-400" />}
                    title="Mark read"
                    onClick={() => {
                      handleReadUnread({ type: "read" });
                    }}
                    className="w-full"
                  />
                )}
                {(dataSource.createdBy._id === auth.user._id ||
                  dataSource?.draft) &&
                  !isFromTalkink &&
                  !dataSource?.draft && <Divider />}

                {(dataSource.createdBy._id === auth.user._id ||
                  dataSource?.draft) &&
                  !isFromTalkink &&
                  !dataSource?.draft && (
                    <>
                      <MenuItem
                        icon={<BiEdit size={20} className="text-neutral-400" />}
                        title="Edit thread..."
                        onClick={() => {
                          navigate(
                            `/a/${params.workspaceId}/ch/${dataSource?.channel?.[0]}/te/${dataSource._id}`
                          );
                        }}
                        className="w-full"
                      />
                      <MenuItem
                        icon={
                          <BiTrash size={20} className="text-neutral-400" />
                        }
                        title="Delete thread..."
                        onClick={() => {
                          setSelectedThread({
                            thread: dataSource,
                            type: "delete",
                          });
                        }}
                        className="w-full"
                      />
                    </>
                  )}
                {!dataSource?.isClosed && (
                  <MenuItem
                    icon={
                      <BiCheckCircle size={20} className="text-neutral-400" />
                    }
                    title="Close thread"
                    onClick={() => {
                      setSelectedThread({
                        thread: dataSource,
                        type: "close",
                      });
                    }}
                    className="w-full"
                  />
                )}
                {dataSource?.isClosed && (
                  <MenuItem
                    icon={
                      <BsArrowUpCircle size={20} className="text-neutral-400" />
                    }
                    title="Reopen thread"
                    onClick={() => {
                      reopenThreadHandler();
                    }}
                    className="w-full"
                  />
                )}
              </>
            )}
            {from === "trash" && (
              <MenuItem
                icon={<BiRecycle size={20} className="text-neutral-400" />}
                title="Restore thread"
                onClick={() => {
                  restoreThreadHandler();
                }}
                className="w-full"
              />
            )}
            {from === "trash" && (
              <MenuItem
                icon={<BiTrash size={20} className="text-neutral-400" />}
                title="Remove from trash"
                onClick={() => {
                  setSelectedThread({
                    thread: dataSource,
                    type: "delete",
                  });
                }}
                className="w-full"
              />
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default MobileMenuThread;

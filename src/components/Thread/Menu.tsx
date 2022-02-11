import { Menu } from "@headlessui/react";
import IconButton from "components/Button/IconButton";
import { SelectedThreadTypes } from "components/ContentItem/ContentItem";
import MenuItem from "components/Menu/MenuItem2";
import { useAppSelector } from "hooks/useAppSelector";
import React, { useMemo } from "react";
import {
  BiCheckCircle,
  BiDotsHorizontalRounded,
  BiEdit,
  BiTrash,
} from "react-icons/bi";
import { BsArrowUpCircle } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { Thread } from "types";

type Props = {
  dataSource: Thread;
  setSelectedThread?: React.Dispatch<
    React.SetStateAction<{
      thread: Thread;
      type: SelectedThreadTypes;
    }>
  >;
  onReopen?: () => void;
};

const ThreadMenu = ({ dataSource, setSelectedThread, onReopen }: Props) => {
  const params = useParams();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);
  const isFromTalkink = dataSource.name === "Welcome to Talk.ink";

  const isMine = useMemo(() => {
    return dataSource.createdBy._id === auth.user._id;
  }, [dataSource?.createdBy, auth?.user?._id]);

  return (
    <Menu as="div" className="relative hidden md:block">
      {({ open }) => (
        <>
          <div className={`flex gap-2 items-center`}>
            <>
              {!dataSource?.draft && (
                <div className="flex">
                  <Menu.Button as="div">
                    <IconButton>
                      <BiDotsHorizontalRounded
                        size={24}
                        className="text-neutral-400"
                      />
                    </IconButton>
                  </Menu.Button>
                </div>
              )}

              {open && (
                <Menu.Items static className="menu-container right-0 top-full">
                  <>
                    {(isMine || dataSource?.draft) &&
                      !isFromTalkink &&
                      !dataSource?.draft && (
                        <>
                          <MenuItem
                            icon={
                              <BiEdit size={20} className="text-neutral-400" />
                            }
                            title="Edit thread..."
                            onClick={() => {
                              navigate(
                                `/a/${params.workspaceId}/ch/${dataSource.channel?.[0]}/te/${dataSource?._id}`
                              );
                            }}
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
                          />
                        </>
                      )}
                    {!dataSource?.isClosed && (
                      <MenuItem
                        icon={
                          <BiCheckCircle
                            size={20}
                            className="text-neutral-400"
                          />
                        }
                        title="Close thread"
                        onClick={() => {
                          setSelectedThread({
                            thread: dataSource,
                            type: "close",
                          });
                        }}
                      />
                    )}
                    {dataSource?.isClosed && (
                      <MenuItem
                        icon={
                          <BsArrowUpCircle
                            size={20}
                            className="text-neutral-400"
                          />
                        }
                        title="Reopen thread"
                        onClick={() => {
                          onReopen();
                        }}
                      />
                    )}
                  </>
                </Menu.Items>
              )}
            </>
          </div>
        </>
      )}
    </Menu>
  );
};

export default ThreadMenu;

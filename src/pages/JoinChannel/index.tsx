import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { kontenbase } from "lib/client";

import Button from "components/Button/Button";
import ChannelList from "./ChannelList";

import { useToast } from "hooks/useToast";
import { useAppSelector } from "hooks/useAppSelector";
import { useAppDispatch } from "hooks/useAppDispatch";
import { addWorkspace } from "features/workspaces";
import { updateUser } from "features/auth";
import FullscreenLoading from "components/Loading/FullscreenLoading";
import { Channel } from "types";

function JoinChannelPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [showToast] = useToast();

  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const userId: string = auth.user._id;

  const [apiLoading, setApiLoading] = useState(false);
  const [channels, setChannels] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  const [selectedChannels, setSelectedChannels] = useState([]);

  const getChannels = async () => {
    setApiLoading(true);
    try {
      const getChannel = await kontenbase
        .service("Channels")
        .find({ where: { privacy: "public", workspace: params.workspaceId } });

      if (getChannel.error) throw new Error(getChannel.error.message);

      if (getChannel.data) {
        const channelIds: string[] = getChannel?.data?.map(
          (data: Channel) => data._id
        );
        setSelectedChannels(channelIds);
      }

      setChannels(getChannel.data);
    } catch (error) {
      if (error instanceof Error) {
        showToast({ message: `${JSON.stringify(error?.message)}` });
      }
    } finally {
      setApiLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedChannels((prev) => {
      const selectedIndex = prev.findIndex((data) => data === id);
      if (selectedIndex >= 0) {
        return prev.filter((data) => data !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const joinChannelsHandler = async () => {
    setApiLoading(true);

    const joinBulkChannelHandler = () => {
      const join = selectedChannels.map(async (data) => {
        const channelData = await kontenbase.service("Channels").getById(data);
        const joinChannel = await kontenbase
          .service("Channels")
          .updateById(data, {
            members: [...channelData.data.members, userId],
          });
        return joinChannel.data;
      });

      return Promise.all(join);
    };

    try {
      const { user: userData } = await kontenbase.auth.user();
      const workspaceData = await kontenbase
        .service("Workspaces")
        .getById(params.workspaceId);

      let workspaces = [];

      if (userData.workspaces) {
        if (userData.workspaces.includes(params.workspaceId)) {
          return showToast({ message: "Already in this workspace!" });
        }
        workspaces = [params.workspaceId, ...userData.workspaces];
      } else {
        workspaces = [params.workspaceId];
      }

      const { user: updateUserData } = await kontenbase.auth.update({
        workspaces,
        channels: selectedChannels,
      });

      const joinWorkspace = await kontenbase
        .service("Workspaces")
        .updateById(params.workspaceId, {
          peoples: [...workspaceData.data.peoples, userId],
        });

      const joinBulkChannel = await joinBulkChannelHandler();

      if (joinWorkspace.data && updateUserData && joinBulkChannel) {
        dispatch(addWorkspace(workspaceData.data));
        dispatch(
          updateUser({
            workspaces,
            channels,
          })
        );
        navigate(`/a/${params.workspaceId}/inbox`);
      }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error)}` });
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    getChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId]);

  useEffect(() => {
    setTimeout(() => {
      setPageLoading(false);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return pageLoading ? (
    <FullscreenLoading />
  ) : (
    <div className="w-screen h-screen flex items-center justify-center py-10">
      <div className="w-6/12 border border-neutral-100 p-3 rounded-md">
        <h1 className="text-3xl font-semibold">Join channels</h1>
        <div className="max-w-sm max-h-[50vh] overflow-auto mt-3">
          {channels.map((data, idx) => (
            <ChannelList
              key={idx}
              data={data}
              onClick={() => {
                handleSelect(data._id);
              }}
              selectedChannels={selectedChannels}
            />
          ))}
        </div>
        <div className="max-w-sm mt-5">
          <Button
            className="w-full bg-indigo-500 text-white font-semibold text-xl p-5 flex items-center justify-center"
            disabled={selectedChannels.length === 0 || apiLoading}
            onClick={joinChannelsHandler}
          >
            Join Channels
          </Button>
        </div>
      </div>
    </div>
  );
}

export default JoinChannelPage;

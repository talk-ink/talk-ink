import Button from "components/Button/Button";
import { useAppSelector } from "hooks/useAppSelector";
import { useToast } from "hooks/useToast";
import { kontenbase } from "lib/client";
import React, { useEffect, useState } from "react";
import { HiOutlineHashtag } from "react-icons/hi";
import { useNavigate, useParams } from "react-router-dom";
import { Channel } from "types";
import ChannelList from "./ChannelList";

function JoinChannelPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [showToast] = useToast();

  const auth = useAppSelector((state) => state.auth);
  const userId: string = auth.user.id;

  const [apiLoading, setApiLoading] = useState(false);
  const [channels, setChannels] = useState([]);

  const [selectedChannels, setSelectedChannels] = useState([]);

  const getChannels = async () => {
    setApiLoading(true);
    try {
      const getChannel = await kontenbase
        .service("Channels")
        .find({ where: { privacy: "public", workspace: params.workspaceId } });

      setChannels(getChannel.data);
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
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
        const channelData = await kontenbase.service("Channels").findById(data);
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
      const userData = await kontenbase.service("Users").findById(userId);

      if (userData.data.workspaces.includes(params.workspaceId)) {
        return showToast({ message: "Already in this workspace!" });
      }

      const updateUser = await kontenbase.service("Users").updateById(userId, {
        workspaces: [params.workspaceId, ...userData.data.workspaces],
      });

      const workspaceData = await kontenbase
        .service("Workspaces")
        .findById(params.workspaceId);

      const joinWorkspace = await kontenbase
        .service("Workspaces")
        .updateById(params.workspaceId, {
          peoples: [...workspaceData.data.peoples, userId],
        });

      const joinBulkChannel = await joinBulkChannelHandler();

      if (joinWorkspace.data && updateUser.data && joinBulkChannel) {
        navigate(`/a/${params.workspaceId}`);
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
  }, [params.workspaceId]);

  return (
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
            className="w-full bg-cyan-600 text-white font-semibold text-xl p-5 flex items-center justify-center"
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

import { useEffect, useState } from "react";

import { BiDotsHorizontalRounded, BiEdit } from "react-icons/bi";
import { useLocation, useNavigate, useParams } from "react-router";

import Button from "components/Button/Button";
import IconButton from "components/Button/IconButton";
import ContentItem from "components/ContentItem/ContentItem";
import ContentSkeleton from "components/Loading/ContentSkeleton";
import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import { useAppSelector } from "hooks/useAppSelector";
import { useGetChannelByIdQuery } from "features/channels";
import { useLazyGetThreadByIdsQuery } from "features/threads";
import { kontenbase } from "lib/client";
import { Channel } from "types";

function ChannelPage() {
  const { pathname } = useLocation();

  const params = useParams();
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.auth);
  const userId: any = auth.user.id;

  const [threadData, setThreadData] = useState([]);
  const [channelData, setChannelData] = useState<Channel | undefined>();
  const [apiLoading, setApiLoading] = useState(false);

  const createThreadDraft = () => {
    const threadsDraft = localStorage.getItem("threadsDraft");
    const uniqueId = Math.floor(Math.random() * 100000);

    const dataTemplate = {
      title: "",
      content: "",
    };
    if (!threadsDraft) {
      localStorage.setItem(
        "threadsDraft",
        JSON.stringify({
          [uniqueId]: dataTemplate,
        })
      );
    } else {
      const parsedThreadsDraft: object = JSON.parse(threadsDraft);
      const newDraft = {
        ...parsedThreadsDraft,
        [uniqueId]: dataTemplate,
      };
      localStorage.setItem("threadsDraft", JSON.stringify(newDraft));
    }
    navigate(`${pathname}/compose/${uniqueId}`);
  };

  const getChannelData = async () => {
    setApiLoading(true);
    try {
      const getChannel = await kontenbase
        .service("Channels")
        .findById(params.channelId);
      if (!getChannel.data) throw new Error("Invalid channel");

      const { data: threads } = await kontenbase
        .service("Threads")
        .find({ where: { channel: getChannel.data._id } });

      setChannelData(getChannel.data);
      setThreadData(threads);
    } catch (error) {
      console.log("err", error);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    getChannelData();
  }, [params?.channelId]);

  const loading = apiLoading;

  return (
    <MainContentContainer>
      <header
        // className={`mb-2 flex items-end justify-between ${
        //   !false && "border-b-2 border-neutral-100 pb-8"
        // }`}
        className={`mb-8 flex items-end justify-between "border-b-2 border-neutral-100 pb-8"
        `}
      >
        <div>
          <h1 className="font-bold text-3xl">{channelData?.name}</h1>
          <p className="text-neutral-500 font-body">Public</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
              <p className="text-lg uppercase text-white">IA</p>
            </div>
          </div>
          <Button
            className="bg-cyan-600 hover:bg-cyan-700 flex items-center"
            onClick={() => {
              createThreadDraft();
            }}
          >
            <BiEdit size={18} className="text-white mr-2" />
            <p className="text-sm text-white font-medium -mb-1">New Thread</p>
          </Button>
          <IconButton size="medium">
            <BiDotsHorizontalRounded size={24} className="text-neutral-400" />
          </IconButton>
        </div>
      </header>
      <ul>
        {loading ? (
          <ContentSkeleton />
        ) : (
          <>
            {threadData?.map((thread, idx) => (
              <ContentItem key={idx} dataSource={thread} />
            ))}
          </>
        )}
      </ul>
    </MainContentContainer>
  );
}

export default ChannelPage;

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

function ChannelPage() {
  const { pathname } = useLocation();

  const params = useParams();
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.auth);
  const userId: any = auth.user.id;

  const { data, isLoading: channelLoading } = useGetChannelByIdQuery(
    params.channelId
  );

  const createThreadDraft = (): void => {
    // const threadsDraft = localStorage.getItem("threadsDraft");
    const uniqueId = Math.floor(Math.random() * 100000);

    // const dataTemplate = {
    //   title: "",
    //   content: "",
    // };
    // if (!threadsDraft) {
    //   localStorage.setItem(
    //     "threadsDraft",
    //     JSON.stringify({
    //       [uniqueId]: dataTemplate,
    //     })
    //   );
    // }
    navigate(`${pathname}/compose/${uniqueId}`);
  };

  useEffect(() => {
    if (!channelLoading) {
      if (!data) throw new Error("Invalid channel");
      if (!data.members.includes(userId)) throw new Error("Invalid channel");
    }
  }, [data, channelLoading]);

  const loading = channelLoading;

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
          <h1 className="font-bold text-3xl">General</h1>
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
              //   console.log("awe");
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
            {data?.threads?.map((thread, idx) => (
              <ContentItem key={idx} />
            ))}
          </>
        )}
      </ul>
    </MainContentContainer>
  );
}

export default ChannelPage;

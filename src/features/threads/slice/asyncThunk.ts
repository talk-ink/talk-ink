import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { kontenbase } from "lib/client";
import { Thread } from "types";

type FetchThreadsProps = {
  type: "inbox" | "threads";
  channelId?: string;
  workspaceId?: string;
  userId?: string;
};

export const fetchThreads = createAsyncThunk(
  "channel/fetchThreads",
  async ({
    type = "threads",
    channelId,
    workspaceId,
    userId,
  }: FetchThreadsProps) => {
    switch (type) {
      case "threads":
        const threadResponse = await kontenbase
          .service("Threads")
          .find({ where: { channel: channelId }, lookup: ["comments"] });

        const parsedThreadsDraft: object = JSON.parse(
          localStorage.getItem("threadsDraft")
        );

        let draft = [];

        if (parsedThreadsDraft) {
          draft = Object.entries(parsedThreadsDraft)
            .map(([key, value]) => ({
              id: key,
              draft: true,
              ...value,
            }))
            .filter((data) => data.channelId === channelId);
        }

        return [...draft, ...threadResponse.data];
      case "inbox":
        const inboxResponse = await kontenbase.service("Threads").find({
          where: {
            workspace: workspaceId,
            tagedUsers: { $in: [userId] },
          },
          lookup: ["comments"],
        });

        const threadData: Thread[] = inboxResponse.data;

        // return threadData.filter((thread) => thread.createdBy._id !== userId);
        return threadData;

      default:
        break;
    }
  }
);

export const fetchComments = createAsyncThunk(
  "channel/thread/fetchComments",
  async ({ threadId, skip }: { threadId: string; skip: number }) => {
    //@ts-ignore
    const { data, count } = await kontenbase.service("Comments").find({
      where: { threads: threadId },
      lookup: ["subComments"],
      skip,
      limit: 10,
      sort: {
        createdAt: -1,
      },
    });

    return {
      comments: data,
      threadId,
      count,
    };
  }
);

export const createComment = createAsyncThunk(
  "channel/thread/createComment",
  async ({
    content,
    threadId,
    tagedUsers,
  }: {
    content: any;
    threadId: string;
    tagedUsers: string[];
  }) => {
    const { data } = await kontenbase.service("Comments").create({
      content,
      threads: [threadId],
    });

    if (tagedUsers.length > 0) {
      const commentHooksUrl: string =
        process.env.REACT_APP_FUNCTION_HOOKS_COMMENT_URL;
      const basicAuth: { username: string; password: string } = {
        username: process.env.REACT_APP_FUNCTION_HOOKS_USERNAME,
        password: process.env.REACT_APP_FUNCTION_HOOKS_PASSWORD,
      };

      await axios.post(
        commentHooksUrl,
        { taggedUsers: tagedUsers, threadId },
        {
          auth: basicAuth,
        }
      );
    }

    return data;
  }
);

export const deleteComment = createAsyncThunk(
  "channel/thread/deleteComment",
  async ({ commentId }: { commentId: string }) => {
    const { data } = await kontenbase.service("Comments").deleteById(commentId);

    return data;
  }
);

export const updateComment = createAsyncThunk(
  "channel/thread/deleteComment",
  async ({ commentId, content }: { commentId: string; content: string }) => {
    const { data } = await kontenbase
      .service("Comments")
      .updateById(commentId, {
        content,
      });

    return data;
  }
);

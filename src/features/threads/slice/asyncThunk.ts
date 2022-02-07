import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { kontenbase } from "lib/client";
import { Thread } from "types";

type FetchThreadsProps = {
  type: "inbox" | "threads" | "trash";
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
        try {
          const threadResponse = await kontenbase.service("Threads").find({
            where: { channel: channelId, isDeleted: { $ne: true } },
            lookup: ["comments"],
          });

          const parsedThreadsDraft: object = JSON.parse(
            localStorage.getItem("threadsDraft")
          );

          let draft = [];

          if (threadResponse.error)
            throw new Error(threadResponse.error.message);

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
        } catch (error) {
          console.log(error);
          return [];
        }

      case "inbox":
        try {
          const inboxResponse = await kontenbase.service("Threads").find({
            where: {
              workspace: workspaceId,
              tagedUsers: { $in: [userId] },
              isDeleted: { $ne: true },
            },
            lookup: ["comments"],
            sort: {
              lastActionAt: -1,
            },
          });

          if (inboxResponse.error) throw new Error(inboxResponse.error.message);

          const threadData: Thread[] = inboxResponse.data;

          return threadData;
        } catch (error) {
          console.log(error);
          return [];
        }

      case "trash":
        try {
          const trashResponse = await kontenbase.service("Threads").find({
            where: {
              workspace: workspaceId,
              createdBy: userId,
              isDeleted: true,
            },
            lookup: ["comments"],
          });

          if (trashResponse.error) throw new Error(trashResponse.error.message);

          const threadData: Thread[] = trashResponse.data;

          return threadData;
        } catch (error) {
          console.log(error);
          return [];
        }
      default:
        break;
    }
  }
);

export const fetchComments = createAsyncThunk(
  "channel/thread/fetchComments",
  async ({ threadId, skip }: { threadId: string; skip: number }) => {
    try {
      //@ts-ignore
      const { data, count, error } = await kontenbase.service("Comments").find({
        where: { threads: threadId },
        lookup: ["subComments"],
        skip,
        limit: 2,
        sort: {
          createdAt: -1,
        },
      });

      if (error) throw new Error(error.message);

      return {
        comments: data,
        threadId,
        count,
      };
    } catch (error) {
      console.log(error);

      return {
        comments: [],
        threadId,
        count: 0,
      };
    }
  }
);

export const createComment = createAsyncThunk(
  "channel/thread/createComment",
  async ({
    content,
    threadId,
    tagedUsers,
    isClosedComment,
    isOpenedComment,
  }: {
    content: any;
    threadId: string;
    tagedUsers: string[];
    isClosedComment?: boolean;
    isOpenedComment?: boolean;
  }) => {
    const { data } = await kontenbase.service("Comments").create({
      content,
      threads: [threadId],
      isClosedComment,
      isOpenedComment,
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

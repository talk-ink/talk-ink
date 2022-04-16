import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { kontenbase } from "lib/client";
import { Thread } from "types";
import { hybridLookup } from "utils/helper";

type FetchThreadsProps = {
  type: "inbox" | "threads" | "trash";
  channelId?: string;
  workspaceId?: string;
  userId?: string;
  limit?: number;
};
type FetchThreadsPaginationProps = {
  type: "inbox" | "threads" | "trash";
  channelId?: string;
  workspaceId?: string;
  userId?: string;
  limit?: number;
  skip?: number;
};

export const fetchThreadsPagination = createAsyncThunk(
  "channel/fetchThreadsPagination",
  async ({
    type = "threads",
    channelId,
    workspaceId,
    userId,
    limit = 30,
    skip = 0,
  }: FetchThreadsPaginationProps) => {
    switch (type) {
      case "threads":
        try {
          const threadResponse = await kontenbase.service("Threads").find({
            where: {
              channel: channelId,
              isDeleted: { $ne: true },
            },
            // @ts-ignore
            lookup: "*",
            limit,
            skip,
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
          return [...draft, ...hybridLookup(threadResponse.data, ["comments"])];
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
            // @ts-ignore
            lookup: "*",
            sort: {
              lastActionAt: -1,
            },
            limit,
            skip,
          });

          if (inboxResponse.error) throw new Error(inboxResponse.error.message);

          const threadData = inboxResponse.data;

          console.log("threadData", threadData);

          return hybridLookup(threadData, ["comments"]);
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
            // @ts-ignore
            lookup: "*",
            limit,
            skip,
          });

          if (trashResponse.error) throw new Error(trashResponse.error.message);

          const threadData: Thread[] = trashResponse.data;

          return hybridLookup(threadData, ["comments"]);
        } catch (error) {
          console.log(error);
          return [];
        }
      default:
        break;
    }
  }
);
export const fetchThreads = createAsyncThunk(
  "channel/fetchThreads",
  async ({
    type = "threads",
    channelId,
    workspaceId,
    userId,
    limit = 50,
  }: FetchThreadsProps) => {
    let returnedData: { data: Thread[]; total: number } = {
      data: [],
      total: 0,
    };
    switch (type) {
      case "threads":
        try {
          const filter = {
            where: { channel: channelId, isDeleted: { $ne: true } },

            lookup: "*",
            limit,
          };
          const threadResponse = await kontenbase
            .service("Threads")
            // @ts-ignore
            .find(filter);
          const { data: dataCount } = await kontenbase
            .service("Threads")
            .count({
              where: filter.where,
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

          returnedData = {
            data: [
              ...draft,
              ...hybridLookup(threadResponse.data, ["comments"]),
            ],
            // total: threadResponse.count,
            total: dataCount.count,
          };
        } catch (error) {
          console.log(error);
          returnedData = {
            data: [],
            total: 0,
          };
        }
        break;

      case "inbox":
        try {
          const filter = {
            where: {
              workspace: workspaceId,
              tagedUsers: { $in: [userId] },
              isDeleted: { $ne: true },
            },
            lookup: "*",
            sort: {
              lastActionAt: -1,
            },
            limit,
          };
          const inboxResponse = await kontenbase
            .service("Threads")
            // @ts-ignore
            .find(filter);
          const { data: dataCount } = await kontenbase
            .service("Threads")
            .count({ where: filter.where });

          if (inboxResponse.error) throw new Error(inboxResponse.error.message);

          const threadData = hybridLookup(inboxResponse.data, ["comments"]);

          returnedData = {
            data: threadData,
            total: dataCount.count,
          };
        } catch (error) {
          console.log(error);
          returnedData = {
            data: [],
            total: 0,
          };
        }
        break;

      case "trash":
        try {
          const trashResponse = await kontenbase.service("Threads").find({
            where: {
              workspace: workspaceId,
              createdBy: userId,
              isDeleted: true,
            },
            // @ts-ignore
            lookup: "*",
            limit,
          });

          if (trashResponse.error) throw new Error(trashResponse.error.message);

          const threadData: Thread[] = trashResponse.data;

          returnedData = {
            data: hybridLookup(threadData, ["comments"]),
            // total: trashResponse.count
            total: 0,
          };
        } catch (error) {
          console.log(error);
          returnedData = {
            data: [],
            total: 0,
          };
        }
        break;
      default:
        break;
    }

    return returnedData;
  }
);

export const fetchComments = createAsyncThunk(
  "channel/thread/fetchComments",
  async ({ threadId, skip }: { threadId: string; skip: number }) => {
    try {
      const filter = {
        where: { threads: threadId },
        lookup: "*",
        skip,
        limit: 2,
        sort: {
          createdAt: -1 as const,
        },
      };

      console.log(filter, "filter");

      const { data, error } = await kontenbase
        .service("Comments")
        // @ts-ignore
        .find({ ...filter });

      if (error) throw new Error(error.message);
      const { data: count, error: countError } = await kontenbase
        .service("Comments")
        .count(filter);
      if (countError) throw new Error(countError.message);

      return {
        comments: hybridLookup(data, ["subComments"]),
        threadId,
        count: count.count,
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
    _tempId,
  }: {
    content: any;
    threadId: string;
    tagedUsers: string[];
    isClosedComment?: boolean;
    isOpenedComment?: boolean;
    _tempId?: string;
  }) => {
    const { data } = await kontenbase.service("Comments").create({
      content,
      threads: [threadId],
      isClosedComment,
      isOpenedComment,
    });
    try {
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
    } catch (error) {
      console.log("err tag createComment");
      console.error(error);
    }

    console.log("createComment", tagedUsers);

    return { ...data, _tempId };
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

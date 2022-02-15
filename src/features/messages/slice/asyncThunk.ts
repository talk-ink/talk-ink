import { createAsyncThunk } from "@reduxjs/toolkit";
import { kontenbase } from "lib/client";

type FetchMessagesProps = {
  toUserId: string;
  loggedUserId: string;
  workspaceId: string;
  limit?: number;
  skip?: number;
};

export const fetchMessages = createAsyncThunk(
  "message/fetchMessages",
  async ({
    toUserId,
    loggedUserId,
    workspaceId,
    limit = 20,
    skip,
  }: FetchMessagesProps) => {
    const response = await kontenbase.service("Messages").find({
      where: { workspace: workspaceId },
      or: [
        { toUser: toUserId, createdBy: loggedUserId },
        { toUser: loggedUserId, createdBy: toUserId },
      ],
      sort: {
        createdAt: -1,
      },
      limit,
      skip,
    });

    return {
      data: response.data
        .map((item) => ({
          ...item,
          _createdById: item?.createdBy?._id,
        }))
        .reverse(),

      _toUserId: toUserId,
      _total: response?.count,
    };
  }
);

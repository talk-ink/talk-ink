import { createAsyncThunk } from "@reduxjs/toolkit";
import { kontenbase } from "lib/client";

type FetchMessagesProps = {
  toUserId: string;
  loggedUserId: string;
  workspaceId: string;
};

export const fetchMessages = createAsyncThunk(
  "message/fetchMessages",
  async ({ toUserId, loggedUserId, workspaceId }: FetchMessagesProps) => {
    const response = await kontenbase.service("Messages").find({
      where: { workspace: workspaceId },
      or: [
        { toUser: toUserId, createdBy: loggedUserId },
        { toUser: loggedUserId, createdBy: toUserId },
      ],
      sort: {
        createdAt: -1,
      },
    });

    return {
      [toUserId]: response.data
        .map((item) => ({
          ...item,
          _createdById: item?.createdBy?._id,
        }))
        .reverse(),
    };
  }
);

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
      // or: [
      //   { toUser: toUserId, createdBy: loggedUserId },
      //   { toUser: loggedUserId, createdBy: toUserId },
      // ],
      or: [{ toUser: loggedUserId }, { createdBy: loggedUserId }],
      sort: {
        createdAt: -1,
      },
    });

    return {
      [toUserId]: response.data
        ?.filter(
          (item) =>
            (item?.toUser?.[0] === toUserId &&
              item?.createdBy?._id === loggedUserId) ||
            (item?.toUser?.[0] === loggedUserId &&
              item?.createdBy?._id === toUserId)
        )
        .map((item) => ({
          ...item,
          _createdById: item?.createdBy?._id,
        }))
        .reverse(),
    };
  }
);

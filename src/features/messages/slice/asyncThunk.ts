import { FindOption } from "@kontenbase/sdk";
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
    limit = 20 as const,
    skip,
  }: FetchMessagesProps) => {
    const filter = {
      where: { workspace: workspaceId },
      sort: {
        createdAt: -1 as const,
      },
      or: [
        { toUser: toUserId, createdBy: loggedUserId },
        { toUser: loggedUserId, createdBy: toUserId },
      ],
      limit,
      skip,
    };

    console.log(filter);

    const response = await kontenbase
      .service("Messages")
      .find({ ...filter, or: filter.or });

    const { data: dataCount } = await kontenbase
      .service("Messages")
      .count({ where: filter.where, or: filter.or });

    return {
      data: response.data
        .map((item) => ({
          ...item,
          _createdById: item?.createdBy?._id,
        }))
        .reverse(),

      _toUserId: toUserId,
      // _total: response?.count,
      _total: dataCount.count,
    };
  }
);

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "types";
import { filterDistinct } from "utils/helper";
import { fetchMessages } from "./asyncThunk";

type MessageState = {
  [key: string]: {
    data: Message[];
    total: number;
  };
} | null;

type InitPageStatusState = {
  messages: MessageState;
  loading: boolean;
  partialLoading: boolean;
};

const initialState: InitPageStatusState = {
  messages: null,
  loading: true,
  partialLoading: true,
};

interface TAddMessage {
  toUserId: string;
  loggedUserId: string;
  message: Message;
  _tempId?: string;
}

interface TAddMessageFromOther extends Omit<TAddMessage, "loggedUserId"> {
  _createdById?: string;
}

interface TDeleteMessage {
  toUserId: string;
  messageId: string;
}

interface TUpdateTempMessage {
  _tempId: string;
  toUserId: string;
  message: Message;
}
interface TUpdateMessage {
  toUserId: string;
  message: Message;
}

interface IFetchMessagePayload {
  data: Message[];
  _toUserId: string;
  _total?: number;
}

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<TAddMessage>) => {
      const newMessage = {
        ...action.payload.message,
        _createdById: action.payload.loggedUserId,
        _tempId: action.payload?._tempId,
      };
      if (!state.messages[action.payload.toUserId]) {
        state.messages[action.payload.toUserId].data = [newMessage];
      } else {
        state.messages[action.payload.toUserId].data = [
          ...state.messages[action.payload.toUserId].data,
          newMessage,
        ];
      }
    },
    addMessageFromOther: (
      state,
      action: PayloadAction<TAddMessageFromOther>
    ) => {
      const newMessage = {
        ...action.payload.message,
        _createdById: action.payload.toUserId,
        _tempId: action.payload?._tempId,
      };

      if (!state.messages[action.payload.toUserId]) {
        state.messages[action.payload.toUserId] = {
          data: [newMessage],
          total: 0,
        };
      } else {
        state.messages[action.payload.toUserId].data = [
          ...state.messages[action.payload.toUserId].data,
          newMessage,
        ];
      }
    },
    deleteMessage: (state, action: PayloadAction<TDeleteMessage>) => {
      state.messages[action.payload.toUserId].data = state.messages[
        action.payload.toUserId
      ].data.filter((item) => {
        if (item._id) return item._id !== action.payload.messageId;
        return item._tempId !== action.payload.messageId;
      });
    },
    clearAllMessage: (state, action) => {
      state.messages = action.payload;
    },
    updateTempMessage: (
      state,
      { payload }: PayloadAction<TUpdateTempMessage>
    ) => {
      const { toUserId, _tempId, message } = payload;

      state.messages[toUserId].data = state.messages[toUserId].data.map(
        (item) => {
          if (item._tempId !== _tempId) return item;
          return { ...item, ...message };
        }
      );
    },
    updateMessage: (state, { payload }: PayloadAction<TUpdateMessage>) => {
      const { toUserId, message } = payload;

      state.messages[toUserId].data = state.messages[toUserId].data.map(
        (item) => {
          if (item._id !== message?._id) return item;
          return { ...item, ...message };
        }
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.pending, (state) => {
      state.loading = true;
      state.partialLoading = true;
    });
    builder.addCase(
      fetchMessages.fulfilled,
      (state, action: PayloadAction<IFetchMessagePayload>) => {
        let newMessages: MessageState | null | undefined;

        if (!state.messages[action.payload._toUserId]) {
          newMessages = {
            ...state.messages,
            [action.payload._toUserId]: {
              data: action.payload.data,
              total: action.payload._total,
            },
          };
        } else {
          newMessages = {
            ...state.messages,
            [action.payload._toUserId]: {
              data: filterDistinct(
                [
                  ...action.payload.data,
                  ...state.messages[action.payload._toUserId].data,
                ],
                "_id"
              ),
              total: action.payload._total,
            },
          };
        }

        state.messages = newMessages;
        state.loading = false;
        state.partialLoading = false;
      }
    );
    builder.addCase(fetchMessages.rejected, (state) => {
      state.loading = false;
      state.partialLoading = false;
    });
  },
});

export const {
  addMessage,
  addMessageFromOther,
  deleteMessage,
  clearAllMessage,
  updateTempMessage,
  updateMessage,
} = messageSlice.actions;
export const messageReducer = messageSlice.reducer;

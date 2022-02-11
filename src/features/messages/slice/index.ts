import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "types";
import { fetchMessages } from "./asyncThunk";

type MessageState = { [key: string]: Message[] } | null;

type InitPageStatusState = {
  messages: MessageState;
  loading: boolean;
};

const initialState: InitPageStatusState = {
  messages: null,
  loading: true,
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
        state.messages[action.payload.toUserId] = [newMessage];
      } else {
        state.messages[action.payload.toUserId] = [
          ...state.messages[action.payload.toUserId],
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
        state.messages[action.payload.toUserId] = [newMessage];
      } else {
        state.messages[action.payload.toUserId] = [
          ...state.messages[action.payload.toUserId],
          newMessage,
        ];
      }
    },
    deleteMessage: (state, action: PayloadAction<TDeleteMessage>) => {
      state.messages[action.payload.toUserId] = state.messages[
        action.payload.toUserId
      ].filter((item) => {
        if (item._id) return item._id !== action.payload.messageId;
        return item._tempId !== action.payload.messageId;
      });
    },
    clearAllMessage: (state, action) => {
      state.messages = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      fetchMessages.fulfilled,
      (state, action: PayloadAction<MessageState>) => {
        state.messages = { ...state.messages, ...action.payload };
        state.loading = false;
      }
    );
    builder.addCase(fetchMessages.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const {
  addMessage,
  addMessageFromOther,
  deleteMessage,
  clearAllMessage,
} = messageSlice.actions;
export const messageReducer = messageSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IComment, ISubComment, Message } from "types";

type BasicMenuType = "close" | "open";

type CommentMenu = {
  data?: IComment | ISubComment | null | undefined;
  type?: BasicMenuType | "reply" | "edit" | "delete" | "reaction";
  category?: "comment" | "subComment" | null | undefined;
};

type MessageMenu = {
  data?: Message;
  type?: BasicMenuType | "delete" | "edit";
};

type MobileMenu = {
  comment: CommentMenu;
  message: MessageMenu;
};

const initialState: MobileMenu = {
  comment: {
    data: null,
    type: "close",
    category: null,
  },
  message: {
    data: null,
    type: "close",
  },
};

const mobileMenuSlice = createSlice({
  name: "mobileMenu",
  initialState,
  reducers: {
    setCommentMenu: (state, action: PayloadAction<CommentMenu>) => {
      state.comment = { ...state.comment, ...action.payload };
    },
    setMessageMenu: (state, action: PayloadAction<MessageMenu>) => {
      state.message = { ...state.message, ...action.payload };
    },
  },
});

export const { setCommentMenu, setMessageMenu } = mobileMenuSlice.actions;
export const mobileMenuReducer = mobileMenuSlice.reducer;

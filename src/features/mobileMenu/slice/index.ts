import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IComment, ISubComment } from "types";

type CommentMenu = {
  data?: IComment | ISubComment | null | undefined;
  type?: "close" | "open" | "reply" | "edit" | "delete" | "reaction";
  category?: "comment" | "subComment" | null | undefined;
};

type MobileMenu = {
  comment: CommentMenu;
};

const initialState: MobileMenu = {
  comment: {
    data: null,
    type: "close",
    category: null,
  },
};

const mobileMenuSlice = createSlice({
  name: "mobileMenu",
  initialState,
  reducers: {
    setCommentMenu: (state, action: PayloadAction<CommentMenu>) => {
      state.comment = { ...state.comment, ...action.payload };
    },
  },
});

export const { setCommentMenu } = mobileMenuSlice.actions;
export const mobileMenuReducer = mobileMenuSlice.reducer;

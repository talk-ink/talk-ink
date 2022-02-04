import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitPageHeaderState = {
  header?: string;
  subHeader?: string;
  privacy?: "public" | "private";
  show?: boolean;
};

const initialState: InitPageHeaderState = {
  header: "",
  subHeader: "",
  privacy: "public",
  show: true,
};

const pageHeader = createSlice({
  name: "pageHeader",
  initialState,
  reducers: {
    setPageHeader: (state, action: PayloadAction<InitPageHeaderState>) => {
      state.header = action.payload.header ?? state.header;
      state.subHeader = action.payload.subHeader ?? state.subHeader;
      state.privacy = action.payload.privacy ?? state.privacy;
      state.show = action.payload.show ?? state.show;
    },
  },
});

export const { setPageHeader } = pageHeader.actions;
export const pageHeaderReducer = pageHeader.reducer;

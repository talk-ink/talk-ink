import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";

import { authReducer } from "features/auth";
import { channelReducer } from "features/channels/slice";
import { workspaceReducer } from "features/workspaces";
import { threadReducer } from "features/threads";
import { toastReducer } from "features/toast/slice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["thread", "toast"],
};

const appReducer = combineReducers({
  auth: authReducer,
  workspace: workspaceReducer,
  channel: channelReducer,
  thread: threadReducer,
  toast: toastReducer,
});

const persistedReducer = persistReducer(persistConfig, appReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

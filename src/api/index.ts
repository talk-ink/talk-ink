import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AuthState } from "types";

const apiUrl = process.env.REACT_APP_KONTENBASE_API_URL;
const apiKey = process.env.REACT_APP_KONTENBASE_API_KEY;

const baseQuery = fetchBaseQuery({
  baseUrl: apiUrl + apiKey,
  prepareHeaders: (headers, { getState }) => {
    const { token } = getState() as AuthState;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  baseQuery,
  endpoints: () => ({}),
});

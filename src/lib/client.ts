import { KontenbaseClient } from "@kontenbase/sdk";

const apiKey: string = `${process.env.REACT_APP_KONTENBASE_API_KEY}`;

export const kontenbase = new KontenbaseClient({
  apiKey,
});

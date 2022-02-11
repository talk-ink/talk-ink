import { RealtimeEventTypes, RealtimeMessage } from "@kontenbase/sdk";
import { kontenbase } from "lib/client";
import { useEffect, useMemo, useState } from "react";

type VariablesDependencies = {
  [key: string]: any;
  workspaceId: string;
};

type HooksVariables = {
  dependencies: VariablesDependencies;
  event: RealtimeEventTypes;
  service: string;
};

type HooksProps = {
  variables?: HooksVariables;
  onRequestSuccess?: (message: RealtimeMessage | null | undefined) => void;
  onRequestError?: (error: string) => void;
};

export const useKontenbaseRealtime = (props: HooksProps) => {
  const { variables, onRequestSuccess, onRequestError } = props;

  const { dependencies, service, event } = variables;

  const [actionPayload, setActionPayload] = useState<
    RealtimeMessage | null | undefined
  >();

  const strProps = useMemo(() => {
    return JSON.stringify(dependencies);
  }, [dependencies]);

  useEffect(() => {
    let key: string | null | undefined;
    console.log("hookmnt");

    if (!variables?.dependencies?.workspaceId) return;

    kontenbase.realtime
      .subscribe(service, { event }, (message) => {
        try {
          if (message.error) throw new Error(message.error.message);
          onRequestSuccess(message);
          setActionPayload(message);
        } catch (error: any) {
          console.log("useKontenbaseRealtime err", error);
          onRequestError(error?.message);
        }
      })
      .then((result) => (key = result));

    return () => {
      console.log("hookumnt");
      kontenbase.realtime.unsubscribe(key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strProps]);

  return { data: actionPayload };
};

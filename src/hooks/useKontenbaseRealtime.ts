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
  where?: Partial<unknown>;
};

// type OnEventActionTypes = "any" | "create" | "update" | "delete";
type HooksProps = {
  variables?: HooksVariables;
  onRequestSuccess?: (message: RealtimeMessage | null | undefined) => any;
  onCreatedRecord?: (message: RealtimeMessage | null | undefined) => any;
  onUpdatedRecord?: (message: RealtimeMessage | null | undefined) => any;
  onDeletedRecord?: (message: RealtimeMessage | null | undefined) => any;
  onRequestError?: (error: string) => void;
  filter?: (message?: RealtimeMessage | null | undefined) => boolean;
};

export const useKontenbaseRealtime = (props: HooksProps) => {
  const {
    variables,
    onRequestSuccess = () => {},
    onCreatedRecord = () => {},
    onUpdatedRecord = () => {},
    onDeletedRecord = () => {},
    onRequestError = () => {},
    filter = () => true,
  } = props;

  const { dependencies, service, event, where } = variables;

  const [actionPayload, setActionPayload] = useState<
    RealtimeMessage | null | undefined
  >();

  const strProps = useMemo(() => {
    return JSON.stringify(dependencies);
  }, [dependencies]);

  useEffect(() => {
    let key: string | null | undefined;
    console.log("useKontenbaseRealtime mount", service);

    if (!variables?.dependencies?.workspaceId) return;

    kontenbase.realtime
      .subscribe(service, { event, where }, (message) => {
        try {
          if (message.error) throw new Error(message.error.message);

          if (!filter(message)) return;

          switch (message.event) {
            case "CREATE_RECORD":
              onCreatedRecord(message);
              break;
            case "UPDATE_RECORD":
              onUpdatedRecord(message);
              break;
            case "DELETE_RECORD":
              onDeletedRecord(message);
              break;
            default:
              break;
          }
          onRequestSuccess(message);
          setActionPayload(message);
        } catch (error: any) {
          console.log("useKontenbaseRealtime err", error);
          onRequestError(error?.message);
        }
      })
      .then((result) => (key = result));

    return () => {
      console.log("useKontenbaseRealtime unmount", service);
      setActionPayload(null);
      kontenbase.realtime.unsubscribe(key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strProps]);

  return { data: actionPayload };
};

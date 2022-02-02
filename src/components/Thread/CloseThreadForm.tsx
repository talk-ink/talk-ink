import { useMemo } from "react";

import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import { kontenbase } from "lib/client";
import moment from "moment-timezone";
import axios from "axios";

import Button from "components/Button/Button";

import { useAppSelector } from "hooks/useAppSelector";
import { useToast } from "hooks/useToast";
import { Channel, Thread } from "types";
import { useAppDispatch } from "hooks/useAppDispatch";
import { updateThread } from "features/threads";
import { createComment } from "features/threads/slice/asyncThunk";
import { notificationUrl } from "utils/helper";

type Props = {
  data: Thread;
  onClose?: () => void;

  from?: "inbox" | null;
};

type InitialValuesProps = {
  closeDescription: string;
};

const NOTIFICATION_API: string = notificationUrl;

function CloseThreadForm({ data, onClose, from }: Props) {
  const [showToast] = useToast();

  const auth = useAppSelector((state) => state.auth);
  const channel = useAppSelector((state) => state.channel);
  const dispatch = useAppDispatch();

  const channelData: Channel = useMemo(() => {
    return channel.channels.find(
      (channel) => channel._id === data.channel?.[0]
    );
  }, [channel.channels]);

  const initialValues: InitialValuesProps = {
    closeDescription: "",
  };

  const handleSubmit = async (values: InitialValuesProps) => {
    try {
      const now = moment().tz("Asia/Jakarta").toDate();

      const payload = {
        isClosed: true,
        closedBy: [auth.user._id],
        closeDescription: values.closeDescription,
        closedAt: now,
      };

      let _invitedUsers: string[] = channelData.members.filter(
        (item) => item !== auth.user._id
      );

      dispatch(
        createComment({
          content: values.closeDescription,
          threadId: data._id,
          tagedUsers: [],
          isClosedComment: true,
        })
      );

      const { data: closeData, error: closeError } = await kontenbase
        .service("Threads")
        .updateById(data._id, payload);

      if (closeError) throw new Error(closeError.message);

      if (_invitedUsers.length > 0) {
        axios.post(NOTIFICATION_API, {
          title: `${auth?.user.firstName} closed "${data.name}" thread`,
          description: values.closeDescription.replace(/(<([^>]+)>)/gi, ""),
          externalUserIds: _invitedUsers,
        });
      }

      dispatch(updateThread({ ...data, ...payload }));

      if (closeData) {
        onClose();
      }
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  return (
    <div className="w-full">
      <div className="rounded border border-neutral-200 p-2">
        <h3 className="font-semibold">{data.name}</h3>
        <p className="text-xs text-neutral-500">
          #{from !== "inbox" ? channelData.name : "Inbox"}
        </p>
      </div>
      <p className="text-sm my-3">
        This change will be noted in the thread along with the conclusion.
        Anyone can reopen a thread anytime.
      </p>
      <p className="font-semibold text-sm mb-3">Conclusion</p>
      <div className="rounded-md border border-neutral-200 p-2 min-h-[30vh]">
        <textarea
          className="outline-none resize-none w-full text-sm"
          placeholder="Type conclusion for this thread"
          onChange={formik.handleChange("closeDescription")}
          value={formik.values.closeDescription}
        />
      </div>
      <form
        onSubmit={formik.handleSubmit}
        className="pt-2 flex items-center justify-end gap-2"
      >
        <Button
          className="text-sm flex items-center justify-center hover:bg-neutral-50 min-w-[5rem]"
          onClick={() => {
            onClose();
          }}
        >
          Cancel
        </Button>

        <Button
          className="text-sm flex items-center justify-center bg-indigo-500 min-w-[5rem] text-white"
          type="submit"
        >
          Close Thread
        </Button>
      </form>
    </div>
  );
}

export default CloseThreadForm;

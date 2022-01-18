import Button from "components/Button/Button";
import { updateChannel } from "features/channels/slice";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useToast } from "hooks/useToast";
import { kontenbase } from "lib/client";
import React, { useState } from "react";
import { Channel, CreateChannel } from "types";
import ChannelForm from "./ChannelForm";

type TProps = {
  data: Channel;
  onClose: () => void;
};

function EditChannelForm({ data, onClose }: TProps) {
  const dispatch = useAppDispatch();
  const [showToast] = useToast();

  const onSubmit = async (value: CreateChannel) => {
    try {
      await kontenbase.service("Channels").updateById(data._id, value);

      dispatch(updateChannel({ _id: data._id, ...value }));
      onClose();
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    }
  };

  return (
    <div className="pt-2 pb-3">
      <ChannelForm
        onSubmit={onSubmit}
        loading={false}
        onCancel={onClose}
        editedData={data}
      />
    </div>
  );
}

export default EditChannelForm;

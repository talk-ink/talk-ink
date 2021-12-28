import Button from "components/Button/Button";
import { updateChannel } from "features/channels/slice";
import { useAppDispatch } from "hooks/useAppDispatch";
import { kontenbase } from "lib/client";
import React, { useState } from "react";
import { Channel, CreateChannel } from "types";
import ChannelForm from "./ChannelForm";

type TProps = {
  data: Channel;
  onClose: () => void;
};

function EditChannelForm({ data, onClose }: TProps) {
  const [edit, setEdit] = useState(false);
  const dispatch = useAppDispatch();

  const onSubmit = async (value: CreateChannel) => {
    try {
      await kontenbase.service("Channels").updateById(data._id, value);

      dispatch(updateChannel({ _id: data._id, ...value }));
      onClose();
    } catch (error) {
      console.log("err", error);
    }
  };
  const privacyStr = {
    public: "Public",
    private: "Private",
  };

  return (
    <div className="pt-2 pb-3">
      {!edit && (
        <>
          <div className="flex justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold">{data.name}</h2>
              <p className="text-sm text-neutral-500">
                {privacyStr[data.privacy]}
              </p>
            </div>
            <div>
              <Button
                className="text-sm font-semibold bg-neutral-100 hover:bg-neutral-200"
                onClick={() => {
                  setEdit(true);
                }}
              >
                Edit Channel
              </Button>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Description</p>
            <p className="text-xs">{data.description}</p>
          </div>
        </>
      )}
      {edit && (
        <ChannelForm
          onSubmit={onSubmit}
          loading={false}
          onCancel={() => {
            setEdit(false);
          }}
          editedData={data}
        />
      )}
    </div>
  );
}

export default EditChannelForm;

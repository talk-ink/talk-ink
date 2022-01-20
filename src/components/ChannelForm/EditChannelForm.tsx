import ChannelForm from "./ChannelForm";

import { useAppDispatch } from "hooks/useAppDispatch";
import { useToast } from "hooks/useToast";

import { updateChannel } from "features/channels/slice";
import { kontenbase } from "lib/client";
import { Channel, CreateChannel } from "types";

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

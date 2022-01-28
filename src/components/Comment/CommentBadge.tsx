import { BiPlusCircle } from "react-icons/bi";

import Button from "components/Button/Button";

type TProps = {
  name: string;
  onInvited?: () => void;
  onCancel?: () => void;
};

function CommentBadge({ name, onInvited, onCancel }: TProps) {
  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 p-3 bg-slate-800 rounded-md flex items-center justify-between z-10">
      <div className="flex items-center mr-5">
        <BiPlusCircle className="text-white mr-2" size={18} />
        <p className="text-sm text-white max-w-sm whitespace-nowrap overflow-hidden text-ellipsis mr-1">
          Invite <strong>{name}</strong> to this channel?
        </p>
      </div>
      <Button
        className="text-sm text-indigo-500 hover:bg-slate-700 mr-2"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button className="text-sm text-white bg-indigo-500" onClick={onInvited}>
        Invite
      </Button>
    </div>
  );
}

export default CommentBadge;

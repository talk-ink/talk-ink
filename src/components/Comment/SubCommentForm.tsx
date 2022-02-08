import React from "react";
import Select from "react-select";

import Button from "components/Button/Button";

import { useRemirror } from "@remirror/react";
import { extensions } from "components/Remirror/extensions";
import { htmlToProsemirrorNode } from "remirror";
import { parseContent } from "utils/helper";
import Remirror from "components/Remirror";
import { IComment } from "types";
import { MdSend } from "react-icons/md";
import IconButton from "components/Button/IconButton";
import { useMediaQuery } from "react-responsive";

interface INotifiedOption {
  value: string;
  label: string;
  color?: string;
  isFixed?: boolean;
  flag: number;
}

interface IProps {
  comment: IComment;
  selectedNotifiedOptions: INotifiedOption[];
  setSelectedNotifiedOptions: React.Dispatch<
    React.SetStateAction<INotifiedOption[]>
  >;
  notifiedOptions: INotifiedOption[];
  discardSubComment: () => void;
  handleCreateSubComment: (subCommentData: any) => void;
}

const SubCommentForm: React.FC<IProps> = ({
  comment,
  selectedNotifiedOptions,
  setSelectedNotifiedOptions,
  notifiedOptions,
  handleCreateSubComment,
  discardSubComment,
}) => {
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });
  const { manager, state, onChange } = useRemirror({
    extensions: () =>
      extensions(true, `Reply to ${comment.createdBy?.firstName}`),
    stringHandler: htmlToProsemirrorNode,
    content: "",
    selection: "end",
  });

  return (
    <div className="flex flex-col justify-between px-2 border-solid border-[1px] border-light-blue-500 rounded-md mb-2">
      <div>
        <div className="mt-1 flex w-full items-center">
          <div className="mr-2">
            <div className="md:bg-gray-200 w-fit px-2 py-[2.9px]  rounded-sm  text-sm">
              Tag:
            </div>
          </div>
          <Select
            value={selectedNotifiedOptions}
            onChange={(e: any) => {
              setSelectedNotifiedOptions(e);
            }}
            isClearable={false}
            className="text-sm custom-select "
            closeMenuOnSelect={false}
            defaultValue={[notifiedOptions?.[0]]}
            isMulti
            options={notifiedOptions}
            placeholder="Select Tags"
            //@ts-ignore
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
            styles={{
              valueContainer: (base) => ({
                ...base,
                width: "max-content",
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: isMobile ? "white" : "#e9ecef",
              }),
              container: (base) => ({
                ...base,
                width: "100%",
              }),
              menuList: (base) => ({
                ...base,
                maxWidth: 300,
              }),
            }}
          />
        </div>
        <Remirror
          remmirorProps={{ manager, onChange, state }}
          fromComment
          listMentions={notifiedOptions
            ?.filter((item) => item.flag === 3 && item.label !== "Your Self")
            ?.map((item) => ({
              id: item.value,
              label: item.label,
            }))}
        />
      </div>
      <div className="flex justify-end -mt-9">
        <div className="flex items-center py-2">
          {!isMobile && (
            <Button
              type="submit"
              className="mr-3 text-sm flex items-center justify-center bg-indigo-100 min-w-[5rem] text-black"
              onClick={discardSubComment}
            >
              Discard
            </Button>
          )}

          {!isMobile && (
            <Button
              type="submit"
              className="text-sm flex items-center justify-center bg-indigo-500 min-w-[5rem] text-white"
              onClick={() => handleCreateSubComment(state)}
            >
              Post
            </Button>
          )}

          {isMobile && (
            <IconButton
              size="medium"
              onClick={() => handleCreateSubComment(state)}
              className="z-50"
            >
              <MdSend size={20} className="text-indigo-500 " />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
};

SubCommentForm.propTypes = {};

export default SubCommentForm;

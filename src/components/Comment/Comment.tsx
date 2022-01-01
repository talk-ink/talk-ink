import React from "react";

import Avatar from "components/Avatar/Avatar";
import ReactMoment from "react-moment";

import Preview from "components/Editor/Preview";

import { IComment } from "types";

interface IProps {
  comment: IComment;
}

const Comment: React.FC<IProps> = ({ comment }) => {
  return (
    <div className="flex items-start mb-8 ">
      <Avatar src="https://picsum.photos/100" />
      <div className="prose flex-grow-0 ml-4">
        <div className="-mt-1.5 flex items-center justify-start">
          <p className=" font-semibold mb-0 mt-0 mr-2">
            {comment.createdBy?.firstName}
          </p>{" "}
          <p className="mb-0 mt-0 text-xs">
            <ReactMoment format="DD/MM/YYYY">
              {comment?.updatedAt || comment?.createdAt}
            </ReactMoment>
          </p>
        </div>
        <Preview content={comment.content} />
      </div>
    </div>
  );
};

Comment.propTypes = {};

export default Comment;

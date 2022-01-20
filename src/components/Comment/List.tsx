import React from "react";

import Comment from "components/Comment/Comment";
import { IComment, Member } from "types";

interface IProps {
  dataSource: IComment[];
  listRef?: React.LegacyRef<HTMLDivElement>;
  memberList: Member[];
  threadId: string;
}

const List: React.FC<IProps> = ({
  dataSource,
  listRef,
  memberList,
  threadId,
}) => {
  return (
    <div>
      {dataSource.length > 0 &&
        dataSource.map((item, index) => (
          <Comment
            comment={item}
            key={index}
            memberList={memberList}
            threadId={threadId}
          />
        ))}
      <div ref={listRef} />
    </div>
  );
};

export default List;

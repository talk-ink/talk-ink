import React from "react";

import Comment from "components/Comment/Comment";
import { IComment, Member, Thread } from "types";

interface IProps {
  dataSource: IComment[];
  listRef?: React.LegacyRef<HTMLDivElement>;
  memberList: Member[];
  threadId: string;
  threadName: string;
  threadData?: Thread;
}

const List: React.FC<IProps> = ({
  dataSource,
  listRef,
  memberList,
  threadId,
  threadName,
  threadData,
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
            threadName={threadName}
            threadData={threadData}
          />
        ))}
      <div ref={listRef} />
    </div>
  );
};

export default List;

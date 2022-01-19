import React, { Fragment } from "react";

import Comment from "components/Comment/Comment";
import { IComment, Member } from "types";

interface IProps {
  dataSource: IComment[];
  listRef?: React.LegacyRef<HTMLDivElement>;
  memberList: Member[];
}

const List: React.FC<IProps> = ({ dataSource, listRef, memberList }) => {
  return (
    <div>
      {dataSource.map((item, index) => (
        <Comment comment={item} key={index} memberList={memberList} />
      ))}
      <div ref={listRef} />
    </div>
  );
};

export default List;

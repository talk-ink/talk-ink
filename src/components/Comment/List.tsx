import React, { Fragment } from "react";

import Comment from "components/Comment/Comment";
import { IComment } from "types";

interface IProps {
  dataSource: IComment[];
  listRef?: React.LegacyRef<HTMLDivElement>;
}

const List: React.FC<IProps> = ({ dataSource, listRef }) => {
  return (
    <div>
      {dataSource.map((item, index) => (
        <Comment comment={item} key={index} />
      ))}
      <div ref={listRef} />
    </div>
  );
};

export default List;

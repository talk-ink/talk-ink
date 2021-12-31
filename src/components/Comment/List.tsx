import React from "react";

import CommentC from "components/Comment/Comment";
import { IComment } from "types";

interface IProps {
  dataSource: IComment[];
}

const List: React.FC<IProps> = ({ dataSource }) => {
  return (
    <>
      {dataSource.map((item, index) => (
        <CommentC comment={item} key={index} />
      ))}
    </>
  );
};

export default List;

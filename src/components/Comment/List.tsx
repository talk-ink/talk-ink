import React, { Fragment } from "react";

import Comment from "components/Comment/Comment";
import { IComment } from "types";

interface IProps {
  dataSource: IComment[];
}

const List: React.FC<IProps> = ({ dataSource }) => {
  return (
    <div>
      {dataSource.map((item, index) => (
        <Comment comment={item} key={index} />
      ))}
    </div>
  );
};

export default List;

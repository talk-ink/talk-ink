import React, { useEffect, useState } from "react";

import { cx } from "remirror";

import { useMentionAtom, FloatingWrapper } from "@remirror/react";

type User = {
  id: string;
  label: string;
};

interface IProps {
  allUsers: User[];
}

const UserSuggestor: React.FC<IProps> = ({ allUsers }) => {
  const [users, setUsers] = useState([]);
  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } =
    useMentionAtom({
      items: users,
    });

  useEffect(() => {
    if (!state) {
      return;
    }

    const searchTerm = state.query.full.toLowerCase();
    const filteredUsers = allUsers
      .filter((user) => user.label.toLowerCase().includes(searchTerm))
      .sort()
      .slice(0, 3);
    setUsers(filteredUsers);
  }, [state]);

  const enabled = !!state;

  return (
    <FloatingWrapper positioner="cursor" enabled={enabled} placement="auto">
      <div {...getMenuProps()} className="suggestions">
        {enabled &&
          users.map((user, index) => {
            const isHighlighted = indexIsSelected(index);
            const isHovered = indexIsHovered(index);

            return (
              <div
                key={user.id}
                className={cx(
                  "suggestion",
                  isHighlighted && "highlighted",
                  isHovered && "hovered"
                )}
                {...getItemProps({
                  item: user,
                  index,
                })}
              >
                {user.label}
              </div>
            );
          })}
      </div>
    </FloatingWrapper>
  );
};

export default UserSuggestor;

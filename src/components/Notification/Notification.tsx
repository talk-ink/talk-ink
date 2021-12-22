import React from "react";

type Props = React.PropsWithChildren<{
  active?: boolean;
  message?: string;
}>;

function Notification({ active, message }: Props) {
  return (
    <div className="absolute top-5 right-5 p-5 opacity-100 bg-white shadow-lg rounded-md transition-opacity">
      notifications
    </div>
  );
}

export default Notification;

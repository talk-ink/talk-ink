import { useState, useEffect } from "react";

type PropsDelay = React.PropsWithChildren<{
  waitBeforeShow?: number;
}>;

const Delayed = ({ children, waitBeforeShow = 100 }: PropsDelay) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timer = () =>
      setTimeout(() => {
        setIsShown(true);
      }, waitBeforeShow);

    const timerId = timer();

    return () => {
      clearTimeout(timerId);
    };
  }, [waitBeforeShow]);

  return isShown ? <>{children}</> : null;
};

export default Delayed;

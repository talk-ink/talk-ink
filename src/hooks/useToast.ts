import { Toast } from "types";
import { useAppDispatch } from "./useAppDispatch";
import { setToast } from "features/toast";

export const useToast = () => {
  const dispatch = useAppDispatch();

  const showToast = ({ message, duration = 3000 }: Toast) => {
    dispatch(setToast({ message, duration }));
  };

  return [showToast];
};

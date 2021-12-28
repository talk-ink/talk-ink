import { setToast } from "features/toast";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

type TProps = {
  children: React.ReactNode;
};

function ToastProvider({ children }: TProps) {
  const toast = useAppSelector((state) => state.toast);
  const dispatch = useAppDispatch();

  const visible = useMemo(() => {
    return toast.message;
  }, [toast.message]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        dispatch(setToast({ message: null }));
      }, toast.duration);
    }
  }, [visible]);

  return (
    <div>
      {children}
      {visible && (
        <div className="absolute top-0 right-0 px-5 py-3 bg-slate-800 text-sm text-white m-5 rounded-md z-[999999]">
          {visible}
        </div>
      )}
    </div>
  );
}

export default ToastProvider;

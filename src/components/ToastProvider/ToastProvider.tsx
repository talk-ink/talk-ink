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
import { VscClose } from "react-icons/vsc";

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
        <div
          className={`absolute top-0 right-0 px-3 py-2 bg-slate-800 text-sm text-white m-5 rounded-md z-[999999] flex items-center ${
            visible ? "animate-showToast" : ""
          }`}
        >
          {visible}
          <button
            className="outline-none h-8 w-8 hover:bg-slate-700 flex items-center justify-center ml-2 rounded-full"
            onClick={() => dispatch(setToast({ message: null }))}
          >
            <VscClose size={20} className="text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ToastProvider;

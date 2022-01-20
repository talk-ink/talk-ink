import Button from "components/Button/Button";
import React from "react";

import { GrClose } from "react-icons/gr";

type TProps = React.PropsWithChildren<{
  header?: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  visible?: any;
  children?: React.ReactNode;
  okButtonText?: string;
  cancelButtonText?: string;
  okButtonProps?: object;
  cancelButtonProps?: object;
  footer?: React.ReactNode | null;
  size?: "xs" | "small" | "medium" | "large";
}>;

function Modal({
  header = "Modal",
  onClose = () => {},
  onConfirm = () => {},
  onCancel = () => {},
  children,
  visible,
  okButtonText = "OK",
  cancelButtonText = "Cancel",
  okButtonProps = {},
  cancelButtonProps = {},
  footer,
  size = "medium",
}: TProps) {
  const modalContentSize = {
    xs: "w-4/12 2xl:w-3/12",
    small: "w-5/12 2xl:w-4/12",
    medium: "w-6/12 2xl:w-5/12",
    large: "w-7/12 2xl:w-6/12",
  };
  return visible ? (
    <div
      id="modal-container"
      className="w-screen min-h-screen absolute bg-[rgba(0,0,0,0.5)] top-0 left-0 flex justify-center items-start z-[9999]"
      onClick={(e: any) => {
        if (e?.target?.id === "modal-container") {
          onClose();
        }
      }}
    >
      <div
        className={`${modalContentSize[size]} h-auto bg-white rounded-lg mt-20`}
      >
        <header className="flex items-center justify-between p-3">
          <h2 className="text-lg font-bold -mb-1">{header}</h2>
          <button onClick={onClose}>
            <GrClose size={18} />
          </button>
        </header>
        <div className="p-3">{children}</div>
        {footer && footer}
        {footer !== null && (
          <div className="p-3 flex items-center justify-end gap-2">
            <Button
              className="text-sm flex items-center justify-center hover:bg-neutral-50 min-w-[5rem]"
              {...cancelButtonProps}
              onClick={onCancel}
            >
              {cancelButtonText}
            </Button>
            <Button
              className="text-sm flex items-center justify-center bg-indigo-500 min-w-[5rem] text-white"
              {...okButtonProps}
              onClick={onConfirm}
            >
              {okButtonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  ) : (
    <></>
  );
}

export default Modal;

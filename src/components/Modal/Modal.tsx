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
}: TProps) {
  return visible ? (
    <div className="w-screen h-screen absolute bg-[rgba(0,0,0,0.5)] top-0 left-0 flex justify-center items-start overflow-hidden">
      <div className="w-5/12 h-auto bg-white rounded-lg mt-20">
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
              className="text-sm flex items-center justify-center bg-cyan-500 min-w-[5rem] text-white"
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

import Button from "components/Button/Button";
import React from "react";

import { GrClose } from "react-icons/gr";
import SettingsSidebar from "./SettingsSidebar";

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

function SettingsModal({
  onClose = () => {},
  onConfirm = () => {},
  onCancel = () => {},
  children,
  visible,
  footer,
}: TProps) {
  return visible ? (
    <div className="w-screen min-h-screen absolute bg-[rgba(0,0,0,0.5)] top-0 left-0 flex justify-center items-start z-[9999]">
      <div className="w-7/12 h-[70vh] bg-white rounded-lg mt-20 overflow-hidden">
        <div className="grid grid-cols-[250px_1fr] h-full">
          <SettingsSidebar />
          <div>
            <header className="flex items-center justify-between p-3 border-b border-neutral-100">
              <h2 className="text-lg font-bold -mb-1">{"header"}</h2>
              <button onClick={onClose}>
                <GrClose size={18} />
              </button>
            </header>
            <div className="p-3">{children}</div>
            {/* {footer !== null && (
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
        )} */}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}

export default SettingsModal;

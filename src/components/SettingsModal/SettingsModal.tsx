import Button from "components/Button/Button";
import AddMembers from "components/Members/AddMembers";
import React, { useState } from "react";

import { GrClose } from "react-icons/gr";
import { SettingsModalHeader } from "utils/text-constants";
import GeneralSettings from "./GeneralSettings";
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
  const [currentRoute, setCurrentRoute] = useState({
    route: "member",
    current: "member",
  });

  const settingsRender = (type: string) => {
    switch (type) {
      case "members":
        return <AddMembers />;
      case "general":
        return <GeneralSettings />;
      default:
        break;
    }
  };

  return visible ? (
    <div className="w-screen min-h-screen absolute bg-[rgba(0,0,0,0.5)] top-0 left-0 flex justify-center items-start z-[9999]">
      <div className="w-7/12 h-[75vh] bg-white rounded-lg mt-20 overflow-hidden">
        <div className="grid grid-cols-[250px_1fr] h-full">
          <SettingsSidebar
            currentActive={currentRoute.route}
            setCurrentActive={(value) => {
              setCurrentRoute({
                route: value,
                current: value,
              });
            }}
          />
          <div>
            <header className="flex items-center justify-between p-3 border-b border-neutral-100">
              <h2 className="text-lg font-bold -mb-1">
                {SettingsModalHeader[currentRoute.current]}
              </h2>
              <button onClick={onClose}>
                <GrClose size={18} />
              </button>
            </header>
            <div className="p-3">{settingsRender(currentRoute.route)}</div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}

export default SettingsModal;

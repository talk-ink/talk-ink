import React, { useState } from "react";

import { BiArrowBack, BiMenu } from "react-icons/bi";
import { GrClose } from "react-icons/gr";

import AddMembers from "components/Members/AddMembers";
import AccountSettings from "./AccountSettings";
import ComingSoonSettings from "./ComingSoon";
import GeneralSettings from "./GeneralSettings";
import ProfileSettings from "./ProfileSettings";
import SettingsSidebar from "./SettingsSidebar";

import { SettingsModalRouteState } from "types";
import { SettingsModalHeader } from "utils/text-constants";
import { useMediaQuery } from "react-responsive";

type TProps = React.PropsWithChildren<{
  onClose?: () => void;
  visible?: any;
}>;

function SettingsModal({
  onClose = () => {},

  visible,
}: TProps) {
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });

  const [currentRoute, setCurrentRoute] = useState<SettingsModalRouteState>({
    route: "members",
    current: "members",
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const settingsRender = (type: string) => {
    switch (type) {
      case "members":
        return (
          <AddMembers
            currentRoute={currentRoute}
            setCurrentRoute={setCurrentRoute}
          />
        );
      case "general":
        return (
          <GeneralSettings
            currentRoute={currentRoute}
            setCurrentRoute={setCurrentRoute}
          />
        );
      case "account":
        return (
          <AccountSettings
            currentRoute={currentRoute}
            setCurrentRoute={setCurrentRoute}
          />
        );
      case "profile":
        return (
          <ProfileSettings
            currentRoute={currentRoute}
            setCurrentRoute={setCurrentRoute}
          />
        );
      default:
        return <ComingSoonSettings />;
    }
  };

  return visible ? (
    <div
      id="modal-container"
      className="w-screen min-h-screen fixed bg-[rgba(0,0,0,0.5)] top-0 left-0 flex justify-center items-start z-[9999]"
      onClick={(e: any) => {
        if (e?.target?.id === "modal-container") {
          onClose();
        }
      }}
    >
      <div className="w-screen md:w-7/12 h-screen md:h-[75vh] bg-white md:rounded-lg md:mt-20 overflow-hidden">
        <div className="md:grid md:grid-cols-[250px_1fr] h-full max-h-full overflow-hidden">
          <SettingsSidebar
            currentActive={currentRoute.route}
            setCurrentActive={(value) => {
              setCurrentRoute({
                route: value,
                current: value,
              });
            }}
            isMobile={isMobile}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <div className="overflow-auto h-screen md:max-h-[75vh]">
            <header className="flex items-center justify-between p-3 border-b border-neutral-100">
              <div className="flex gap-2 items-center">
                {currentRoute.route !== currentRoute.current && (
                  <button
                    onClick={() => {
                      setCurrentRoute((prev) => ({
                        route: prev.route,
                        current: prev.route,
                      }));
                    }}
                    className="hover:bg-neutral-200 p-1 rounded"
                  >
                    <BiArrowBack size={18} />
                  </button>
                )}
                <h2 className="text-lg font-bold">
                  {SettingsModalHeader[currentRoute.current]}
                </h2>
              </div>
              <button
                onClick={() => {
                  setCurrentRoute({ route: "members", current: "members" });
                  onClose();
                }}
                className="hover:bg-neutral-200 p-1 rounded"
              >
                <GrClose size={18} />
              </button>
            </header>
            <div className="h-full">
              <div className="p-3 h-full">
                {settingsRender(currentRoute.route)}
              </div>
              {isMobile && (
                <div className="fixed top-1/2 left-2 transform -translate-y-1/2 bg-indigo-500 h-8 w-8 flex items-center justify-center rounded-full shadow-md">
                  <BiMenu
                    size={16}
                    onClick={() => setIsSidebarOpen((prev) => !prev)}
                    className="text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}

export default SettingsModal;

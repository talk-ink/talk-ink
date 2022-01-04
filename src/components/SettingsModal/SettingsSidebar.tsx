import React, { useMemo, useState } from "react";
import SidebarButton from "components/SettingsModal/SidebarButton";
import { useAppSelector } from "hooks/useAppSelector";
import {
  BiBell,
  BiCreditCardFront,
  BiCustomize,
  BiImport,
  BiMoon,
  BiSliderAlt,
  BiUser,
  BiUserPlus,
} from "react-icons/bi";
import { RiAccountCircleFill } from "react-icons/ri";
import { useParams } from "react-router-dom";

function SettingsSidebar() {
  const params = useParams();

  const auth = useAppSelector((state) => state.auth);
  const workspace = useAppSelector((state) => state.workspace);

  const workspaceData = useMemo(() => {
    return workspace.workspaces.find((data) => data._id === params.workspaceId);
  }, [workspace.workspaces, params.workspaceId]);

  const [currentActive, setCurrentActive] = useState("members");

  return (
    <div className="bg-[#F7FAFB]">
      <header className="flex items-center p-3">
        <h2 className="text-lg font-bold -mb-1">Settings</h2>
      </header>
      <div className="p-3">
        <div className="mb-5">
          <div className="overflow-hidden mb-2">
            <p className="font-semibold text-sm text-neutral-500 whitespace-nowrap overflow-hidden text-ellipsis">
              {auth.user.email}
            </p>
          </div>
          <ul>
            <SidebarButton
              icon={
                <RiAccountCircleFill size={20} className="text-neutral-200" />
              }
              text="Account"
              type="account"
              onClick={() => {
                setCurrentActive("account");
              }}
              active={currentActive}
            />
            <SidebarButton
              icon={<BiSliderAlt size={20} className="text-neutral-400" />}
              text="Preferences"
              type="preferences"
              onClick={() => {
                setCurrentActive("preferences");
              }}
              active={currentActive}
            />
            <SidebarButton
              icon={<BiUser size={20} className="text-neutral-400" />}
              text="Profile"
              type="profile"
              onClick={() => {
                setCurrentActive("profile");
              }}
              active={currentActive}
            />

            <SidebarButton
              icon={<BiBell size={20} className="text-neutral-400" />}
              text="Notifications"
              type="notifications"
              onClick={() => {
                setCurrentActive("notifications");
              }}
              active={currentActive}
            />
            <SidebarButton
              icon={<BiMoon size={20} className="text-neutral-400" />}
              text="Do Not Disturb"
              type="donotdisturb"
              onClick={() => {
                setCurrentActive("donotdisturb");
              }}
              active={currentActive}
            />
          </ul>
        </div>
        <div>
          <div className="overflow-hidden mb-2">
            <p className="font-semibold text-sm text-neutral-500 whitespace-nowrap overflow-hidden text-ellipsis">
              {workspaceData.name}
            </p>
          </div>
          <ul>
            <SidebarButton
              icon={
                <div className="w-5 h-5 bg-[#a8a8a8] rounded-md flex items-center justify-center">
                  <p className="text-white uppercase font-bold text-xs">
                    {workspaceData.name[0]}
                  </p>
                </div>
              }
              text="General"
              type="general"
              onClick={() => {
                setCurrentActive("general");
              }}
              active={currentActive}
            />
            <SidebarButton
              icon={<BiUserPlus size={20} className="text-neutral-400" />}
              text="Members & Group"
              type="members"
              onClick={() => {
                setCurrentActive("members");
              }}
              active={currentActive}
            />
            <SidebarButton
              icon={
                <BiCreditCardFront size={20} className="text-neutral-400" />
              }
              text="Billing"
              type="billing"
              onClick={() => {
                setCurrentActive("billing");
              }}
              active={currentActive}
            />
            <SidebarButton
              icon={<BiCustomize size={20} className="text-neutral-400" />}
              text="Integrations"
              type="integrations"
              onClick={() => {
                setCurrentActive("integrations");
              }}
              active={currentActive}
            />
            <SidebarButton
              icon={<BiImport size={20} className="text-neutral-400" />}
              text="Import"
              type="import"
              onClick={() => {
                setCurrentActive("import");
              }}
              active={currentActive}
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SettingsSidebar;

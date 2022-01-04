import React, { SetStateAction, useMemo, useState, Dispatch } from "react";
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

type TProps = React.PropsWithChildren<{
  currentActive: string;
  setCurrentActive: Dispatch<SetStateAction<string>>;
}>;

function SettingsSidebar({ currentActive, setCurrentActive }: TProps) {
  const params = useParams();

  const auth = useAppSelector((state) => state.auth);
  const workspace = useAppSelector((state) => state.workspace);

  const workspaceData = useMemo(() => {
    return workspace.workspaces.find((data) => data._id === params.workspaceId);
  }, [workspace.workspaces, params.workspaceId]);

  const [header, setHeader] = useState({
    title: "",
    from: null,
  });

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
              type="account"
              onClick={() => {
                setCurrentActive("account");
              }}
              active={currentActive}
            />
            <SidebarButton
              icon={<BiSliderAlt size={20} className="text-neutral-400" />}
              type="preferences"
              onClick={() => {
                setCurrentActive("preferences");
              }}
              active={currentActive}
            />
            <SidebarButton
              icon={<BiUser size={20} className="text-neutral-400" />}
              type="profile"
              onClick={() => {
                setCurrentActive("profile");
              }}
              active={currentActive}
            />

            <SidebarButton
              icon={<BiBell size={20} className="text-neutral-400" />}
              type="notifications"
              onClick={() => {
                setCurrentActive("notifications");
              }}
              active={currentActive}
            />
            <SidebarButton
              icon={<BiMoon size={20} className="text-neutral-400" />}
              type="doNotDisturb"
              onClick={() => {
                setCurrentActive("doNotDisturb");
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
              type="general"
              onClick={() => {
                setCurrentActive("general");
              }}
              active={currentActive}
            />
            <SidebarButton
              icon={<BiUserPlus size={20} className="text-neutral-400" />}
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
              type="billing"
              onClick={() => {
                setCurrentActive("billing");
              }}
              active={currentActive}
            />
            <SidebarButton
              icon={<BiCustomize size={20} className="text-neutral-400" />}
              type="integrations"
              onClick={() => {
                setCurrentActive("integrations");
              }}
              active={currentActive}
            />
            <SidebarButton
              icon={<BiImport size={20} className="text-neutral-400" />}
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

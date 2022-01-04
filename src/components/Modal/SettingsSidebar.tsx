import React, { useMemo } from "react";
import MenuButton from "components/Button/MenuButton";
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
            <MenuButton
              icon={
                <RiAccountCircleFill size={20} className="text-neutral-200" />
              }
              text="Account"
              type="account"
            />
            <MenuButton
              icon={<BiSliderAlt size={20} className="text-neutral-400" />}
              text="Preferences"
              type="preferences"
            />
            <MenuButton
              icon={<BiUser size={20} className="text-neutral-400" />}
              text="Profile"
              type="profile"
            />

            <MenuButton
              icon={<BiBell size={20} className="text-neutral-400" />}
              text="Notifications"
              type="members"
            />
            <MenuButton
              icon={<BiMoon size={20} className="text-neutral-400" />}
              text="Do Not Disturb"
              type="donotdisturb"
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
            <MenuButton
              icon={
                <div className="w-5 h-5 bg-[#a8a8a8] rounded-md flex items-center justify-center">
                  <p className="text-white uppercase font-bold text-xs">
                    {workspaceData.name[0]}
                  </p>
                </div>
              }
              text="General"
              type="general"
            />
            <MenuButton
              icon={<BiUserPlus size={20} className="text-neutral-400" />}
              text="Members & Group"
              type="members"
            />
            <MenuButton
              icon={
                <BiCreditCardFront size={20} className="text-neutral-400" />
              }
              text="Billing"
              type="billing"
            />
            <MenuButton
              icon={<BiCustomize size={20} className="text-neutral-400" />}
              text="Integrations"
              type="integrations"
            />
            <MenuButton
              icon={<BiImport size={20} className="text-neutral-400" />}
              text="Import"
              type="import"
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SettingsSidebar;

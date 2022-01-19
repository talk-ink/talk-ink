import React, { useState } from "react";
import { Menu } from "@headlessui/react";

import TextInput from "components/Form/TextInput";
import { User } from "types";

type TProps = {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  children?: React.ReactNode;
};

function MemberSuggestion({ onChange, children }: TProps) {
  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <Menu.Button as="button" className="outline-none w-full">
            <TextInput
              className="w-full"
              placeholder="Search by name"
              onChange={onChange}
            />
          </Menu.Button>
          {open && (
            <Menu.Items
              static
              className="w-full max-h-64 mt-1 absolute left-0 origin-bottom rounded-sm bg-white py-1 border border-gray-200 overflow-auto shadow outline-none"
            >
              {children}
            </Menu.Items>
          )}
        </>
      )}
    </Menu>
  );
}

export default MemberSuggestion;

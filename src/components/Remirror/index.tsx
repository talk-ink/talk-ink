import React from "react";
import "remirror/styles/all.css";
import "remirror/styles/extension-file.css";
import "./editor.css";

import { AllStyledComponent } from "@remirror/styles/emotion";

import { toolbarItems } from "./toolbar";

import { Remirror, ThemeProvider, Toolbar } from "@remirror/react";
import UserSuggestor from "./UserSuggestor";

const ALL_USERS = [
  { id: "joe", label: "Joe" },
  { id: "sue", label: "Sue" },
  { id: "pat", label: "Pat" },
  { id: "tom", label: "Tom" },
  { id: "jim", label: "Jim" },
];

interface IProps {
  remmirorProps?: any;
  readOnly?: boolean;
}

const MyEditor: React.FC<IProps> = ({ remmirorProps, readOnly }) => {
  const { manager, onChange, state } = remmirorProps || {};

  return (
    <div className="remirror-theme thread-editor ">
      <AllStyledComponent>
        <ThemeProvider>
          <Remirror
            autoFocus
            manager={manager}
            autoRender="start"
            onChange={onChange}
            state={state}
            editable={!readOnly}
          >
            {!readOnly && <UserSuggestor allUsers={ALL_USERS} />}
            {!readOnly && (
              <Toolbar items={toolbarItems} refocusEditor label="Top Toolbar" />
            )}
          </Remirror>
        </ThemeProvider>
      </AllStyledComponent>
    </div>
  );
};

export default React.memo(MyEditor);

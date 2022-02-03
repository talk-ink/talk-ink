import React, { useEffect, useRef, useState } from "react";
import "remirror/styles/all.css";
import "./editor.css";

import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  TaskListExtension,
  HardBreakExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  OrderedListExtension,
  StrikeExtension,
  TableExtension,
  TrailingNodeExtension,
  ImageExtension,
  DropCursorExtension,
  MentionAtomExtension,
  MentionAtomNodeAttributes,
  ImageExtensionAttributes,
} from "remirror/extensions";
import { cx, ExtensionPriority, htmlToProsemirrorNode } from "remirror";
import {
  FileExtension,
  createBaseuploadFileUploader,
  createDataUrlFileUploader,
} from "@remirror/extension-file";

import css from "refractor/lang/css";
import javascript from "refractor/lang/javascript";
import json from "refractor/lang/json";
import markdown from "refractor/lang/markdown";
import typescript from "refractor/lang/typescript";
import {
  DelayedPromiseCreator,
  ErrorConstant,
  invariant,
  ProsemirrorAttributes,
} from "@remirror/core";

import { FileComponent } from "./FileComponent";

import {
  ComponentItem,
  Remirror,
  useRemirror,
  ThemeProvider,
  useMentionAtom,
  FloatingWrapper,
  ToolbarItemUnion,
  Toolbar,
  useChainedCommands,
  useActive,
  useCommands,
} from "@remirror/react";

import { kontenbase } from "lib/client";

const ALL_USERS = [
  { id: "joe", label: "Joe" },
  { id: "sue", label: "Sue" },
  { id: "pat", label: "Pat" },
  { id: "tom", label: "Tom" },
  { id: "jim", label: "Jim" },
];

function UserSuggestor() {
  const [users, setUsers] = useState<MentionAtomNodeAttributes[]>([]);
  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } =
    useMentionAtom({
      items: users,
    });

  useEffect(() => {
    if (!state) {
      return;
    }

    const searchTerm = state.query.full.toLowerCase();
    const filteredUsers = ALL_USERS.filter((user) =>
      user.label.toLowerCase().includes(searchTerm)
    )
      .sort()
      .slice(0, 5);
    setUsers(filteredUsers);
  }, [state]);

  const enabled = !!state;

  return (
    <FloatingWrapper
      positioner="cursor"
      enabled={enabled}
      placement="bottom-start"
    >
      <div {...getMenuProps()} className="suggestions">
        {enabled &&
          users.map((user, index) => {
            const isHighlighted = indexIsSelected(index);
            const isHovered = indexIsHovered(index);

            return (
              <div
                key={user.id}
                className={cx(
                  "suggestion",
                  isHighlighted && "highlighted",
                  isHovered && "hovered"
                )}
                {...getItemProps({
                  item: user,
                  index,
                })}
              >
                {user.label}
              </div>
            );
          })}
      </div>
    </FloatingWrapper>
  );
}

const toolbarItems: ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: "Simple Formatting",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleBold",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleItalic",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleStrike",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleCode",
        display: "icon",
      },
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "Heading Formatting",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleHeading",
        display: "icon",
        attrs: { level: 1 },
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleHeading",
        display: "icon",
        attrs: { level: 2 },
      },
      {
        type: ComponentItem.ToolbarMenu,

        items: [
          {
            type: ComponentItem.MenuGroup,
            role: "radio",
            items: [
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "toggleHeading",
                attrs: { level: 3 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "toggleHeading",
                attrs: { level: 4 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "toggleHeading",
                attrs: { level: 5 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "toggleHeading",
                attrs: { level: 6 },
              },
            ],
          },
        ],
      },
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "Simple Formatting",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleBulletList",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleOrderedList",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleTaskList",
        display: "icon",
      },
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "Simple Formatting",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleBlockquote",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleCodeBlock",
        display: "icon",
      },
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "History",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "undo",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "redo",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleColumns",
        display: "icon",
        attrs: { count: 2 },
      },
    ],
    separator: "none",
  },
];

interface FileWithProgress {
  file: File;
  progress: SetProgress;
}

type SetProgress = (progress: number) => void;

export type ImageAttributes = ProsemirrorAttributes<ImageExtensionAttributes>;

type DelayedImage = DelayedPromiseCreator<ImageAttributes>;

function uploadHandler(files: FileWithProgress[]): DelayedImage[] {
  invariant(files.length > 0, {
    code: ErrorConstant.EXTENSION,
    message:
      "The upload handler was applied for the image extension without any valid files",
  });

  let completed = 0;
  const promises: Array<DelayedPromiseCreator<ImageAttributes>> = [];

  for (const { file, progress } of files) {
    promises.push(async () => {
      const { data } = await kontenbase.storage.upload(file);

      return new Promise<ImageAttributes>((resolve) => {
        const reader = new FileReader();

        reader.addEventListener(
          "load",
          (readerEvent) => {
            completed += 1;
            progress(completed / files.length);
            resolve({
              src: data.url as string,
              fileName: data.fileName,
            });
          },
          { once: true }
        );

        reader.readAsDataURL(file);
      });
    });
  }

  return promises;
}

const extensions = () => [
  new MentionAtomExtension({
    extraAttributes: { type: "user" },
    matchers: [{ name: "at", char: "@", appendText: " ", matchOffset: 0 }],
  }),
  new LinkExtension({ autoLink: true }),
  new BoldExtension({}),
  new StrikeExtension(),
  new ItalicExtension(),
  new HeadingExtension({}),
  new LinkExtension({}),
  new BlockquoteExtension(),
  new BulletListExtension({ enableSpine: true }),
  new OrderedListExtension(),
  new ListItemExtension({
    priority: ExtensionPriority.High,
    enableCollapsible: true,
  }),
  new CodeExtension(),
  new CodeBlockExtension({
    supportedLanguages: [css, javascript, json, markdown, typescript],
  }),
  new TrailingNodeExtension(),
  new TableExtension(),
  new MarkdownExtension({ copyAsMarkdown: false }),
  new HardBreakExtension(),
  new TaskListExtension(),
  new ImageExtension({
    enableResizing: true,
    //@ts-ignore
    uploadHandler,
  }),
  new DropCursorExtension(),
  new FileExtension({
    render: FileComponent,
    pasteRuleRegexp: /.*/,
    uploadFileHandler: createBaseuploadFileUploader,
    extraAttributes: {
      showPreview: {
        default: false,
        parseDOM: (dom) => dom.getAttribute("data-show-preview") === "true",
        toDOM: (attrs) => [
          "data-show-preview",
          Boolean(attrs.showPreview).toString(),
        ],
      },
    },
  }),
];

interface IProps {
  editor?: "Social" | "Custom";
}

export const Menu = ({
  inputFile,
}: {
  inputFile: React.RefObject<HTMLInputElement>;
}) => {
  // Using command chaining
  const chain = useChainedCommands();
  const active = useActive();
  const { focus } = useCommands();

  return (
    <button
      onClick={async () => {
        inputFile.current.click();

        // chain.insertImage({ src: data.url }).run();
        // focus();
      }}
      style={{ fontWeight: active.bold() ? "bold" : undefined }}
    >
      B
    </button>
  );
};

const MyEditor: React.FC<IProps> = ({ editor }) => {
  const inputFile = useRef(null);

  const { manager, setState, state } = useRemirror({
    extensions,
    stringHandler: htmlToProsemirrorNode,
    content: "",
  });

  console.log(new TextEncoder().encode(JSON.stringify(state)).length);

  return (
    <div className="remirror-theme">
      <ThemeProvider>
        <Remirror
          autoFocus
          manager={manager}
          autoRender="end"
          onChange={(parameter) => {
            return setState(parameter.state);
          }}
          state={state}
        >
          <UserSuggestor />
          <Toolbar items={toolbarItems} refocusEditor label="Top Toolbar" />
          <Menu inputFile={inputFile} />
        </Remirror>
      </ThemeProvider>

      <input
        type="file"
        id="file"
        ref={inputFile}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default MyEditor;

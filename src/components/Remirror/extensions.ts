import {
  FileExtension,
  createBaseuploadFileUploader,
} from "@remirror/extension-file";

import css from "refractor/lang/css";
import javascript from "refractor/lang/javascript";
import json from "refractor/lang/json";
import markdown from "refractor/lang/markdown";
import typescript from "refractor/lang/typescript";

import { ImageExtensionAttributes } from "remirror/extensions";

import {
  DelayedPromiseCreator,
  ErrorConstant,
  invariant,
  ProsemirrorAttributes,
} from "@remirror/core";

import { ExtensionPriority } from "remirror";

import { kontenbase } from "lib/client";

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
} from "remirror/extensions";

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
    // eslint-disable-next-line no-loop-func
    promises.push(async () => {
      const { data } = await kontenbase.storage.upload(file);

      return new Promise<ImageAttributes>((resolve) => {
        const reader = new FileReader();

        reader.addEventListener(
          "load",
          (_readerEvent) => {
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

export const extensions = (readonly = false) => [
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
  new MarkdownExtension({ copyAsMarkdown: true }),
  new HardBreakExtension(),
  new TaskListExtension(),
  new ImageExtension({
    enableResizing: !readonly,
    uploadHandler,
  }),

  new FileExtension({
    uploadFileHandler: createBaseuploadFileUploader,
  }),
  new DropCursorExtension(),
];

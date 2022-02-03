import { CKEditor } from "ckeditor4-react";

function CKE() {
  return (
    <CKEditor
      initData={<p>Hello from CKEditor 4!</p>}
      onInstanceReady={() => {}}
      config={{
        mentions: [
          {
            feed: ["Anna", "Thomas", "John"],
            minChars: 0,
            outputTemplate: `<a href="#">{name}</a>`,
          },
        ],
      }}
      editorUrl={process.env.PUBLIC_URL + "/ckeditor/ckeditor.js"}
    />
  );
}

export default CKE;

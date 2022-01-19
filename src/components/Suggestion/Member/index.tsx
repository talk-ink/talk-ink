import React, { useState } from "react";

import TextInput from "components/Form/TextInput";

type TProps = {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  children?: React.ReactNode;
};

function MemberSuggestion({ onChange, children }: TProps) {
  const [showSuggestion, setShowSuggestion] = useState(false);
  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.relatedTarget) setShowSuggestion(false);
      }}
    >
      <TextInput
        className="w-full"
        placeholder="Search by name"
        onChange={(e) => {
          onChange(e);
          setShowSuggestion(true);
        }}
        onClick={() => {
          setShowSuggestion((prev) => !prev);
        }}
      />

      {showSuggestion && (
        <div
          className="w-full max-h-64 mt-1 absolute left-0 origin-bottom rounded-sm bg-white py-1 border border-gray-200 overflow-auto shadow outline-none z-10"
          onClick={() => setShowSuggestion(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default MemberSuggestion;

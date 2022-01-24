import React, { useState } from "react";

type TProps = {
  header?: React.ReactNode;
  children?: React.ReactNode;
};
type ItemsProps = {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
};
type ItemProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
};
interface HeaderProps extends React.HTMLProps<HTMLInputElement> {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
}

const Items = ({ onClick, children }: ItemsProps) => {
  return (
    <div
      className="w-full max-h-64 mt-1 absolute left-0 origin-bottom rounded-sm bg-white py-1 border border-gray-200 overflow-auto shadow outline-none z-10"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const Item = ({ onClick, children }: ItemProps) => {
  return (
    <button
      className={`flex items-center hover:bg-indigo-100 p-2 outline-none w-full mt-1 first:mt-0`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Header = ({ onClick, children, ...rest }: HeaderProps) => {
  return (
    <div onClick={onClick} {...rest}>
      {children}
    </div>
  );
};

function Suggestion({ header, children }: TProps) {
  const [showSuggestion, setShowSuggestion] = useState(false);
  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.relatedTarget) setShowSuggestion(false);
      }}
    >
      <Header
        className="w-full"
        onClick={() => {
          setShowSuggestion((prev) => !prev);
        }}
      >
        {header}
      </Header>

      {showSuggestion && (
        <Items onClick={() => setShowSuggestion(false)}>{children}</Items>
      )}
    </div>
  );
}

Suggestion.Items = Items;
Suggestion.Item = Item;
Suggestion.Header = Header;

export default Suggestion;

import IconButton from "components/Button/IconButton";
import React from "react";
import { BiFilter, BiSearch } from "react-icons/bi";
import { GrClose } from "react-icons/gr";

interface Props extends React.HTMLProps<HTMLInputElement> {
  onClear?: () => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit?: () => void;
  value?: string | number | readonly string[];
}

const SearchInput = ({ onClear, onSubmit, value, ...rest }: Props) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="w-full border rounded border-slate-300 bg-slate-100 flex p-1 my-3"
    >
      <div className="flex items-center flex-1 pl-2">
        <BiSearch size={24} className="text-slate-600 mr-2 my-1" />
        <input
          type="text"
          className="outline-none w-full bg-transparent text-sm"
          value={value}
          {...rest}
        />
      </div>
      <div className="flex items-center">
        {value && (
          <IconButton
            size="medium"
            className="hover:bg-slate-100 outline-none"
            onClick={onClear}
          >
            <GrClose />
          </IconButton>
        )}
        {/* <button className="flex items-center h-full px-3 ">
          <BiFilter size={20} />
          <p className="text-sm font-semibold ml-2 ">Filter</p>
        </button> */}
      </div>
    </form>
  );
};

export default SearchInput;

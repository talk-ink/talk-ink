import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

export default forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    //@ts-ignore
    const item = props.items[index];

    if (item) {
      //@ts-ignore
      props.command({ id: item });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      //@ts-ignore
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    //@ts-ignore
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  //@ts-ignore
  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="items">
      {/* @ts-ignore */}
      {props.items.length ? (
        //@ts-ignore
        props.items.map((item, index) => (
          <button
            className={`item ${index === selectedIndex ? "is-selected" : ""}`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item}
          </button>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  );
});

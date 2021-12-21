import React from "react";

type Props = React.PropsWithChildren<{
  count?: number;
}>;

function Skeleton() {
  const bg = "bg-neutral-100";
  return (
    <div className="animate-pulse px-3 py-5">
      <div className="flex items-center justify-between px-3 group">
        <div className="flex items-center w-full ">
          <div className={`p-5 rounded-full overflow-hidden mr-4  ${bg}`}></div>
          <div className="w-full">
            <div className="flex items-center mb-2">
              <div className={`h-3 w-52 mr-2 rounded-full ${bg}`}></div>
            </div>
            <div className={`h-3 w-9/12 rounded-full ${bg}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentSkeleton({ count = 5 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton key={idx} />
      ))}
    </>
  );
}

export default ContentSkeleton;

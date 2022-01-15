import { MdHourglassFull } from "react-icons/md";

function FullscreenLoading() {
  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center">
      <div className="flex flex-col justify-center items-center">
        <MdHourglassFull size={32} className="text-indigo-600 animate-spin" />

        <small className="text-sm text-neutral-400 mt-2">Loading...</small>
      </div>
    </div>
  );
}

export default FullscreenLoading;

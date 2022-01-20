import BrainStorm from "assets/image/brainstorming.svg";

function ChannelEmpty() {
  return (
    <div className="w-full flex flex-col items-center justify-center ">
      <img className="w-96" src={BrainStorm} alt="channel empty" />
      <h6 className="font-bold text-center mb-2">
        Every discussion is a thread
      </h6>
      <p className="text-neutral-500 w-96 text-center px-5 md:px-0 ">
        Threads keep discussions on-topic. They can be linked, referenced, and
        searched for later. It's your Twist superpower.
      </p>
    </div>
  );
}

export default ChannelEmpty;

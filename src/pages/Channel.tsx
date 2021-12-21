import Button from "components/Button/Button";
import IconButton from "components/Button/IconButton";
import ContentItem from "components/ContentItem/ContentItem";
import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import { BiDotsHorizontalRounded, BiEdit } from "react-icons/bi";

function ChannelPage() {
  return (
    <MainContentContainer>
      <header
        // className={`mb-2 flex items-end justify-between ${
        //   !false && "border-b-2 border-neutral-100 pb-8"
        // }`}
        className={`mb-8 flex items-end justify-between "border-b-2 border-neutral-100 pb-8"
        `}
      >
        <div>
          <h1 className="font-bold text-3xl">General</h1>
          <p className="text-neutral-500 font-body">Public</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
              <p className="text-lg uppercase text-white">IA</p>
            </div>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700 flex items-center">
            <BiEdit size={18} className="text-white mr-2" />
            <p className="text-sm text-white font-medium -mb-1">New Thread</p>
          </Button>
          <IconButton size="medium">
            <BiDotsHorizontalRounded size={24} className="text-neutral-400" />
          </IconButton>
        </div>
      </header>
      <ul>
        <ContentItem />
        <ContentItem />
        <ContentItem />
        <ContentItem />
        <ContentItem />
        <ContentItem />
        <ContentItem />
        <ContentItem />
      </ul>
    </MainContentContainer>
  );
}

export default ChannelPage;

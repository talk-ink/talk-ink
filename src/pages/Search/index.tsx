import React, { useState } from "react";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import SearchInput from "components/SearchInput";
import SearchItem from "components/SearchItem";

import { useToast } from "hooks/useToast";
import { useAppSelector } from "hooks/useAppSelector";
import { SearchResponse, Thread } from "types";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "hooks/useAppDispatch";
import { bulkAddThread } from "features/threads";
import ContentSkeleton from "components/Loading/ContentSkeleton";
import SearchEmpty from "components/EmptyContent/SearchEmpty";
import { sendSearch } from "utils/helper";
import MobileHeader from "components/Header/Mobile";

function SearchPage() {
  const navigate = useNavigate();
  const params = useParams();

  const [showToast] = useToast();

  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [search, setSearch] = useState<string | null | undefined>();
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<SearchResponse[]>([]);

  const handleSubmit = async () => {
    if (!search) return;
    setSearchLoading(true);
    try {
      const searchData = await sendSearch({
        userId: auth.user._id,
        workspaceId: params.workspaceId,
        search,
      });

      if (searchData.length > 0) {
        setSearchResult(searchData);

        const threadsData: Thread[] = searchData.map((data) => data.thread);

        dispatch(bulkAddThread(threadsData));
      } else {
        setSearchResult([]);
      }
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    } finally {
      setSearchLoading(false);
    }
  };

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value);
  };

  return (
    <>
      <MobileHeader header="Search" subHeader="Search anything" type="search" />
      <MainContentContainer>
        <header className="mb-2">
          <div className="mb-7">
            <h1 className="font-bold text-3xl hidden md:inline">Search</h1>
            <div>
              <SearchInput
                onSubmit={() => {
                  handleSubmit();
                }}
                onChange={(e) => {
                  onChange(e);
                }}
                onClear={() => {
                  setSearch("");
                }}
                value={search}
              />
            </div>
          </div>
        </header>
        {searchLoading ? (
          <ContentSkeleton />
        ) : searchResult.length > 0 ? (
          <div>
            {searchResult?.map((data, idx) => (
              <SearchItem
                key={idx}
                dataSource={data}
                onClick={() => {
                  navigate(
                    `/a/${params.workspaceId}/ch/${data.channelId}/t/${data.threadId}`,
                    { state: { from: "search" } }
                  );
                }}
                search={search}
              />
            ))}
          </div>
        ) : (
          <SearchEmpty />
        )}
      </MainContentContainer>
    </>
  );
}

export default SearchPage;

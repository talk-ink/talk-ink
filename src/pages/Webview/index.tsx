import FullscreenLoading from "components/Loading/FullscreenLoading";
import { setAuthToken, setAuthUser } from "features/auth";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useToast } from "hooks/useToast";
import { kontenbase } from "lib/client";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {};

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const WebviewPage = (props: Props) => {
  const [showToast] = useToast();
  const query = useQuery();
  const navigate = useNavigate();
  const absolutePath: string | null | undefined = query.get("absolutePath");
  const token: string | null | undefined = query.get("token");

  const dispatch = useAppDispatch();

  const tokenHandler = async () => {
    try {
      kontenbase.auth.saveToken(token);

      const { user: userData, error } = await kontenbase.auth.user();

      if (error) throw new Error(error.message);

      dispatch(setAuthToken({ token }));
      dispatch(setAuthUser(userData));

      setTimeout(() => {
        if (!absolutePath) {
          navigate("/");
        } else {
          navigate(absolutePath);
        }
      }, 100);
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  useEffect(() => {
    if (!token) return;
    tokenHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  return <FullscreenLoading />;
};

export default WebviewPage;

import React, { useEffect, useState } from "react";
import { Outlet, Route, Routes } from "react-router";

import SidebarComponent from "components/Sidebar/SidebarComponent";
import FullscreenLoading from "components/Loading/FullscreenLoading";

function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return loading ? (
    <FullscreenLoading />
  ) : (
    <div className="w-full min-h-screen grid grid-cols-[280px_1fr] overflow-hidden text-slightGray">
      <SidebarComponent />
      <Outlet />
    </div>
  );
}

export default DashboardPage;

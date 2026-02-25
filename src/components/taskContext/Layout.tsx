
import React, { useState } from "react";
import Sidebar from "./menu/Sidebar";
import Header from "./menu/Header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  return (
    <main className="flex flex-row h-screen w-screen overflow-hidden back">
      <aside className="flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      </aside>
      <section className="flex-1 flex flex-col overflow-hidden">
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 py-1 md:px-6 px-3 overflow-y-auto">
          {children}
        </main>
      </section>
    </main>
  );
};

export default Layout;
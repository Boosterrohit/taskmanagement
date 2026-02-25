
import React from "react";
import Sidebar from "./menu/Sidebar";
import Header from "./menu/Header";

interface LayoutProps {
  children: React.ReactNode;
//   isSidebarOpen: boolean;
//   toggleSidebar: () => void;
//   closeSidebar: () => void;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <main className="flex flex-row h-screen w-screen overflow-hidden">
      <aside className="flex-shrink-0">
        <Sidebar  /> {/* isOpen={isSidebarOpen} onClose={closeSidebar} */}
      </aside>
      <section className="flex-1 flex flex-col overflow-hidden">
        <Header/> {/* isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} */}
        <main className="flex-1 py-8 px-4 overflow-y-auto">
          {children}
        </main>
      </section>
    </main>
  );
};

export default Layout;
import { List, Menu, Notebook, RefreshCcw, User2, X } from "lucide-react"
import profile from "../../../assets/profile.png"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react";
import { useLocation } from "react-router-dom";
interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}
const pageTitles: Record<string, string> = {
  "/my-day": "My Day",
  "/all-tasks": "All My Tasks",
  "/my-calendar": "My Calendar",
  // add your other routes here
};
const Header = ({ isSidebarOpen, toggleSidebar }: HeaderProps) => {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || "My Tasks";
  const [isRotating, setIsRotating] = useState(false);
 const handleRefresh = () => {
  setIsRotating(true);
  setTimeout(() => {
    setIsRotating(false);
    window.location.reload();
  }, 500); // rotates for 500ms, then reloads
};
  return (
    <div className="md:px-6 px-2 py-3 flex items-center  justify-between gap-2">
       <div className="flex items-center gap-2 md:hidden">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden bg-transparent p-2 rounded-md transition-colors checeing"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        
      </div>
      <div className="bg-white md:w-fit w-[616px]  px-3 py-2 flex justify-between items-center shadow-lg border rounded-full">
<div className="flex items-center gap-1 text-gray-700">
  <Notebook size={20}/>
{/* <p className="md:flex hidden text-lg font-bold">All My Tasks</p> */}
<p className="flex  text-lg font-bold">{title}</p>
</div>
<div className="bg-gray-300 h-8 w-[1px] mx-2"></div>
{title === "All My Tasks" && (
<div className="">
  <Tabs defaultValue="overview" className="w-full">
      <TabsList className="bg-white">
        <TabsTrigger value="overview" className="text-xs flex gap-1 items-center"><List size={10}/>My Lists</TabsTrigger>
        <TabsTrigger value="analytics" className="text-xs flex gap-1 items-center"><User2 size={12}/>Rohit</TabsTrigger>
      </TabsList>
      </Tabs>
</div>
)}
<div title="Refresh Page">
  <RefreshCcw size={18} className={`text-gray-500 cursor-pointer hover:text-blue-500 ${isRotating ? "animate-rotate-reverse" : ""}`}
  onClick={handleRefresh}/>
</div>
      </div>

      <div className="w-48 text-center  md:bg-white md:px-3 py-2.5 md:shadow-lg md:border rounded-full flex items-center justify-center">
        <img src={profile} alt="Profile" className="md:w-8 md:h-8 h-12 w-12 rounded-full inline-block md:mr-2" />
        <p className="md:flex hidden text-sm">Rohit Kumar Sah</p>
      </div>
    </div>
  )
}

export default Header
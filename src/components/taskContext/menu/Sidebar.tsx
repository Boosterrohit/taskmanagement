import { Plus } from "lucide-react"
import { SIDE_BAR_MENU } from "@/data"
import profile from "../../../assets/profile.png"
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const [openSection, setOpenSection] = useState<string | null>(null);
  

  useEffect(() => {
    SIDE_BAR_MENU.forEach((section) => {
      const hasActiveItem = section.SUBMENU.some(
        (item) => location.pathname === `/dashboard${item.slug}`
      );
      if (hasActiveItem) {
        setOpenSection(section.title);
      }
    });
  }, [location.pathname]);

  return (
    <>
    {isOpen && (
        <div
          className="fixed inset-0 bg-white/0 bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
{openSection && (
  <div></div>
)}
    <div className={`fixed lg:static top-0 left-0 w-60 bg-white/70 backdrop-blur-md shadow-lg p-5  text-white flex flex-col h-screen z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
      <div className="text-black flex gap-2">
{/* <div className="border-[1.5px] border-black flex justify-center items-center p-2 rounded-full"> */}
        {/* <Settings className="inline-block w-6 h-6" /> */}
        <img src={profile} alt="Profile" className="w-10 h-10 rounded-full inline-block object-cover" />

{/* </div> */}
        <div className="flex flex-col leading-5 mt-0.5">
          <span>Rohit Sah</span>
          <span className="text-xs text-gray-500">Free Plan</span>

        </div>
        </div>
        <div>
          {SIDE_BAR_MENU.map((item) => {
            return(
              <div key={item.id} className="mt-8">
                <h3 className="text-black text-base uppercase font-semibold mb-2">{item.title}</h3>
                <ul className="flex flex-col gap-2">
                  {item.SUBMENU.map((link) => {
                    return(
                      <li key={link.id} className="text-gray-700 px-2 text-sm leading-7 hover:text-blue-500 cursor-pointer transition-colors flex items-center gap-2">
                          {link.icon && <link.icon className="w-4 h-4" />}
                        {link.name}
                      </li>
                    )
                })}
                </ul>
              </div>
            )
          })}
        </div>
        <div className="text-black absolute bottom-5 border cursor-pointer w-52 left-4 text-sm flex justify-between bg-white shadow-md px-3 py-2 rounded-full items-center gap-2">
         <div className="flex">
           <div className="bg-red-400 -mr-2 border-2 border-gray-300 w-8 h-8 rounded-full flex justify-center items-center text-base text-white">R</div>
          <div className="bg-green-400 -mr-2 border-2 border-gray-300 w-8 h-8 rounded-full flex justify-center items-center text-base text-white">A</div>
          <div className="bg-orange-400 -mr-4 border-2 border-gray-300 w-8 h-8 rounded-full flex justify-center items-center text-base text-white">D</div>
         </div>
          <p className="flex items-center text-gray-500 text-base">Add Board <Plus size={15}/></p>
        </div>
    </div>
    </>
  )
}

export default Sidebar
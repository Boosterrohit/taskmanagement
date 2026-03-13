import { Plus } from "lucide-react";
import { SIDE_BAR_MENU } from "@/data";
import profile from "../../../assets/profile.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useBoard } from "@/contexts/boardContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { boards, addBoard } = useBoard();
  const [showBoardDialog, setShowBoardDialog] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [isAddingBoard, setIsAddingBoard] = useState(false);

  const isBoardRoute = useMemo(
    () => location.pathname.startsWith("/board/"),
    [location.pathname]
  );

  const handleAddBoard = () => {
    setNewBoardName("");
    setShowBoardDialog(true);
  };

  const confirmAddBoard = async () => {
    const trimmed = newBoardName.trim();
    if (!trimmed) return;

    setIsAddingBoard(true);
    if (newBoardName.trim()) {
      const newBoard = await addBoard(trimmed);
      navigate(`/board/${newBoard.id}`);
    }
    setIsAddingBoard(false);
    setShowBoardDialog(false);
  };

  const isMenuActive = (slug: string) => {
    return location.pathname === slug || location.pathname === `/dashboard${slug}`;
  };

  const isBoardActive = (id: string) => {
    return location.pathname === `/board/${id}`;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed  inset-0 bg-white/0 bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* board dialog */}
      {showBoardDialog && (
        <div className="fixed inset-0  bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h2 className="text-lg font-semibold mb-2">New Board</h2>
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
              placeholder="Board name"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                disabled={isAddingBoard}
                onClick={() => setShowBoardDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-500 text-white"
                disabled={isAddingBoard || !newBoardName.trim()}
                onClick={confirmAddBoard}
              >
                {isAddingBoard ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={`fixed lg:static  top-0  left-0 w-60 bg-white/70 backdrop-blur-md shadow-lg p-5 text-white flex flex-col h-screen z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
        <div className="text-black flex gap-2 ">
          <img src={profile} alt="Profile" className="w-10 h-10 rounded-full inline-block object-cover" />
          <div className="flex flex-col leading-5 mt-0.5">
            <span>Rohit Sah</span>
            <span className="text-xs text-gray-500">Free Plan</span>
          </div>
        </div>
        <div className="overflow-y-auto h-[79vh] hide-scrollbar">
          {SIDE_BAR_MENU.map((item) => {
            return (
              <div key={item.id} className="mt-8 ">
                <h3 className="text-black text-base  uppercase font-semibold mb-2">{item.title}</h3>
                <ul className="flex flex-col gap-2">
                  {item.SUBMENU.map((link) => {
                    const active = isMenuActive(link.slug);
                    return (
                      <li
                        key={link.id}
                        className={`px-2 text-sm leading-7 cursor-pointer transition-colors flex items-center gap-2 rounded-md ${
                          active ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:text-blue-500"
                        }`}
                      >
                        <Link to={link.slug} className="flex items-center gap-1 w-full">
                          {link.icon && <link.icon className="w-4 h-4" />}
                          {link.name}
                        </Link>
                      </li>
                    );
                  })}
                  {item.title === "Boards" && boards.map((b) => (
                    <li
                      key={b.id}
                      className={`px-2 text-sm leading-7 cursor-pointer transition-colors flex items-center gap-2 rounded-md ${
                        isBoardActive(b.id) ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:text-blue-500"
                      }`}
                    >
                      <Link to={`/board/${b.id}`} className="w-full truncate">{b.name}</Link>
                    </li>
                  ))}
                  {item.title === "Boards" && boards.length === 0 && (
                    <li className="text-gray-400 px-2 text-xs">No boards yet</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
        <div onClick={handleAddBoard} className={`text-black absolute bottom-5 border cursor-pointer w-52 left-4 text-sm flex justify-between bg-white shadow-md px-3 py-2 rounded-full items-center gap-2 ${isBoardRoute ? "ring-2 ring-blue-300" : ""}`}>
          <div className="flex">
            <div className="bg-red-400 -mr-2 border-2 border-gray-300 w-8 h-8 rounded-full flex justify-center items-center text-base text-white">R</div>
            <div className="bg-green-400 -mr-2 border-2 border-gray-300 w-8 h-8 rounded-full flex justify-center items-center text-base text-white">A</div>
            <div className="bg-orange-400 -mr-4 border-2 border-gray-300 w-8 h-8 rounded-full flex justify-center items-center text-base text-white">D</div>
          </div>
          <p className="flex items-center text-gray-500 text-base">Add Board <Plus size={15}/></p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
// SidebarContext.js
"use client";
import  {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const toggleSubmenu = (item) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  };

  // Gunakan useMemo untuk mencegah re-render yang tidak perlu
  const contextValue = useMemo(
    () => ({
      isExpanded,
      isMobileOpen,
      isMobile,
      isHovered,
      activeItem,
      openSubmenu,
      toggleSidebar,
      toggleMobileSidebar,
      setIsHovered,
      setActiveItem,
      toggleSubmenu,
      searchQuery,
      setSearchQuery,
    }),
    [
      isExpanded,
      isMobileOpen,
      isMobile,
      isHovered,
      activeItem,
      openSubmenu,
      searchQuery,
    ]
  ); // searchQuery sebagai dependensi

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

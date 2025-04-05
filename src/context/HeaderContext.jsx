// contexts/HeaderContext.js
import  { createContext, useState, useContext } from "react";

const HeaderContext = createContext();

export const useHeader = () => useContext(HeaderContext);

export const HeaderProvider = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    // Reset query when closing search
    if (isSearchOpen) setSearchQuery("");
  };

  const contextValue = {
    isSearchOpen,
    toggleSearch,
    searchQuery,
    setSearchQuery,
  };

  return (
    <HeaderContext.Provider value={contextValue}>
      {children}
    </HeaderContext.Provider>
  );
};

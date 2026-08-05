import React, { createContext, useContext, useState } from "react";

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {

  const [refreshFeed, setRefreshFeed] = useState(0);

  const triggerFeedRefresh = () => {
    setRefreshFeed(prev => prev + 1);
  };

  return (
    <RefreshContext.Provider
      value={{
        refreshFeed,
        triggerFeedRefresh
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);
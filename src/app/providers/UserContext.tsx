import React, { createContext, useContext } from "react";

type Role = "admin" | "coach" | "client";

export interface UserContextValue {
  role: Role;
  setRole: (role: Role) => void;
  currentCoachId?: string;
  setCurrentCoachId: (id?: string) => void;
  currentClientId?: string;
  setCurrentClientId: (id?: string) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const useUserContext = (): UserContextValue => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUserContext must be used within UserProvider");
  }
  return ctx;
};

export const UserProvider: React.FC<{
  value: UserContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};



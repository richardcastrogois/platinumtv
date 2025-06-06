//frontend/src/contexts/SearchContext.ts

import { createContext } from "react";

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(
  undefined
);

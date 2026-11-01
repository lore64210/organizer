import { createContext, useContext } from 'react';

/** Estimated height until the header reports its real size. */
export const DEFAULT_HEADER_HEIGHT = 104;

const HeaderHeightContext = createContext(DEFAULT_HEADER_HEIGHT);

export const useHeaderHeight = () => useContext(HeaderHeightContext);

export const HeaderHeightProvider = HeaderHeightContext.Provider;

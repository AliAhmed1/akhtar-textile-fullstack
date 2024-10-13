import { useRef } from 'react';

const useCheckFetchOnce = () => {
  const hasCalled = useRef(false);

  const checkFetch = () => {
    if (hasCalled.current) {
      console.warn("Fetch has already been called. Skipping...");
      return false;
    }

    hasCalled.current = true;
    return true;
  };

  return checkFetch;
};

export default useCheckFetchOnce;

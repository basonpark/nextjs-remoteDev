//separating implementation logic from component
import { useContext, useEffect, useState } from "react";
import { JobItem, JobItemExpanded } from "./types";
import { BASE_API_URL } from "./constants";
import { useQueries, useQuery } from "@tanstack/react-query";
import { handleError } from "./utils";
import { BookmarksContext } from "../contexts/BookmarksContextProvider";

type JobItemApiResponse = {
  public: boolean;
  jobItem: JobItemExpanded;
}

const fetchJobItem = async (id: number): Promise<JobItemApiResponse> => {
  const res = await fetch(`${BASE_API_URL}/${id}`);
  //network ok but 4xx, 5xx
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.description);
  }
  const data = await res.json();
  return data;
}

//fetch with reactquery instead of useeffect
export function useJobItem(id: number | null) {
  const { data, isInitialLoading } = useQuery( //need to call unconditionally
    ['job-item', id],
    () => id ? fetchJobItem(id) : null,
    {
      staleTime: 1000 * 60 * 60, //every hour update
      refetchOnWindowFocus: false,
      retry: false,
      enabled: Boolean(id), //casting id to bool
      onError: handleError
    }
  );
  return {jobItem: data?.jobItem, isLoading: isInitialLoading} as const;
}

// ------------------------------

export function useJobItems(ids: number[]) {
  const results = useQueries({
    queries: ids.map(id => ({
      queryKey: ['job-item', id],
      queryFn: () => fetchJobItem(id),
      staleTime: 1000 * 60 * 60, //every hour update
      refetchOnWindowFocus: false,
      retry: false,
      onError: handleError
    }))
  });
  const jobItems = results.map(result=>result.data?.jobItem).filter((jobItem) => Boolean(jobItem)) as JobItemExpanded[];
  const isLoading = results.some(result => result.isLoading);

  return {
    jobItems,
    isLoading
  }
}

// ------------------------------

type JobItemsApiResponse = {
  public: boolean;
  sorted: boolean;
  jobItems: JobItem[];
}

const fetchJobItems = async (searchText: string): Promise<JobItemsApiResponse> => {
  
  const res = await fetch(`${BASE_API_URL}?search=${searchText}`);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.description);
  }
  const data = await res.json();
  return data;
}

//with react query implementation
export function useSearchQuery(searchText: string) {
  const { data, isInitialLoading } = useQuery(
    ['job-items', searchText],
    () => fetchJobItems(searchText),
    { 
      staleTime: 1000 * 60 * 60, //every hour update
      refetchOnWindowFocus: false,
      retry: false,
      enabled: Boolean(searchText), //casting searchText to bool
      onError: handleError
    }
  );
  
  return {
    jobItems: data?.jobItems,
    isLoading: isInitialLoading
  };
}

// -------------------------------
//before react query implementation
// export function useJobItems(searchText: string) {
//   const [jobItems, setJobItems] = useState<JobItem[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (!searchText) return;
  
//     //cannot add async in useEffect directly
//     const fetchData = async () => {
//       setIsLoading(true);
//       const res = await fetch(
//         `${BASE_API_URL}?search=${searchText}`
//       );
//       const data = await res.json();
//       setIsLoading(false);
//       setJobItems(data.jobItems);
//     };
  
//     fetchData();
//   }, [searchText]);

//   return [
//       jobItems,
//       isLoading
//   ] as const;

// }

export function useDebounce<T>(value: T, delay = 500) : T {
    const [debouncedValue, setDebouncedValue] = useState(value);
  
    useEffect(() => {
      const timerId = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(timerId);
    }, [value, delay]);

    return debouncedValue;
  }


export function useActiveId() {
    
  const [activeId, setActiveId] = useState<number | null>(null);
  
  useEffect(() => {
      const handleHashChange = () => {
          const id = +window.location.hash.slice(1);
          setActiveId(id);
      };
      
      handleHashChange();
      
      window.addEventListener("hashchange", handleHashChange);
      
      return () => {
          window.removeEventListener("hashchange", handleHashChange);
      };
  }, []);
  
  return activeId;
  
}

export function useLocalStorage(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(() =>
  JSON.parse(localStorage.getItem(key) || JSON.stringify(initialValue))
);

useEffect(() => {
  localStorage.setItem(key, JSON.stringify(value));
}, [value, key]);

return [value, setValue];

}

export function useOnClickOutside(refs: React.RefObject<HTMLElement>[], handler: () => void) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        refs.every((ref) => !ref.current?.contains(e.target as Node))
      ) {
        handler();
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [refs, handler]);
}




export function useBookmarksContext() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error(
      "useBookmarksContext must be used within a BookmarksContextProvider"
    );
  }

  return context;
}


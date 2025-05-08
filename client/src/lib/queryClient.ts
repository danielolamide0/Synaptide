import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  urlOrOptions: string | { url: string; method?: string; body?: any },
  options?: RequestInit
): Promise<Response> {
  let url: string;
  let finalOptions: RequestInit = { ...options };

  if (typeof urlOrOptions === 'string') {
    url = urlOrOptions;
    // If called with old signature: apiRequest('GET', '/api/messages')
    if (options && !options.method) {
      finalOptions.method = options.toString();
    }
  } else {
    // New signature: apiRequest({ url: '/api/users', method: 'POST', body: { name: 'User' } })
    url = urlOrOptions.url;
    finalOptions.method = urlOrOptions.method || 'GET';
    
    if (urlOrOptions.body) {
      if (typeof urlOrOptions.body === 'string') {
        finalOptions.body = urlOrOptions.body;
      } else {
        finalOptions.body = JSON.stringify(urlOrOptions.body);
        finalOptions.headers = {
          ...finalOptions.headers,
          'Content-Type': 'application/json'
        };
      }
    }
  }

  if (!finalOptions.method) {
    finalOptions.method = 'GET';
  }
  
  finalOptions.credentials = 'include';

  const res = await fetch(url, finalOptions);
  
  // Don't throw error for 404s when getting user data - just let the component handle it
  if (url.includes('/api/users') && finalOptions.method === 'GET' && res.status === 404) {
    return res;
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

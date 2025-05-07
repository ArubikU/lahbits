import { cookies } from "isomorphic-next/headers";
import { apiCache } from "./use-cache";

export const API_URLS = {
    AUTH: {
        LOGIN: "/api/auth/login",
        REGISTER: "/api/auth/register"
    },
    USER: {
        UPDATE: "/api/user",
        GET: "/api/user",
        TASKS: "/api/tasks",
        TASKS_UNCOMPLETED: "/api/tasks?state=false",
        TASKS_COMPLETED: "/api/tasks?state=true",
        TASKS_FAILED: "/api/tasks?state=failed",
        STATS: "/api/stats",
        STREAK: "/api/streak",
        STREAK_BONUSES: "/api/streak?bonuses=true",
        STREAK_RECOVER: "/api/streak?recover=true",
        STREAK_UPDATE: "/api/streak?update=true",
        STATS_CATEGORIES: "/api/categories",
        MARKETPLACE_ITEMS: "/api/marketplace?st=items",
        MARKETPLACE_PURCHASES: "/api/marketplace?st=purchases",
        
    },
    MARKETPLACE: {
        CREATE: "/api/marketplace?action=create",
        TOGGLE: "/api/marketplace?action=toggle",
        DELETE: "/api/marketplace?action=delete",
        UPDATE: "/api/marketplace?action=update",
        PURCHASE: "/api/marketplace?action=purchase",
    },
    STATS: {
        CREATE: "/api/stats?action=create",
        DELETE: "/api/stats?action=delete",
        UPDATE: "/api/stats?action=update",
    },
    CATEGORIES: {
        CREATE: "/api/categories?action=create",
        UPDATE: "/api/categories?action=update",
        DELETE: "/api/categories?action=delete",
    },
    LEVELING: {
        GET: "/api/leveling",
    },
    TASK: {
        CREATE: "/api/tasks?action=create",
        COMPLETE: "/api/tasks?action=complete",
        UPDATE: "/api/tasks?action=update",
        DELETE: "/api/tasks?action=delete",
        FAVORITE: "/api/tasks?action=favorite",
        UNFAVORITE: "/api/tasks?action=unfavorite",
    },
    NIP: {
        CREATE: "/api/pin?action=create",
        UPDATE: "/api/pin?action=update",
        VALIDATE : "/api/pin?action=validate",
        HAS: "/api/pin",
    },
    AI: {
        GENERATE: "/api/ai/generate",
        SUGGEST: "/api/ai/suggest",
    },
    NOTIFICATIONS: {
        REGISTER_DEVICE: "/api/notifications?action=register",
        HAS: "/api/notifications",
    },
    IMAGE: "/api/image",
}


interface ExtendedRequestInit extends RequestInit {
    objectbody?: string | FormData | URLSearchParams | {[key: string]: any }
    ttl?: number
}

function apiRequest(url: string, method: string,  options?: ExtendedRequestInit): any {
    const sessionId = cookies().get("sessionId") || localStorage.getItem("sessionId") || null
    if(method==="FORM"){
        const opt = options as RequestInit
        return fetch(url, { 
            method: "POST",
            body: opt.body,
            headers: {
                Authorization: sessionId ? `Bearer ${sessionId}` : "",
            },
        })
            .then((res) => res.json())
            .catch((error) => {
                console.error(`Error with ${method} request:`, error);
                throw error;
            });

    }
    const convertedobject = JSON.parse(options?.body as string || "{}")
    const objectbody = options?.objectbody || convertedobject || {}
    const mixedbody = {
        ...objectbody,
        ...convertedobject,
    }

    if(method==="GET"){
        
    return fetch(url, {
        method,
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: sessionId ? `Bearer ${sessionId}` : "",
            ...options?.headers,
        },
    })
        .then((res) => res.json())
        .catch((error) => {
            console.error(`Error with ${method} request:`, error);
            throw error;
        });
    }
    if(method==="GET_CACHE"){
        const cacheKey = `${url}?${new URLSearchParams(mixedbody as string)}?${sessionId}`
        const cacheTTL = options?.ttl || 300 // Default TTL is 5 minutes (300 seconds)
        
        const cachedResponse = apiCache.get(cacheKey) as any
        if (cachedResponse) {
            if(cachedResponse.result){
                console.log(`Cache hit for ${cacheKey}`)
                console.log(cachedResponse)
                return cachedResponse
            }
        }
        const response = fetch(url, {
            method: "GET",
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: sessionId ? `Bearer ${sessionId}` : "",
                ...options?.headers,
            },
        })
            .then((res) => {
                const jsonResponse = res.json()
                jsonResponse.then((data) => {
                    apiCache.set(cacheKey, data, cacheTTL)
                    console.log(`Cache set for ${cacheKey}`)
                })
                return jsonResponse
            })
            .catch((error) => {
                console.error(`Error with ${method} request:`, error);
                throw error;
            });
        return response
    }
    return fetch(url, {
        method,
        body: JSON.stringify(mixedbody),
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: sessionId ? `Bearer ${sessionId}` : "",
            ...options?.headers,
        },
    })
        .then((res) => res.json())
        .catch((error) => {
            console.error(`Error with ${method} request:`, error);
            throw error;
        });
}


export async function fetcherWithCache<T>(
    url: string,
    options?: ExtendedRequestInit,
    ttl: number = 300
  ): Promise<T | any> {
    return apiRequest(url, "GET_CACHE", {...options, ttl});
  }
  

export async function fetcher(url: string, options?: ExtendedRequestInit) {
    return apiRequest(url, "GET",  options);
}

export async function poster(url: string,  options?: ExtendedRequestInit) {
    return apiRequest(url, "POST",  options);
}

export async function putter(url: string,  options?: ExtendedRequestInit) {
    return apiRequest(url, "PUT",  options);
}

export async function deleter(url: string, options?: ExtendedRequestInit) {
    return apiRequest(url, "DELETE", options);
}

export async function patcher(url: string,  options?: ExtendedRequestInit) {
    return apiRequest(url, "PATCH",  options);
}

export async function former(url: string,  options?: RequestInit) {
    return apiRequest(url, "FORM",  options);
}
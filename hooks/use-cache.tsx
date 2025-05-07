
type CacheItem<T> = {
    data: T;
    expiry: number;
  };
  
  class MemoryCache {
    private cache: Map<string, CacheItem<any>> = new Map();
    private isBrowser = typeof window !== 'undefined';
    private prefix = 'cache:'; // Prefijo para aislar la caché
  
    private getFromLocalStorage<T>(key: string): CacheItem<T> | null {
      if (!this.isBrowser) return null;
  
      try {
        const itemStr = localStorage.getItem(this.prefix + key);
        if (!itemStr) return null;
  
        const item = JSON.parse(itemStr) as CacheItem<T>;
        if (Date.now() > item.expiry) {
          localStorage.removeItem(this.prefix + key);
          return null;
        }
  
        return item;
      } catch {
        return null;
      }
    }
  
    private saveToLocalStorage<T>(key: string, item: CacheItem<T>): void {
      if (!this.isBrowser) return;
  
      try {
        localStorage.setItem(this.prefix + key, JSON.stringify(item));
      } catch {
        // No rompas nada, localStorage es caprichoso
      }
    }
  
    private removeFromLocalStorage(key: string): void {
      if (this.isBrowser) {
        localStorage.removeItem(this.prefix + key);
      }
    }
  
    get<T>(key: string): T | null {
      const memoryItem = this.cache.get(key);
      if (memoryItem) {
        if (Date.now() > memoryItem.expiry) {
          this.cache.delete(key);
          this.removeFromLocalStorage(key);
          return null;
        }
        return memoryItem.data as T;
      }
  
      const localItem = this.getFromLocalStorage<T>(key);
      if (localItem) {
        this.cache.set(key, localItem);
        console.log(localItem)
        return localItem.data;
      }
  
      return null;
    }
  
    set<T>(key: string, data: T, ttl: number = 300): void {
      console.log("Setting cache for key:", key, "with data:", JSON.stringify(data));
      const expiry = Date.now() + ttl * 1000;
      const item: CacheItem<T> = { data, expiry };
      console.log("Cache item:", JSON.stringify(item));
  
      this.cache.set(key, item);
      this.saveToLocalStorage(key, item);
    }
  
    delete(key: string): void {
      this.cache.delete(key);
      this.removeFromLocalStorage(key);
    }

    invalidate(url: string): void {
        const keysToDelete: string[] = [];
    
        for (const key of this.cache.keys()) {
            if (key.startsWith(url)) {
            keysToDelete.push(key);
            }
        }
    
        for (const key of keysToDelete) {
            this.delete(key);
        }

    }

    override<T>(url: string, dispatcher: React.Dispatch<T> | T ): void {
        const keysToOverride: string[] = [];
    
        for (const key of this.cache.keys()) {
            if (key.startsWith(url)) {
            keysToOverride.push(key);
            }
        }
    
        for (const key of keysToOverride) {
            const item = this.cache.get(key);
            if (item) {
              let modifiedItemResult = item;
              if(item.data && item.data.result){
                if (typeof dispatcher === 'function') {
                  modifiedItemResult.data.result = (dispatcher as React.Dispatch<T>)(item.data.result);
                } else {
                  modifiedItemResult.data.result = dispatcher;
                }
                  this.set(key, modifiedItemResult, item.expiry - Date.now());
            }
            }
        }
    }
  
    prune(): void {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
          this.removeFromLocalStorage(key);
        }
      }
    }
  
    clear(): void {
      this.cache.clear();
      if (this.isBrowser) {
        for (const key in localStorage) {
          if (key.startsWith(this.prefix)) {
            localStorage.removeItem(key);
          }
        }
      }
    }
  }
  
  export const apiCache = new MemoryCache();
  
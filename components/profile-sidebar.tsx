'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Import Sheet components
import { API_URLS, fetcher, fetcherWithCache, poster } from "@/hooks/use-api";
import { apiCache } from "@/hooks/use-cache";
import { useMobile } from "@/hooks/use-mobile"; // Import useMobile
import { clearAuth } from "@/lib/auth";
import { Stat, Task, User } from "@/types";
import { Coins, DoorOpen, Menu, SettingsIcon, Star } from "lucide-react"; // Import Menu icon
import Image from "next/image";
import { useEffect, useState } from "react";
import OneSignal from 'react-onesignal';
import { NavMenu } from "./nav-menu";
import { ProgressBar } from "./ui/progress-bar";

interface ProfileSidebarProps {
  user?: User;
  stats?: Stat[];
  setUser?: React.Dispatch<React.SetStateAction<User | undefined>>;
}

export function ProfileSidebar({ user, stats,setUser }: ProfileSidebarProps) {
  const [failedTasks, setFailedTasks] = useState<Task[]>([]);
  const [nextLevelXp, setNextLevelXp] = useState(0);
  const [statsByCategory, setStatsByCategory] = useState<Record<string, { color: string; icon?: string; stats: Stat[] }>>({});
  const [displayedLevel, setDisplayedLevel] = useState(0);
  const isMobile = useMobile(); // Call the hook
useEffect(() => {
  OneSignal.init({ appId: '7a7b90ee-92f1-404b-abb0-7f126f313a95',autoRegister: true,allowLocalhostAsSecureOrigin: true,autoResubscribe: true
   }).then(() => {
    const userId = OneSignal.User.onesignalId
    if (userId) {
      poster(API_URLS.NOTIFICATIONS.REGISTER_DEVICE, {objectbody:{
        device_id: userId,
      }})
    }
  });
  fetcher(API_URLS.NOTIFICATIONS.HAS)
}, []);

  useEffect(() => {
    const fetchData = async () => {
      const userTasks = await fetcherWithCache(API_URLS.USER.TASKS_FAILED)
      if(userTasks.result) {
        
        setFailedTasks(userTasks.result);
        if(setUser){
          const commulativeXp = userTasks.result.reduce((acc: number, task: Task) => acc + task.xp_reward, 0);
          let reducedXp = Math.ceil(commulativeXp * 3/4) * -1;
          setUser((prev) => {
            if (prev) {
              return {
                ...prev,
                current_xp: prev.current_xp + reducedXp,
              };
            }
            return prev;
          });
          apiCache.invalidate(API_URLS.USER.GET);
        }
      }

      const levInfo = await fetcherWithCache(API_URLS.LEVELING.GET)
      if(levInfo.result){
        setNextLevelXp(levInfo.result.xp_required);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (stats) {
      const categorizedStats = stats.reduce((acc, stat) => {
        if (!stat.category) return acc;
        if (!acc[stat.category.name]) {
          acc[stat.category.name] = {
            color: stat.category.color,
            icon: stat.category.icon,
            stats: [],
          };
        }
        acc[stat.category.name].stats.push(stat);
        return acc;
      }, {} as Record<string, { color: string; icon?: string; stats: Stat[] }>);
      setStatsByCategory(categorizedStats);
    }
  }
    , [stats]);
  useEffect(() => {
    if (user) {
      setDisplayedLevel(user.current_level - user.prestige_level * 100)
    }
  }, [user])
  const userIconContent = () => {
    if (!user) {
      return (
        <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center text-gray-500" />
      );
    }

    return user.profile_image_url ? (
      <Image
        src={user.profile_image_url}
        alt={user.nickname || user.username}
        fill
        className="rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    ) : (
      <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center text-gray-500">
        {user.nickname?.[0] || user.username[0]}
      </div>
    );
  };


  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Perfil del usuario */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32 mb-3">
          {userIconContent()}
        </div>
        <h2 className="text-lg font-semibold text-white">
          {user ? (
            user.nickname || user.username
          ) : (
            <div className="h-6 w-32 rounded border border-transparent animate-pulse bg-white/10"></div>
          )}
        </h2>


        <div className="mt-2 w-full">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              {(displayedLevel || displayedLevel >=0) ? (
                <span className="text-sm text-gray-300">Nivel {displayedLevel}</span>
              ) : (
                <div className="h-5 w-24 rounded border border-transparent animate-pulse bg-white/10"></div>
              )}
            </div>
            {user ? (
              <span className="text-xs text-gray-400">
                {user.current_xp}/{nextLevelXp}
              </span>
            ) : (
              <div className="h-4 w-20 rounded border border-transparent animate-pulse bg-white/10"></div>
            )}
          </div>
          <ProgressBar
            value={user?.current_xp || 0}
            max={nextLevelXp}
            color="#10b981"
          />
        </div>

        <div className="mt-2 text-sm text-yellow-500 flex items-center">
          <Coins className="w-4 h-4 mr-1" />
          {user?(<span>{user.gold} Oro</span>) : (<span>0 Oro</span>)}
        </div>
      </div>

      <NavMenu />

      {/* Failed Tasks Dialog Trigger */}
      <Dialog>
        <DialogTrigger asChild>
          {failedTasks.length > 0 && (
            <div className="mt-4">
              <button className="w-full text-sm font-medium text-gray-300 bg-red-600 hover:bg-red-500 py-2 rounded">
                Tienes tareas fallidas ({failedTasks.length})
              </button>
            </div>
          )}
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-none rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              Tareas Fallidas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {failedTasks.length > 0 ? (
              failedTasks.map((task: any) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg shadow-md ${task.is_failed ? "bg-red-600 border-2 border-red-700" : "bg-gray-800"
                    }`}
                >
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-300 mt-2">{task.description}</p>
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-400">
                      Recompensa: {task.xp_reward} XP
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${task.is_failed ? "bg-red-500 text-white" : "bg-green-500 text-white"
                        }`}
                    >
                      {task.is_failed ? "Fallida" : "Completada"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400">No hay tareas fallidas.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog Trigger */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="mt-4 w-full text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 py-2 rounded">
            Ver Stats
          </button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-none rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Tus Stats</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {Object.entries(statsByCategory).map(([category, { color, icon, stats }]) => {
              const totalCurrent = stats.reduce((sum, s) => sum + s.current_value, 0);
              const totalMax = stats.reduce((sum, s) => sum + s.max_value, 0);
              const rawPercent = (totalCurrent / totalMax) * 100;
              const cappedPercent = Math.min(rawPercent, 200).toFixed(1);

              return (
                <div key={category}>
                  <h4 className="text-xs font-medium text-gray-400 mb-1 uppercase flex justify-between">
                    <span>{category}</span>
                    <span className="text-[10px] font-normal" style={{ color }}>
                      {cappedPercent}% acumulado
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {stats.map((stat) => (
                      <div key={stat.id} className="flex items-center">
                        {icon && (
                          <span className="mr-2 text-lg" style={{ color }}>
                            {icon}
                          </span>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-300">{stat.name}</span>
                            <span className="text-xs text-gray-500">
                              {stat.current_value}/{stat.max_value}
                            </span>
                          </div>
                          <ProgressBar
                            value={stat.current_value}
                            max={stat.max_value}
                            color={color}
                            height={4}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {/* settings */}
          <div className="grid grid-cols-[repeat(2,1fr)] grid-rows-[1fr] gap-y-[10px] gap-x-[10px]">

          <div className="mt-4">
            <button className="w-full text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 py-2 rounded"
              onClick={() => {
                window.location.href = "/settings/stats";
              }}>
              <div className="flex items-center justify-center gap-2">
                <SettingsIcon />
                <span>Stats</span>
              </div>
            </button>
          </div>
          
            <div className="mt-4">
            <button className="w-full text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 py-2 rounded"
              onClick={() => {
              window.location.href = "/settings/categories";
              }}>
              <div className="flex items-center justify-center gap-2">
              <SettingsIcon />
              <span>Categorias</span>
              </div>
            </button>
            </div>
</div>
        </DialogContent>
      </Dialog>

      
          <button className="mt-4 w-full text-sm font-medium text-white-600 bg-red-600 hover:bg-red-700 py-2 rounded"
          
              onClick={() => {
                clearAuth();
                window.location.href = "/auth?stage=login";
              }}
          >
            
              <div className="flex items-center justify-center gap-2">
            <DoorOpen></DoorOpen> <span>Cerrar Sesión</span>
            </div>
          </button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          {/* Consider moving this button to your main layout's header for mobile */}
          <button className="fixed top-4 right-4 z-50 p-2 bg-gray-800 text-white rounded-md md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gray-900 text-white p-4 border-none overflow-y-auto">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop view (original layout)
  return (
    <div className="w-64 bg-gray-900 h-screen p-4 flex-col hidden md:flex"> {/* Added hidden md:flex */}
      {sidebarContent}
      {/* Keep the original failed tasks notification for desktop */}
      {failedTasks.length > 0 && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md text-sm">
          ¡Tienes tareas fallidas!
        </div>
      )}
    </div>
  );
}

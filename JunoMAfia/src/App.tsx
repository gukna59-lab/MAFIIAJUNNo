import React, { useState, useEffect, useRef } from 'react';
import { useStore } from './store.js';
import { LogOut, Users, MessageSquare, Play, Info, ShieldAlert, Flag, Moon, Sun, X, Skull, CheckCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Subcomponents
function NicknameScreen({ onJoin }: { onJoin: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div className="flex items-center justify-center min-h-screen relative p-4 overflow-hidden z-0">
      <div className="absolute inset-0 pointer-events-none -z-10 bg-slate-50 dark:bg-[#101423] transition-colors duration-500">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 dark:bg-indigo-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/20 dark:bg-rose-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '11s' }} />
      </div>
      
      <div className="max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-500 flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-indigo-600 rounded-2xl rotate-3 mb-6 flex items-center justify-center shadow-lg shadow-rose-500/20">
           <span className="text-white font-black text-3xl -rotate-3">M</span>
        </div>
        <h1 className="text-2xl font-black mb-1 text-center text-slate-900 dark:text-white tracking-tight">Mafia Juno</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6 text-center">Telegram Web App</p>
        <input 
          autoFocus
          className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-white transition-all text-center"
          placeholder="Введи никнейм..." 
          value={name} 
          maxLength={15}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onJoin(name.trim())}
        />
        <button 
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-900/20 active:scale-95 disabled:opacity-50"
          onClick={() => name.trim() && onJoin(name.trim())}
          disabled={!name.trim()}
        >
          Зайти в игру
        </button>
      </div>
    </div>
  );
}

function GlobalChat() {
  const { messages, socket, myId, players } = useStore();
  const [text, setText] = useState('');
  
  const handleSend = () => {
    if (text.trim() && socket) {
      socket.emit('sendChat', text.trim(), true);
      setText('');
    }
  };

  return (
    <div className="flex flex-col h-[280px] bg-white dark:bg-[#101423] rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm shadow-black/5">
      <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 font-bold text-sm flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80">
        <MessageSquare size={16} className="text-blue-500" /> 
        <span className="text-slate-900 dark:text-white">Глобальный чат</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse custom-scrollbar">
        {[...messages].reverse().filter(m => m.isGlobal).map(m => {
          const isMe = m.senderId === myId;
          const sender = players[m.senderId];
          return (
            <div key={m.id} className={cn("flex flex-col max-w-[85%]", isMe ? "self-end items-end" : "self-start items-start")}>
              <span className="text-[10px] font-semibold mb-0.5 px-1 opacity-70" style={{color: sender?.vipColor || (isMe ? '#fb7185' : '#60a5fa')}}>
                {m.senderName}
              </span>
              <div className={cn(
                "px-3 py-2 rounded-2xl text-sm drop-shadow-sm",
                isMe 
                  ? "bg-rose-500 text-white rounded-br-sm" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700/50"
              )}>
                {m.text}
              </div>
            </div>
          );
        })}
        {messages.filter(m => m.isGlobal).length === 0 && (
          <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-4 my-auto">
            Здесь пока тихо...
          </div>
        )}
      </div>
      <div className="p-3 bg-white dark:bg-[#101423] border-t border-slate-200 dark:border-slate-800/80">
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium transition-all"
          placeholder="Сообщение..."
        />
      </div>
    </div>
  );
}

function MainMenu() {
  const { players, rooms, socket, myId, reports } = useStore();
  const me = myId ? players[myId] : null;

  useEffect(() => {
    if (me?.isAdmin) {
       socket?.emit('getReports');
    }
  }, [me?.isAdmin, socket]);
  
  const [activeTab, setActiveTab] = useState<'ROOMS' | 'SHOP' | 'ADMIN'>('ROOMS');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [createData, setCreateData] = useState({ show: false, name: `${me?.nickname || 'Игрок'}'s Room`, maxPlayers: 10, isPrivate: false, password: '' });
  const [joinData, setJoinData] = useState<{ show: boolean, roomId: string, password: '' }>({ show: false, roomId: '', password: '' });

  // Users currently online in the menu
  const onlinePlayers = Object.values(players).filter(p => p.status === 'IN_MENU' || p.status === 'IN_ROOM');

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
       document.documentElement.classList.add('dark');
    } else {
       document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-4 min-h-[100dvh] pb-8">
      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-3/4 max-w-xs bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-300">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Users size={20} className="text-rose-500" /> Онлайн ({onlinePlayers.length})</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {onlinePlayers.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 relative group">
                  <div className="flex items-center gap-3 overflow-hidden">
                     {p.avatar ? (
                       <img src={p.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm" />
                     ) : (
                       <div className="w-9 h-9 bg-gradient-to-tr from-rose-500 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm">
                         {p.nickname.charAt(0).toUpperCase()}
                       </div>
                     )}
                     <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate text-sm" style={{color: p.vipColor || undefined}}>
                          {p.nickname} {p.id === myId && <span className="text-xs text-slate-400 font-normal">(Ты)</span>}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span className={cn("w-1.5 h-1.5 rounded-full", p.status === 'IN_ROOM' ? 'bg-amber-500' : 'bg-emerald-500')}></span>
                          {p.status === 'IN_ROOM' ? 'В комнате' : 'В лобби'}
                        </span>
                     </div>
                  </div>
                  {p.id !== myId && p.status === 'IN_ROOM' && p.roomId && (
                    <button 
                      onClick={() => {
                        socket?.emit('joinRoom', p.roomId);
                        setIsDrawerOpen(false);
                      }}
                      className="text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1.5 rounded-lg active:scale-95 transition-all shadow-md shadow-rose-900/20"
                    >
                      Войти
                    </button>
                  )}
                  {p.id !== myId && p.status === 'IN_MENU' && me?.roomId && (
                    <button 
                      onClick={() => {
                        socket?.emit('invitePlayer', p.id);
                        document.dispatchEvent(new CustomEvent('toast', { detail: 'Приглашение отправлено' }));
                      }}
                      className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg active:scale-95 transition-all shadow-md shadow-indigo-900/20"
                    >
                      Позвать
                    </button>
                  )}
                </div>
              ))}
            </div>
            {(me?.nickname?.toLowerCase() === 'admin' || me?.isAdmin) && (
               <button onClick={() => document.dispatchEvent(new CustomEvent('open-admin-panel'))} className="mt-4 w-full border-2 border-rose-500/50 text-rose-500 p-3 rounded-xl font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                 <ShieldAlert size={18} /> Админ Панель
               </button>
            )}
            <button onClick={() => setIsDrawerOpen(false)} className="mt-2 w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-slate-600 dark:text-slate-300 font-semibold active:scale-[0.98] transition-transform">Закрыть</button>
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-start">
           <div className="flex items-center gap-3">
             <div className="relative">
               {me?.avatar ? (
                 <img src={me.avatar} alt="Avatar" className="w-12 h-12 rounded-xl object-cover shadow-sm ring-2 ring-transparent" />
               ) : (
                 <div className="w-12 h-12 bg-gradient-to-tr from-rose-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-sm">
                    {me?.nickname.charAt(0).toUpperCase() || '?'}
                 </div>
               )}
               <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
             </div>
             
             <div className="flex flex-col">
               <h2 className="font-bold text-lg leading-tight" style={{color: me?.vipColor || undefined}}>
                 {me?.nickname || 'Loading...'}
               </h2>
               <div className="flex items-center gap-2 text-xs font-semibold mt-0.5">
                 <span className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                   <div className="w-3 h-3 rounded-full bg-amber-400"></div> {me?.coins || 0}
                 </span>
                 <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                   {me?.wins || 0} Поб.
                 </span>
                 <span className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                   {me?.matchesPlayed || 0} Игр
                 </span>
               </div>
             </div>
           </div>

           <div className="flex gap-2">
             <button 
               onClick={() => setIsDrawerOpen(true)}
               className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl active:scale-95 transition-all"
             >
                <Users size={18} />
             </button>
             <button 
               onClick={toggleTheme}
               className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl active:scale-95 transition-all"
             >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
           </div>
        </div>

        {/* Tab Navigation inside Header */}
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl">
          <button 
            onClick={() => setActiveTab('ROOMS')} 
            className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all shadow-sm", activeTab === 'ROOMS' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 shadow-none")}
          >
            Игры
          </button>
          <button 
            onClick={() => setActiveTab('SHOP')} 
            className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all shadow-sm", activeTab === 'SHOP' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 shadow-none")}
          >
            Магазин
          </button>
          {me?.isAdmin && (
            <button 
              onClick={() => setActiveTab('ADMIN')} 
              className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all shadow-sm", activeTab === 'ADMIN' ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400 shadow-none")}
            >
              Админ
            </button>
          )}
        </div>
        
        {me?.status === 'PENALTY' && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 border border-red-100 dark:border-red-900/30">
            <ShieldAlert size={16} className="shrink-0" />
            У вас штраф. Вернитесь в игру или дождитесь окончания.
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 gap-4">
        {activeTab === 'ROOMS' && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                Список комнат
              </h2>
              <button 
                onClick={() => setCreateData({...createData, show: true})}
                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md shadow-rose-900/20 active:scale-95 disabled:opacity-50"
                disabled={me?.status === 'PENALTY'}
              >
                Создать игру
              </button>
            </div>
            
            <div className="space-y-3">
              {Object.values(rooms).length === 0 ? (
                <div className="text-center p-8 text-slate-500 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl text-sm font-medium">
                  Нет активных комнат
                </div>
              ) : (
                Object.values(rooms).map(room => (
                  <div key={room.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 leading-none">
                        {room.name}
                        {room.isPrivate && <ShieldAlert size={14} className="text-amber-500" />}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                         <span className={cn("px-2 py-0.5 rounded-md", room.players.length >= room.maxPlayers ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400')}>
                           {room.players.length}/{room.maxPlayers}
                         </span>
                         <span className="text-slate-400 dark:text-slate-500">
                           {room.status === 'WAITING' ? 'Ожидание' : 'В игре'}
                         </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (room.status !== 'WAITING') {
                           document.dispatchEvent(new CustomEvent('toast', { detail: 'Игра уже началась!' }));
                           return;
                        }
                        if (room.isPrivate) {
                           setJoinData({ show: true, roomId: room.id, password: '' });
                        } else {
                           socket?.emit('joinRoom', room.id);
                        }
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm",
                        room.status === 'WAITING' ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {room.status === 'WAITING' ? (room.isPrivate ? 'Код' : 'Войти') : 'Идет'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'SHOP' && (
          <div className="flex flex-col gap-3">
             <div className="px-1 flex justify-between items-end">
               <h2 className="font-bold text-lg">Магазин 💎</h2>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-16 h-16 bg-rose-500/10 rounded-full blur-xl"></div>
                  <span className="font-bold text-rose-500 text-sm mb-1">Ник (Red)</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mb-3">Сделай свой ник розовым.</span>
                  <button onClick={() => socket?.emit('buyItem', 'color_#fb7185')} className="mt-auto bg-amber-500 hover:bg-amber-400 font-bold py-1.5 rounded-lg text-amber-950 text-xs w-full shadow-sm">Купить (50 🪙)</button>
                </div>
                <div className="flex flex-col p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
                  <span className="font-bold text-emerald-500 text-sm mb-1">Ник (Green)</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mb-3">Сделай свой ник зеленым.</span>
                  <button onClick={() => socket?.emit('buyItem', 'color_#34d399')} className="mt-auto bg-amber-500 hover:bg-amber-400 font-bold py-1.5 rounded-lg text-amber-950 text-xs w-full shadow-sm">Купить (50 🪙)</button>
                </div>
                <div className="flex flex-col p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm col-span-2 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl"></div>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <ShieldAlert size={20} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Бронежилет</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">Защита от одного выстрела мафии ночью в следующей игре.</span>
                    </div>
                    <button onClick={() => socket?.emit('buyItem', 'armor')} className="ml-auto shrink-0 self-center bg-amber-500 hover:bg-amber-400 font-bold px-3 py-2 rounded-xl text-amber-950 text-xs shadow-sm">100 🪙</button>
                  </div>
                </div>
                <div className="flex flex-col p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm col-span-2 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-500/10 rounded-full blur-xl"></div>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                      <Users size={20} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Контракт Дона</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">Повышает шанс стать Доном мафии.</span>
                    </div>
                    <button onClick={() => socket?.emit('buyItem', 'boost_don')} className="ml-auto shrink-0 self-center bg-amber-500 hover:bg-amber-400 font-bold px-3 py-2 rounded-xl text-amber-950 text-xs shadow-sm">100 🪙</button>
                  </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'ADMIN' && (
          <div className="flex flex-col gap-3">
             <h2 className="font-bold text-lg px-1 text-rose-500">Жалобы игроков</h2>
             <div className="space-y-3">
               {reports.length === 0 ? (
                 <div className="text-center p-8 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl text-slate-500 text-sm font-medium">
                   Жалоб пока нет.
                 </div>
               ) : (
                 reports.map(r => (
                    <div key={r.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-500 font-medium">От: <span className="font-bold text-slate-900 dark:text-white">{r.reporterName}</span></span>
                         <span className="text-slate-400">{new Date(r.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-sm">
                        На игрока: <span className="font-bold text-rose-500">{r.targetName}</span> <span className="text-slate-400 text-xs">(ID: {r.targetId})</span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm border border-slate-100 dark:border-slate-800/80">
                        {r.reason}
                      </div>
                      <div className="flex justify-end gap-2 mt-1">
                         <button onClick={() => socket?.emit('adminAction', 'dismiss', r.targetId)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-xs active:scale-95">Отклонить</button>
                         <button onClick={() => socket?.emit('adminAction', 'ban', r.targetId)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-xs active:scale-95 shadow-sm shadow-red-900/20">Забанить</button>
                      </div>
                    </div>
                 ))
               )}
             </div>
          </div>
        )}

        <div className="mt-auto pt-4">
          <GlobalChat />
        </div>
      </div>

      {createData.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreateData({...createData, show: false})}></div>
           <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold">Настройки комнаты</h2>
              <div className="space-y-3">
                <input 
                  value={createData.name} 
                  onChange={e => setCreateData({...createData, name: e.target.value})} 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 rounded-xl focus:outline-none focus:ring-2 ring-rose-500 text-sm font-medium"
                  placeholder="Название комнаты"
                />
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Макс. игроков</span>
                  <input 
                    type="number" 
                    min={4} max={16} 
                    value={createData.maxPlayers} 
                    onChange={e => setCreateData({...createData, maxPlayers: Math.max(4, parseInt(e.target.value))})} 
                    className="w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1.5 rounded-lg text-center text-sm font-bold focus:outline-none focus:ring-2 ring-rose-500"
                  />
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => setCreateData({...createData, isPrivate: !createData.isPrivate})}>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Приватная комната</span>
                  <input type="checkbox" checked={createData.isPrivate} readOnly className="w-5 h-5 accent-rose-600 rounded cursor-pointer"/>
                </div>
                {createData.isPrivate && (
                  <input 
                    value={createData.password} 
                    onChange={e => setCreateData({...createData, password: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-amber-200 dark:border-amber-900/30 p-3 rounded-xl focus:outline-none focus:ring-2 ring-amber-500 text-sm font-medium"
                    placeholder="Пароль (код)"
                  />
                )}
              </div>
              <div className="flex gap-2 mt-2">
                 <button onClick={() => setCreateData({...createData, show: false})} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold active:scale-95 transition-transform text-sm">Отмена</button>
                 <button onClick={() => {
                   socket?.emit('createRoom', createData.name, createData.isPrivate, createData.maxPlayers, createData.password);
                   setCreateData({...createData, show: false});
                 }} className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-rose-900/50 hover:bg-rose-500 active:scale-95 transition-transform text-sm">Создать</button>
              </div>
           </div>
        </div>
      )}

      {joinData.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setJoinData({...joinData, show: false})}></div>
           <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold">Вход в комнату</h2>
              <input 
                autoFocus
                value={joinData.password} 
                onChange={e => setJoinData({...joinData, password: e.target.value})} 
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 rounded-xl focus:outline-none focus:ring-2 ring-indigo-500 text-sm font-medium"
                placeholder="Введите пароль..."
                onKeyDown={e => {
                  if(e.key === 'Enter') {
                    socket?.emit('joinRoom', joinData.roomId, joinData.password);
                    setJoinData({...joinData, show: false});
                  }
                }}
              />
              <div className="flex gap-2 mt-2">
                 <button onClick={() => setJoinData({...joinData, show: false})} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold active:scale-95 transition-transform text-sm">Отмена</button>
                 <button onClick={() => {
                   socket?.emit('joinRoom', joinData.roomId, joinData.password);
                   setJoinData({...joinData, show: false});
                 }} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/50 hover:bg-indigo-500 active:scale-95 transition-transform text-sm">Войти</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

const getRoleColorClass = (role?: string) => {
   if (!role) return 'bg-slate-100 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600';
   if (['MAFIA', 'DON'].includes(role)) return 'bg-red-50 border-red-500/50 text-red-500 dark:bg-red-950/50';
   if (['SHERIFF', 'DOCTOR', 'CITIZEN'].includes(role)) return 'bg-blue-50 border-blue-500/50 text-blue-500 dark:bg-blue-950/50';
   return 'bg-amber-50 border-amber-500/50 text-amber-500 dark:bg-amber-950/50';
};
const getRoleTextColor = (role?: string) => {
   if (!role) return 'text-slate-500';
   if (['MAFIA', 'DON'].includes(role)) return 'text-red-500';
   if (['SHERIFF', 'DOCTOR', 'CITIZEN'].includes(role)) return 'text-blue-500';
   return 'text-amber-500';
};

function RoomTimer({ room }: { room: any }) {
   const [timeLeft, setTimeLeft] = useState(0);

   useEffect(() => {
     if (!room?.phaseEndsAt) {
       setTimeLeft(0);
       return;
     }
     const interval = setInterval(() => {
        const left = Math.max(0, Math.ceil((room.phaseEndsAt - Date.now()) / 1000));
        setTimeLeft(left);
     }, 100);
     return () => clearInterval(interval);
   }, [room?.phaseEndsAt, room?.phase]);

   if (room?.status !== 'IN_GAME' || !room?.phaseEndsAt) return null;

   return (
       <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white px-4 py-0.5 rounded-full text-xs font-bold shadow-lg z-50 flex items-center gap-1">
           <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           {timeLeft} сек
       </div>
   );
}

function ReportModal({ targetId, onClose }: { targetId: string, onClose: () => void }) {
   const [reason, setReason] = useState('Оскорбление');
   const [comment, setComment] = useState('');
   const [photo, setPhoto] = useState('');
   const { socket, setError, setSuccess } = useStore();

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
         setError('Файл слишком большой (макс 2 МБ).');
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
         setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
   };

   const submit = () => {
      if(!comment.trim()) {
         setError("Пожалуйста, опишите ситуацию подробнее.");
         return;
      }
      socket?.emit('reportPlayer', targetId, reason, comment, photo);
      setSuccess("Жалоба успешно отправлена!");
      onClose();
   };

   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
         <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
             <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                 <h3 className="font-bold">Жалоба на игрока</h3>
                 <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg active:scale-95 transition-all"><X size={18}/></button>
             </div>
             <div className="p-4 flex flex-col gap-4">
                 <div className="flex flex-col gap-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Причина</label>
                     <select value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/50 transition-shadow">
                         <option>Оскорбление</option>
                         <option>Спам / Реклама</option>
                         <option>Сговор / Игра не по правилам</option>
                         <option>Неактивность</option>
                         <option>Другое</option>
                     </select>
                 </div>
                 <div className="flex flex-col gap-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Описание (что он сделал?)</label>
                     <textarea placeholder="Опишите ситуацию подробнее..." rows={3} value={comment} onChange={e => setComment(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/50 transition-shadow resize-none"></textarea>
                 </div>
                 <div className="flex flex-col gap-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Скриншот или Фото (необязательно)</label>
                     <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 dark:file:bg-rose-900/30 dark:file:text-rose-400" />
                     {photo && <img src={photo} alt="Preview" className="mt-2 h-24 object-contain rounded-lg border border-slate-200 dark:border-slate-700" />}
                 </div>
                 <button onClick={submit} className="w-full mt-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold py-3 rounded-xl shadow-md shadow-rose-900/20 text-sm transition-all flex justify-center items-center gap-2">Отправить жалобу <Flag size={14}/></button>
             </div>
         </div>
      </div>
   );
}

function RoomView() {
  const { players, rooms, socket, myId, startTimer, messages } = useStore();
  const [chatText, setChatText] = useState('');
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const [playerInfoTarget, setPlayerInfoTarget] = useState<string | null>(null);
  
  const me = myId ? players[myId] : null;
  const room = me?.roomId ? rooms[me.roomId] : null;

  if (!me || !room) return null;

  const isHost = room.hostId === myId;
  const isNight = room.phase === 'NIGHT';
  const isVoting = room.phase === 'VOTING';

  const handleSendGroup = () => {
    if (chatText.trim() && socket) {
      if (isNight && (me.role === 'MAFIA' || me.role === 'DON')) {
        socket.emit('sendChat', chatText.trim(), false, true); // mafia chat
      } else {
        socket.emit('sendChat', chatText.trim(), false);
      }
      setChatText('');
    }
  };

  const handleReport = (targetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReportTargetId(targetId);
  };

  const handlePlayerAction = (targetId: string) => {
     if (room.status === 'WAITING' && isHost && targetId !== myId) {
        if (window.confirm(`Предложить кик игрока ${players[targetId]?.nickname}?`)) {
           socket?.emit('proposeKick', targetId);
        }
     } else if (room.status === 'IN_GAME') {
        if (isVoting) {
           socket?.emit('submitDayVote', targetId);
        } else if (isNight && me.role) {
           socket?.emit('submitNightAction', targetId);
        }
     }
  };

  const getRoleTranslate = (role: string) => {
    switch(role) {
       case 'SHERIFF': return 'Комиссар';
       case 'DOCTOR': return 'Доктор';
       case 'DON': return 'Дон';
       case 'MAFIA': return 'Мафия';
       case 'CITIZEN': return 'Мирный';
       case 'MEDIUM': return 'Медиум';
       case 'JESTER': return 'Шут';
       case 'TERRORIST': return 'Террорист';
       case 'BARTENDER': return 'Бармен';
       default: return role;
    }
  };

  const roleDesc: Record<string, string> = {
    'SHERIFF': 'Комиссар — предводитель мирных. Каждую ночь проверяйте одного игрока, чтобы узнать мафию.',
    'DOCTOR': 'Доктор — спаситель. Выбирайте, кого спасти от смерти этой ночью. Себя можно, но не подряд!',
    'DON': 'Дон — глава мафии. Решайте, кто умрет этой ночью. Ваша цель — убить всех мирных.',
    'MAFIA': 'Мафия — рядовой бандит. Помогайте Дону устранять мирных, общайтесь в секретном чате.',
    'CITIZEN': 'Мирный житель. У вас нет ночных способностей, ваше оружие — логика дневного обсуждения.',
    'MEDIUM': 'Медиум. Вы можете читать ночной чат мафии, но вы не знаете кто именно пишет. Раскройте их!',
    'JESTER': 'Шут — безумец. Ваша цель — умереть на дневном голосовании города. Заставьте всех подозревать вас.',
    'TERRORIST': 'Террорист. Если горожане решат казнить вас, вы заберете одного голосовавшего против вас с собой!',
    'BARTENDER': 'Бармен. Выбирайте цель ночью. Завтра ее слова в дневном чате превратятся в случайный бред!'
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col h-[100dvh] gap-3 pb-6 relative">
      {reportTargetId && <ReportModal targetId={reportTargetId} onClose={() => setReportTargetId(null)} />}
      {playerInfoTarget && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9998]" onClick={() => setPlayerInfoTarget(null)}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-[260px] overflow-hidden shadow-2xl animate-in zoom-in-95 p-4 flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
               {players[playerInfoTarget]?.avatar ? (
                  <img src={players[playerInfoTarget]?.avatar} className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-slate-200 dark:ring-slate-700" />
               ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm ring-2 ring-slate-200 dark:ring-slate-700">
                     {players[playerInfoTarget]?.nickname[0].toUpperCase()}
                  </div>
               )}
               <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate w-full flex justify-center text-center" style={{color: players[playerInfoTarget]?.vipColor}}>{players[playerInfoTarget]?.nickname}</h3>
               
               <div className="w-full flex flex-col gap-2 mt-2">
                  <button onClick={() => { useStore.getState().setSuccess('Заявка отправлена!'); setPlayerInfoTarget(null); }} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold text-sm transition-all focus:scale-95 active:scale-95">Добавить в друзья</button>
                  <button onClick={() => { setReportTargetId(playerInfoTarget); setPlayerInfoTarget(null); }} className="w-full bg-rose-100 hover:bg-rose-200 text-rose-900 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-200 py-2.5 rounded-xl font-bold text-sm transition-all focus:scale-95 active:scale-95">Пожаловаться</button>
               </div>
            </div>
         </div>
      )}
      <header className="flex justify-between items-center bg-white dark:bg-[#101423] p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 shrink-0 relative shadow-sm">
        <RoomTimer room={room} />
        <div className="flex flex-col">
           <h2 className="font-bold text-base leading-tight dark:text-white">{room.name}</h2>
           {room.status === 'IN_GAME' ? (
              <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wide">День {room.dayCount || 1} • {room.phase === 'DAY' ? 'ОБСУЖДЕНИЕ' : room.phase === 'VOTING' ? 'ГОЛОСОВАНИЕ' : room.phase === 'NIGHT' ? 'НОЧЬ' : 'ИТОГИ'}</span>
           ) : (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Лобби: {room.players.length} / {room.maxPlayers}</span>
           )}
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => socket?.emit('leaveRoom')} className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 p-2 rounded-xl active:scale-95 transition-transform" title="Выйти">
             <LogOut size={16}/>
           </button>
        </div>
      </header>

      {room.status === 'STARTING' && startTimer !== null && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 p-3 rounded-2xl text-center text-sm font-bold animate-pulse shadow-sm">
           Игра начнется через {startTimer} сек...
        </div>
      )}

      {room.kickVote && (
         <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 p-3 rounded-2xl flex flex-col gap-2 shadow-sm">
            <div className="text-center">
               <h3 className="font-bold text-red-600 dark:text-red-300 text-sm">Голосование на кик: {players[room.kickVote.targetId]?.nickname}</h3>
               <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">За: {room.kickVote.votesFor.length} | Против: {room.kickVote.votesAgainst.length}</p>
            </div>
            <div className="flex gap-2">
               <button onClick={() => socket?.emit('voteKick', room.kickVote!.targetId, true)} className="flex-1 bg-red-600 text-white py-1.5 rounded-lg font-bold text-sm shadow-sm active:scale-95">За</button>
               <button onClick={() => socket?.emit('voteKick', room.kickVote!.targetId, false)} className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-1.5 rounded-lg font-bold text-sm shadow-sm active:scale-95">Против</button>
            </div>
         </div>
      )}

      {room.status === 'IN_GAME' && (room.phase === 'DAY' || room.phase === 'RESULTS') && room.gameLog && room.gameLog.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-3 space-y-1 shadow-sm max-h-32 overflow-y-auto custom-scrollbar">
             {room.gameLog.map((log, i) => (
                <div key={i} className="text-amber-800 dark:text-amber-300 text-[10px] font-semibold flex items-start gap-1 leading-snug">
                  <span className="shrink-0 mt-0.5">📜</span> <span>{log}</span>
                </div>
             ))}
          </div>
      )}

      {showRoleInfo && me.role && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRoleInfo(false)}></div>
            <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
               <button onClick={() => setShowRoleInfo(false)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full"><LogOut size={14} className="rotate-180"/></button>
               <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner border-[4px]",
                  ['DON', 'MAFIA'].includes(me.role) ? 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-500/50 text-red-500' :
                  ['JESTER', 'TERRORIST', 'BARTENDER'].includes(me.role) ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-500/50 text-amber-500' :
                  'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-500/50 text-blue-500'
               )}>
                  <span className="font-extrabold text-3xl">{me.role.charAt(0)}</span>
               </div>
               <h4 className={cn("font-black text-2xl uppercase tracking-widest mb-2", 
                  ['DON', 'MAFIA'].includes(me.role) ? 'text-red-500' :
                  ['JESTER', 'TERRORIST', 'BARTENDER'].includes(me.role) ? 'text-amber-500' :
                  'text-blue-500'
               )}>{getRoleTranslate(me.role)}</h4>
               <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                 {roleDesc[me.role]}
               </p>
            </div>
         </div>
      )}

      {room.status === 'WAITING' ? (
        <div className="flex flex-col flex-1 gap-3 overflow-hidden">
           <div className="bg-white dark:bg-[#101423] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm shrink-0">
               <h3 className="font-bold text-center mb-3">Регистрация ({room.players.length}/{room.maxPlayers})</h3>
               <div className="flex flex-wrap gap-2 justify-center">
                   {room.players.map(pid => {
                      const p = players[pid];
                      if (!p) return null;
                      return (
                         <div key={pid} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-1.5 pr-3 shadow-sm">
                             {p.avatar ? <img className="w-7 h-7 rounded-full object-cover" src={p.avatar} /> : <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 text-white flex items-center justify-center text-[11px] font-bold shadow-sm">{p.nickname[0].toUpperCase()}</div>}
                             <span className="text-xs font-bold truncate max-w-[90px]" style={{color: p.vipColor}}>{p.nickname}</span>
                         </div>
                      )
                   })}
               </div>
               {isHost && (
                  <div className="w-full flex gap-2 mt-4">
                     <button className="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl shadow-sm text-sm transition-all" onClick={() => socket?.emit('addBot')}>+ Бот</button>
                     <button className="flex-[2] bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-rose-900/20 text-sm transition-all flex items-center justify-center gap-2" onClick={() => socket?.emit('startGame')}><Play size={16} /> НАЧАТЬ ИГРУ</button>
                  </div>
               )}
           </div>
           
           <div className="flex-1 flex flex-col bg-white dark:bg-[#101423] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden relative">
              <div className="bg-slate-50 dark:bg-slate-900/50 py-2.5 text-center text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800/80 uppercase tracking-widest">Чат</div>
              <div className="flex-1 p-2 overflow-y-auto space-y-2 z-0 flex flex-col-reverse custom-scrollbar bg-slate-50 dark:bg-transparent">
                 {[...messages].filter(m => !m.isGlobal && m.roomId === room.id).reverse().map(m => (
                    <div key={m.id} className="text-xs">
                      {m.isSystem ? (
                         <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-2 py-1 rounded-lg font-bold text-center mx-2 shadow-sm text-[10px]">⚙ {m.text}</div>
                      ) : (
                        <div className={cn("flex flex-col max-w-[90%]", m.senderId === myId ? "self-end items-end ml-auto" : "self-start items-start mr-auto")}>
                           <strong className={cn("text-[9px] mb-0.5 px-0.5 opacity-70", m.senderId === myId ? "text-rose-500" : "text-blue-500")} style={{color: players[m.senderId]?.vipColor || undefined}}>
                           {m.senderName}
                           </strong> 
                           <div className={cn("px-2.5 py-1.5 rounded-xl shadow-sm leading-snug break-words", m.senderId === myId ? "bg-rose-500 text-white rounded-tr-sm" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-sm")}>
                             {m.text}
                           </div>
                        </div>
                      )}
                    </div>
                 ))}
              </div>
              <div className="p-1.5 bg-white dark:bg-[#101423] flex gap-1 z-20 border-t border-slate-200 dark:border-slate-800/80">
                <input 
                  className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 ring-indigo-500/50 font-medium transition-all"
                  value={chatText}
                  onChange={e => setChatText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendGroup()}
                  placeholder="Чат лобби..."
                />
              </div>
           </div>
        </div>
      ) : (
        <div className="flex flex-1 gap-2 overflow-hidden">
           <div className="flex-1 flex flex-col gap-2 min-w-0">
               {me.role && (
                   <div className="bg-white dark:bg-[#101423] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2 shadow-sm shrink-0 flex items-center justify-center gap-3 relative cursor-pointer active:scale-95 transition-transform" onClick={() => setShowRoleInfo(true)}>
                       <button className="absolute right-2 top-2 text-slate-400 hover:text-indigo-500"><Info size={14}/></button>
                       <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-[3px] shadow-sm shrink-0", getRoleColorClass(me.role))}>
                          <span className="font-extrabold text-xl">{me.role[0]}</span>
                       </div>
                       <div className="flex flex-col items-start leading-none min-w-0">
                          <span className="text-[9px] text-slate-400 font-semibold mb-1">Ваша роль</span>
                          <span className={cn("font-bold text-[13px] truncate w-full", getRoleTextColor(me.role))}>{getRoleTranslate(me.role)}</span>
                       </div>
                   </div>
               )}
               
               <div className="flex-1 flex flex-col bg-white dark:bg-[#101423] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden relative">
                   <div className="bg-slate-50 dark:bg-slate-900/50 py-2 text-center text-[10px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800/80 uppercase tracking-widest shrink-0">Чат</div>
                   
                   {isNight && (me.role !== 'MAFIA' && me.role !== 'DON') && (
                      <div className="absolute inset-x-0 bottom-0 top-[30px] bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-10 p-4 rounded-b-2xl">
                         <div className="text-center">
                            <div className="text-indigo-500 dark:text-indigo-400 text-4xl mb-2 animate-pulse">🌙</div>
                            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 leading-tight">Ночь</h3>
                            <p className="text-indigo-600/70 dark:text-indigo-200/60 mt-1 text-[11px] font-medium leading-tight max-w-[120px] mx-auto">Город спит. Сделайте выбор справа.</p>
                         </div>
                      </div>
                   )}

                   <div className="flex-1 p-1.5 overflow-y-auto space-y-2 z-0 flex flex-col-reverse custom-scrollbar bg-slate-50 dark:bg-transparent">
                      {[...messages].filter(m => !m.isGlobal && m.roomId === room.id).reverse().map(m => (
                         <div key={m.id} className="text-xs">
                           {m.isSystem ? (
                              <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-2 py-1 rounded-lg font-bold text-center mx-1 shadow-sm text-[9px]">⚙ {m.text}</div>
                           ) : (
                             <div className={cn("flex flex-col max-w-[95%]", m.senderId === myId ? "self-end items-end ml-auto" : "self-start items-start mr-auto")}>
                                <strong className={cn("text-[8px] mb-0.5 px-0.5 opacity-70", m.senderId === myId ? "text-rose-500" : "text-blue-500", m.isMafiaOnly && "text-red-600 dark:text-red-400")} style={{color: players[m.senderId]?.vipColor || undefined}}>
                                {m.senderName}
                                </strong> 
                                <div className={cn("px-2 py-1.5 rounded-xl shadow-sm leading-snug break-words text-[11px]",
                                   m.senderId === myId ? "bg-rose-500 text-white rounded-tr-sm" : m.isMafiaOnly ? "bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-800/50 rounded-tl-sm" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                                )}>
                                  {m.text}
                                </div>
                             </div>
                           )}
                         </div>
                      ))}
                   </div>
                   <div className="p-1 bg-white dark:bg-[#101423] flex gap-1 z-20 border-t border-slate-200 dark:border-slate-800/80 shrink-0">
                     <input 
                       className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 ring-indigo-500/50 disabled:opacity-50 font-medium transition-all"
                       value={chatText}
                       disabled={(room.status === 'IN_GAME' && room.phase !== 'DAY' && room.phase !== 'RESULTS' && !(isNight && (me.role === 'MAFIA' || me.role === 'DON'))) || !me.isAlive}
                       onChange={e => setChatText(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleSendGroup()}
                       placeholder={!me.isAlive ? "Мертвые молчат" : isNight && (me.role === 'MAFIA' || me.role === 'DON') ? "Мафия..." : "Чат..."}
                     />
                   </div>
               </div>
           </div>

           <div className="w-[130px] sm:w-[150px] bg-white dark:bg-[#101423] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm shrink-0 flex flex-col overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-900/50 py-2 text-center text-[10px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800/80 uppercase tracking-widest shrink-0">Игроки ({room.players.length})</div>
              <div className="flex-1 overflow-y-auto p-1.5 grid grid-cols-2 gap-1.5 content-start custom-scrollbar">
                  {room.players.map(pid => {
                     const p = players[pid];
                     if(!p) return null;
                     
                     const isMafia = me?.role === 'MAFIA' || me?.role === 'DON';
                     const myVoteTargets = isVoting ? room.votes?.[myId!] : isNight ? (isMafia ? room.mafiaVotes?.[myId!] : room.nightActions?.[me.role || '']) : undefined;
                     const isTargeted = myVoteTargets === pid;

                     const votesReceived = isVoting ? Object.values(room.votes || {}).filter(id => id === pid).length : 0;
                     const voters = isVoting ? Object.entries(room.votes || {}).filter(([vid, tid]) => tid === pid).map(entry => players[entry[0]]?.nickname).join(', ') : '';

                     const mafiaVotesReceived = (isNight && isMafia) ? Object.values(room.mafiaVotes || {}).filter(id => id === pid).length : 0;
                     const mafiaVoters = (isNight && isMafia) ? Object.entries(room.mafiaVotes || {}).filter(([vid, tid]) => tid === pid).map(entry => players[entry[0]]?.nickname).join(', ') : '';

                     return (
                       <div 
                         key={pid} 
                         onClick={() => {
                            if (room.status === 'IN_GAME' && p.isAlive && me?.isAlive && (isVoting || isNight) && pid !== myId) {
                               handlePlayerAction(pid);
                            } else {
                               setPlayerInfoTarget(pid);
                            }
                         }}
                         className={cn(
                            "relative bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-1 flex flex-col items-center justify-center aspect-[4/5] text-center transition-all overflow-hidden group",
                            (isVoting || isNight) && pid !== myId && p.isAlive && me?.isAlive ? "cursor-pointer active:scale-95 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800" : "cursor-default",
                            isTargeted && "ring-2 ring-rose-500 border-rose-500 bg-rose-50 dark:bg-rose-900/20",
                            p.isAlive === false && "border-red-500/30",
                            p.isAlive === false && "opacity-75 grayscale"
                         )}
                         title={p.nickname}
                       >
                         {p.avatar ? (
                            <img src={p.avatar} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-1 object-cover shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 shrink-0" />
                         ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm mb-1 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                               {p.nickname[0].toUpperCase()}
                            </div>
                         )}
                         <span className={cn("text-[9px] font-bold truncate w-full px-0.5 leading-tight", p.isAlive === false && "line-through text-slate-500")} style={p.isAlive !== false ? {color: p.vipColor} : {}}>{p.nickname}</span>
                         
                         {p.isAlive && isVoting && votesReceived > 0 && (
                            <div className="absolute top-[-2px] right-[-2px] flex flex-col items-end pointer-events-none p-1 z-20">
                               <div className="bg-rose-500 rounded px-1 min-w-[14px] h-[14px] flex items-center justify-center text-[9px] font-bold text-white shadow-sm mb-0.5">{votesReceived}</div>
                            </div>
                         )}

                         {p.isAlive && isNight && isMafia && mafiaVotesReceived > 0 && (
                            <div className="absolute top-[-2px] right-[-2px] flex flex-col items-end pointer-events-none p-1 z-20">
                               <div className="bg-red-600 rounded px-1 min-w-[14px] h-[14px] flex items-center justify-center text-[9px] font-bold text-white shadow-sm mb-0.5">{mafiaVotesReceived}</div>
                            </div>
                         )}

                         {p.isAlive === false && (
                             <div className="absolute inset-0 bg-red-950/70 backdrop-blur-[1px] flex items-center justify-center flex-col z-10 pointer-events-none">
                                 <div className="absolute inset-0 border-2 border-red-600/80 rounded-xl"></div>
                                 <Skull size={20} className="text-red-500 mb-1 drop-shadow-md" />
                                 {p.role && (
                                    <span className="text-[7.5px] font-black text-red-50 bg-red-900/90 px-1 py-0.5 rounded shadow-sm relative z-20 outline outline-1 outline-red-500 truncate w-[90%] uppercase tracking-wider">{getRoleTranslate(p.role)}</span>
                                 )}
                             </div>
                         )}
                         
                         {isTargeted && (
                             <div className="absolute inset-0 border-2 border-rose-500 bg-rose-500/10 rounded-xl z-20 pointer-events-none flex items-center justify-center">
                                 <div className="w-8 h-8 border-2 border-rose-500 rounded-full animate-ping opacity-50"></div>
                             </div>
                         )}
                       </div>
                     );
                  })}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}



function AdminPanelModal({ onClose }: { onClose: () => void }) {
   const { socket, reports } = useStore();

   useEffect(() => {
      socket?.emit('getReports');
   }, [socket]);

   return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
         <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]">
             <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-rose-500 text-white">
                 <h3 className="font-bold text-lg flex items-center gap-2"><ShieldAlert size={20}/> Панель Администратора</h3>
                 <button onClick={onClose} className="p-1 hover:bg-rose-600 rounded-lg active:scale-95 transition-all outline-none"><X size={20}/></button>
             </div>
             <div className="p-4 overflow-y-auto flex-1 space-y-3 custom-scrollbar bg-slate-50 dark:bg-slate-950">
                 {reports.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 font-bold">Нет активных жалоб</div>
                 ) : (
                    reports.map(r => (
                       <div key={r.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                             <div className="text-xs text-slate-500">
                                От: <strong className="text-slate-900 dark:text-white">{r.reporterName}</strong>
                             </div>
                             <div className="text-[10px] text-slate-400">{new Date(r.timestamp).toLocaleTimeString()}</div>
                          </div>
                          <div>
                             На кого: <strong className="text-rose-500">{r.targetName}</strong> <span className="text-[10px] text-slate-400">({r.targetId})</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg text-sm border-l-2 border-rose-500">
                             {r.reason}
                          </div>
                          {r.photo && (
                             <img src={r.photo} alt="Доказательство" className="w-full max-h-48 object-cover rounded-lg mt-1" />
                          )}
                          <div className="flex gap-2 mt-2">
                             <button onClick={() => socket?.emit('adminAction', 'ban', r.targetId)} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-xs font-bold transition">Забанить пользователя</button>
                             <button onClick={() => socket?.emit('adminAction', 'dismiss', r.id)} className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-2 rounded-lg text-xs font-bold transition">Отклонить</button>
                          </div>
                       </div>
                    ))
                 )}
             </div>
         </div>
      </div>
   );
}


// Main
export default function App() {
  const { socket, myId, players, error, success, connect } = useStore();
  const [inviteData, setInviteData] = useState<{roomId: string, roomName: string, fromName: string} | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    // Hide standard frame limits, this is a web app.
    document.body.className = "bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-rose-500/30 transition-colors duration-300";

    const handleOpenAdminPanel = () => setShowAdminPanel(true);
    document.addEventListener('open-admin-panel', handleOpenAdminPanel);

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      tg.ready();
      tg.expand();
      const user = tg.initDataUnsafe.user;
      connect({ id: String(user.id), nickname: user.first_name || user.username || 'Игрок', avatar: user.photo_url });
      setIsInitializing(false);
      return () => document.removeEventListener('open-admin-panel', handleOpenAdminPanel);
    }

    let localId = localStorage.getItem('mafiaId');
    let localNick = localStorage.getItem('mafiaNickname');
    
    if (localId && localNick) {
       connect({ id: localId, nickname: localNick });
       setIsInitializing(false);
    } else {
       setIsInitializing(false);
    }

    return () => document.removeEventListener('open-admin-panel', handleOpenAdminPanel);
  }, []);

  useEffect(() => {
    if (socket) {
       socket.on('invited', (data) => {
          setInviteData(data);
       });
       
       const toastListener = (e: any) => useStore.getState().setError(e.detail);
       document.addEventListener('toast', toastListener as EventListener);
       
       return () => {
          socket.off('invited');
          document.removeEventListener('toast', toastListener as EventListener);
       }
    }
  }, [socket]);

  if (isInitializing) return <div className="flex h-screen items-center justify-center font-bold animate-pulse text-slate-500">Загрузка...</div>;

  if (!socket || !myId) {
    return <NicknameScreen onJoin={(name) => {
      let localId = localStorage.getItem('mafiaId');
      if (!localId) {
        localId = 'web_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('mafiaId', localId);
      }
      localStorage.setItem('mafiaNickname', name);
      connect({ id: localId, nickname: name });
    }} />;
  }

  const me = players[myId];
  if (!me) return <div className="flex h-screen items-center justify-center font-bold animate-pulse text-slate-500">Загрузка данных...</div>;

  return (
    <>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 dark:bg-indigo-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/20 dark:bg-rose-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '11s' }} />
      </div>

      {showAdminPanel && <AdminPanelModal onClose={() => setShowAdminPanel(false)} />}

      {error && (
        <div className="fixed top-4 right-4 bg-red-600/90 backdrop-blur text-slate-900 dark:text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-in slide-in-from-top flex items-center gap-3 max-w-sm">
           <ShieldAlert size={20} />
           <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 bg-emerald-600/90 backdrop-blur text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-in slide-in-from-top flex items-center gap-3 max-w-sm">
           <CheckCircle size={20} />
           <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {inviteData && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-indigo-900 border border-indigo-700 text-slate-900 dark:text-white px-4 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top flex flex-col gap-2 min-w-[280px]">
           <div className="flex items-center gap-2">
             <MessageSquare size={16} className="text-indigo-400"/>
             <span className="font-bold text-sm">Приглашение в игру</span>
           </div>
           <p className="text-sm text-slate-600 dark:text-slate-300">
             <strong className="text-slate-900 dark:text-white">{inviteData.fromName}</strong> зовет вас в комнату: <br/><strong className="text-indigo-200">{inviteData.roomName}</strong>
           </p>
           <div className="flex gap-2 mt-2">
             <button 
               onClick={() => {
                 socket?.emit('joinRoom', inviteData.roomId);
                 setInviteData(null);
               }}
               className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-1.5 rounded-lg text-xs font-bold transition"
             >Принять</button>
             <button 
               onClick={() => setInviteData(null)}
               className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 py-1.5 rounded-lg text-xs font-bold transition text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
             >Отклонить</button>
           </div>
        </div>
      )}
      
      {me.status === 'IN_ROOM' || me.status === 'IN_GAME' ? (
        <RoomView />
      ) : (
        <MainMenu />
      )}
    </>
  );
}

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type {
  User, Email, CalendarEvent, Automation, Task, ActivityLog, AppConnection,
  FocusSession, NotificationPrefs, Theme, Role, EmailCategory, AppId,
} from '../types';
import { KEYS, loadJSON, saveJSON, clearAllAutoflowData, uid } from '../lib/storage';
import {
  seedEmails, seedEvents, seedAutomations, seedTasks, seedActivity,
  seedConnections, seedNotificationPrefs,
} from '../lib/seed';

interface ToastItem { id: string; message: string; kind: 'success' | 'error' | 'info' }

interface AppState {
  user: User | null;
  theme: Theme;
  connections: AppConnection[];
  emails: Email[];
  events: CalendarEvent[];
  automations: Automation[];
  tasks: Task[];
  activity: ActivityLog[];
  focusSessions: FocusSession[];
  notificationPrefs: NotificationPrefs;
  toasts: ToastItem[];
}

interface AppContextValue extends AppState {
  login: (email: string, name?: string) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  toggleConnection: (id: AppId) => void;
  toggleTheme: () => void;

  addEmailActionLog: (msg: string) => void;
  markImportant: (id: string, value?: boolean) => void;
  markSpam: (id: string, value?: boolean) => void;
  archiveEmail: (id: string, value?: boolean) => void;
  deleteEmail: (id: string) => void;
  moveEmailCategory: (id: string, category: EmailCategory) => void;
  markRead: (id: string) => void;

  addEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  addAutomation: (a: Omit<Automation, 'id' | 'createdAt' | 'timesTriggered'>) => void;
  updateAutomation: (id: string, patch: Partial<Automation>) => void;
  deleteAutomation: (id: string) => void;
  toggleAutomation: (id: string) => void;
  runAutomations: () => number;

  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  clearActivity: () => void;
  addActivity: (message: string, type: ActivityLog['type']) => void;

  startFocusSession: (s: Omit<FocusSession, 'id' | 'createdAt' | 'active'>) => void;
  endFocusSession: (id: string) => void;
  deleteFocusSession: (id: string) => void;

  updateNotificationPrefs: (patch: Partial<NotificationPrefs>) => void;
  resetDemoData: () => void;

  pushToast: (message: string, kind?: ToastItem['kind']) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadJSON<User | null>(KEYS.user, null));
  const [theme, setTheme] = useState<Theme>(() => loadJSON<Theme>(KEYS.theme, 'light'));
  const [connections, setConnections] = useState<AppConnection[]>(() => loadJSON(KEYS.connections, seedConnections()));
  const [emails, setEmails] = useState<Email[]>(() => loadJSON(KEYS.emails, []));
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadJSON(KEYS.events, []));
  const [automations, setAutomations] = useState<Automation[]>(() => loadJSON(KEYS.automations, []));
  const [tasks, setTasks] = useState<Task[]>(() => loadJSON(KEYS.tasks, []));
  const [activity, setActivity] = useState<ActivityLog[]>(() => loadJSON(KEYS.activity, []));
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => loadJSON(KEYS.focusSessions, []));
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(() => loadJSON(KEYS.notificationPrefs, seedNotificationPrefs()));
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Seed once
  useEffect(() => {
    const seeded = loadJSON<boolean>(KEYS.seeded, false);
    if (!seeded) {
      const e = seedEmails();
      const ev = seedEvents();
      const au = seedAutomations();
      const tk = seedTasks();
      const ac = seedActivity();
      setEmails(e); saveJSON(KEYS.emails, e);
      setEvents(ev); saveJSON(KEYS.events, ev);
      setAutomations(au); saveJSON(KEYS.automations, au);
      setTasks(tk); saveJSON(KEYS.tasks, tk);
      setActivity(ac); saveJSON(KEYS.activity, ac);
      saveJSON(KEYS.seeded, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { saveJSON(KEYS.user, user); }, [user]);
  useEffect(() => {
    saveJSON(KEYS.theme, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  useEffect(() => { saveJSON(KEYS.connections, connections); }, [connections]);
  useEffect(() => { saveJSON(KEYS.emails, emails); }, [emails]);
  useEffect(() => { saveJSON(KEYS.events, events); }, [events]);
  useEffect(() => { saveJSON(KEYS.automations, automations); }, [automations]);
  useEffect(() => { saveJSON(KEYS.tasks, tasks); }, [tasks]);
  useEffect(() => { saveJSON(KEYS.activity, activity); }, [activity]);
  useEffect(() => { saveJSON(KEYS.focusSessions, focusSessions); }, [focusSessions]);
  useEffect(() => { saveJSON(KEYS.notificationPrefs, notificationPrefs); }, [notificationPrefs]);

  const pushToast = useCallback((message: string, kind: ToastItem['kind'] = 'success') => {
    const id = uid('toast');
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const addActivity = useCallback((message: string, type: ActivityLog['type']) => {
    setActivity((a) => [{ id: uid('act'), message, timestamp: new Date().toISOString(), type }, ...a].slice(0, 200));
  }, []);

  const login = useCallback((email: string, name?: string) => {
    const derivedName = name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Demo User';
    const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    const existing = loadJSON<User | null>(KEYS.user, null);
    const newUser: User = {
      name: derivedName,
      email: email || 'demo@autoflow.app',
      role: existing?.role || 'student',
      avatarColor: existing?.avatarColor || colors[Math.floor(Math.random() * colors.length)],
      loggedIn: true,
    };
    setUser(newUser);
    addActivity('Signed in to AutoFlow (Demo Mode)', 'system');
  }, [addActivity]);

  const logout = useCallback(() => {
    setUser((u) => (u ? { ...u, loggedIn: false } : u));
    addActivity('Signed out', 'system');
  }, [addActivity]);

  const setRole = useCallback((role: Role) => {
    setUser((u) => (u ? { ...u, role } : u));
  }, []);

  const toggleConnection = useCallback((id: AppId) => {
    setConnections((cs) => cs.map((c) => {
      if (c.id !== id) return c;
      const nowConnected = !c.connected;
      return { ...c, connected: nowConnected, connectedAt: nowConnected ? new Date().toISOString() : undefined };
    }));
    const conn = connections.find((c) => c.id === id);
    addActivity(`${conn?.name || id} ${conn?.connected ? 'disconnected' : 'connected'} (Simulated)`, 'connection');
  }, [connections, addActivity]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);

  // Email actions
  const markImportant = useCallback((id: string, value?: boolean) => {
    setEmails((es) => es.map((e) => (e.id === id ? { ...e, important: value ?? !e.important } : e)));
  }, []);
  const markSpam = useCallback((id: string, value?: boolean) => {
    setEmails((es) => es.map((e) => (e.id === id ? { ...e, spam: value ?? !e.spam, category: (value ?? !e.spam) ? 'Spam' : e.category } : e)));
  }, []);
  const archiveEmail = useCallback((id: string, value?: boolean) => {
    setEmails((es) => es.map((e) => (e.id === id ? { ...e, archived: value ?? !e.archived } : e)));
  }, []);
  const deleteEmail = useCallback((id: string) => {
    setEmails((es) => es.filter((e) => e.id !== id));
  }, []);
  const moveEmailCategory = useCallback((id: string, category: EmailCategory) => {
    setEmails((es) => es.map((e) => (e.id === id ? { ...e, category } : e)));
  }, []);
  const markRead = useCallback((id: string) => {
    setEmails((es) => es.map((e) => (e.id === id ? { ...e, read: true } : e)));
  }, []);
  const addEmailActionLog = useCallback((msg: string) => addActivity(msg, 'automation'), [addActivity]);

  // Events
  const addEvent = useCallback((e: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { ...e, id: uid('evt') };
    setEvents((evs) => [...evs, newEvent]);
    addActivity(`Event added: "${e.title}" on ${e.date}`, 'calendar');
  }, [addActivity]);
  const updateEvent = useCallback((id: string, patch: Partial<CalendarEvent>) => {
    setEvents((evs) => evs.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)));
    addActivity('Event updated', 'calendar');
  }, [addActivity]);
  const deleteEvent = useCallback((id: string) => {
    setEvents((evs) => evs.filter((ev) => ev.id !== id));
    addActivity('Event deleted', 'calendar');
  }, [addActivity]);

  // Automations
  const addAutomation = useCallback((a: Omit<Automation, 'id' | 'createdAt' | 'timesTriggered'>) => {
    const newA: Automation = { ...a, id: uid('auto'), createdAt: new Date().toISOString(), timesTriggered: 0 };
    setAutomations((as) => [newA, ...as]);
    addActivity(`Automation created: "${a.name}"`, 'automation');
  }, [addActivity]);
  const updateAutomation = useCallback((id: string, patch: Partial<Automation>) => {
    setAutomations((as) => as.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);
  const deleteAutomation = useCallback((id: string) => {
    setAutomations((as) => as.filter((a) => a.id !== id));
    addActivity('Automation deleted', 'automation');
  }, [addActivity]);
  const toggleAutomation = useCallback((id: string) => {
    setAutomations((as) => as.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  }, []);

  const runAutomations = useCallback((): number => {
    let triggeredCount = 0;
    const triggerCounts: Record<string, number> = {};
    let newTasks: Task[] = [];

    setEmails((es) => es.map((email) => {
      let updated = { ...email };
      for (const auto of automations) {
        if (!auto.enabled) continue;
        const { condition, action } = auto;
        let matches = false;
        const val = condition.value.toLowerCase();
        if (condition.type === 'senderContains') {
          matches = updated.sender.toLowerCase().includes(val) || updated.senderEmail.toLowerCase().includes(val);
        } else if (condition.type === 'subjectContains') {
          matches = updated.subject.toLowerCase().includes(val);
        } else if (condition.type === 'category') {
          matches = updated.category.toLowerCase() === val;
        } else if (condition.type === 'keywordContains') {
          matches = updated.subject.toLowerCase().includes(val) || updated.body.toLowerCase().includes(val) || updated.preview.toLowerCase().includes(val);
        }
        if (matches) {
          if (action.type === 'markImportant') updated.important = true;
          else if (action.type === 'moveToCategory' && action.value) updated.category = action.value as EmailCategory;
          else if (action.type === 'markSpam') { updated.spam = true; updated.category = 'Spam'; }
          else if (action.type === 'archive') updated.archived = true;
          else if (action.type === 'createTask') {
            newTasks.push({
              id: uid('task'),
              title: action.value || `Follow up: ${updated.subject}`,
              priority: 'Medium',
              dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
              completed: false,
              createdAt: new Date().toISOString(),
            });
          }
          triggerCounts[auto.id] = (triggerCounts[auto.id] || 0) + 1;
          triggeredCount += 1;
        }
      }
      return updated;
    }));

    if (newTasks.length) setTasks((ts) => [...newTasks, ...ts]);

    if (Object.keys(triggerCounts).length) {
      setAutomations((as) => as.map((a) => (triggerCounts[a.id] ? { ...a, timesTriggered: a.timesTriggered + triggerCounts[a.id] } : a)));
    }

    addActivity(`Ran all automations — ${triggeredCount} action${triggeredCount === 1 ? '' : 's'} applied`, 'automation');
    return triggeredCount;
  }, [automations, addActivity]);

  // Tasks
  const addTask = useCallback((t: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = { ...t, id: uid('task'), createdAt: new Date().toISOString() };
    setTasks((ts) => [newTask, ...ts]);
    addActivity(`Task created: "${t.title}"`, 'task');
  }, [addActivity]);
  const toggleTask = useCallback((id: string) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);
  const deleteTask = useCallback((id: string) => {
    setTasks((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const clearActivity = useCallback(() => setActivity([]), []);

  // Focus sessions
  const startFocusSession = useCallback((s: Omit<FocusSession, 'id' | 'createdAt' | 'active'>) => {
    const newSession: FocusSession = { ...s, id: uid('focus'), createdAt: new Date().toISOString(), active: true };
    setFocusSessions((fs) => [newSession, ...fs]);
    addActivity(`Focus Mode started: "${s.title}"`, 'focus');
  }, [addActivity]);
  const endFocusSession = useCallback((id: string) => {
    setFocusSessions((fs) => fs.map((f) => (f.id === id ? { ...f, active: false } : f)));
    addActivity('Focus Mode ended', 'focus');
  }, [addActivity]);
  const deleteFocusSession = useCallback((id: string) => {
    setFocusSessions((fs) => fs.filter((f) => f.id !== id));
  }, []);

  const updateNotificationPrefs = useCallback((patch: Partial<NotificationPrefs>) => {
    setNotificationPrefs((p) => ({ ...p, ...patch }));
  }, []);

  const resetDemoData = useCallback(() => {
    clearAllAutoflowData();
    window.location.href = '/';
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    user, theme, connections, emails, events, automations, tasks, activity, focusSessions, notificationPrefs, toasts,
    login, logout, setRole, toggleConnection, toggleTheme,
    addEmailActionLog, markImportant, markSpam, archiveEmail, deleteEmail, moveEmailCategory, markRead,
    addEvent, updateEvent, deleteEvent,
    addAutomation, updateAutomation, deleteAutomation, toggleAutomation, runAutomations,
    addTask, toggleTask, deleteTask,
    clearActivity, addActivity,
    startFocusSession, endFocusSession, deleteFocusSession,
    updateNotificationPrefs, resetDemoData,
    pushToast, dismissToast,
  }), [
    user, theme, connections, emails, events, automations, tasks, activity, focusSessions, notificationPrefs, toasts,
    login, logout, setRole, toggleConnection, toggleTheme,
    addEmailActionLog, markImportant, markSpam, archiveEmail, deleteEmail, moveEmailCategory, markRead,
    addEvent, updateEvent, deleteEvent,
    addAutomation, updateAutomation, deleteAutomation, toggleAutomation, runAutomations,
    addTask, toggleTask, deleteTask,
    clearActivity, addActivity,
    startFocusSession, endFocusSession, deleteFocusSession,
    updateNotificationPrefs, resetDemoData,
    pushToast, dismissToast,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

import type {
  Email,
  CalendarEvent,
  Automation,
  Task,
  ActivityLog,
  AppConnection,
  FocusSession,
  NotificationPrefs,
} from '../types';
import { uid } from './storage';

const now = () => new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
const todayPlus = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().slice(0, 10);
};

export function seedEmails(): Email[] {
  const raw: Array<Omit<Email, 'id' | 'important' | 'spam' | 'archived' | 'read'>> = [
    {
      sender: 'Prof. Adrian Kent',
      senderEmail: 'a.kent@university.edu',
      subject: 'Assignment 3 deadline extended',
      preview: 'The deadline for Assignment 3 has been moved to next Friday...',
      body: 'Hi all,\n\nThe deadline for Assignment 3 has been moved to next Friday at 11:59 PM. Please make sure to submit via the portal. Late submissions will not be accepted.\n\nBest,\nProf. Kent',
      category: 'College',
      timestamp: daysAgo(0),
    },
    {
      sender: 'HDFC Bank Alerts',
      senderEmail: 'alerts@hdfcbank.com',
      subject: 'Urgent: Unusual login detected on your account',
      preview: 'We noticed an unusual login attempt on your account...',
      body: 'Dear Customer,\n\nWe detected an unusual login attempt on your account from a new device. If this was not you, please secure your account immediately.\n\nHDFC Bank Security Team',
      category: 'Other',
      timestamp: daysAgo(0),
    },
    {
      sender: 'Sarah Lin (Product)',
      senderEmail: 'sarah.lin@company.com',
      subject: 'Team meeting moved to 3 PM tomorrow',
      preview: 'Quick heads up — moving our sync to 3 PM tomorrow...',
      body: 'Hi team,\n\nQuick heads up — I am moving our weekly sync to 3 PM tomorrow to avoid a conflict with the design review. Same link.\n\nThanks,\nSarah',
      category: 'Meetings',
      timestamp: daysAgo(1),
    },
    {
      sender: 'Amazon',
      senderEmail: 'no-reply@amazon.com',
      subject: 'Big Deal Days: Up to 60% off electronics',
      preview: 'Don\u2019t miss out on our biggest sale of the season...',
      body: 'Big Deal Days are here! Save up to 60% on electronics, home goods and more. Shop now before deals end.',
      category: 'Promotions',
      timestamp: daysAgo(1),
    },
    {
      sender: 'Career Services',
      senderEmail: 'careers@university.edu',
      subject: 'Assignment: Resume review workshop signup',
      preview: 'Sign up for our resume review workshop this week...',
      body: 'Hello,\n\nOur resume review workshop is happening this Thursday. This is a great assignment-adjacent opportunity for graduating students. Sign up via the link in the portal.',
      category: 'College',
      timestamp: daysAgo(2),
    },
    {
      sender: 'IT Helpdesk',
      senderEmail: 'helpdesk@company.com',
      subject: 'Scheduled maintenance this weekend',
      preview: 'Our systems will be down for maintenance this Saturday...',
      body: 'Hello,\n\nOur systems will undergo scheduled maintenance this Saturday from 1 AM to 5 AM. Expect brief downtime for internal tools.\n\nIT Team',
      category: 'Work',
      timestamp: daysAgo(2),
    },
    {
      sender: 'LinkedIn',
      senderEmail: 'notifications@linkedin.com',
      subject: 'You have 12 new profile views',
      preview: 'See who\u2019s been checking out your profile this week...',
      body: 'Your profile has been getting attention! 12 people viewed your profile this week. Upgrade to Premium to see who they are.',
      category: 'Promotions',
      timestamp: daysAgo(3),
    },
    {
      sender: 'Unknown Sender',
      senderEmail: 'winner@lucky-draw123.biz',
      subject: 'YOU HAVE WON $1,000,000 - CLAIM NOW',
      preview: 'Congratulations! You have been selected as our lucky winner...',
      body: 'CONGRATULATIONS! You have won $1,000,000 in our international lottery draw. Click the link below and provide your bank details to claim your prize within 24 hours.',
      category: 'Spam',
      timestamp: daysAgo(3),
    },
    {
      sender: 'David Chen (Manager)',
      senderEmail: 'david.chen@company.com',
      subject: 'Urgent: Client presentation feedback needed',
      preview: 'Need your feedback on the client deck before EOD...',
      body: 'Hi,\n\nThis is urgent — I need your feedback on the client presentation before end of day. The meeting with the client is tomorrow morning. Please review slides 5-12 in particular.\n\nDavid',
      category: 'Work',
      timestamp: daysAgo(0),
    },
    {
      sender: 'Registrar Office',
      senderEmail: 'registrar@university.edu',
      subject: 'Meeting reminder: Academic advising session',
      preview: 'Your advising meeting is scheduled for next week...',
      body: 'Dear Student,\n\nThis is a reminder that your academic advising meeting is scheduled for next Tuesday at 10 AM. Please bring your course plan.\n\nRegistrar Office',
      category: 'Meetings',
      timestamp: daysAgo(4),
    },
    {
      sender: 'Netflix',
      senderEmail: 'info@netflix.com',
      subject: 'New this week: shows picked for you',
      preview: 'Check out what\u2019s new on Netflix this week...',
      body: 'New arrivals just for you! Check out this week\u2019s new releases, hand-picked based on your viewing history.',
      category: 'Promotions',
      timestamp: daysAgo(5),
    },
    {
      sender: 'Priya Sharma',
      senderEmail: 'priya.sharma@company.com',
      subject: 'Assignment handoff: Q3 report',
      preview: 'Handing off the Q3 report assignment to you...',
      body: 'Hi,\n\nI am handing off the Q3 report assignment to you while I am on leave. All source files are in the shared drive. Let me know if you have questions.\n\nPriya',
      category: 'Work',
      timestamp: daysAgo(6),
    },
  ];

  return raw.map((r) => ({
    ...r,
    id: uid('email'),
    important: false,
    spam: false,
    archived: false,
    read: Math.random() > 0.5,
  }));
}

export function seedEvents(): CalendarEvent[] {
  return [
    { id: uid('evt'), title: 'Team Standup', date: todayPlus(0), startTime: '09:30', endTime: '09:45', category: 'Meeting' },
    { id: uid('evt'), title: 'Data Structures Lecture', date: todayPlus(0), startTime: '11:00', endTime: '12:30', category: 'Class' },
    { id: uid('evt'), title: 'Client Presentation', date: todayPlus(1), startTime: '15:00', endTime: '16:00', category: 'Meeting' },
    { id: uid('evt'), title: 'Assignment 3 Due', date: todayPlus(3), startTime: '23:59', endTime: '23:59', category: 'Deadline' },
    { id: uid('evt'), title: 'Academic Advising', date: todayPlus(5), startTime: '10:00', endTime: '10:30', category: 'Meeting' },
    { id: uid('evt'), title: 'Gym Session', date: todayPlus(1), startTime: '18:00', endTime: '19:00', category: 'Personal' },
  ];
}

export function seedAutomations(): Automation[] {
  return [
    {
      id: uid('auto'),
      name: 'Flag meeting emails',
      condition: { type: 'subjectContains', value: 'meeting' },
      action: { type: 'moveToCategory', value: 'Meetings' },
      enabled: true,
      createdAt: now(),
      timesTriggered: 0,
    },
    {
      id: uid('auto'),
      name: 'Assignments to College + Important',
      condition: { type: 'subjectContains', value: 'assignment' },
      action: { type: 'markImportant' },
      enabled: true,
      createdAt: now(),
      timesTriggered: 0,
    },
    {
      id: uid('auto'),
      name: 'Bank emails are important',
      condition: { type: 'senderContains', value: 'bank' },
      action: { type: 'markImportant' },
      enabled: true,
      createdAt: now(),
      timesTriggered: 0,
    },
    {
      id: uid('auto'),
      name: 'Keep promotions filed',
      condition: { type: 'category', value: 'Promotions' },
      action: { type: 'moveToCategory', value: 'Promotions' },
      enabled: true,
      createdAt: now(),
      timesTriggered: 0,
    },
    {
      id: uid('auto'),
      name: 'Urgent keyword alert',
      condition: { type: 'keywordContains', value: 'urgent' },
      action: { type: 'markImportant' },
      enabled: true,
      createdAt: now(),
      timesTriggered: 0,
    },
  ];
}

export function seedTasks(): Task[] {
  return [
    { id: uid('task'), title: 'Submit Assignment 3', priority: 'High', dueDate: todayPlus(3), completed: false, createdAt: now() },
    { id: uid('task'), title: 'Prepare client presentation slides', priority: 'High', dueDate: todayPlus(1), completed: false, createdAt: now() },
    { id: uid('task'), title: 'Review Q3 report draft', priority: 'Medium', dueDate: todayPlus(4), completed: false, createdAt: now() },
    { id: uid('task'), title: 'Book advising session room', priority: 'Low', dueDate: todayPlus(5), completed: true, createdAt: daysAgo(1) },
  ];
}

export function seedActivity(): ActivityLog[] {
  return [
    { id: uid('act'), message: 'AutoFlow demo workspace initialized', timestamp: daysAgo(0), type: 'system' },
  ];
}

export function seedConnections(): AppConnection[] {
  return [
    { id: 'gmail', name: 'Gmail', connected: false },
    { id: 'gcal', name: 'Google Calendar', connected: false },
    { id: 'telegram', name: 'Telegram', connected: false },
    { id: 'whatsapp', name: 'WhatsApp', connected: false },
  ];
}

export function seedFocusSessions(): FocusSession[] {
  return [];
}

export function seedNotificationPrefs(): NotificationPrefs {
  return {
    emailAlerts: true,
    meetingReminders: true,
    automationAlerts: true,
    focusModeMutes: true,
  };
}

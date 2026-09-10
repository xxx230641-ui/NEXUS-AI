import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Users,
  Activity,
  Megaphone,
  Sliders,
  Database,
  Cpu,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  Clock,
  Sparkles,
  Lock,
  Globe,
  Radio,
  FileText,
  Server,
  Zap,
  Plus,
  Download,
  Send,
  Bot,
  Terminal,
  Wand2,
  X,
  TrendingUp,
  UserPlus,
  ShieldCheck,
  KeyRound,
  ChevronRight,
  Eraser,
  Flame,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useLang } from '../hooks/useLang';
import { formatGregorianDate, formatGregorianDateTime } from '../utils/dateUtils';
import { downloadHtmlReport, downloadCsvReport } from '../utils/exportReport';

interface UserRecord {
  uid: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'user';
  status: 'active' | 'suspended';
  createdAt: string;
  authMethod: string;
  policyStatus?: 'compliant' | 'warning' | 'flagged' | 'suspended';
  violationsCount?: number;
  violationReasonAr?: string;
  violationReasonEn?: string;
  flaggedAt?: string;
}

interface SystemMetrics {
  totalUsers: number;
  activeSessions: number;
  uptime: string;
  memoryUsageMB: string;
  smtpConfigured: boolean;
  geminiKeyConfigured: boolean;
  logsCount: number;
  securityThreatsCount?: number;
  registrationsToday?: number;
  registrationsThisWeek?: number;
  authMethodBreakdown?: {
    google: number;
    manual: number;
    manual_admin: number;
    demo: number;
  };
  rolesBreakdown?: {
    owner: number;
    admin: number;
    user: number;
  };
  statusBreakdown?: {
    active: number;
    suspended: number;
  };
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  status: 'success' | 'warning' | 'danger';
}

export const AdminDashboard: React.FC = () => {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'users' | 'broadcast' | 'logs'>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Real System Stats from Backend
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeSessions: 0,
    uptime: '0h 0m 0s',
    memoryUsageMB: '0',
    smtpConfigured: false,
    geminiKeyConfigured: true,
    logsCount: 0,
    securityThreatsCount: 0,
    registrationsToday: 0,
    registrationsThisWeek: 0,
    authMethodBreakdown: { google: 0, manual: 0, manual_admin: 0, demo: 0 },
    rolesBreakdown: { owner: 1, admin: 0, user: 0 },
    statusBreakdown: { active: 1, suspended: 0 },
  });

  // Recent Registrations Feed
  const [recentRegistrations, setRecentRegistrations] = useState<UserRecord[]>([]);

  // Feature Toggles
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    liveVoiceEnabled: true,
    geminiRateLimit: 60,
    maxUserSessions: 5000,
    securityShieldActive: true,
    autoPilotGuardianMode: true,
    aiAdvisorMode: true,
  });

  // Users Directory State
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Create User Modal State
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user' as 'owner' | 'admin' | 'user',
  });

  // Broadcast Notice State
  const [broadcast, setBroadcast] = useState({
    active: false,
    textAr: '',
    textEn: '',
    type: 'info' as 'info' | 'warning' | 'alert' | 'success',
  });
  const [broadcastTitleAr, setBroadcastTitleAr] = useState('');
  const [broadcastTitleEn, setBroadcastTitleEn] = useState('');
  const [broadcastTargetAudience, setBroadcastTargetAudience] = useState<'all' | 'active' | 'admins'>('all');
  const [broadcastHistory, setBroadcastHistory] = useState<Array<{
    id: string;
    titleAr: string;
    titleEn: string;
    textAr: string;
    textEn: string;
    type: string;
    createdAt: string;
    targetAudience: string;
  }>>([]);

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Executive AI Consultant with Absolute Execution Authority
  const [aiQuery, setAiQuery] = useState('');
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExecutedActions, setAiExecutedActions] = useState<string[]>([]);

  // Autonomous Agent Full Sweeper State
  const [autonomousResult, setAutonomousResult] = useState<{
    riskLevel: string;
    threatsDetected: string[];
    actionsTaken: string[];
    reportSummary: string;
    timestamp: string;
  } | null>(null);
  const [autonomousReportsHistory, setAutonomousReportsHistory] = useState<Array<any>>([]);
  const [isAutonomousRunning, setIsAutonomousRunning] = useState(false);

  // Gemini Test State
  const [testGeminiPrompt, setTestGeminiPrompt] = useState('');
  const [testGeminiReply, setTestGeminiReply] = useState<string | null>(null);
  const [isGeminiTesting, setIsGeminiTesting] = useState(false);

  // User Deletion Modal State
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);

  // Human-Readable Styled HTML Document Export Functions
  const exportUsersReport = () => {
    if (!users.length) return;
    const activeCount = users.filter(u => u.status === 'active').length;
    const adminCount = users.filter(u => u.role === 'admin' || u.role === 'owner').length;

    downloadHtmlReport({
      title: lang === 'ar' ? 'تقرير دليل وتفاصيل المستخدمين' : 'NEXUS Executive Users Directory Report',
      subtitle: lang === 'ar' ? 'تقرير الحسابات والصلاحيات المعتمدة في النظام' : 'Authorized User Accounts & Role Privileges',
      filename: `nexus_users_directory_report_${new Date().toISOString().slice(0, 10)}.html`,
      lang: lang === 'ar' ? 'ar' : 'en',
      sections: [
        {
          title: lang === 'ar' ? 'مؤشرات وإحصائيات الحسابات' : 'Directory Key Metrics',
          metrics: [
            { label: lang === 'ar' ? 'إجمالي الحسابات' : 'Total Users', value: users.length, color: 'cyan' },
            { label: lang === 'ar' ? 'الحسابات النشطة' : 'Active Users', value: activeCount, color: 'emerald' },
            { label: lang === 'ar' ? 'حسابات الإدارة' : 'Administrators', value: adminCount, color: 'amber' },
          ],
        },
        {
          title: lang === 'ar' ? 'سجل المستخدمين والصلاحيات التفصيلي' : 'Detailed Users Registry',
          table: {
            headers: [
              lang === 'ar' ? 'الاسم الكامل' : 'Full Name',
              lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
              lang === 'ar' ? 'الرتبة / الصلاحية' : 'Role',
              lang === 'ar' ? 'حالة الحساب' : 'Status',
              lang === 'ar' ? 'وسيلة الدخول' : 'Auth Method',
              lang === 'ar' ? 'تاريخ التسجيل' : 'Registered Date',
            ],
            rows: users.map(u => [
              u.name,
              u.email,
              u.role.toUpperCase(),
              u.status === 'active' ? (lang === 'ar' ? 'نشط ✓' : 'Active ✓') : (lang === 'ar' ? 'معطل 🛑' : 'Suspended 🛑'),
              u.authMethod,
              u.createdAt,
            ]),
          },
        },
      ],
    });

    triggerToast(lang === 'ar' ? 'تم تنزيل تقرير المستخدمين المنسق كجدول تفاعلي بنجاح 📄' : 'Exported formatted users directory report 📄');
  };

  const exportUsersCsv = () => {
    if (!users.length) return;
    const headers = [
      lang === 'ar' ? 'الاسم الكامل' : 'Full Name',
      lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
      lang === 'ar' ? 'الصلاحية' : 'Role',
      lang === 'ar' ? 'حالة الحساب' : 'Status',
      lang === 'ar' ? 'وسيلة الدخول' : 'Auth Method',
      lang === 'ar' ? 'تاريخ التسجيل' : 'Registered Date',
    ];
    const rows = users.map((u) => [
      u.name,
      u.email,
      u.role.toUpperCase(),
      u.status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'معطل' : 'Suspended'),
      u.authMethod,
      u.createdAt,
    ]);
    downloadCsvReport(`nexus_users_directory_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    triggerToast(lang === 'ar' ? 'تم تنزيل جدول Excel/CSV لجميع الحسابات بنجاح 📊' : 'Exported Users CSV 📊');
  };

  const exportLogsReport = () => {
    if (!logs.length) return;
    const successLogs = logs.filter(l => l.status === 'success').length;

    downloadHtmlReport({
      title: lang === 'ar' ? 'تقرير سجلات الحوكمة والأمان' : 'NEXUS Audit & Security Logs Report',
      subtitle: lang === 'ar' ? 'سلسلة تتبع الأحداث والأمان الموثقة في الخادم' : 'Server Audit Trail & Security Events Log',
      filename: `nexus_audit_logs_report_${new Date().toISOString().slice(0, 10)}.html`,
      lang: lang === 'ar' ? 'ar' : 'en',
      sections: [
        {
          title: lang === 'ar' ? 'ملخص الأمان وسجلات الأنشطة' : 'Audit Summary Metrics',
          metrics: [
            { label: lang === 'ar' ? 'إجمالي الأحداث' : 'Total Events', value: logs.length, color: 'indigo' },
            { label: lang === 'ar' ? 'العمليات الناجحة' : 'Successful Logs', value: successLogs, color: 'emerald' },
          ],
        },
        {
          title: lang === 'ar' ? 'جدول سجلات الأحداث التفصيلي' : 'Detailed Event Logs Table',
          table: {
            headers: [
              lang === 'ar' ? 'التوقيت' : 'Timestamp',
              lang === 'ar' ? 'نوع الإجراء' : 'Action Type',
              lang === 'ar' ? 'المستخدم / المنفذ' : 'User/Operator',
              lang === 'ar' ? 'الحالة' : 'Status',
              lang === 'ar' ? 'التفاصيل التنفيذية' : 'Executive Details',
            ],
            rows: logs.map(l => [
              l.timestamp,
              l.action,
              l.user,
              l.status === 'success' ? (lang === 'ar' ? 'مكتمل ✓' : 'Success ✓') : (lang === 'ar' ? 'تنبيه ⚠️' : 'Warning ⚠️'),
              l.details,
            ]),
          },
        },
      ],
    });

    triggerToast(lang === 'ar' ? 'تم تنزيل تقرير سجلات الأمان المنسق بنجاح 🛡️' : 'Exported formatted audit logs report 🛡️');
  };

  const exportLogsCsv = () => {
    if (!logs.length) return;
    const headers = [
      lang === 'ar' ? 'التوقيت' : 'Timestamp',
      lang === 'ar' ? 'نوع الإجراء' : 'Action Type',
      lang === 'ar' ? 'المستخدم / المنفذ' : 'User/Operator',
      lang === 'ar' ? 'الحالة' : 'Status',
      lang === 'ar' ? 'التفاصيل التنفيذية' : 'Executive Details',
    ];
    const rows = logs.map((l) => [
      l.timestamp,
      l.action,
      l.user,
      l.status,
      l.details,
    ]);
    downloadCsvReport(`nexus_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    triggerToast(lang === 'ar' ? 'تم تنزيل جدول Excel/CSV للسجلات بنجاح 📊' : 'Exported Audit Logs CSV 📊');
  };

  // Executive Actions
  const handleOptimizeDb = async () => {
    try {
      const res = await fetch('/api/admin/actions/optimize-db', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        triggerToast(lang === 'ar' ? data.messageAr : data.messageEn);
        fetchAdminStats();
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFlushSessions = async () => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من إعادة ضبط جلسات جميع المستخدمين النشطين؟' : 'Reset all active non-owner user sessions?')) return;
    try {
      const res = await fetch('/api/admin/actions/flush-sessions', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        triggerToast(lang === 'ar' ? data.messageAr : data.messageEn);
        fetchAdminStats();
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSecurityScan = async () => {
    try {
      const res = await fetch('/api/admin/actions/security-scan', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        triggerToast(lang === 'ar' ? data.messageAr : data.messageEn);
        fetchAdminStats();
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch initial real server data
  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
        if (data.recentRegistrations) setRecentRegistrations(data.recentRegistrations);
        if (data.systemSettings) setSettings(data.systemSettings);
        if (data.broadcastNotice) setBroadcast(data.broadcastNotice);
      }

      // Fetch live broadcasts history
      const bcRes = await fetch('/api/admin/broadcast');
      if (bcRes.ok) {
        const bcData = await bcRes.json();
        if (bcData.liveBroadcasts) setBroadcastHistory(bcData.liveBroadcasts);
        if (bcData.broadcastNotice) setBroadcast(bcData.broadcastNotice);
      }
    } catch (err) {
      console.error('Failed to fetch real admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users) setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  const fetchAutonomousReportsHistory = async () => {
    try {
      const res = await fetch('/api/admin/ai-autonomous-reports');
      if (res.ok) {
        const data = await res.json();
        if (data.reports) {
          setAutonomousReportsHistory(data.reports);
          if (data.reports.length > 0 && !autonomousResult) {
            const latest = data.reports[0];
            setAutonomousResult({
              riskLevel: latest.riskLevel,
              threatsDetected: latest.threatsDetected || [],
              actionsTaken: latest.actionsTaken || [],
              reportSummary: latest.reportSummary || '',
              timestamp: latest.timestamp || new Date().toISOString(),
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch autonomous reports:', err);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    fetchUsers();
    fetchLogs();
    fetchAutonomousReportsHistory();
  }, []);

  // Background Auto-Pilot Guardian Listener: triggers AI protection when user leaves or closes app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && settings.autoPilotGuardianMode) {
        fetch('/api/admin/ai-autonomous-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ triggerReason: 'AUTONOMOUS_EXIT_LEAVE' }),
          keepalive: true,
        }).catch((e) => console.error('Exit auto-pilot execution error:', e));
      } else if (document.visibilityState === 'visible' && settings.autoPilotGuardianMode) {
        fetchAutonomousReportsHistory();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.autoPilotGuardianMode]);

  // Update System Settings
  const handleToggleSetting = async (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        triggerToast(lang === 'ar' ? 'تم تحديث إعدادات النظام الحقيقية بنجاح ⚡' : 'System settings updated ⚡');
        fetchAdminStats();
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.email) return;

    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(lang === 'ar' ? 'تم إنشاء حساب المستخدم الحقيقي بنجاح ✓' : 'User created successfully ✓');
        setIsCreateUserOpen(false);
        setNewUserForm({ email: '', name: '', password: '', role: 'user' });
        fetchAdminStats();
        fetchUsers();
        fetchLogs();
      } else {
        triggerToast(data.messageAr || data.message || 'Error creating user');
      }
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  // User role or status update
  const handleUserRoleStatus = async (email: string, role?: string, status?: string) => {
    try {
      const res = await fetch('/api/admin/users/role-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, status }),
      });
      if (res.ok) {
        triggerToast(lang === 'ar' ? 'تم تحديث صلاحية/حالة المستخدم فورياً ✓' : 'User profile updated ✓');
        fetchAdminStats();
        fetchUsers();
        fetchLogs();
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  // Open delete user modal dialog
  const promptDeleteUser = (u: UserRecord) => {
    if (u.role === 'owner' || u.email.toLowerCase() === 'xxx230641@gmail.com') {
      triggerToast(lang === 'ar' ? 'لا يمكن حذف حساب مالك التطبيق الرئيسي 👑' : 'Cannot delete primary owner account 👑');
      return;
    }
    setUserToDelete(u);
  };

  // Perform permanent user deletion from database
  const confirmDeleteUserAccount = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userToDelete.email }),
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(lang === 'ar' ? `تم حذف حساب ${userToDelete.name} (${userToDelete.email}) نهائياً من قاعدة البيانات 🗑️` : `User ${userToDelete.email} permanently deleted 🗑️`);
        setUserToDelete(null);
        fetchAdminStats();
        fetchUsers();
        fetchLogs();
      } else {
        triggerToast(data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  // Broadcast Update with Real Push Notification Delivery
  const handleSaveBroadcast = async (sendPushOverride?: boolean) => {
    try {
      const payload = {
        ...broadcast,
        sendPush: sendPushOverride ?? true,
        titleAr: broadcast.textAr ? `📢 إشعار هام: ${broadcast.textAr.substring(0, 30)}...` : '📢 إعلان عام من إدارة النظام',
        titleEn: broadcast.textEn ? `📢 Global Notice: ${broadcast.textEn.substring(0, 30)}...` : '📢 Global System Announcement',
        targetAudience: 'all',
      };

      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        triggerToast(
          lang === 'ar'
            ? 'تم إرسال البث العام والإشعارات الفورية الحقيقية لجميع أجهزة العملاء بنجاح 🚀🔔'
            : 'Real global broadcast & instant push notifications dispatched to all client devices! 🚀🔔'
        );
        fetchLogs();
        fetchAdminStats();
      }
    } catch (err) {
      console.error('Failed to update broadcast:', err);
    }
  };

  // Purge Audit Logs
  const handlePurgeLogs = async () => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من مسح جميع سجلات الأحداث والأمان؟' : 'Purge all audit logs?')) return;
    try {
      const res = await fetch('/api/admin/logs/clear', { method: 'POST' });
      if (res.ok) {
        triggerToast(lang === 'ar' ? 'تم مسح وتطهير سجلات النظام بنجاح 🧹' : 'Audit logs purged 🧹');
        fetchAdminStats();
        fetchLogs();
      }
    } catch (err) {
      console.error('Failed to purge logs:', err);
    }
  };

  // Ask AI Consultant (Absolute Execution Authority Agent)
  const handleAskAiConsultant = async (queryText?: string) => {
    const promptToRun = queryText || aiQuery;
    if (!promptToRun.trim()) return;

    try {
      setIsAiLoading(true);
      setAiExecutedActions([]);
      const res = await fetch('/api/admin/ai-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: promptToRun }),
      });
      const data = await res.json();
      setAiReply(data.reply || 'تم تحليل بيانات التطبيق واتخاذ القرار التنفيذي المناسب.');
      if (data.executedActions && data.executedActions.length > 0) {
        setAiExecutedActions(data.executedActions);
        triggerToast(lang === 'ar' ? '⚡ نفّذ مستشار الذكاء الاصطناعي الإجراءات المطلوبة فورياً!' : '⚡ AI Agent executed system actions!');
      }
      fetchAdminStats();
      fetchLogs();
    } catch (err) {
      console.error('AI Consultant execution error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Run Absolute Autonomous AI Sweep & Auto-Protection
  const handleRunAutonomousAgent = async () => {
    try {
      setIsAutonomousRunning(true);
      const res = await fetch('/api/admin/ai-autonomous-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        const report = data.report || {
          riskLevel: data.riskLevel,
          threatsDetected: data.threatsDetected || [],
          actionsTaken: data.actionsTaken || [],
          reportSummary: data.reportSummary || '',
          timestamp: data.timestamp || new Date().toISOString(),
        };
        setAutonomousResult(report);
        if (data.reportsHistory) {
          setAutonomousReportsHistory(data.reportsHistory);
        }
        triggerToast(
          lang === 'ar'
            ? '🤖 تم تفويض الذكاء الاصطناعي بنجاح: تم فحص وإدارة وحماية التطبيق وتوليد تقرير التهديدات!'
            : '🤖 Autonomous AI sweep & defense execution complete!'
        );
        fetchAdminStats();
        fetchLogs();
      }
    } catch (err) {
      console.error('Autonomous agent execution error:', err);
    } finally {
      setIsAutonomousRunning(false);
    }
  };

  // Test Gemini API Model Directly
  const handleTestGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsGeminiTesting(true);
      const res = await fetch('/api/admin/test-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: testGeminiPrompt || 'اختبار استجابة Gemini 3.6 Flash للنظام' }),
      });
      const data = await res.json();
      if (data.success) {
        setTestGeminiReply(data.reply);
      } else {
        setTestGeminiReply('خطأ: ' + (data.error || 'فشل الاختبار'));
      }
    } catch (err) {
      console.error('Gemini test error:', err);
    } finally {
      setIsGeminiTesting(false);
    }
  };

  // Flag / Unflag user compliance status
  const handleFlagUser = async (email: string, policyStatus: 'compliant' | 'warning' | 'flagged' | 'suspended', reasonAr?: string) => {
    try {
      const res = await fetch('/api/admin/users/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          policyStatus,
          violationReasonAr: reasonAr || (policyStatus === 'compliant' ? '' : 'مخالفة سياسة التطبيق والتوجيهات العامة'),
          violationReasonEn: reasonAr || (policyStatus === 'compliant' ? '' : 'Application terms and guidelines violation'),
          incrementViolations: policyStatus === 'flagged',
        }),
      });
      if (res.ok) {
        triggerToast(
          lang === 'ar'
            ? policyStatus === 'compliant'
              ? 'تم تسوية وضع حساب المستخدم واحتسابه ملتزماً بالقواعد ✅'
              : 'تم تسجيل المخالفة وتحديث حالة التزام المستخدم ⚠️'
            : 'User compliance status updated'
        );
        fetchUsers();
        fetchAdminStats();
        fetchLogs();
      }
    } catch (err) {
      console.error('Failed to flag user:', err);
    }
  };

  // Export DB Backup
  const handleExportDb = () => {
    window.open('/api/admin/export-db', '_blank');
    triggerToast(lang === 'ar' ? 'تم تحميل النسخة الاحتياطية المكتملة 💾' : 'Database backup downloaded 💾');
  };

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    let matchesRole = true;
    if (userRoleFilter === 'non_compliant') {
      matchesRole = u.policyStatus === 'flagged' || u.policyStatus === 'warning' || (u.violationsCount || 0) > 0;
    } else if (userRoleFilter !== 'all') {
      matchesRole = u.role === userRoleFilter;
    }
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border-subtle)] min-h-screen space-y-6 animate-fade-in font-sans shadow-xl">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-20 ltr:right-6 rtl:left-6 z-50 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-lg flex items-center gap-2.5 border border-emerald-300 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Control Room Master Header (Royal Emerald & Clean Executive Theme) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white border border-emerald-400/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 ltr:right-0 rtl:left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Status Line */}
        <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-5 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-100">
              <Globe className="w-4 h-4 text-emerald-200" />
              <span>Google Cloud Platform / NEXUS Enterprise Console</span>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 text-[10px] font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
              ALL REGIONS OPERATIONAL (99.99% UPTIME)
            </span>
          </div>

          {/* PROMINENT AI ADVISOR MODE SWITCH BUTTON */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-inner">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-300 animate-bounce" />
              <span className="text-xs font-black text-white whitespace-nowrap">
                {lang === 'ar' ? '🤖 مستشار الذكاء الاصطناعي' : '🤖 AI Co-Pilot Advisor'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleToggleSetting('aiAdvisorMode')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.aiAdvisorMode ? 'bg-amber-400 shadow-lg' : 'bg-white/30'
              }`}
              title={lang === 'ar' ? 'زر التبديل للذكاء الاصطناعي كمستشار تنفيذي' : 'Toggle AI Advisor Co-Pilot'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.aiAdvisorMode ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
              settings.aiAdvisorMode ? 'bg-amber-400/30 text-amber-100 border border-amber-300/40 animate-pulse' : 'bg-black/20 text-white/80'
            }`}>
              {settings.aiAdvisorMode ? (lang === 'ar' ? 'مفعل 🟢' : 'Active 🟢') : (lang === 'ar' ? 'معطل ⚪' : 'Off ⚪')}
            </span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/15 border border-white/30 text-white shadow-inner">
                <ShieldAlert className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {lang === 'ar' ? 'غرفة التحكم والتنفيذ لمشرف النظام (Owner Control Room)' : 'Owner Control Room & Executive Portal'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] border border-white/30 font-bold">
                    v3.6-PROD REAL
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 mt-1">
                  {lang === 'ar'
                    ? 'لوحة تحكم إدارية بمستوى الشركات العالمية متصلة بالخادم الحقيقي، مع مفتاح التبديل المباشر لمستشار الذكاء الاصطناعي.'
                    : 'Enterprise level executive console connected to live server with direct AI Co-Pilot Advisor mode toggle.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleOptimizeDb}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/20 shadow-md"
              title={lang === 'ar' ? 'ضغط وتحسين قواعد البيانات وذاكرة RAM' : 'Optimize DB Cache'}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'ar' ? 'تحسين قواعد البيانات' : 'Optimize DB'}</span>
            </button>

            <button
              onClick={handleSecurityScan}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/20 shadow-md"
              title={lang === 'ar' ? 'تشغيل فحص الثغرات والأمان الشامل' : 'Run Security Scan'}
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'ar' ? 'فحص الثغرات' : 'Security Scan'}</span>
            </button>

            <button
              onClick={handleFlushSessions}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/20 shadow-md"
              title={lang === 'ar' ? 'إعادة ضبط الجلسات النشطة للمستخدمين' : 'Flush Sessions'}
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'ar' ? 'تصفير الجلسات' : 'Flush Sessions'}</span>
            </button>

            <button
              onClick={handleExportDb}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/20 shadow-md"
              title={lang === 'ar' ? 'تصدير نسخة احتياطية حقيقية JSON' : 'Export Full Real JSON Backup'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تصدير نسخة النظام' : 'Backup DB'}</span>
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-white/20 border border-white/30 text-white font-black text-xs flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
              {lang === 'ar' ? 'الخادم: نشط 100%' : 'Server: 100% Online'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-black shadow-md border border-emerald-400'
              : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)]'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-500" />
          <span>{lang === 'ar' ? 'مؤشرات الخادم والمستشار' : 'Server & AI Agent'}</span>
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'registrations'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-black shadow-md border border-emerald-400'
              : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)]'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-500" />
          <span>{lang === 'ar' ? 'تتبع تسجيل المستخدمين المباشر' : 'Live User Registrations'}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
            +{metrics.registrationsToday || 0} {lang === 'ar' ? 'اليوم' : 'today'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-black shadow-md border border-emerald-400'
              : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)]'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-500" />
          <span>{lang === 'ar' ? 'سجل الحسابات والتعيين' : 'User Directory'}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">{users.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'broadcast'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-black shadow-md border border-emerald-400'
              : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)]'
          }`}
        >
          <Megaphone className="w-4 h-4 text-amber-500" />
          <span>{lang === 'ar' ? 'البث العام للتطبيق' : 'Global Broadcasts'}</span>
          {broadcast.active && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-black shadow-md border border-emerald-400'
              : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)]'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-500" />
          <span>{lang === 'ar' ? 'سجلات الأمان والتطبيقات' : 'Audit Logs'}</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[10px] font-bold">{logs.length}</span>
        </button>
      </div>

      {/* TAB 1: SERVER METRICS & ABSOLUTE AI EXECUTIVE CONSULTANT */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Executive Real Telemetry Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 space-y-2 border-indigo-500/20 bg-indigo-500/5">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span className="text-xs font-bold">{lang === 'ar' ? 'المستخدمون المسجلون' : 'Registered Users'}</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)]">{metrics.totalUsers}</div>
              <p className="text-[10px] text-emerald-500 font-bold">{lang === 'ar' ? 'حسابات حقيقية دائمية' : 'Persistent Accounts'}</p>
            </Card>

            <Card className="p-4 space-y-2 border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span className="text-xs font-bold">{lang === 'ar' ? 'الجلسات النشطة المباشرة' : 'Active Sessions'}</span>
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)]">{metrics.activeSessions}</div>
              <p className="text-[10px] text-emerald-500 font-bold">{lang === 'ar' ? 'متصلون الآن بالخادم' : 'Live Connected'}</p>
            </Card>

            <Card className="p-4 space-y-2 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span className="text-xs font-bold">{lang === 'ar' ? 'وقت تشغيل الخادم' : 'Server Uptime'}</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-lg font-black text-[var(--text-primary)] truncate">{metrics.uptime}</div>
              <p className="text-[10px] text-amber-500 font-bold">{lang === 'ar' ? 'تشغيل حقيقي بدون توقف' : 'Real Node Uptime'}</p>
            </Card>

            <Card className="p-4 space-y-2 border-cyan-500/20 bg-cyan-500/5">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span className="text-xs font-bold">{lang === 'ar' ? 'ذاكرة RAM للعمليات' : 'Memory Heap'}</span>
                <Cpu className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)]">{metrics.memoryUsageMB} MB</div>
              <p className="text-[10px] text-cyan-500 font-bold">{lang === 'ar' ? 'قراءة حقيقية للموارد' : 'Live Node.js RAM'}</p>
            </Card>
          </div>

          {/* ABSOLUTE AUTHORITY AI EXECUTIVE CONSULTANT WIDGET */}
          <Card className="space-y-4 border-2 border-indigo-500/50 bg-[var(--bg-surface)] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 ltr:right-0 rtl:left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 shadow-inner">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-[var(--text-primary)]">
                      {lang === 'ar' ? 'مستشار المشرف التنفيذي (Absolute Authority AI Agent)' : 'Executive AI Agent (Absolute Authority)'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {lang === 'ar' ? 'صلاحية تنفيذية مطلقة' : 'Execution Agent'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {lang === 'ar'
                      ? 'يمكن للمستشار تنفيذ الأوامر المباشرة فورياً (تعديل الصيانة، إغلاق/فتح التسجيل، تطهير السجلات، وتفعيل الحماية الحقيقية).'
                      : 'Ask or instruct the AI agent to execute system actions directly on live application state.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRunAutonomousAgent}
                  disabled={isAutonomousRunning}
                  className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xl flex items-center gap-2 transition-all border border-white/20 cursor-pointer"
                >
                  {isAutonomousRunning ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  )}
                  <span>
                    {lang === 'ar'
                      ? '⚡ تشغيل الإدارة والتعديل الذاتي الشامل (Auto-Pilot Agent)'
                      : '⚡ Execute Full Autonomous Auto-Pilot'}
                  </span>
                </button>

                <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-xl border border-indigo-500/30 hidden md:inline-block">
                  NEXUS AI Flash Exec
                </span>
              </div>
            </div>

            {/* Background Auto-Pilot Guardian Switch on Exit/Leave */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-hover)] border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border shrink-0 ${
                  settings.autoPilotGuardianMode
                    ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                    : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                }`}>
                  <ShieldCheck className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-[var(--text-primary)]">
                      {lang === 'ar' ? '🤖 زر وضع الحارس والوكيل الذاتي عند المغادرة والخروج (Auto-Pilot Guardian)' : 'Auto-Pilot Guardian on Exit'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                      settings.autoPilotGuardianMode
                        ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 animate-pulse'
                        : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}>
                      {settings.autoPilotGuardianMode
                        ? (lang === 'ar' ? 'مفعل 🟢 (يعمل ويحل المشاكل تلقائياً عند المغادرة)' : 'Active 🟢')
                        : (lang === 'ar' ? 'معطل ⚪' : 'Disabled ⚪')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">
                    {lang === 'ar'
                      ? 'عند تفعيل هذا الزر الخفيف، يتولى الذكاء الاصطناعي فحص السجلات، حماية النظام، وتطبيق الحلول تلقائياً في الخلفية فور إغلاقك أو خروجك من التطبيق.'
                      : 'When enabled, the AI resolves background issues and guards the app automatically whenever you leave or close the app.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleSetting('autoPilotGuardianMode')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none self-end sm:self-center ${
                  settings.autoPilotGuardianMode ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.autoPilotGuardianMode ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Direct Instant Executive Action Commands */}
            <div className="space-y-2">
              <span className="text-[11px] font-black text-[var(--text-muted)] block">
                {lang === 'ar' ? 'اختصارات الأوامر التنفيذية المباشرة (أوامر سريعة لصاحب التطبيق):' : 'Direct Action Command Shortcuts:'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAskAiConsultant('فعل وضع الصيانة للنظام عاجلاً')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold border border-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>🛡️</span>
                  <span>{lang === 'ar' ? 'تفعيل وضع الصيانة' : 'Enable Maintenance'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAskAiConsultant('إلغاء وضع الصيانة وتشغيل الخادم طبيعياً')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold border border-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>🚀</span>
                  <span>{lang === 'ar' ? 'إلغاء الصيانة' : 'Disable Maintenance'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAskAiConsultant('امسح وتطهر جميع سجلات الأحداث فورياً')}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold border border-red-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'مسح وتطهير السجلات' : 'Purge All Logs'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAskAiConsultant('أغلق باب التسجيل الجديد للمستخدمين مؤقتاً')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إغلاق التسجيل' : 'Close Registration'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAskAiConsultant('افتح باب التسجيل الجديد للمستخدمين')}
                  className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-bold border border-teal-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'فتح التسجيل' : 'Open Registration'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAskAiConsultant('افحص الأمان وفعل درع الحماية الأوتوماتيكي مع تتبع التهديدات')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إصلاح وتفعيل درع الأمان' : 'Activate Security Shield'}</span>
                </button>
              </div>
            </div>

            {/* Input prompt */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAiConsultant()}
                placeholder={
                  lang === 'ar'
                    ? 'اكتب أمرك للمستشار (مثال: فعل الصيانة، مسح السجلات، أغلق التسجيل، أو طلب تحليل حالة التطبيق)...'
                    : 'Command the AI agent (e.g. enable maintenance, clear logs, audit security)...'
                }
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-[var(--bg-base)] border border-indigo-500/30 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              />
              <Button size="sm" variant="primary" onClick={() => handleAskAiConsultant()} disabled={isAiLoading} icon={<Wand2 className="w-4 h-4" />}>
                {isAiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>{lang === 'ar' ? 'تنفيذ الأمر ⚡' : 'Execute ⚡'}</span>}
              </Button>
            </div>

            {/* Executed Action Banner Feedback */}
            {aiExecutedActions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-1">
                <div className="font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'ar' ? 'تم تنفيذ الإجراءات المباشرة بنجاح على الخادم:' : 'Direct System Actions Executed:'}</span>
                </div>
                <ul className="list-disc ltr:pl-5 rtl:pr-5 font-bold space-y-0.5 text-[11px]">
                  {aiExecutedActions.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* AI Reply Text Output */}
            {aiReply && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-[var(--bg-base)] border border-indigo-500/30 text-xs text-[var(--text-primary)] whitespace-pre-line leading-relaxed font-medium shadow-inner"
              >
                {aiReply}
              </motion.div>
            )}
          </Card>

          {/* DEDICATED AI AUTONOMOUS OPERATIONS & THREAT INTELLIGENCE BOX */}
          <Card className="space-y-4 border-2 border-purple-500/40 bg-[var(--bg-surface)] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 ltr:right-0 rtl:left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header with Risk Level Badge & Trigger */}
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-400 shadow-inner">
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-black text-[var(--text-primary)]">
                      {lang === 'ar'
                        ? 'صندوق تقرير وتعديلات الذكاء الاصطناعي الذاتي وتقييم الأخطار (AI Autonomous Operations & Threat Box)'
                        : 'AI Autonomous Operations & Threat Radar'}
                    </h3>

                    {autonomousResult ? (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 shadow-sm ${
                          autonomousResult.riskLevel === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : autonomousResult.riskLevel === 'ELEVATED'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>
                          {lang === 'ar'
                            ? `تقييم الأخطار: ${
                                autonomousResult.riskLevel === 'CRITICAL'
                                  ? '🔴 حرج (تم التأمين الفوري)'
                                  : autonomousResult.riskLevel === 'ELEVATED'
                                  ? '🟡 تحذير متوسط (محمي)'
                                  : '🟢 آمن كلياً'
                              }`
                            : `Risk Level: ${autonomousResult.riskLevel}`}
                        </span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{lang === 'ar' ? 'جاهز للفحص والتغيير الذاتي' : 'Ready for Auto Sweep'}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {lang === 'ar'
                      ? 'يعرض جميع الأفعال التي اتخذها الذكاء الاصطناعي لحماية الخادم وتعديل إعداداته، بالإضافة إلى رصد أخطار وتهديدات التطبيق مباشرة.'
                      : 'Real-time record of autonomous actions taken by the AI agent and current threat radar.'}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="primary"
                onClick={handleRunAutonomousAgent}
                disabled={isAutonomousRunning}
                icon={isAutonomousRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                className="bg-purple-600 hover:bg-purple-500 text-white font-black"
              >
                {lang === 'ar' ? 'إعادة الفحص والتغيير الذاتي ⚡' : 'Re-Run Auto Sweep ⚡'}
              </Button>
            </div>

            {/* Display Results or Initial Prompt */}
            {autonomousResult ? (
              <div className="space-y-4 pt-1">
                {/* 1. Actions Executed Autonomously */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {lang === 'ar' ? 'الإجراءات والتغييرات المباشرة التي قام بها الذكاء الاصطناعي ذاتياً:' : 'Autonomous Actions Executed:'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300">
                      {new Date(autonomousResult.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {autonomousResult.actionsTaken.map((act, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-[var(--bg-base)] border border-emerald-500/20 text-xs font-bold text-emerald-300 flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Detected App Threats & Vulnerabilities Radar */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    {lang === 'ar' ? 'رادار الأخطار والتهديدات المرصودة في التطبيق:' : 'App Threats & Vulnerabilities Radar:'}
                  </span>
                  <div className="space-y-2 pt-1">
                    {autonomousResult.threatsDetected.map((thr, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[var(--bg-base)] border border-amber-500/20 text-xs text-[var(--text-primary)] font-bold flex items-center gap-2 shadow-sm">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{thr}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Comprehensive Operations & Security Report */}
                <div className="p-4 rounded-2xl bg-[var(--bg-base)] border border-purple-500/30 space-y-2">
                  <span className="text-xs font-black text-purple-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    {lang === 'ar' ? 'التقرير الشامل وتوجيهات الذكاء الاصطناعي للمشرف:' : 'Full AI Operations & Protection Report:'}
                  </span>
                  <div className="p-3.5 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] whitespace-pre-line leading-relaxed font-medium">
                    {autonomousResult.reportSummary}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[var(--bg-base)] border border-purple-500/20 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-400 mx-auto flex items-center gap-1 justify-center">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-[var(--text-primary)]">
                    {lang === 'ar' ? 'زر الإدارة الذاتية المباشرة (Auto-Pilot Agent)' : 'Auto-Pilot Agent Control'}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] max-w-xl mx-auto">
                    {lang === 'ar'
                      ? 'عند الضغط على الزر، سيتولى الذكاء الاصطناعي فحص الخادم، حماية التطبيق، تعديل وضع الصيانة والتسجيل حسب الحاجة، وعرض تقرير بالتهديدات والأخطار المرصودة تلقائياً.'
                      : 'Click the Auto-Pilot button above to trigger full autonomous scanning, defense shielding, and system tuning.'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleRunAutonomousAgent}
                  disabled={isAutonomousRunning}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black"
                >
                  {lang === 'ar' ? 'تشغيل الفحص والتغيير الذاتي الآن ⚡' : 'Start Autonomous Auto Sweep ⚡'}
                </Button>
              </div>
            )}

            {/* Historical Reports Timeline Feed */}
            {autonomousReportsHistory.length > 0 && (
              <div className="border-t border-purple-500/20 pt-4 space-y-2">
                <span className="text-[11px] font-black text-purple-300 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  {lang === 'ar' ? 'سجل تقارير الفحص والتغييرات الذاتية السابقة للذكاء الاصطناعي:' : 'Historical Autonomous AI Interventions Log:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {autonomousReportsHistory.slice(0, 6).map((rep) => (
                    <div
                      key={rep.id}
                      onClick={() => setAutonomousResult(rep)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        autonomousResult && (autonomousResult as any).id === rep.id
                          ? 'bg-purple-500/20 border-purple-400/50 shadow-md ring-1 ring-purple-400/30'
                          : 'bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono mb-1">
                        <span>{new Date(rep.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                          rep.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : rep.riskLevel === 'ELEVATED' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {rep.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {rep.actionsTaken?.[0] || (lang === 'ar' ? 'فحص وتأمين تلقائي' : 'Autonomous Sweep')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Master System Feature Toggles */}
          <Card className="space-y-4 border-2 border-[var(--border-subtle)]">
            <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
              <Sliders className="w-5 h-5 text-[var(--accent)]" />
              {lang === 'ar' ? 'التحكم بميزات الخادم والتسجيل المباشر' : 'Master System Controls & Feature Flags'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-black text-[var(--text-primary)] block">
                    {lang === 'ar' ? 'وضع الصيانة العامة (Maintenance Mode)' : 'Maintenance Mode'}
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {lang === 'ar' ? 'عرض شاشة الصيانة للمستخدمين وإبقاء المشرفين فقط.' : 'Block standard users with maintenance banner.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('maintenanceMode')}
                  className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                    settings.maintenanceMode ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      settings.maintenanceMode ? 'ltr:left-7 rtl:right-7' : 'ltr:left-1 rtl:right-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-black text-[var(--text-primary)] block">
                    {lang === 'ar' ? 'فتح التسجيل الجديد (Open Registration)' : 'Allow New User Signups'}
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {lang === 'ar' ? 'السماح أو إيقاف إنشاء الحسابات الجديدة في التطبيق.' : 'Allow or halt new account signups.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('registrationOpen')}
                  className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                    settings.registrationOpen ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      settings.registrationOpen ? 'ltr:left-7 rtl:right-7' : 'ltr:left-1 rtl:right-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-black text-[var(--text-primary)] block">
                    {lang === 'ar' ? 'المكالمات الصوتية المباشرة (NEXUS AI Live Voice)' : 'NEXUS AI Voice Calls'}
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {lang === 'ar' ? 'تمكين الاتصال الصوتي الفائق السريعة مع مساعد NEXUS.' : 'Enable live speech audio mode.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('liveVoiceEnabled')}
                  className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                    settings.liveVoiceEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      settings.liveVoiceEnabled ? 'ltr:left-7 rtl:right-7' : 'ltr:left-1 rtl:right-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-hover)] border border-indigo-500/30 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-black text-[var(--text-primary)] block">
                    {lang === 'ar' ? '🤖 حارس الوكيل الذاتي عند المغادرة (Background Auto-Pilot Guardian)' : 'Background Auto-Pilot Guardian'}
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {lang === 'ar' ? 'قيام الذكاء الاصطناعي بحل المشاكل وتأمين الخادم تلقائياً عند خروجك أو مغادرتك التطبيق.' : 'AI resolves issues and guards server automatically when leaving or closing app.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('autoPilotGuardianMode')}
                  className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                    settings.autoPilotGuardianMode ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      settings.autoPilotGuardianMode ? 'ltr:left-7 rtl:right-7' : 'ltr:left-1 rtl:right-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-black text-[var(--text-primary)] block">
                    {lang === 'ar' ? 'درع الأمان وتتبع التهديدات (Security Shield)' : 'Security Threat Shield'}
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {lang === 'ar' ? 'حظر تلقائي للمحاولات المشبوهة وتحديد معدل الطلبات.' : 'Automatic IP rate limit & threat filter.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('securityShieldActive')}
                  className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                    settings.securityShieldActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      settings.securityShieldActive ? 'ltr:left-7 rtl:right-7' : 'ltr:left-1 rtl:right-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* NEXUS AI API Live Tester */}
          <Card className="space-y-3 border-2 border-[var(--border-subtle)]">
            <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5">
              <Terminal className="w-4 h-4 text-indigo-400" />
              {lang === 'ar' ? 'وحدة اختبار نموذج الذكاء الاصطناعي (NEXUS AI Live Console)' : 'NEXUS AI Live Console'}
            </h3>
            <form onSubmit={handleTestGemini} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testGeminiPrompt}
                  onChange={(e) => setTestGeminiPrompt(e.target.value)}
                  placeholder={lang === 'ar' ? 'اكتب أمر للاختبار (مثلاً: استجابة خادم النواة)...' : 'Type prompt to test NEXUS AI...'}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none"
                />
                <Button type="submit" size="sm" variant="primary" disabled={isGeminiTesting}>
                  {isGeminiTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>{lang === 'ar' ? 'تشغيل ⚡' : 'Run ⚡'}</span>}
                </Button>
              </div>
            </form>
            {testGeminiReply && (
              <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)] max-h-28 overflow-y-auto">
                {testGeminiReply}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: REAL USER REGISTRATION TRACKER & SIGNUPS CENTER */}
      {activeTab === 'registrations' && (
        <div className="space-y-6 animate-fade-in">
          {/* Registration Real Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-emerald-500/30 bg-emerald-500/5 space-y-2">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span className="text-xs font-bold">{lang === 'ar' ? 'مسجلو اليوم الحقيقيون' : 'Signups Today'}</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-[var(--text-primary)]">+{metrics.registrationsToday || 0}</div>
              <p className="text-[10px] text-emerald-500 font-bold">{lang === 'ar' ? 'تم التسجيل في الـ 24 ساعة الماضية' : 'New users in last 24h'}</p>
            </Card>

            <Card className="p-4 border-indigo-500/30 bg-indigo-500/5 space-y-2">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span className="text-xs font-bold">{lang === 'ar' ? 'مسجلو هذا الأسبوع' : 'Signups This Week'}</span>
                <UserPlus className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-3xl font-black text-[var(--text-primary)]">+{metrics.registrationsThisWeek || 0}</div>
              <p className="text-[10px] text-indigo-400 font-bold">{lang === 'ar' ? 'إحصائية حقيقية لـ 7 أيام' : 'New users in last 7 days'}</p>
            </Card>

            <Card className="p-4 border-cyan-500/30 bg-cyan-500/5 space-y-2">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span className="text-xs font-bold">{lang === 'ar' ? 'إجمالي الحسابات المسجلة' : 'Total Accounts'}</span>
                <Users className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-3xl font-black text-[var(--text-primary)]">{metrics.totalUsers}</div>
              <p className="text-[10px] text-cyan-400 font-bold">{lang === 'ar' ? 'مسجلة بالكامل في قاعدة البيانات' : 'Stored in Users DB'}</p>
            </Card>

            <Card className="p-4 border-amber-500/30 bg-amber-500/5 space-y-2">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span className="text-xs font-bold">{lang === 'ar' ? 'حالة الحسابات' : 'Account Status'}</span>
                <ShieldCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-black text-emerald-500">{metrics.statusBreakdown?.active || 0} {lang === 'ar' ? 'نشط' : 'active'}</span>
                <span className="text-xs font-black text-red-500">{metrics.statusBreakdown?.suspended || 0} {lang === 'ar' ? 'محظور' : 'suspended'}</span>
              </div>
              <p className="text-[10px] text-amber-400 font-bold">{lang === 'ar' ? 'متابعة أمان الحسابات' : 'Security audit'}</p>
            </Card>
          </div>

          {/* Registration Method Distribution */}
          <Card className="space-y-4 border-2 border-[var(--border-subtle)]">
            <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
              <KeyRound className="w-5 h-5 text-indigo-400" />
              {lang === 'ar' ? 'توزيع طرق التسجيل داخل التطبيق (Registration Authentication Methods)' : 'Auth Method Distribution'}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[11px] font-bold text-[var(--text-muted)] block">Google OAuth</span>
                <div className="text-2xl font-black text-[var(--text-primary)]">{metrics.authMethodBreakdown?.google || 0}</div>
                <span className="text-[10px] text-indigo-400 font-bold">{lang === 'ar' ? 'تسجيل عبر جوجل' : 'Google accounts'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[11px] font-bold text-[var(--text-muted)] block">{lang === 'ar' ? 'البريد وكلمة السر' : 'Email & Password'}</span>
                <div className="text-2xl font-black text-[var(--text-primary)]">{metrics.authMethodBreakdown?.manual || 0}</div>
                <span className="text-[10px] text-emerald-400 font-bold">{lang === 'ar' ? 'تسجيل يدوي عادي' : 'Standard email signup'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[11px] font-bold text-[var(--text-muted)] block">{lang === 'ar' ? 'منشأ بواسطة المشرف' : 'Created by Admin'}</span>
                <div className="text-2xl font-black text-[var(--text-primary)]">{metrics.authMethodBreakdown?.manual_admin || 0}</div>
                <span className="text-[10px] text-amber-400 font-bold">{lang === 'ar' ? 'حسابات إدارية' : 'Admin added'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[11px] font-bold text-[var(--text-muted)] block">{lang === 'ar' ? 'حساب تجريبي / ضيف' : 'Demo / Guest'}</span>
                <div className="text-2xl font-black text-[var(--text-primary)]">{metrics.authMethodBreakdown?.demo || 0}</div>
                <span className="text-[10px] text-cyan-400 font-bold">{lang === 'ar' ? 'جلسات سريعة' : 'Guest sessions'}</span>
              </div>
            </div>
          </Card>

          {/* Live Recent Signups Timeline Feed */}
          <Card className="space-y-4 border-2 border-[var(--border-subtle)] p-0 overflow-hidden">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                {lang === 'ar' ? 'سجل التسجيلات الأخيرة المباشرة داخل التطبيق' : 'Live Recent Signups Timeline'}
              </h3>
              <Button size="sm" variant="outline" onClick={fetchAdminStats}>
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              {recentRegistrations.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] font-bold">
                  {lang === 'ar' ? 'لا توجد تسجيلات حديثة حالياً.' : 'No recent signups.'}
                </div>
              ) : (
                recentRegistrations.map((u) => (
                  <div key={u.email} className="p-4 hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={u.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-[var(--border-subtle)] shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-[var(--text-primary)]">{u.name}</span>
                          {u.role === 'owner' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-black text-[9px]">👑 MASK / OWNER</span>
                          ) : u.role === 'admin' ? (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-black text-[9px]">🛡️ ADMIN</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 font-bold text-[9px]">👤 MEMBER</span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-[var(--text-muted)]">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-end hidden sm:block">
                        <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-[10px] uppercase border border-indigo-500/20">
                          {u.authMethod}
                        </span>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">
                          {formatGregorianDateTime(u.createdAt, lang)}
                        </p>
                      </div>

                      {u.role !== 'owner' && (
                        <div className="flex items-center gap-1">
                          {u.status === 'active' ? (
                            <button
                              onClick={() => handleUserRoleStatus(u.email, undefined, 'suspended')}
                              className="px-2 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold cursor-pointer"
                            >
                              {lang === 'ar' ? 'حظر' : 'Suspend'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserRoleStatus(u.email, undefined, 'active')}
                              className="px-2 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-[10px] font-bold cursor-pointer"
                            >
                              {lang === 'ar' ? 'تفعيل' : 'Activate'}
                            </button>
                          )}
                          <button
                            onClick={() => promptDeleteUser(u)}
                            className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 cursor-pointer"
                            title={lang === 'ar' ? 'حذف حساب المستخدم نهائياً' : 'Delete user permanently'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: USER DIRECTORY & MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls Bar */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={lang === 'ar' ? 'ابحث بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
                  className="w-full ltr:pl-9 rtl:pr-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
                >
                  <option value="all">{lang === 'ar' ? 'جميع الصلاحيات والحالات' : 'All Roles & Statuses'}</option>
                  <option value="non_compliant">{lang === 'ar' ? '⚠️ غير الملتزمين بالقواعد (Watchlist)' : '⚠️ Non-Compliant Users'}</option>
                  <option value="owner">{lang === 'ar' ? 'مالك التطبيق (Owner)' : 'Owner'}</option>
                  <option value="admin">{lang === 'ar' ? 'مشرف (Admin)' : 'Admin'}</option>
                  <option value="user">{lang === 'ar' ? 'مستخدم عادي' : 'Standard User'}</option>
                </select>

                <Button size="sm" variant="primary" onClick={() => setIsCreateUserOpen(true)} icon={<Plus className="w-4 h-4" />}>
                  {lang === 'ar' ? 'إنشاء حساب جديد' : 'Create User'}
                </Button>

                <Button size="sm" variant="outline" onClick={exportUsersReport} title={lang === 'ar' ? 'تنزيل تقرير المستخدمين المنسق (طباعة / PDF / HTML)' : 'Export Formatted Users Report (PDF/HTML)'}>
                  <Download className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden md:inline">{lang === 'ar' ? 'تقرير منسق (HTML/PDF)' : 'Export (HTML/PDF)'}</span>
                </Button>

                <Button size="sm" variant="outline" onClick={exportUsersCsv} title={lang === 'ar' ? 'تنزيل جدول البيانات (Excel / CSV)' : 'Export Users Data Spreadsheet (CSV)'}>
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden md:inline">{lang === 'ar' ? 'جدول Excel (CSV)' : 'Export (CSV)'}</span>
                </Button>

                <Button size="sm" variant="outline" onClick={fetchUsers}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>

          {/* User Directory Table */}
          <Card className="p-0 overflow-hidden border border-[var(--border-subtle)]">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-[var(--bg-hover)] border-b border-[var(--border-subtle)] font-extrabold text-[var(--text-muted)]">
                  <tr>
                    <th className="p-3.5 ltr:text-left rtl:text-right">{lang === 'ar' ? 'المستخدم' : 'User'}</th>
                    <th className="p-3.5 ltr:text-left rtl:text-right">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                    <th className="p-3.5 ltr:text-left rtl:text-right">{lang === 'ar' ? 'الصلاحية' : 'Role'}</th>
                    <th className="p-3.5 ltr:text-left rtl:text-right">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="p-3.5 ltr:text-left rtl:text-right">{lang === 'ar' ? 'تاريخ الانضمام' : 'Joined'}</th>
                    <th className="p-3.5 ltr:text-right rtl:text-left">{lang === 'ar' ? 'إجراءات الإدارة' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[var(--text-muted)] font-bold">
                        {lang === 'ar' ? 'لا يوجد مستخدمون مطابقون للبحث.' : 'No users matching search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.email} className="hover:bg-[var(--bg-hover)]/50 transition-colors">
                        <td className="p-3.5 font-bold flex items-center gap-2.5">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-[var(--border-subtle)]"
                          />
                          <div>
                            <span className="block font-black text-xs text-[var(--text-primary)]">{u.name}</span>
                            <span className="text-[10px] text-[var(--text-muted)] uppercase">{u.authMethod}</span>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-xs">{u.email}</td>

                        <td className="p-3.5">
                          {u.role === 'owner' ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-500 font-black text-[10px] border border-amber-500/30">
                              👑 {lang === 'ar' ? 'مالك التطبيق' : 'Owner'}
                            </span>
                          ) : u.role === 'admin' ? (
                            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-500 font-black text-[10px] border border-indigo-500/30">
                              🛡️ {lang === 'ar' ? 'مشرف' : 'Admin'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-400 font-bold text-[10px]">
                              👤 {lang === 'ar' ? 'عضو' : 'Member'}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <div className="space-y-1">
                            {u.status === 'active' ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-black text-[10px] inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {lang === 'ar' ? 'نشط' : 'Active'}
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-500 font-black text-[10px] inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {lang === 'ar' ? 'محظور' : 'Suspended'}
                              </span>
                            )}

                            {u.policyStatus === 'flagged' ? (
                              <div className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-[9px] flex items-center gap-1" title={u.violationReasonAr}>
                                <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                                <span className="truncate max-w-[120px]">{lang === 'ar' ? `غير ملتزم (${u.violationsCount || 1} مخالفة)` : `Flagged (${u.violationsCount || 1})`}</span>
                              </div>
                            ) : u.policyStatus === 'warning' ? (
                              <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[9px] flex items-center gap-1" title={u.violationReasonAr}>
                                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>{lang === 'ar' ? 'إنذار مبكر ⚠️' : 'Warning ⚠️'}</span>
                              </div>
                            ) : (
                              <span className="block text-[9px] text-emerald-400 font-medium">{lang === 'ar' ? '✓ ملتزم بالقواعد' : '✓ Compliant'}</span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5 text-[11px] font-mono text-[var(--text-muted)]">
                          {formatGregorianDate(u.createdAt, lang)}
                        </td>

                        <td className="p-3.5 ltr:text-right rtl:text-left space-x-1 rtl:space-x-reverse">
                          {u.role !== 'owner' && (
                            <>
                              {u.role === 'admin' ? (
                                <button
                                  onClick={() => handleUserRoleStatus(u.email, 'user')}
                                  className="px-2 py-1 rounded bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 text-[10px] font-bold cursor-pointer"
                                  title={lang === 'ar' ? 'تنزيل لعضو عادي' : 'Demote to user'}
                                >
                                  {lang === 'ar' ? 'تنزيل' : 'Demote'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserRoleStatus(u.email, 'admin')}
                                  className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 text-[10px] font-bold cursor-pointer"
                                  title={lang === 'ar' ? 'ترقية لمشرف' : 'Promote to admin'}
                                >
                                  {lang === 'ar' ? 'ترقية' : 'Promote'}
                                </button>
                              )}

                              {u.status === 'active' ? (
                                <button
                                  onClick={() => handleUserRoleStatus(u.email, undefined, 'suspended')}
                                  className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold cursor-pointer"
                                >
                                  {lang === 'ar' ? 'حظر' : 'Suspend'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserRoleStatus(u.email, undefined, 'active')}
                                  className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-[10px] font-bold cursor-pointer"
                                >
                                  {lang === 'ar' ? 'تفعيل' : 'Activate'}
                                </button>
                              )}

                              {u.policyStatus === 'flagged' || u.policyStatus === 'warning' ? (
                                <button
                                  onClick={() => handleFlagUser(u.email, 'compliant')}
                                  className="px-2 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-[10px] font-bold cursor-pointer"
                                  title={lang === 'ar' ? 'اعتماد التزام المستخدم وتسوية الوضع' : 'Clear Violation'}
                                >
                                  {lang === 'ar' ? 'تسوية' : 'Resolve'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleFlagUser(u.email, 'flagged', lang === 'ar' ? 'مخالفة شروط وسياسات استخدام التطبيق' : 'Policy violation')}
                                  className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold cursor-pointer"
                                  title={lang === 'ar' ? 'تسجيل مخالفة لعدم الالتزام بقواعد التطبيق' : 'Flag policy violation'}
                                >
                                  {lang === 'ar' ? 'مخالفة' : 'Flag'}
                                </button>
                              )}

                              <button
                                onClick={() => promptDeleteUser(u)}
                                className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 cursor-pointer"
                                title={lang === 'ar' ? 'حذف حساب المستخدم نهائياً' : 'Delete user permanently'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: BROADCAST NOTICE BANNER */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="space-y-4 border-2 border-amber-500/30">
            <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
              <Megaphone className="w-5 h-5 text-amber-500" />
              {lang === 'ar' ? 'إنشاء بث تنبيهي عام لكل المستخدمين (Global Broadcast Notice)' : 'Global Broadcast Message Manager'}
            </h3>

            <div className="p-4 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[var(--text-primary)]">
                  {lang === 'ar' ? 'تفعيل الشريط الإعلاني العلوي في التطبيق' : 'Activate Top Header Notice Banner'}
                </span>
                <button
                  type="button"
                  onClick={() => setBroadcast({ ...broadcast, active: !broadcast.active })}
                  className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                    broadcast.active ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      broadcast.active ? 'ltr:left-7 rtl:right-7' : 'ltr:left-1 rtl:right-1'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    {lang === 'ar' ? 'نص التنبيه باللغة العربية' : 'Arabic Notice Text'}
                  </label>
                  <input
                    type="text"
                    value={broadcast.textAr}
                    onChange={(e) => setBroadcast({ ...broadcast, textAr: e.target.value })}
                    placeholder="مثال: تنبيه: سيتم تحديث الخوادم في تمام الساعة 2 صباحاً..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    {lang === 'ar' ? 'نص التنبيه باللغة الإنجليزية' : 'English Notice Text'}
                  </label>
                  <input
                    type="text"
                    value={broadcast.textEn}
                    onChange={(e) => setBroadcast({ ...broadcast, textEn: e.target.value })}
                    placeholder="Notice: Scheduled server update at 02:00 AM UTC..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  {lang === 'ar' ? 'نوع الشريط ولونه' : 'Banner Style Level'}
                </label>
                <div className="flex items-center gap-3">
                  {(['info', 'warning', 'alert', 'success'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBroadcast({ ...broadcast, type: t })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize cursor-pointer border ${
                        broadcast.type === t ? 'border-amber-500 bg-amber-500/20 text-amber-500' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Preview */}
              {broadcast.textAr && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                    {lang === 'ar' ? 'معاينة كيف سيظهر للمستخدمين:' : 'Preview Banner Output:'}
                  </span>
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm ${
                      broadcast.type === 'warning'
                        ? 'bg-amber-500 text-slate-950'
                        : broadcast.type === 'alert'
                        ? 'bg-red-500 text-white'
                        : broadcast.type === 'success'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 animate-pulse shrink-0" />
                      <span>{lang === 'ar' ? broadcast.textAr : broadcast.textEn || broadcast.textAr}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                  <span>
                    {lang === 'ar'
                      ? '🟢 البث العام والتنبيهات حقيقية 100%: عند النقر على إرسال، يتسلم جميع العملاء إشعاراً فورياً على أجهزتهم وفي قائمة التنبيهات.'
                      : '🟢 Real Global Push Active: Dispatches instant notifications & OS push popups directly to all client devices.'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={() => handleSaveBroadcast(true)} className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-black shadow-lg shadow-amber-500/20">
                  <Send className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                  <span>{lang === 'ar' ? 'إرسال بث حقيقي وإشعار فوري لجميع العملاء 🚀' : 'Dispatch Real Push Broadcast 🚀'}</span>
                </Button>
                <Button variant="outline" onClick={() => handleSaveBroadcast(false)}>
                  <span>{lang === 'ar' ? 'حفظ شريط الإعلانات فقط' : 'Save Header Banner Only'}</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Broadcast History Log Feed */}
          <Card className="space-y-4 border-2 border-[var(--border-subtle)]">
            <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
              <Clock className="w-5 h-5 text-indigo-400" />
              {lang === 'ar' ? 'سجل الرسائل والإشعارات المربعة المرسلة سابقاً للعملاء' : 'Historical Sent Push Broadcasts Log'}
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto ltr:pr-2 rtl:pl-2">
              {broadcastHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--text-muted)] font-bold">
                  {lang === 'ar' ? 'لا توجد رسائل بث سابقة حتى الآن.' : 'No previous broadcasts logged.'}
                </div>
              ) : (
                broadcastHistory.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          item.type === 'alert' ? 'bg-red-500/20 text-red-400' : item.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {item.type.toUpperCase()}
                        </span>
                        <span className="text-xs font-black text-[var(--text-primary)]">{item.titleAr || item.titleEn}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{lang === 'ar' ? item.textAr : item.textEn || item.textAr}</p>
                    </div>

                    <div className="text-end shrink-0 text-[10px] text-[var(--text-muted)] font-mono">
                      <span>{formatGregorianDateTime(item.createdAt, lang)}</span>
                      <div className="text-[9px] text-emerald-400 font-bold mt-0.5">
                        ✓ {lang === 'ar' ? 'تم تسليم الإشعار الحقيقي' : 'Delivered'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS & SECURITY THREATS */}
      {activeTab === 'logs' && (
        <div className="space-y-4 animate-fade-in">
          <Card className="p-4 border-2 border-[var(--border-subtle)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  {lang === 'ar' ? 'سجلات أمان الخادم والأحداث المباشرة (Live Audit Logs)' : 'Live Audit Logs & Security Events'}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {lang === 'ar' ? 'تتبع حقيقي لكافة الأحداث، إنشاء الحسابات، تغيير التفضيلات، ومحاولات الأمان.' : 'Real-time record of all system events.'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={exportLogsReport} title={lang === 'ar' ? 'تنزيل تقرير السجلات المنسق (HTML/PDF)' : 'Export Logs (HTML/PDF)'}>
                  <Download className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden md:inline">{lang === 'ar' ? 'تقرير منسق (HTML/PDF)' : 'Logs (HTML/PDF)'}</span>
                </Button>
                <Button size="sm" variant="outline" onClick={exportLogsCsv} title={lang === 'ar' ? 'تنزيل السجلات بصيغة CSV' : 'Export Logs CSV'}>
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden md:inline">{lang === 'ar' ? 'جدول CSV' : 'Logs CSV'}</span>
                </Button>
                <Button size="sm" variant="danger" onClick={handlePurgeLogs} icon={<Trash2 className="w-4 h-4" />}>
                  {lang === 'ar' ? 'تطهير ومسح السجلات' : 'Purge All Logs'}
                </Button>
                <Button size="sm" variant="outline" onClick={fetchLogs}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 mt-4 max-h-[500px] overflow-y-auto ltr:pr-2 rtl:pl-2">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] font-bold">
                  {lang === 'ar' ? 'السجلات فارغة تماماً.' : 'Audit log is completely empty.'}
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono ${
                      log.status === 'danger'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : log.status === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-[var(--bg-hover)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black px-2 py-0.5 rounded bg-black/20 text-[10px]">{log.action}</span>
                        <span className="font-bold text-[11px] text-[var(--text-muted)]">[{log.user}]</span>
                      </div>
                      <p className="text-[11px] font-sans font-medium text-[var(--text-secondary)]">{log.details}</p>
                    </div>

                    <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-mono">
                      {formatGregorianDateTime(log.timestamp, lang)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* CREATE USER MODAL */}
      <AnimatePresence>
        {isCreateUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md">
              <Card className="space-y-4 border-2 border-indigo-500/40 shadow-2xl bg-[var(--bg-surface)]">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-400" />
                    {lang === 'ar' ? 'إنشاء حساب مستخدم جديد' : 'Create New User Account'}
                  </h3>
                  <button onClick={() => setIsCreateUserOpen(false)} className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                      {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      placeholder={lang === 'ar' ? 'أدخل اسم المستخدم...' : 'Enter user name...'}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                      {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      required
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      placeholder="user@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                      {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                    </label>
                    <input
                      type="password"
                      required
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                      {lang === 'ar' ? 'الصلاحية (Role)' : 'Role'}
                    </label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none"
                    >
                      <option value="user">{lang === 'ar' ? 'مستخدم عادي (User)' : 'User'}</option>
                      <option value="admin">{lang === 'ar' ? 'مشرف نظام (Admin)' : 'Admin'}</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateUserOpen(false)}>
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      {lang === 'ar' ? 'حفظ وتفعيل الحساب' : 'Create & Activate'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE USER MODAL */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md">
              <Card className="space-y-4 border-2 border-red-500/50 shadow-2xl bg-[var(--bg-surface)]">
                <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
                  <h3 className="text-base font-black text-red-500 flex items-center gap-2">
                    <Trash2 className="w-5 h-5 animate-bounce" />
                    {lang === 'ar' ? 'تأكيد حذف حساب المستخدم نهائياً' : 'Confirm Permanent User Deletion'}
                  </h3>
                  <button onClick={() => setUserToDelete(null)} className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs space-y-2">
                  <p className="font-bold text-red-400">
                    {lang === 'ar'
                      ? '⚠️ تحذير أمني من مالك التطبيق:'
                      : '⚠️ Critical Application Owner Security Alert:'}
                  </p>
                  <p className="text-[var(--text-primary)] leading-relaxed">
                    {lang === 'ar'
                      ? `هل أنت متأكد تماماً من حذف حساب ${userToDelete.name} (${userToDelete.email})؟ سيتم شطب بيانات الحساب نهائياً من قاعدة البيانات، ولن يتمكن هذا البريد من الدخول مجدداً.`
                      : `Are you completely sure you want to permanently delete user ${userToDelete.name} (${userToDelete.email})? This action will remove their account record permanently from disk.`}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex items-center gap-3">
                  <img
                    src={userToDelete.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={userToDelete.name}
                    className="w-10 h-10 rounded-2xl object-cover border border-[var(--border-subtle)]"
                  />
                  <div>
                    <span className="block font-black text-xs text-[var(--text-primary)]">{userToDelete.name}</span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">{userToDelete.email}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold text-[9px] uppercase">{userToDelete.role}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 font-bold text-[9px]">{userToDelete.authMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setUserToDelete(null)}>
                    {lang === 'ar' ? 'إلغاء الأمر' : 'Cancel'}
                  </Button>
                  <Button
                    type="button"
                    onClick={confirmDeleteUserAccount}
                    className="bg-red-600 hover:bg-red-500 text-white font-black shadow-lg shadow-red-600/30"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                    <span>{lang === 'ar' ? 'حذف الحساب نهائياً 🗑️' : 'Delete Account Permanently 🗑️'}</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

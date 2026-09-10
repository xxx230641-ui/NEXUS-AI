import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Network,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Layers,
  Edit3,
  Plus,
  Trash2,
  CheckCircle,
  X,
  Save,
  Link as LinkIcon,
  Sparkles,
  Search,
  Download,
  Share2,
  Activity,
  Cpu,
  BrainCircuit,
  Grid,
  CircleDot,
  Compass,
  Lock,
  Zap,
  Info,
  ShieldCheck,
  FileText,
  Sliders,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  TrendingUp,
  FolderPlus,
  Unlink,
  Check,
  FileSpreadsheet,
  Printer,
  History,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ContextBadge, ContextType } from '../components/ui/ContextBadge';
import { useLang } from '../hooks/useLang';
import { useAuth } from '../hooks/useAuth';
import { downloadHtmlReport, downloadCsvReport } from '../utils/exportReport';

export interface GraphEdgeRelation {
  id: string;
  source: string;
  target: string;
  labelAr: string;
  labelEn: string;
  strength: number; // 1 to 100
}

export interface GraphNode {
  id: string;
  labelAr: string;
  labelEn: string;
  category: ContextType;
  x: number;
  y: number;
  connections: string[]; // target node IDs
  statusAr: string;
  statusEn: string;
  weight: number;
  priority: 'high' | 'medium' | 'low';
  detailsAr?: string;
  detailsEn?: string;
  linkedAppsCount?: number;
  lastUpdated?: string;
  aiInsightsAr?: string;
  aiInsightsEn?: string;
}

const INITIAL_NODES: GraphNode[] = [
  {
    id: 'central-twin',
    labelAr: 'التوأم الرقمي نكسوس المباشر',
    labelEn: 'NEXUS Digital Twin Core',
    category: 'professional',
    x: 300,
    y: 210,
    connections: ['node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-6'],
    statusAr: 'نشط ومزامن 100%',
    statusEn: 'Active & Synced 100%',
    weight: 100,
    priority: 'high',
    detailsAr: 'النواة المركزية المدارة بالذكاء الاصطناعي لربط وتنظيم جميع سياقات حياتك.',
    detailsEn: 'Central AI-managed core orchestrating all your life contexts.',
    linkedAppsCount: 8,
    lastUpdated: 'منذ دقيقة',
    aiInsightsAr: 'النواة في أعلى مستويات الكفاءة والترابط بين جدول الأعمال والتسليمات.',
    aiInsightsEn: 'Core operating at peak cross-context efficiency.',
  },
  {
    id: 'node-1',
    labelAr: 'خطة تسليم مشاريع الذكاء الاصطناعي',
    labelEn: 'AI Project Delivery Roadmap',
    category: 'professional',
    x: 140,
    y: 85,
    connections: ['central-twin', 'node-2', 'node-4'],
    statusAr: 'أولوية قصوى - تسليم قريب',
    statusEn: 'Critical Priority - Imminent Release',
    weight: 92,
    priority: 'high',
    detailsAr: 'جدول المخرجات والمهام البرمجية المرتبطة بنوشن وسلاك ورسائل الخادم.',
    detailsEn: 'Outputs roadmap linked to Notion, Slack, and server APIs.',
    linkedAppsCount: 4,
    lastUpdated: 'منذ 10 دقائق',
    aiInsightsAr: 'ارتباط وثيق بدورة التعلم العميق. يفضل تخصيص ساعتين للمراجعة.',
    aiInsightsEn: 'Highly correlated with Deep Learning course.',
  },
  {
    id: 'node-2',
    labelAr: 'تقويم Google (مواعيد المقابلات والتطوير)',
    labelEn: 'Google Calendar (Interviews & Syncs)',
    category: 'professional',
    x: 460,
    y: 90,
    connections: ['central-twin', 'node-1'],
    statusAr: 'مزامنة حية وتنبيهات مستمرة',
    statusEn: 'Live Synced & Active Alerts',
    weight: 88,
    priority: 'high',
    detailsAr: 'تزامن تلقائي لحجز أوقات المقابلات والاجتماعات وتفادي تضارب المواعيد.',
    detailsEn: 'Automatic sync for interview booking and conflict resolution.',
    linkedAppsCount: 3,
    lastUpdated: 'منذ 5 دقائق',
    aiInsightsAr: 'تم منع تضارب بين مقابلة التوظيف والالتزام العائلي بنجاح.',
    aiInsightsEn: 'Successfully prevented time conflict with family event.',
  },
  {
    id: 'node-3',
    labelAr: 'الالتزامات والمناسبات العائلية',
    labelEn: 'Family Events & Logistics',
    category: 'family',
    x: 120,
    y: 315,
    connections: ['central-twin'],
    statusAr: 'سياق نشط مساءً',
    statusEn: 'Active Evening Context',
    weight: 78,
    priority: 'medium',
    detailsAr: 'مواعيد طبيبة، رحلات تسوق، والتزامات الأبناء والعائلة.',
    detailsEn: 'Doctor visits, shopping trips, and family commitments.',
    linkedAppsCount: 4,
    lastUpdated: 'منذ ساعة',
    aiInsightsAr: 'سياق مستقر. تم تخصيص الفترة المسائية دون أي تداخل مهني.',
    aiInsightsEn: 'Stable context. Evening slot preserved without work overlap.',
  },
  {
    id: 'node-4',
    labelAr: 'دورة التعلم العميق والذكاء الاصطناعي',
    labelEn: 'Advanced Deep Learning Course',
    category: 'learning',
    x: 480,
    y: 310,
    connections: ['central-twin', 'node-1'],
    statusAr: 'تقدم 75% - إنجاز ممتاز',
    statusEn: '75% Progress - Great Score',
    weight: 70,
    priority: 'medium',
    detailsAr: 'دورات تطوير مهارات الذكاء الاصطناعي وتحليل البيانات والشبكات العصبية.',
    detailsEn: 'AI skills development, data analysis, and neural nets.',
    linkedAppsCount: 2,
    lastUpdated: 'منذ ساعتين',
    aiInsightsAr: 'إكمال الوحدة الأخيرة يرفع التقييم الفني للمقابلات القادمة بنسبة 15%.',
    aiInsightsEn: 'Completing final module boosts technical rating by 15%.',
  },
  {
    id: 'node-5',
    labelAr: 'شبكة الأصدقاء والأنشطة الاجتماعية',
    labelEn: 'Social Network & Leisure',
    category: 'social',
    x: 300,
    y: 385,
    connections: ['central-twin'],
    statusAr: 'نشط عطلة نهاية الأسبوع',
    statusEn: 'Active Weekend',
    weight: 58,
    priority: 'low',
    detailsAr: 'لقاءات الأصدقاء، المجموعات والمناسبات والأنشطة الخاصة.',
    detailsEn: 'Friends gatherings, social groups, and private events.',
    linkedAppsCount: 3,
    lastUpdated: 'اليوم',
    aiInsightsAr: 'فرصة جيدة للراحة والتوازن النفسي يوم الجمعة.',
    aiInsightsEn: 'Good opportunity for leisure balance on Friday.',
  },
  {
    id: 'node-6',
    labelAr: 'مؤشرات الصحة وتتبع اللياقة',
    labelEn: 'Health & Vital Metrics Tracker',
    category: 'family',
    x: 300,
    y: 65,
    connections: ['central-twin'],
    statusAr: 'مكتمل اليوم 10,000 خطوة',
    statusEn: '10k Steps Completed Today',
    weight: 84,
    priority: 'high',
    detailsAr: 'تزامن خطوات المشي، معدل ضربات القلب، وساعات النوم وجودته.',
    detailsEn: 'Step counter sync, heart rate, and sleep quality analytics.',
    linkedAppsCount: 2,
    lastUpdated: 'منذ 30 دقيقة',
    aiInsightsAr: 'معدل النشاط البدني ممتاز جداً هذا الأسبوع.',
    aiInsightsEn: 'Physical vitality score is outstanding this week.',
  },
];

const INITIAL_EDGES: GraphEdgeRelation[] = [
  { id: 'edge-1', source: 'central-twin', target: 'node-1', labelAr: 'مزامنة رئيسية', labelEn: 'Core Sync', strength: 95 },
  { id: 'edge-2', source: 'central-twin', target: 'node-2', labelAr: 'جدولة زمنية', labelEn: 'Calendar Schedule', strength: 90 },
  { id: 'edge-3', source: 'central-twin', target: 'node-3', labelAr: 'تراخص عائلية', labelEn: 'Family Sync', strength: 80 },
  { id: 'edge-4', source: 'central-twin', target: 'node-4', labelAr: 'تطوير معرفي', labelEn: 'Skill Learning', strength: 75 },
  { id: 'edge-5', source: 'central-twin', target: 'node-5', labelAr: 'نشاط اجتماعي', labelEn: 'Social Context', strength: 60 },
  { id: 'edge-6', source: 'central-twin', target: 'node-6', labelAr: 'مؤشرات الحيوية', labelEn: 'Health Metrics', strength: 85 },
  { id: 'edge-7', source: 'node-1', target: 'node-2', labelAr: 'ربط المقابلات والمهام', labelEn: 'Interview Tasks', strength: 88 },
  { id: 'edge-8', source: 'node-1', target: 'node-4', labelAr: 'تطبيق التعلّم بالمشروع', labelEn: 'Applied Learning', strength: 92 },
];

export const ContextGraphPage: React.FC = () => {
  const { t } = useTranslation();
  const { lang } = useLang();
  const { requireAuth } = useAuth();

  // Nodes & Edges State (Persisted in LocalStorage)
  const [nodes, setNodes] = useState<GraphNode[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_user_graph_nodes_v3');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Failed loading graph nodes:', err);
    }
    return INITIAL_NODES;
  });

  const [edges, setEdges] = useState<GraphEdgeRelation[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_user_graph_edges_v3');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Failed loading graph edges:', err);
    }
    return INITIAL_EDGES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('nexus_user_graph_nodes_v3', JSON.stringify(nodes));
      localStorage.setItem('nexus_user_graph_edges_v3', JSON.stringify(edges));
    } catch (err) {
      console.error('Failed saving graph data:', err);
    }
  }, [nodes, edges]);

  // Filters & Canvas Control State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNodeId, setActiveNodeId] = useState<string | null>('central-twin');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<'orbit' | 'cluster' | 'grid' | 'tree'>('orbit');

  // Multi-Tab Inspector Sub-State
  const [inspectorTab, setInspectorTab] = useState<'info' | 'links' | 'ai' | 'history'>('info');

  // Zoom & Pan Canvas Controls State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanningCanvas, setIsPanningCanvas] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Edit / Add Modal States
  const [editingNode, setEditingNode] = useState<GraphNode | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  // AI Connection Suggestion State
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ source: string; target: string; reasonAr: string; reasonEn: string; score: number }>>([]);
  const [isDiscoveringAi, setIsDiscoveringAi] = useState<boolean>(false);

  // New Link Form State
  const [connectSourceId, setConnectSourceId] = useState<string>('central-twin');
  const [connectTargetId, setConnectTargetId] = useState<string>('node-1');
  const [connectLabelAr, setConnectLabelAr] = useState<string>('تكامل وتزامن');
  const [connectLabelEn, setConnectLabelEn] = useState<string>('Integration & Sync');

  // New Node Form State
  const [newNodeTitleAr, setNewNodeTitleAr] = useState<string>('');
  const [newNodeTitleEn, setNewNodeTitleEn] = useState<string>('');
  const [newNodeCategory, setNewNodeCategory] = useState<ContextType>('professional');
  const [newNodeStatusAr, setNewNodeStatusAr] = useState<string>('نشط ومزامن 100%');
  const [newNodeStatusEn, setNewNodeStatusEn] = useState<string>('Active & Synced 100%');
  const [newNodeWeight, setNewNodeWeight] = useState<number>(80);
  const [newNodePriority, setNewNodePriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newNodeDetailsAr, setNewNodeDetailsAr] = useState<string>('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeNode = nodes.find((n) => n.id === activeNodeId) || null;

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchesCategory =
        selectedCategory === 'all' || node.category === selectedCategory || node.id === 'central-twin';
      const matchesPriority =
        priorityFilter === 'all' || node.priority === priorityFilter || node.id === 'central-twin';
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        node.labelAr.toLowerCase().includes(q) ||
        node.labelEn.toLowerCase().includes(q) ||
        node.statusAr.toLowerCase().includes(q) ||
        node.statusEn.toLowerCase().includes(q);

      return matchesCategory && matchesPriority && matchesSearch;
    });
  }, [nodes, selectedCategory, priorityFilter, searchQuery]);

  // Overall Metrics
  const metrics = useMemo(() => {
    const totalNodes = nodes.length;
    const totalEdges = edges.length;
    const avgWeight = Math.round(
      nodes.reduce((acc, n) => acc + n.weight, 0) / (totalNodes || 1)
    );
    const activeContextsCount = new Set(nodes.map((n) => n.category)).size;
    return { totalNodes, totalEdges, avgWeight, activeContextsCount };
  }, [nodes, edges]);

  // Apply Layout Algorithms
  const applyLayoutPreset = (mode: 'orbit' | 'cluster' | 'grid' | 'tree') => {
    setLayoutMode(mode);
    setNodes((prev) => {
      const cx = 300;
      const cy = 210;

      if (mode === 'orbit') {
        const others = prev.filter((n) => n.id !== 'central-twin');
        const radius = 155;
        return prev.map((n) => {
          if (n.id === 'central-twin') return { ...n, x: cx, y: cy };
          const idx = others.findIndex((o) => o.id === n.id);
          const angle = (idx / others.length) * 2 * Math.PI;
          return {
            ...n,
            x: Math.round(cx + radius * Math.cos(angle)),
            y: Math.round(cy + radius * Math.sin(angle)),
          };
        });
      } else if (mode === 'cluster') {
        const categoryOffsets: Record<ContextType, { x: number; y: number }> = {
          professional: { x: 150, y: 100 },
          personal: { x: 300, y: 210 },
          family: { x: 150, y: 320 },
          learning: { x: 450, y: 320 },
          social: { x: 450, y: 100 },
        };
        const counts: Record<string, number> = {};

        return prev.map((n) => {
          if (n.id === 'central-twin') return { ...n, x: cx, y: cy };
          const base = categoryOffsets[n.category] || { x: 300, y: 200 };
          counts[n.category] = (counts[n.category] || 0) + 1;
          const offset = counts[n.category] * 35;
          return {
            ...n,
            x: Math.round(base.x + (offset % 60)),
            y: Math.round(base.y + Math.floor(offset / 60) * 35),
          };
        });
      } else if (mode === 'tree') {
        const others = prev.filter((n) => n.id !== 'central-twin');
        return prev.map((n) => {
          if (n.id === 'central-twin') return { ...n, x: cx, y: 70 };
          const idx = others.findIndex((o) => o.id === n.id);
          const colWidth = 520 / Math.max(1, others.length - 1);
          return {
            ...n,
            x: Math.round(40 + idx * colWidth),
            y: Math.round(240 + (idx % 2 === 0 ? 0 : 90)),
          };
        });
      } else {
        // Grid Layout
        return prev.map((n, idx) => {
          const cols = 3;
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          return {
            ...n,
            x: Math.round(110 + col * 190),
            y: Math.round(75 + row * 125),
          };
        });
      }
    });

    showToast(
      lang === 'ar'
        ? `تم تطبيق تخطيط الشبكة: ${
            mode === 'orbit' ? 'المدار الدائري' : mode === 'cluster' ? 'التجميع حسب السياق' : mode === 'tree' ? 'الشجرة التفرعية' : 'الشبكة الموزعة'
          }`
        : `Layout set to: ${mode.toUpperCase()}`
    );
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
    showToast(lang === 'ar' ? 'تمت إعادة ضبط أبعاد الرؤية وحجم الشبكة' : 'Zoom and pan reset');
  };

  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 1.08 : 0.92;
    setZoomLevel((prev) => Math.max(0.4, Math.min(3.0, Number((prev * zoomDelta).toFixed(2)))));
  };

  const getSVGCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const scaleX = 600 / rect.width;
    const scaleY = 440 / rect.height;

    const rawX = (clientX - rect.left) * scaleX;
    const rawY = (clientY - rect.top) * scaleY;

    const x = (rawX - panOffset.x) / zoomLevel;
    const y = (rawY - panOffset.y) / zoomLevel;

    return { x, y };
  };

  const handleNodePointerDown = (nodeId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setActiveNodeId(nodeId);
    setDraggingNodeId(nodeId);

    const coords = getSVGCoordinates(e);
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (targetNode) {
      dragOffsetRef.current = {
        x: targetNode.x - coords.x,
        y: targetNode.y - coords.y,
      };
    }
  };

  const handleCanvasPointerDown = (e: React.MouseEvent) => {
    if (draggingNodeId) return;
    setIsPanningCanvas(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingNodeId) {
      const coords = getSVGCoordinates(e);
      const newX = Math.max(25, Math.min(575, Math.round(coords.x + dragOffsetRef.current.x)));
      const newY = Math.max(25, Math.min(415, Math.round(coords.y + dragOffsetRef.current.y)));

      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeId
            ? {
                ...n,
                x: newX,
                y: newY,
              }
            : n
        )
      );
    } else if (isPanningCanvas && 'clientX' in e) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handlePointerUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
    setIsPanningCanvas(false);
  };

  // Add Edge / Connection
  const handleAddEdgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth(lang === 'ar' ? 'إنشاء روابط وسياقات جديدة' : 'Create Context Links')) {
      return;
    }
    if (connectSourceId === connectTargetId) {
      showToast(lang === 'ar' ? 'لا يمكن ربط العقدة بنفسها' : 'Cannot link node to itself');
      return;
    }

    const newEdge: GraphEdgeRelation = {
      id: `edge-${Date.now()}`,
      source: connectSourceId,
      target: connectTargetId,
      labelAr: connectLabelAr || 'ربط سياقي',
      labelEn: connectLabelEn || 'Context Link',
      strength: 85,
    };

    setEdges((prev) => [...prev, newEdge]);
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === connectSourceId && !n.connections.includes(connectTargetId)) {
          return { ...n, connections: [...n.connections, connectTargetId] };
        }
        return n;
      })
    );

    setIsConnectModalOpen(false);
    showToast(lang === 'ar' ? 'تم إنشاء رابطة سياق عصبي جديدة بنجاح 🔗' : 'New neural context link created 🔗');
  };

  // Remove Edge
  const handleRemoveEdge = (edgeId: string) => {
    const targetEdge = edges.find((e) => e.id === edgeId);
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));

    if (targetEdge) {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === targetEdge.source) {
            return { ...n, connections: n.connections.filter((c) => c !== targetEdge.target) };
          }
          return n;
        })
      );
    }
    showToast(lang === 'ar' ? 'تمت إزالة رابطة السياق' : 'Context link removed');
  };

  // AI Discover Intelligent Connections
  const handleDiscoverAiConnections = () => {
    setIsDiscoveringAi(true);
    setTimeout(() => {
      const suggestions = [
        {
          source: 'node-1',
          target: 'node-4',
          reasonAr: 'ارتباط مباشر بنسبة 94% بين مشروع الذكاء الاصطناعي ودورة التعلم العميق المتقدمة',
          reasonEn: '94% correlation between AI Project & Deep Learning Course',
          score: 94,
        },
        {
          source: 'node-2',
          target: 'node-3',
          reasonAr: 'تزامن عالي التوازن بين جدول التقويم المهني والالتزامات العائلية المسائية',
          reasonEn: 'High balance sync between Work Calendar & Family Slot',
          score: 89,
        },
      ];
      setAiSuggestions(suggestions);
      setIsDiscoveringAi(false);
      showToast(lang === 'ar' ? 'تم استكشاف روابط سياق ذكية بواسطة الذكاء الاصطناعي 🤖' : 'AI Context Connections Discovered 🤖');
    }, 1200);
  };

  const applyAiSuggestion = (sug: { source: string; target: string; reasonAr: string; reasonEn: string }) => {
    const newEdge: GraphEdgeRelation = {
      id: `edge-ai-${Date.now()}`,
      source: sug.source,
      target: sug.target,
      labelAr: lang === 'ar' ? 'تكامل ذكي AI' : 'Smart AI Link',
      labelEn: 'Smart AI Link',
      strength: 94,
    };
    setEdges((prev) => [...prev, newEdge]);
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === sug.source && !n.connections.includes(sug.target)) {
          return { ...n, connections: [...n.connections, sug.target] };
        }
        return n;
      })
    );
    setAiSuggestions((prev) => prev.filter((s) => !(s.source === sug.source && s.target === sug.target)));
    showToast(lang === 'ar' ? 'تم اعتماد وتطبيق وصلة الذكاء الاصطناعي بنجاح ✓' : 'AI connection applied successfully ✓');
  };

  // Save Node Edit
  const handleSaveNodeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;
    setNodes((prev) => prev.map((n) => (n.id === editingNode.id ? editingNode : n)));
    showToast(lang === 'ar' ? 'تم حفظ تعديلات العقدة بنجاح' : 'Node details saved');
    setEditingNode(null);
  };

  // Add New Node
  const handleAddNewNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth(lang === 'ar' ? 'إضافة عقدة سياقية جديدة' : 'Add Context Node')) {
      return;
    }
    if (!newNodeTitleAr.trim()) return;

    const newId = `node-${Date.now()}`;
    const newNode: GraphNode = {
      id: newId,
      labelAr: newNodeTitleAr,
      labelEn: newNodeTitleEn || newNodeTitleAr,
      category: newNodeCategory,
      x: Math.floor(Math.random() * 260) + 170,
      y: Math.floor(Math.random() * 200) + 100,
      connections: ['central-twin'],
      statusAr: newNodeStatusAr,
      statusEn: newNodeStatusEn,
      weight: newNodeWeight,
      priority: newNodePriority,
      detailsAr: newNodeDetailsAr || 'عقدة سياقية مخصصة تم إنشاؤها حديثاً بمزامنة حية.',
      detailsEn: 'Custom context node created recently.',
      linkedAppsCount: 2,
      lastUpdated: 'الآن',
      aiInsightsAr: 'سياق جديد تم ربطه بالنواة المركزية بنجاح.',
      aiInsightsEn: 'New context successfully connected to central core.',
    };

    const newEdge: GraphEdgeRelation = {
      id: `edge-${Date.now()}`,
      source: 'central-twin',
      target: newId,
      labelAr: 'رابط رئيسي',
      labelEn: 'Core Link',
      strength: 80,
    };

    setNodes((prev) => [
      ...prev.map((n) =>
        n.id === 'central-twin' ? { ...n, connections: [...n.connections, newId] } : n
      ),
      newNode,
    ]);
    setEdges((prev) => [...prev, newEdge]);

    setActiveNodeId(newId);
    setIsAddModalOpen(false);
    setNewNodeTitleAr('');
    setNewNodeTitleEn('');
    setNewNodeDetailsAr('');
    showToast(lang === 'ar' ? 'تمت إضافة عقدة سياق جديدة وربطها عصبياً بنجاح 🌐' : 'New context node added and linked 🌐');
  };

  // Delete Node
  const handleDeleteNode = (id: string) => {
    if (id === 'central-twin') {
      showToast(lang === 'ar' ? 'لا يمكن حذف النواة الرقمية الرئيسية' : 'Central Twin node cannot be deleted');
      return;
    }

    setNodes((prev) =>
      prev
        .filter((n) => n.id !== id)
        .map((n) => ({
          ...n,
          connections: n.connections.filter((cId) => cId !== id),
        }))
    );
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    setActiveNodeId('central-twin');
    showToast(lang === 'ar' ? 'تمت إزالة العقدة وجميع روابطها السلكية' : 'Node and associated edges removed');
  };

  // Export Executive HTML/PDF Report
  const handleExportGraphReport = () => {
    downloadHtmlReport({
      title: lang === 'ar' ? 'تقرير خريطة سياق المعرفة والعلاقات الحية' : 'NEXUS Executive Context Knowledge Graph Report',
      subtitle: lang === 'ar' ? 'تحليل الكيانات، الروابط العصبية، والأوزان النسبية' : 'Neural Node Entities Analysis & Edge Connectors',
      filename: `nexus_context_graph_report_${Date.now()}.html`,
      lang: lang === 'ar' ? 'ar' : 'en',
      sections: [
        {
          title: lang === 'ar' ? 'مؤشرات كفاءة الخريطة والسياقات' : 'Knowledge Graph Core Metrics',
          metrics: [
            { label: lang === 'ar' ? 'إجمالي العقد والكيانات' : 'Total Nodes', value: nodes.length, color: 'indigo' },
            { label: lang === 'ar' ? 'إجمالي الروابط العصبية' : 'Total Neural Edges', value: edges.length, color: 'emerald' },
            { label: lang === 'ar' ? 'متوسط وزن الأهمية' : 'Avg Importance Weight', value: `${metrics.avgWeight}%`, color: 'amber' },
            { label: lang === 'ar' ? 'مجالات السياق النشطة' : 'Active Context Spheres', value: metrics.activeContextsCount, color: 'cyan' },
          ],
        },
        {
          title: lang === 'ar' ? 'جدول الكيانات والعقد التفصيلي' : 'Detailed Context Nodes Directory',
          table: {
            headers: [
              lang === 'ar' ? 'اسم الكيان / العقدة' : 'Node Label',
              lang === 'ar' ? 'تصنيف السياق' : 'Context Sphere',
              lang === 'ar' ? 'مستوى الأولوية' : 'Priority',
              lang === 'ar' ? 'وزن الأهمية (%)' : 'Importance Weight',
              lang === 'ar' ? 'الحالة والتزامن' : 'Status & Sync',
            ],
            rows: nodes.map((n) => [
              lang === 'ar' ? n.labelAr : n.labelEn,
              n.category.toUpperCase(),
              n.priority.toUpperCase(),
              `${n.weight}%`,
              lang === 'ar' ? n.statusAr : n.statusEn,
            ]),
          },
        },
        {
          title: lang === 'ar' ? 'سجل روابط العلاقات السلكية (Neural Edges)' : 'Neural Edge Connections Directory',
          table: {
            headers: [
              lang === 'ar' ? 'العقدة المصدر' : 'Source Node',
              lang === 'ar' ? 'العقدة الهدف' : 'Target Node',
              lang === 'ar' ? 'نوع العلاقة' : 'Relation Label',
              lang === 'ar' ? 'قوة الرابطة (%)' : 'Strength Weight',
            ],
            rows: edges.map((e) => {
              const srcNode = nodes.find((n) => n.id === e.source);
              const tgtNode = nodes.find((n) => n.id === e.target);
              return [
                srcNode ? (lang === 'ar' ? srcNode.labelAr : srcNode.labelEn) : e.source,
                tgtNode ? (lang === 'ar' ? tgtNode.labelAr : tgtNode.labelEn) : e.target,
                lang === 'ar' ? e.labelAr : e.labelEn,
                `${e.strength}%`,
              ];
            }),
          },
        },
      ],
    });
    showToast(lang === 'ar' ? 'تم تنزيل تقرير خريطة السياق المنسق كجدول تفاعلي 📄' : 'Context graph report exported 📄');
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      lang === 'ar' ? 'العقدة' : 'Node',
      lang === 'ar' ? 'السياق' : 'Category',
      lang === 'ar' ? 'الأولوية' : 'Priority',
      lang === 'ar' ? 'الوزن' : 'Weight',
      lang === 'ar' ? 'الحالة' : 'Status',
    ];
    const rows = nodes.map((n) => [
      lang === 'ar' ? n.labelAr : n.labelEn,
      n.category,
      n.priority,
      n.weight,
      lang === 'ar' ? n.statusAr : n.statusEn,
    ]);
    downloadCsvReport(`nexus_context_nodes_${Date.now()}.csv`, headers, rows);
  };

  // Category Colors Helper
  const getCategoryTheme = (category: ContextType) => {
    switch (category) {
      case 'professional':
        return { stroke: '#6366F1', fill: '#818CF8', bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' };
      case 'family':
        return { stroke: '#EC4899', fill: '#F472B6', bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30' };
      case 'learning':
        return { stroke: '#F59E0B', fill: '#FBBF24', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
      case 'social':
        return { stroke: '#10B981', fill: '#34D399', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      default:
        return { stroke: '#6366F1', fill: '#818CF8', bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' };
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--accent)] text-white px-5 py-2.5 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm flex items-center gap-2.5 border border-white/20 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black text-[var(--accent)] uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4" />
            <span>{lang === 'ar' ? 'شبكة السياق العصبي الفائقة' : 'Ultra Neural Context Knowledge Graph'}</span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-mono font-extrabold text-[10px]">
              v3.6 Dynamic
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <Network className="w-8 h-8 text-[var(--accent)]" />
            {t('nav.graph')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {lang === 'ar'
              ? 'خريطة تفاعلية متقدمة تربط تطبيقاتك، مواعيدك ورسائلك بسياق واحد محمي ومستقل'
              : 'Advanced neural graph linking apps, events, and life contexts with encrypted sync.'}
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDiscoverAiConnections}
            disabled={isDiscoveringAi}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95"
          >
            <Sparkles className={`w-4 h-4 text-amber-300 ${isDiscoveringAi ? 'animate-spin' : ''}`} />
            <span>{lang === 'ar' ? '🤖 استكشاف روابط السياق بالذكاء الاصطناعي' : '🤖 AI Smart Link Discovery'}</span>
          </button>

          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center gap-1.5 border border-indigo-500/30 cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'ربط عقدتين' : 'Link Nodes'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'عقدة سياق جديدة' : 'Add Node'}</span>
          </button>

          <button
            onClick={handleExportGraphReport}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-hover)] hover:bg-[var(--bg-hover)]/80 text-[var(--text-primary)] font-bold text-xs flex items-center gap-1.5 border border-[var(--border-subtle)] cursor-pointer"
            title={lang === 'ar' ? 'تنزيل تقرير خريطة السياق المنسق' : 'Export PDF/HTML Report'}
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">{lang === 'ar' ? 'تقرير (PDF/HTML)' : 'Report'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-[var(--bg-hover)] hover:bg-[var(--bg-hover)]/80 text-[var(--text-primary)] font-bold text-xs flex items-center gap-1.5 border border-[var(--border-subtle)] cursor-pointer"
            title={lang === 'ar' ? 'تصدير جدول بيانات CSV' : 'Export CSV'}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Top Knowledge Graph Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3.5 flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[var(--text-muted)]">
              {lang === 'ar' ? 'إجمالي الكيانات والعقد' : 'Total Nodes'}
            </div>
            <div className="text-lg font-black text-[var(--text-primary)]">{metrics.totalNodes}</div>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[var(--text-muted)]">
              {lang === 'ar' ? 'الروابط العصبية' : 'Neural Edges'}
            </div>
            <div className="text-lg font-black text-[var(--text-primary)]">{metrics.totalEdges}</div>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[var(--text-muted)]">
              {lang === 'ar' ? 'متوسط وزن الأهمية' : 'Avg Importance'}
            </div>
            <div className="text-lg font-black text-[var(--text-primary)]">{metrics.avgWeight}%</div>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[var(--text-muted)]">
              {lang === 'ar' ? 'مجالات السياق النشطة' : 'Active Spheres'}
            </div>
            <div className="text-lg font-black text-[var(--text-primary)]">{metrics.activeContextsCount}</div>
          </div>
        </Card>
      </div>

      {/* AI Connection Suggestions Bar */}
      {aiSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/40 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              {lang === 'ar' ? 'اقتراحات الربط الذكي المكتشفة بالذكاء الاصطناعي:' : 'AI Suggested Neural Links:'}
            </span>
            <button
              onClick={() => setAiSuggestions([])}
              className="text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {lang === 'ar' ? 'إغلاق الاقتراحات' : 'Dismiss'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiSuggestions.map((sug, idx) => {
              const srcN = nodes.find((n) => n.id === sug.source);
              const tgtN = nodes.find((n) => n.id === sug.target);
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[var(--bg-surface)] border border-purple-500/30 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{srcN ? (lang === 'ar' ? srcN.labelAr : srcN.labelEn) : sug.source}</span>
                      <span className="text-purple-400">↔</span>
                      <span>{tgtN ? (lang === 'ar' ? tgtN.labelAr : tgtN.labelEn) : sug.target}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {lang === 'ar' ? sug.reasonAr : sug.reasonEn}
                    </p>
                  </div>

                  <button
                    onClick={() => applyAiSuggestion(sug)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'اعتماد الوصلة' : 'Apply'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Main Layout Grid: Graph Stage (Left 8 Cols) + Inspector Panel (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT STAGE: GRAPH CANVAS CONTROLS & CANVAS */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-4 space-y-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative overflow-hidden">
            {/* Filter Controls Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Context Category Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'professional', 'family', 'learning', 'social'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-[var(--accent)] text-white shadow-md'
                        : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {cat === 'all' ? (lang === 'ar' ? 'جميع السياقات' : 'All Spheres') : cat.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Priority Filters */}
              <div className="flex items-center gap-1">
                {['all', 'high', 'medium', 'low'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      priorityFilter === p
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {p === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Algorithms & Canvas Toolbars */}
            <div className="flex items-center justify-between gap-2 flex-wrap border-t border-[var(--border-subtle)] pt-3">
              {/* Layout Mode Presets */}
              <div className="flex items-center gap-1 p-1 bg-[var(--bg-hover)] rounded-xl border border-[var(--border-subtle)]">
                <button
                  onClick={() => applyLayoutPreset('orbit')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    layoutMode === 'orbit' ? 'bg-indigo-600 text-white' : 'text-[var(--text-muted)]'
                  }`}
                  title={lang === 'ar' ? 'تخطيط مداري' : 'Orbit'}
                >
                  🌐 {lang === 'ar' ? 'مداري' : 'Orbit'}
                </button>
                <button
                  onClick={() => applyLayoutPreset('cluster')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    layoutMode === 'cluster' ? 'bg-indigo-600 text-white' : 'text-[var(--text-muted)]'
                  }`}
                  title={lang === 'ar' ? 'تجميع حسب السياق' : 'Cluster'}
                >
                  🧩 {lang === 'ar' ? 'تجميع' : 'Cluster'}
                </button>
                <button
                  onClick={() => applyLayoutPreset('tree')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    layoutMode === 'tree' ? 'bg-indigo-600 text-white' : 'text-[var(--text-muted)]'
                  }`}
                  title={lang === 'ar' ? 'شجرة التفرع' : 'Tree'}
                >
                  🌿 {lang === 'ar' ? 'شجرة' : 'Tree'}
                </button>
                <button
                  onClick={() => applyLayoutPreset('grid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    layoutMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-[var(--text-muted)]'
                  }`}
                  title={lang === 'ar' ? 'شبكة متوازية' : 'Grid'}
                >
                  📊 {lang === 'ar' ? 'شبكة' : 'Grid'}
                </button>
              </div>

              {/* Search Bar & Zoom Controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute start-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'ar' ? 'بحث عن عقدة...' : 'Search node...'}
                    className="ps-8 pe-3 py-1.5 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:outline-none focus:border-indigo-500 w-32 sm:w-40"
                  />
                </div>

                {/* Zoom Buttons */}
                <div className="flex items-center gap-1 bg-[var(--bg-hover)] p-1 rounded-xl border border-[var(--border-subtle)]">
                  <button onClick={handleZoomOut} className="p-1 hover:text-indigo-600 cursor-pointer" title={lang === 'ar' ? 'تصغير' : 'Zoom Out'}>
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono px-1 font-bold text-[var(--text-muted)]">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button onClick={handleZoomIn} className="p-1 hover:text-indigo-600 cursor-pointer" title={lang === 'ar' ? 'تكبير' : 'Zoom In'}>
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={handleZoomReset} className="p-1 hover:text-indigo-600 cursor-pointer" title={lang === 'ar' ? 'إعادة ضبط' : 'Reset View'}>
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* SVG INTERACTIVE GRAPH CANVAS STAGE - WHITE BACKGROUND */}
            <div
              className="relative w-full h-[480px] rounded-2xl bg-white border-2 border-slate-200 shadow-md overflow-hidden select-none cursor-grab active:cursor-grabbing"
              onMouseDown={handleCanvasPointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              onWheel={handleWheelZoom}
            >
              {/* Crisp Background Grid Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] opacity-70 [background-size:22px_22px] pointer-events-none" />

              <svg
                ref={svgRef}
                viewBox="0 0 600 440"
                className="w-full h-full overflow-visible"
              >
                <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                  {/* Defs for gradients & glowing filters */}
                  <defs>
                    <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.1" />
                    </filter>

                    <linearGradient id="nexus-central-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>

                    <linearGradient id="active-edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>

                  {/* Render Edges (Smooth Curved Neural Lines & Labels) */}
                  {edges.map((edge) => {
                    const srcNode = nodes.find((n) => n.id === edge.source);
                    const tgtNode = nodes.find((n) => n.id === edge.target);

                    if (!srcNode || !tgtNode) return null;

                    const isSrcActive =
                      activeNodeId === srcNode.id ||
                      activeNodeId === tgtNode.id ||
                      hoveredNodeId === srcNode.id ||
                      hoveredNodeId === tgtNode.id;

                    const strokeWidth = isSrcActive ? 2.5 : 1.4;
                    const strokeColor = isSrcActive ? '#4F46E5' : '#CBD5E1';

                    const midX = (srcNode.x + tgtNode.x) / 2;
                    const midY = (srcNode.y + tgtNode.y) / 2;

                    return (
                      <g key={edge.id} className="transition-all duration-300">
                        <path
                          d={`M ${srcNode.x} ${srcNode.y} Q ${midX} ${midY} ${tgtNode.x} ${tgtNode.y}`}
                          stroke={isSrcActive ? 'url(#active-edge-grad)' : strokeColor}
                          strokeWidth={strokeWidth}
                          strokeDasharray={edge.source === 'central-twin' ? 'none' : '4 3'}
                          fill="none"
                          opacity={isSrcActive ? 1 : 0.65}
                        />

                        {/* Edge Relation Label Badge */}
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x="-34"
                            y="-9"
                            width="68"
                            height="18"
                            rx="6"
                            fill="#FFFFFF"
                            stroke={isSrcActive ? '#4F46E5' : '#E2E8F0'}
                            strokeWidth="1.2"
                            filter="url(#soft-shadow)"
                          />
                          <text
                            x="0"
                            y="3"
                            textAnchor="middle"
                            fill={isSrcActive ? '#4F46E5' : '#475569'}
                            fontSize="8.5"
                            fontWeight="800"
                          >
                            {lang === 'ar' ? edge.labelAr : edge.labelEn}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* Render Nodes (Light Theme Clean Visuals) */}
                  {filteredNodes.map((node) => {
                    const isCentral = node.id === 'central-twin';
                    const isActive = activeNodeId === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const theme = getCategoryTheme(node.category);
                    const radius = isCentral ? 32 : Math.max(18, Math.min(26, node.weight / 3.8));

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onMouseDown={(e) => handleNodePointerDown(node.id, e)}
                        onTouchStart={(e) => handleNodePointerDown(node.id, e)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        {/* Outer Pulse Rings for Active / Hovered / Core Node */}
                        {(isCentral || isActive || isHovered) && (
                          <circle
                            r={radius + 8}
                            fill="none"
                            stroke={isCentral ? '#4F46E5' : theme.stroke}
                            strokeWidth="1.8"
                            opacity="0.4"
                            className="animate-pulse"
                          />
                        )}

                        {/* Node Base Circle */}
                        <circle
                          r={radius}
                          fill={isCentral ? 'url(#nexus-central-grad)' : '#FFFFFF'}
                          stroke={isActive || isHovered ? '#2563EB' : theme.stroke}
                          strokeWidth={isActive || isHovered ? 3 : 2.2}
                          filter="url(#soft-shadow)"
                        />

                        {/* Inner Node Core */}
                        {!isCentral && (
                          <circle
                            r={radius * 0.55}
                            fill={theme.fill}
                            opacity="0.9"
                          />
                        )}

                        {/* Central Twin Logo Mark or Node Weight */}
                        {isCentral ? (
                          <text
                            x="0"
                            y="4"
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="11.5"
                            fontWeight="900"
                          >
                            NEXUS
                          </text>
                        ) : (
                          <text
                            x="0"
                            y="3"
                            textAnchor="middle"
                            fill="#0F172A"
                            fontSize="9.5"
                            fontWeight="800"
                          >
                            {node.weight}%
                          </text>
                        )}

                        {/* Node Label Caption (Below Circle - White Card Style) */}
                        <g transform={`translate(0, ${radius + 16})`}>
                          <rect
                            x="-55"
                            y="-10"
                            width="110"
                            height="20"
                            rx="8"
                            fill="#FFFFFF"
                            stroke={isActive ? '#2563EB' : '#E2E8F0'}
                            strokeWidth="1.2"
                            filter="url(#soft-shadow)"
                          />
                          <text
                            x="0"
                            y="3"
                            textAnchor="middle"
                            fill={isActive ? '#1E40AF' : '#0F172A'}
                            fontSize="9.5"
                            fontWeight="800"
                          >
                            {(lang === 'ar' ? node.labelAr : node.labelEn).slice(0, 16)}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </Card>
        </div>

        {/* RIGHT PANEL: RICH MULTI-TAB NODE INSPECTOR & MANAGER */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 bg-[var(--bg-surface)] border-2 border-indigo-500/30 rounded-3xl space-y-4 shadow-xl">
            {activeNode ? (
              <>
                {/* Active Node Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-2xl ${getCategoryTheme(activeNode.category).bg} ${getCategoryTheme(activeNode.category).text}`}>
                      <CircleDot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[var(--text-primary)]">
                        {lang === 'ar' ? activeNode.labelAr : activeNode.labelEn}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <ContextBadge context={activeNode.category} />
                        <span className="text-[10px] font-mono text-indigo-400 font-bold">
                          {activeNode.weight}% {lang === 'ar' ? 'وزن الأهمية' : 'weight'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {activeNode.id !== 'central-twin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingNode(activeNode)}
                        className="p-1.5 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-hover)]/80 text-[var(--text-secondary)] cursor-pointer"
                        title={lang === 'ar' ? 'تعديل بيانات العقدة' : 'Edit Node'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNode(activeNode.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                        title={lang === 'ar' ? 'حذف العقدة' : 'Delete Node'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Inspector Sub-Tabs (Info, Links, AI Insights, History) */}
                <div className="flex items-center justify-between gap-1 p-1 bg-[var(--bg-hover)] rounded-2xl border border-[var(--border-subtle)] text-xs">
                  <button
                    onClick={() => setInspectorTab('info')}
                    className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      inspectorTab === 'info' ? 'bg-indigo-600 text-white shadow-xs' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {lang === 'ar' ? 'التفاصيل' : 'Info'}
                  </button>
                  <button
                    onClick={() => setInspectorTab('links')}
                    className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      inspectorTab === 'links' ? 'bg-indigo-600 text-white shadow-xs' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {lang === 'ar' ? 'الروابط' : 'Links'}
                  </button>
                  <button
                    onClick={() => setInspectorTab('ai')}
                    className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      inspectorTab === 'ai' ? 'bg-indigo-600 text-white shadow-xs' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {lang === 'ar' ? 'تحليل AI' : 'AI'}
                  </button>
                  <button
                    onClick={() => setInspectorTab('history')}
                    className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      inspectorTab === 'history' ? 'bg-indigo-600 text-white shadow-xs' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {lang === 'ar' ? 'السجل' : 'Log'}
                  </button>
                </div>

                {/* TAB 1: NODE INFO & WEIGHT */}
                {inspectorTab === 'info' && (
                  <div className="space-y-3.5 text-xs">
                    <div className="p-3 rounded-2xl bg-[var(--bg-hover)] space-y-1 border border-[var(--border-subtle)]">
                      <span className="text-[11px] font-bold text-[var(--text-muted)]">
                        {lang === 'ar' ? 'الحالة والتزامن الحالي:' : 'Current Status & Sync:'}
                      </span>
                      <p className="font-bold text-emerald-400">
                        {lang === 'ar' ? activeNode.statusAr : activeNode.statusEn}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[var(--text-muted)]">
                        {lang === 'ar' ? 'تفاصيل الكيان وسياق العمل:' : 'Context Details:'}
                      </span>
                      <p className="text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-hover)] p-3 rounded-2xl border border-[var(--border-subtle)]">
                        {lang === 'ar' ? activeNode.detailsAr : activeNode.detailsEn}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)] block mb-0.5">{lang === 'ar' ? 'مستوى الأولوية' : 'Priority'}</span>
                        <span className="font-extrabold uppercase text-indigo-400">{activeNode.priority}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)] block mb-0.5">{lang === 'ar' ? 'التطبيقات المرتبطة' : 'Linked Apps'}</span>
                        <span className="font-extrabold text-emerald-400">{activeNode.linkedAppsCount || 1} {lang === 'ar' ? 'تطبيق' : 'apps'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CONNECTED EDGES & LINKS MANAGER */}
                {inspectorTab === 'links' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--text-secondary)]">
                        {lang === 'ar' ? 'الروابط السلكية النشطة بها هذه العقدة:' : 'Connected Neural Edges:'}
                      </span>
                      <button
                        onClick={() => {
                          setConnectSourceId(activeNode.id);
                          setIsConnectModalOpen(true);
                        }}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'ربط عقدة جديدة' : 'Add Link'}</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {edges.filter((e) => e.source === activeNode.id || e.target === activeNode.id).length === 0 ? (
                        <p className="text-[var(--text-muted)] italic text-center py-4">
                          {lang === 'ar' ? 'لا توجد روابط سلكية مباشرة لهذه العقدة حالياً' : 'No direct edges connected to this node.'}
                        </p>
                      ) : (
                        edges
                          .filter((e) => e.source === activeNode.id || e.target === activeNode.id)
                          .map((edge) => {
                            const otherId = edge.source === activeNode.id ? edge.target : edge.source;
                            const otherNode = nodes.find((n) => n.id === otherId);
                            return (
                              <div
                                key={edge.id}
                                className="p-2.5 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex items-center justify-between gap-2"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-bold text-[var(--text-primary)]">
                                    {otherNode ? (lang === 'ar' ? otherNode.labelAr : otherNode.labelEn) : otherId}
                                  </div>
                                  <div className="text-[10px] text-indigo-400 font-mono">
                                    {lang === 'ar' ? edge.labelAr : edge.labelEn} ({edge.strength}%)
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleRemoveEdge(edge.id)}
                                  className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                                  title={lang === 'ar' ? 'فك الرابط' : 'Unlink'}
                                >
                                  <Unlink className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: AI CONTEXT INTELLIGENCE */}
                {inspectorTab === 'ai' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                      <div className="flex items-center gap-2 text-purple-400 font-black">
                        <Sparkles className="w-4 h-4" />
                        <span>{lang === 'ar' ? 'استنتاج المحرك العصبي الذكي:' : 'Neural Intelligence Insight:'}</span>
                      </div>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        {lang === 'ar'
                          ? activeNode.aiInsightsAr || 'العقدة مترابطة بشكل جيد مع سياق التوأم الرقمي الرئيسي دون تضارب.'
                          : activeNode.aiInsightsEn || 'Node is strongly correlated with primary digital twin context.'}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] space-y-1">
                      <span className="text-[11px] font-bold text-[var(--text-muted)] block">
                        {lang === 'ar' ? 'التوصية المباشرة للأسبوع:' : 'Weekly Recommendation:'}
                      </span>
                      <p className="text-[var(--text-primary)] font-bold">
                        {lang === 'ar'
                          ? 'متابعة المزامنة التلقائية مع المفكرة للحفاظ على استقرار الجدول الزمني.'
                          : 'Maintain automated calendar sync for timeline stability.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 4: AUDIT LOG */}
                {inspectorTab === 'history' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-1.5">
                        <span className="font-bold">{lang === 'ar' ? 'تاريخ التعديل الأخير:' : 'Last Updated:'}</span>
                        <span className="font-mono text-indigo-400">{activeNode.lastUpdated || 'منذ قليل'}</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-[var(--text-secondary)]">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span>{lang === 'ar' ? 'تمت مزامنة البيانات إلكترونياً' : 'Data synced electronically'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-400">✓</span>
                          <span>{lang === 'ar' ? 'التحقق من التراخيص والحوكمة' : 'Governance verified'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)] space-y-2">
                <Network className="w-8 h-8 mx-auto text-indigo-500/40" />
                <p className="text-xs">{lang === 'ar' ? 'انقر على أي عقدة للتحكم في تفاصيلها وروابطها' : 'Click any node to inspect details'}</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* MODAL 1: ADD NEW CONTEXT NODE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border-2 border-indigo-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                {lang === 'ar' ? 'إضافة عقدة سياق جديدة للخريطة' : 'Add New Context Node'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-[var(--bg-hover)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewNode} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {lang === 'ar' ? 'عنوان الكيان (بالعربية)' : 'Node Label (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={newNodeTitleAr}
                  onChange={(e) => setNewNodeTitleAr(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: مشروع الذكاء الاصطناعي الجديد' : 'e.g. New AI Project'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {lang === 'ar' ? 'عنوان الكيان (بالإنجليزية)' : 'Node Label (English)'}
                </label>
                <input
                  type="text"
                  value={newNodeTitleEn}
                  onChange={(e) => setNewNodeTitleEn(e.target.value)}
                  placeholder="e.g. New AI Project"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">
                    {lang === 'ar' ? 'تصنيف السياق' : 'Context Category'}
                  </label>
                  <select
                    value={newNodeCategory}
                    onChange={(e) => setNewNodeCategory(e.target.value as ContextType)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:outline-none focus:border-indigo-500"
                  >
                    <option value="professional">Professional (مهني)</option>
                    <option value="family">Family (عائلي)</option>
                    <option value="learning">Learning (تعليمي)</option>
                    <option value="social">Social (اجتماعي)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">
                    {lang === 'ar' ? 'مستوى الأولوية' : 'Priority'}
                  </label>
                  <select
                    value={newNodePriority}
                    onChange={(e) => setNewNodePriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:outline-none focus:border-indigo-500"
                  >
                    <option value="high">High (قصوى)</option>
                    <option value="medium">Medium (متوسطة)</option>
                    <option value="low">Low (منخفضة)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {lang === 'ar' ? 'وزن الأهمية النسبية (%): ' : 'Importance Weight (%): '} {newNodeWeight}%
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={newNodeWeight}
                  onChange={(e) => setNewNodeWeight(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {lang === 'ar' ? 'التفاصيل والوصف' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={newNodeDetailsAr}
                  onChange={(e) => setNewNodeDetailsAr(e.target.value)}
                  placeholder={lang === 'ar' ? 'تفاصيل الكيان وسياق العمل مرتبطاً بالتطبيق...' : 'Node context description...'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  {lang === 'ar' ? 'إضافة للشبكة' : 'Add Node'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LINK TWO NODES */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border-2 border-indigo-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-indigo-500" />
                {lang === 'ar' ? 'إنشاء رابطة عصبية سلكية بين عقدتين' : 'Create Neural Link Between Nodes'}
              </h3>
              <button onClick={() => setIsConnectModalOpen(false)} className="p-1 rounded-lg hover:bg-[var(--bg-hover)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEdgeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {lang === 'ar' ? 'العقدة المصدر' : 'Source Node'}
                </label>
                <select
                  value={connectSourceId}
                  onChange={(e) => setConnectSourceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:outline-none focus:border-indigo-500"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {lang === 'ar' ? n.labelAr : n.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {lang === 'ar' ? 'العقدة الهدف المرتبطة' : 'Target Node'}
                </label>
                <select
                  value={connectTargetId}
                  onChange={(e) => setConnectTargetId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:outline-none focus:border-indigo-500"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {lang === 'ar' ? n.labelAr : n.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {lang === 'ar' ? 'نوع وعنوان العلاقة (بالعربية)' : 'Relation Label (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={connectLabelAr}
                  onChange={(e) => setConnectLabelAr(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: تكامل وتزامن المواعيد' : 'e.g. Sync & Integration'}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={() => setIsConnectModalOpen(false)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  {lang === 'ar' ? 'إنشاء الرابطة' : 'Create Link'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT EXISTING NODE */}
      {editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border-2 border-indigo-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500" />
                {lang === 'ar' ? 'تعديل تفاصيل العقدة' : 'Edit Node Details'}
              </h3>
              <button onClick={() => setEditingNode(null)} className="p-1 rounded-lg hover:bg-[var(--bg-hover)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNodeEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {lang === 'ar' ? 'عنوان العقدة (بالعربية)' : 'Label (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={editingNode.labelAr}
                  onChange={(e) => setEditingNode({ ...editingNode, labelAr: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {lang === 'ar' ? 'الحالة والتزامن' : 'Status'}
                </label>
                <input
                  type="text"
                  value={editingNode.statusAr}
                  onChange={(e) => setEditingNode({ ...editingNode, statusAr: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {lang === 'ar' ? 'وزن الأهمية النسبية (%): ' : 'Weight (%): '} {editingNode.weight}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={editingNode.weight}
                  onChange={(e) => setEditingNode({ ...editingNode, weight: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {lang === 'ar' ? 'التفاصيل والوصف' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={editingNode.detailsAr || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, detailsAr: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={() => setEditingNode(null)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChatBubbleLeftRightIcon, SparklesIcon, ExclamationTriangleIcon, FaceSmileIcon, ClockIcon, FlagIcon } from "@heroicons/react/24/outline";
import { CalendarDaysIcon, TagIcon, FaceSmileIcon as SmileIcon, DevicePhoneMobileIcon, ArrowPathIcon, FlagIcon as FlagSolidIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowUpRightIcon, ArrowDownRightIcon, EnvelopeIcon, StarIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useEffect } from "react";
import {
  LineChart as RLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RBarChart, Bar, PieChart as RPieChart, Pie, Cell, Legend,
} from 'recharts';
import { Tooltip as ReactTooltip } from "react-tooltip";

type Message = {
  tag: string;
  sentiment: string;
  source: string;
  isPricingInquiry: boolean;
  isFlagged: boolean;
  aiConfidence: number;
  responseTime: number;
  date: string;
  manualUploadName?: string;
};

// Mock data (replace with real data/fetch in production)
const MOCK_MESSAGES: Message[] = [
  {
    tag: "Lead",
    sentiment: "Positive",
    source: "Instagram",
    isPricingInquiry: true,
    isFlagged: false,
    aiConfidence: 95,
    responseTime: 12,
    date: "2024-06-01",
  },
  {
    tag: "Complaint",
    sentiment: "Negative",
    source: "LinkedIn",
    isPricingInquiry: false,
    isFlagged: true,
    aiConfidence: 88,
    responseTime: 45,
    date: "2024-06-02",
  },
  {
    tag: "Collab",
    sentiment: "Neutral",
    source: "Manual Upload",
    isPricingInquiry: false,
    isFlagged: false,
    aiConfidence: 91,
    responseTime: 30,
    date: "2024-06-03",
    manualUploadName: "June Leads Import",
  },
  {
    tag: "Technical",
    sentiment: "Negative",
    source: "Instagram",
    isPricingInquiry: false,
    isFlagged: true,
    aiConfidence: 80,
    responseTime: 60,
    date: "2024-06-04",
  },
  {
    tag: "Lead",
    sentiment: "Positive",
    source: "LinkedIn",
    isPricingInquiry: true,
    isFlagged: false,
    aiConfidence: 97,
    responseTime: 10,
    date: "2024-06-05",
  },
  {
    tag: "Complaint",
    sentiment: "Negative",
    source: "Instagram",
    isPricingInquiry: false,
    isFlagged: true,
    aiConfidence: 85,
    responseTime: 50,
    date: "2024-06-06",
  },
  {
    tag: "Lead",
    sentiment: "Positive",
    source: "Manual Upload",
    isPricingInquiry: true,
    isFlagged: false,
    aiConfidence: 92,
    responseTime: 15,
    date: "2024-06-07",
    manualUploadName: "Q2 Sales Dump",
  },
  {
    tag: "Collab",
    sentiment: "Neutral",
    source: "Instagram",
    isPricingInquiry: false,
    isFlagged: false,
    aiConfidence: 90,
    responseTime: 25,
    date: "2024-06-08",
  },
  {
    tag: "Technical",
    sentiment: "Negative",
    source: "LinkedIn",
    isPricingInquiry: false,
    isFlagged: true,
    aiConfidence: 78,
    responseTime: 70,
    date: "2024-06-09",
  },
  {
    tag: "Lead",
    sentiment: "Positive",
    source: "Instagram",
    isPricingInquiry: true,
    isFlagged: false,
    aiConfidence: 99,
    responseTime: 8,
    date: "2024-06-10",
  },
  {
    tag: "Complaint",
    sentiment: "Negative",
    source: "Manual Upload",
    isPricingInquiry: false,
    isFlagged: true,
    aiConfidence: 82,
    responseTime: 55,
    date: "2024-06-11",
  },
  {
    tag: "Collab",
    sentiment: "Neutral",
    source: "LinkedIn",
    isPricingInquiry: false,
    isFlagged: false,
    aiConfidence: 93,
    responseTime: 20,
    date: "2024-06-12",
  },
  {
    tag: "Technical",
    sentiment: "Negative",
    source: "Instagram",
    isPricingInquiry: false,
    isFlagged: true,
    aiConfidence: 76,
    responseTime: 65,
    date: "2024-06-13",
  },
  {
    tag: "Lead",
    sentiment: "Positive",
    source: "LinkedIn",
    isPricingInquiry: true,
    isFlagged: false,
    aiConfidence: 94,
    responseTime: 13,
    date: "2024-06-14",
  },
  {
    tag: "Complaint",
    sentiment: "Negative",
    source: "Instagram",
    isPricingInquiry: false,
    isFlagged: true,
    aiConfidence: 87,
    responseTime: 48,
    date: "2024-06-15",
  },
  {
    tag: "Lead",
    sentiment: "Positive",
    source: "Manual Upload",
    isPricingInquiry: true,
    isFlagged: false,
    aiConfidence: 96,
    responseTime: 11,
    date: "2024-06-16",
  },
  {
    tag: "Collab",
    sentiment: "Neutral",
    source: "Instagram",
    isPricingInquiry: false,
    isFlagged: false,
    aiConfidence: 89,
    responseTime: 28,
    date: "2024-06-17",
  },
  {
    tag: "Technical",
    sentiment: "Negative",
    source: "LinkedIn",
    isPricingInquiry: false,
    isFlagged: true,
    aiConfidence: 81,
    responseTime: 68,
    date: "2024-06-18",
  },
  {
    tag: "Lead",
    sentiment: "Positive",
    source: "Instagram",
    isPricingInquiry: true,
    isFlagged: false,
    aiConfidence: 98,
    responseTime: 9,
    date: "2024-06-19",
  },
  {
    tag: "Complaint",
    sentiment: "Negative",
    source: "Manual Upload",
    isPricingInquiry: false,
    isFlagged: true,
    aiConfidence: 83,
    responseTime: 53,
    date: "2024-06-20",
  },
];

// Chart color palettes
const COLORS = [
  "#6366f1", "#a21caf", "#06b6d4", "#f59e42", "#f43f5e", "#22c55e", "#eab308", "#fbbf24", "#3b82f6", "#ef4444"
];
const SHADOW = "0 4px 24px 0 rgba(99,102,241,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.06)";
const PIE_SHADOW = "drop-shadow(0 2px 8px #6366f155)";

// Filter options
const TAGS = ["All", "Lead", "Complaint", "Collab", "Technical", "Positive"] as const;
const SENTIMENTS = ["All", "Positive", "Neutral", "Negative"] as const;
const SOURCES = ["All", "Instagram", "LinkedIn", "Manual Upload"] as const;

// Add new types for comparison
type ComparisonFilters = {
  dateRange: string;
  customStart?: string;
  customEnd?: string;
  tag: string;
  sentiment: string;
  source: string;
  pricingInquiry: string;
  flagged: string;
  aiConfidence: [number, number];
};

type CompareDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onCompare: (comparison: { compareBy: string; sharedFilters: any; valueA: string; valueB: string }) => void;
};

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 20 20" fill="none" stroke="currentColor" className="w-4 h-4 ml-2 inline-block align-middle">
    <path d="M6 8l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const COMPARE_FIELDS = [
  { value: 'dateRange', label: 'Time Range' },
  { value: 'source', label: 'Inbox (Platform)' },
  { value: 'tag', label: 'Tag' },
  { value: 'sentiment', label: 'Sentiment' },
  { value: 'manualUploadName', label: 'Source' },
];

const CompareDrawer = ({ isOpen, onClose, onCompare }: CompareDrawerProps) => {
  const [compareBy, setCompareBy] = useState('source');
  const [sharedFilters, setSharedFilters] = useState({
    dateRange: 'Last 30 days',
    sentiment: 'All',
    tag: 'All',
    source: 'All',
    manualUploadName: 'All',
  });
  const [valueA, setValueA] = useState('Instagram');
  const [valueB, setValueB] = useState('LinkedIn');

  // Get label for Compare By
  const compareByLabel = COMPARE_FIELDS.find(f => f.value === compareBy)?.label || '';

  // Get options for the compareBy field
  let compareOptions: string[] = [];
  if (compareBy === 'source') compareOptions = SOURCES.filter(s => s !== 'All');
  else if (compareBy === 'tag') compareOptions = TAGS.filter(t => t !== 'All');
  else if (compareBy === 'sentiment') compareOptions = SENTIMENTS.filter(s => s !== 'All');
  else if (compareBy === 'dateRange') compareOptions = ['This Month', 'Last Month', 'Last 30 Days', 'Last 7 Days'];
  else if (compareBy === 'manualUploadName') compareOptions = [
    ...Array.from(new Set(MOCK_MESSAGES.filter(m => m.source === 'Manual Upload' && m.manualUploadName).map(m => m.manualUploadName!)))
  ];

  // Swap A/B handler
  const swapAB = () => {
    const temp = valueA;
    setValueA(valueB);
    setValueB(temp);
  };

  // Shared filter controls
  const SharedFilters = () => (
    <fieldset className="p-3 bg-gray-50 rounded-md mb-4 border text-sm text-gray-700">
      <legend className="text-xs font-semibold text-gray-500 uppercase mb-2">Filters Applied to Both</legend>
      {/* Time Range (if not comparing by time) */}
      {compareBy !== 'dateRange' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
          <div className="relative">
            <select
              className="w-full border rounded-md px-3 py-2 pr-8 appearance-none focus:ring-2 focus:ring-indigo-400 text-sm bg-white"
              value={sharedFilters.dateRange}
              onChange={e => setSharedFilters(f => ({ ...f, dateRange: e.target.value }))}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>All Time</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
      )}
      {compareBy !== 'sentiment' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment</label>
          <div className="relative">
            <select
              className="w-full border rounded-md px-3 py-2 pr-8 appearance-none focus:ring-2 focus:ring-indigo-400 text-sm bg-white"
              value={sharedFilters.sentiment}
              onChange={e => setSharedFilters(f => ({ ...f, sentiment: e.target.value }))}
            >
              {SENTIMENTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
      )}
      {compareBy !== 'tag' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
          <div className="relative">
            <select
              className="w-full border rounded-md px-3 py-2 pr-8 appearance-none focus:ring-2 focus:ring-indigo-400 text-sm bg-white"
              value={sharedFilters.tag}
              onChange={e => setSharedFilters(f => ({ ...f, tag: e.target.value }))}
            >
              {TAGS.map(t => <option key={t}>{t}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
      )}
      {compareBy !== 'source' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <div className="relative">
            <select
              className="w-full border rounded-md px-3 py-2 pr-8 appearance-none focus:ring-2 focus:ring-indigo-400 text-sm bg-white"
              value={sharedFilters.source}
              onChange={e => setSharedFilters(f => ({ ...f, source: e.target.value }))}
            >
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
      )}
    </fieldset>
  );

  // Compare value selectors
  const CompareValueSelectors = () => (
    <fieldset className="space-y-2 mb-4">
      <legend className="text-xs font-semibold text-gray-500 uppercase mb-1">Compare Values</legend>
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">{compareByLabel} A</label>
          <div className="relative">
            <select
              className="w-full border rounded-md px-3 py-2 pr-8 appearance-none focus:ring-2 focus:ring-indigo-400 text-sm bg-white"
              value={valueA}
              onChange={e => setValueA(e.target.value)}
            >
              {compareOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <button type="button" onClick={swapAB} className="mb-2 px-2 py-1 rounded-full border bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center" title="Swap A & B">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 12l-3 3m0 0l3 3m-3-3h18" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">{compareByLabel} B</label>
          <div className="relative">
            <select
              className="w-full border rounded-md px-3 py-2 pr-8 appearance-none focus:ring-2 focus:ring-indigo-400 text-sm bg-white"
              value={valueB}
              onChange={e => setValueB(e.target.value)}
            >
              {compareOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
      </div>
      {/* Summary line below compare values */}
      <div className="mt-3 text-xs text-gray-600">
        Comparing <span className="font-semibold text-indigo-700">{valueA}</span> vs <span className="font-semibold text-purple-700">{valueB}</span>
        {compareByLabel && ` by ${compareByLabel.toLowerCase()}`}
        {sharedFilters.sentiment !== 'All' && ` for '${sharedFilters.sentiment}' messages`}
        {sharedFilters.dateRange && sharedFilters.dateRange !== 'All Time' && ` from the ${sharedFilters.dateRange.toLowerCase()}`}
        .
      </div>
    </fieldset>
  );

  // Handle run comparison
  const handleRunComparison = () => {
    onCompare({ compareBy, sharedFilters, valueA, valueB });
    onClose();
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-[400px] bg-white shadow-xl z-[100] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">What would you like to compare?</h2>
              <div className="text-xs text-gray-500 mt-1">Choose a field and values to compare side by side</div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Compare By</label>
            <div className="flex flex-col gap-2">
              {COMPARE_FIELDS.map(f => (
                <label key={f.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="compareBy"
                    value={f.value}
                    checked={compareBy === f.value}
                    onChange={() => setCompareBy(f.value)}
                    className="accent-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{f.label}</span>
                </label>
              ))}
            </div>
          </div>
          <SharedFilters />
          <CompareValueSelectors />
        </div>
        <div className="p-6 border-t">
          <button
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-2 rounded-lg shadow hover:scale-[1.02] transition-transform"
            onClick={handleRunComparison}
          >
            Run Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  // Filter state
  const [dateRange, setDateRange] = useState("Last 7 days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [tag, setTag] = useState("All");
  const [sentiment, setSentiment] = useState("All");
  const [source, setSource] = useState("All");
  const [manualUploadName, setManualUploadName] = useState("All");
  const [pricingInquiry, setPricingInquiry] = useState("");
  const [flagged, setFlagged] = useState("");
  const [aiConfidence, setAiConfidence] = useState([70, 99]);
  const [exportOpen, setExportOpen] = useState(false);
  const exportBtnRef = useRef<HTMLButtonElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(false); // For skeleton loaders
  const [compareMode, setCompareMode] = useState(false);
  const [showSaveView, setShowSaveView] = useState(false);
  const [viewName, setViewName] = useState("");
  const [savedViews, setSavedViews] = useState<{ name: string; filters: any }[]>([]);
  const [activeView, setActiveView] = useState<string>("Default");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);
  const [comparisonData, setComparisonData] = useState<{
    compareBy: string;
    sharedFilters: any;
    valueA: string;
    valueB: string;
  } | null>(null);

  // Unique manual upload names from data
  const manualUploadNames = [
    "All",
    ...Array.from(new Set(MOCK_MESSAGES.filter(m => m.source === "Manual Upload" && m.manualUploadName).map(m => m.manualUploadName!)))
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node) &&
        exportBtnRef.current &&
        !exportBtnRef.current.contains(event.target as Node)
      ) {
        setExportOpen(false);
      }
    }
    if (exportOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    } else {
      window.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportOpen]);

  // Date filtering logic
  function isInDateRange(date: string) {
    if (dateRange === "All Time") return true;
    if (dateRange === "Custom Range" && customStart && customEnd) {
      return date >= customStart && date <= customEnd;
    }
    const today = new Date("2024-06-20"); // For demo, set 'today' as last mock date
    let start: Date;
    if (dateRange === "Last 7 days") {
      start = new Date(today);
      start.setDate(today.getDate() - 6);
    } else if (dateRange === "Last 30 days") {
      start = new Date(today);
      start.setDate(today.getDate() - 29);
    } else {
      return true;
    }
    return new Date(date) >= start && new Date(date) <= today;
  }

  // Filtered data (mock logic)
  const filtered = MOCK_MESSAGES.filter(m =>
    isInDateRange(m.date) &&
    (tag === "All" || m.tag === tag) &&
    (sentiment === "All" || m.sentiment === sentiment) &&
    (source === "All" || m.source === source) &&
    (source !== "Manual Upload" || manualUploadName === "All" || m.manualUploadName === manualUploadName) &&
    (!pricingInquiry || m.isPricingInquiry === (pricingInquiry === "Yes")) &&
    (!flagged || m.isFlagged === (flagged === "Yes")) &&
    m.aiConfidence >= aiConfidence[0] && m.aiConfidence <= aiConfidence[1]
  );

  // Helper to filter by shared filters and compareBy value
  function filterByAll(base: any, compareBy: string, value: string) {
    return MOCK_MESSAGES.filter(m => {
      let match = true;
      // Shared filters
      if (base.dateRange && base.dateRange !== 'All Time') {
        const today = new Date('2024-06-20');
        let start: Date;
        if (base.dateRange === 'Last 7 days') {
          start = new Date(today);
          start.setDate(today.getDate() - 6);
          match = match && (new Date(m.date) >= start && new Date(m.date) <= today);
        } else if (base.dateRange === 'Last 30 days') {
          start = new Date(today);
          start.setDate(today.getDate() - 29);
          match = match && (new Date(m.date) >= start && new Date(m.date) <= today);
        }
      }
      if (base.sentiment && base.sentiment !== 'All') match = match && m.sentiment === base.sentiment;
      if (base.tag && base.tag !== 'All') match = match && m.tag === base.tag;
      if (base.source && base.source !== 'All') match = match && m.source === base.source;
      if (base.manualUploadName && base.manualUploadName !== 'All') match = match && m.manualUploadName === base.manualUploadName;
      // Compare by
      if (compareBy && value) {
        if (compareBy === 'dateRange') {
          // Special: filter by month
          if (value === 'This Month') match = match && m.date >= '2024-06-01' && m.date <= '2024-06-30';
          else if (value === 'Last Month') match = match && m.date >= '2024-05-01' && m.date <= '2024-05-31';
          else if (value === 'Last 30 Days') {
            const today = new Date('2024-06-20');
            let start = new Date(today);
            start.setDate(today.getDate() - 29);
            match = match && (new Date(m.date) >= start && new Date(m.date) <= today);
          } else if (value === 'Last 7 Days') {
            const today = new Date('2024-06-20');
            let start = new Date(today);
            start.setDate(today.getDate() - 6);
            match = match && (new Date(m.date) >= start && new Date(m.date) <= today);
          }
        } else {
          match = match && m[compareBy as keyof Message] === value;
        }
      }
      return match;
    });
  }

  // In comparison mode, filter for A and B
  const comparisonDataA = comparisonData ? filterByAll(comparisonData.sharedFilters, comparisonData.compareBy, comparisonData.valueA) : [];
  const comparisonDataB = comparisonData ? filterByAll(comparisonData.sharedFilters, comparisonData.compareBy, comparisonData.valueB) : [];

  // Summary box logic
  let summaryText = '';
  if (comparisonData) {
    // Example: "Instagram had 32% more complaints than LinkedIn in the last 30 days."
    const labelA = comparisonData.valueA;
    const labelB = comparisonData.valueB;
    const base = comparisonData.sharedFilters;
    // Example: compare number of complaints
    const complaintsA = comparisonDataA.filter(m => m.tag === 'Complaint').length;
    const complaintsB = comparisonDataB.filter(m => m.tag === 'Complaint').length;
    let delta = 0;
    if (complaintsB > 0) delta = Math.round(((complaintsA - complaintsB) / complaintsB) * 100);
    else if (complaintsA > 0) delta = 100;
    summaryText = `${labelA} had ${Math.abs(delta)}% ${delta >= 0 ? 'more' : 'fewer'} complaints than ${labelB}`;
    if (base.dateRange && base.dateRange !== 'All Time') summaryText += ` in the ${base.dateRange.toLowerCase()}`;
    summaryText += '.';
  }

  // Analytics card stats (mocked)
  const totalMessages = filtered.length;
  const pricingInquiryPct = totalMessages ? Math.round(filtered.filter(m => m.isPricingInquiry).length / totalMessages * 100) : 0;
  const avgResponseTime = totalMessages ? Math.round(filtered.reduce((sum, m) => sum + m.responseTime, 0) / totalMessages) : 0;
  const flaggedCount = filtered.filter(m => m.isFlagged).length;

  // Mock previous week data for deltas
  const prevFiltered = MOCK_MESSAGES.filter(m => {
    // For demo, treat previous week as dates 2024-05-25 to 2024-05-31
    return m.date >= "2024-05-25" && m.date <= "2024-05-31";
  });
  const prevTotal = prevFiltered.length || 1;
  const prevPricingPct = prevTotal ? Math.round(prevFiltered.filter(m => m.isPricingInquiry).length / prevTotal * 100) : 0;
  const prevAvgResp = prevTotal ? Math.round(prevFiltered.reduce((sum, m) => sum + m.responseTime, 0) / prevTotal) : 0;
  const prevFlagged = prevFiltered.filter(m => m.isFlagged).length;
  // Deltas
  const delta = (curr: number, prev: number) => {
    if (prev === 0) return { val: 0, up: true };
    const diff = curr - prev;
    return { val: Math.abs(Math.round((diff / prev) * 100)), up: diff >= 0 };
  };
  const totalDelta = delta(totalMessages, prevTotal);
  const pricingDelta = delta(pricingInquiryPct, prevPricingPct);
  const respDelta = delta(avgResponseTime, prevAvgResp);
  const flaggedDelta = delta(flaggedCount, prevFlagged);

  // Chart data transforms
  // Message volume over time
  const volumeData = (() => {
    if (comparisonData) {
      const mapA = new Map<string, number>();
      const mapB = new Map<string, number>();
      comparisonDataA.forEach(m => {
        mapA.set(m.date, (mapA.get(m.date) || 0) + 1);
      });
      comparisonDataB.forEach(m => {
        mapB.set(m.date, (mapB.get(m.date) || 0) + 1);
      });
      const dates = new Set([...Array.from(mapA.keys()), ...Array.from(mapB.keys())]);
      return Array.from(dates).map(date => ({
        date,
        [comparisonData.valueA]: mapA.get(date) || 0,
        [comparisonData.valueB]: mapB.get(date) || 0
      }));
    }
    const map = new Map<string, number>();
    filtered.forEach(m => {
      map.set(m.date, (map.get(m.date) || 0) + 1);
    });
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  })();

  // Tag distribution
  const tagData = (() => {
    if (comparisonData) {
      const mapA = new Map<string, number>();
      const mapB = new Map<string, number>();
      comparisonDataA.forEach(m => {
        mapA.set(m.tag, (mapA.get(m.tag) || 0) + 1);
      });
      comparisonDataB.forEach(m => {
        mapB.set(m.tag, (mapB.get(m.tag) || 0) + 1);
      });
      const tags = new Set([...Array.from(mapA.keys()), ...Array.from(mapB.keys())]);
      return Array.from(tags).map(tag => ({
        tag,
        [comparisonData.valueA]: mapA.get(tag) || 0,
        [comparisonData.valueB]: mapB.get(tag) || 0
      }));
    }
    const map = new Map<string, number>();
    filtered.forEach(m => {
      map.set(m.tag, (map.get(m.tag) || 0) + 1);
    });
    return Array.from(map.entries()).map(([tag, count]) => ({ tag, count }));
  })();

  // Sentiment breakdown
  const sentimentData = (() => {
    const map = new Map<string, number>();
    filtered.forEach(m => {
      map.set(m.sentiment, (map.get(m.sentiment) || 0) + 1);
    });
    return Array.from(map.entries()).map(([sentiment, count]) => ({ sentiment, count }));
  })();

  // Avg. response time by tag
  const responseTimeByTag = (() => {
    const map = new Map<string, { sum: number, count: number }>();
    filtered.forEach(m => {
      if (!map.has(m.tag)) map.set(m.tag, { sum: 0, count: 0 });
      map.get(m.tag)!.sum += m.responseTime;
      map.get(m.tag)!.count += 1;
    });
    return Array.from(map.entries()).map(([tag, { sum, count }]) => ({ tag, avg: count ? Math.round(sum / count) : 0 }));
  })();

  // Pricing inquiry trend
  const pricingInquiryTrend = (() => {
    const map = new Map<string, number>();
    filtered.forEach(m => {
      if (m.isPricingInquiry) map.set(m.date, (map.get(m.date) || 0) + 1);
    });
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  })();

  // Flagged vs Not Flagged
  const flaggedPie = [
    { name: "Flagged", value: filtered.filter(m => m.isFlagged).length },
    { name: "Not Flagged", value: filtered.filter(m => !m.isFlagged).length },
  ];

  const resetFilters = () => {
    setDateRange("Last 7 days");
    setTag("All");
    setSentiment("All");
    setSource("All");
    setPricingInquiry("");
    setFlagged("");
    setAiConfidence([70, 99]);
  };

  return (
    <>
      {/* Compare Drawer rendered at root level for proper z-index stacking */}
      <CompareDrawer 
        isOpen={showCompareDrawer}
        onClose={() => setShowCompareDrawer(false)}
        onCompare={(comparison) => {
          setComparisonData(comparison);
          setShowCompareDrawer(false);
        }}
      />
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-indigo-950">
        {/* Sticky Glassy Header */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-lg border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 py-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <SparklesIcon className="w-7 h-7 text-indigo-500" /> Analytics
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
              Review insights from your messages. Filter by tag, sentiment, platform, and more. Powered by InexraAI.
            </p>
          </div>
          <div className="flex items-center gap-6">
            {/* Export/Email CTA */}
            <div className="relative group">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow hover:scale-105 transition whitespace-nowrap" onClick={() => {/* Export logic */}}>
                <ArrowUpRightIcon className="w-5 h-5" /> Export
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-50 hidden group-hover:block">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={() => {/* Export PDF logic */}}>Export as PDF</button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={() => {/* Export CSV logic */}}>Export as CSV</button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => setShowEmailModal(true)}><EnvelopeIcon className="w-4 h-4" /> Email Report</button>
              </div>
            </div>
            {/* Save View CTA */}
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 font-semibold shadow hover:bg-yellow-200 transition whitespace-nowrap" onClick={() => setShowSaveView(true)}>
              <StarIcon className="w-5 h-5" /> Save View
            </button>
            {/* Compare Toggle */}
            <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow transition whitespace-nowrap ${comparisonData ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-indigo-100'}`} onClick={() => setShowCompareDrawer(true)}>
              ⚖️ Compare
            </button>
          </div>
        </header>

        {/* Saved Views Tabs */}
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeView === "Default"
                  ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300 shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-indigo-50"
              }`}
              onClick={() => {
                setActiveView("Default");
                resetFilters();
              }}
            >
              Default View
            </button>
            {savedViews.map((view) => (
              <button
                key={view.name}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeView === view.name
                    ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300 shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-indigo-50"
                }`}
                onClick={() => {
                  setActiveView(view.name);
                  // Apply saved filters
                  Object.entries(view.filters).forEach(([key, value]) => {
                    switch (key) {
                      case "dateRange": setDateRange(value as string); break;
                      case "tag": setTag(value as string); break;
                      case "sentiment": setSentiment(value as string); break;
                      case "source": setSource(value as string); break;
                      case "pricingInquiry": setPricingInquiry(value as string); break;
                      case "flagged": setFlagged(value as string); break;
                      case "aiConfidence": setAiConfidence(value as [number, number]); break;
                    }
                  });
                }}
              >
                {view.name}
                <button
                  className="p-1 hover:bg-indigo-200 rounded-full transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSavedViews(savedViews.filter(v => v.name !== view.name));
                    if (activeView === view.name) {
                      setActiveView("Default");
                      resetFilters();
                    }
                  }}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </button>
            ))}
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-indigo-50 transition-all flex items-center gap-2"
              onClick={() => setShowSaveView(true)}
            >
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">+</span>
              Save View
            </button>
          </div>
        </div>

        {/* Save View Modal (scaffold) */}
        {showSaveView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-sm flex flex-col gap-4">
              <h2 className="text-lg font-bold mb-2">Save Current View</h2>
              <input 
                className="border rounded px-3 py-2" 
                placeholder="View name" 
                value={viewName} 
                onChange={e => setViewName(e.target.value)} 
              />
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowSaveView(false)}>Cancel</button>
                <button 
                  className="px-4 py-2 rounded bg-indigo-600 text-white" 
                  onClick={() => {
                    const currentFilters = {
                      dateRange,
                      tag,
                      sentiment,
                      source,
                      pricingInquiry,
                      flagged,
                      aiConfidence
                    };
                    setSavedViews([...savedViews, { name: viewName, filters: currentFilters }]);
                    setActiveView(viewName);
                    setShowSaveView(false);
                    setViewName("");
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Email Modal (scaffold) */}
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-sm flex flex-col gap-4">
              <h2 className="text-lg font-bold mb-2">Email Report</h2>
              <input className="border rounded px-3 py-2" placeholder="Recipient email" value={email} onChange={e => setEmail(e.target.value)} />
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowEmailModal(false)}>Cancel</button>
                <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => { setShowEmailModal(false); setEmail(""); }}>Send</button>
              </div>
            </div>
          </div>
        )}

        {/* Filters Row */}
        {showFilters && (
          <div className="max-w-7xl mx-auto px-4 mb-8 animate-fade-in">
            <div className="flex flex-wrap items-center gap-3 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow p-4 border border-gray-100 dark:border-gray-800 backdrop-blur-md">
              {/* Date Range */}
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-indigo-400" />
                <select className="border border-gray-300 rounded-md text-sm px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-400" value={dateRange} onChange={e => setDateRange(e.target.value)}>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>All Time</option>
                  <option>Custom Range</option>
                </select>
                {dateRange === "Custom Range" && (
                  <>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-md text-sm px-2 py-1 shadow-sm focus:ring-2 focus:ring-indigo-400"
                      value={customStart}
                      onChange={e => setCustomStart(e.target.value)}
                      max={customEnd || undefined}
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-md text-sm px-2 py-1 shadow-sm focus:ring-2 focus:ring-indigo-400"
                      value={customEnd}
                      onChange={e => setCustomEnd(e.target.value)}
                      min={customStart || undefined}
                    />
                  </>
                )}
              </div>
              {/* Tag Filter */}
              <div className="flex gap-2 flex-wrap items-center">
                <TagIcon className="w-5 h-5 text-blue-400" />
                {TAGS.map(t => (
                  <button key={t} className={`px-3 py-1 rounded-full text-sm font-medium transition border ${tag === t ? "bg-blue-100 text-blue-700 border-blue-300 shadow" : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700"}`} onClick={() => setTag(t)}>{t}</button>
                ))}
              </div>
              {/* Sentiment Filter */}
              <div className="flex gap-2 flex-wrap items-center">
                <SmileIcon className="w-5 h-5 text-green-400" />
                {SENTIMENTS.map(s => (
                  <button key={s} className={`px-3 py-1 rounded-full text-sm font-medium transition border ${sentiment === s ? (s === "Positive" ? "bg-green-100 text-green-700 border-green-300 shadow" : s === "Neutral" ? "bg-yellow-100 text-yellow-700 border-yellow-300 shadow" : s === "Negative" ? "bg-red-100 text-red-700 border-red-300 shadow" : "bg-blue-100 text-blue-700 border-blue-300 shadow") : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:text-indigo-700"}`} onClick={() => setSentiment(s)}>{s}</button>
                ))}
              </div>
              {/* Source Dropdown */}
              <div className="flex items-center gap-2">
                <DevicePhoneMobileIcon className="w-5 h-5 text-cyan-400" />
                <select className="border border-gray-300 rounded-md text-sm px-3 py-2 shadow-sm focus:ring-2 focus:ring-cyan-400" value={source} onChange={e => { setSource(e.target.value); setManualUploadName("All"); }}>
                  {SOURCES.map(src => <option key={src}>{src}</option>)}
                </select>
                {source === "Manual Upload" && (
                  <select className="border border-gray-300 rounded-md text-sm px-3 py-2 shadow-sm focus:ring-2 focus:ring-cyan-400" value={manualUploadName} onChange={e => setManualUploadName(e.target.value)}>
                    {manualUploadNames.map(name => <option key={name}>{name}</option>)}
                  </select>
                )}
              </div>
              {/* Pricing Inquiry */}
              <div className="flex items-center gap-1">
                <span className="text-sm">Pricing Inquiry:</span>
                <button className={`px-2 py-1 rounded text-xs font-medium border ${pricingInquiry === "Yes" ? "bg-indigo-100 text-indigo-700 border-indigo-300 shadow" : "bg-gray-100 text-gray-700 border-gray-200"}`} onClick={() => setPricingInquiry(pricingInquiry === "Yes" ? "" : "Yes")}>Yes</button>
                <button className={`px-2 py-1 rounded text-xs font-medium border ${pricingInquiry === "No" ? "bg-indigo-100 text-indigo-700 border-indigo-300 shadow" : "bg-gray-100 text-gray-700 border-gray-200"}`} onClick={() => setPricingInquiry(pricingInquiry === "No" ? "" : "No")}>No</button>
              </div>
              {/* Flagged */}
              <div className="flex items-center gap-1">
                <FlagSolidIcon className="w-5 h-5 text-red-400" />
                <button className={`px-2 py-1 rounded text-xs font-medium border ${flagged === "Yes" ? "bg-red-100 text-red-700 border-red-300 shadow" : "bg-gray-100 text-gray-700 border-gray-200"}`} onClick={() => setFlagged(flagged === "Yes" ? "" : "Yes")}>Yes</button>
                <button className={`px-2 py-1 rounded text-xs font-medium border ${flagged === "No" ? "bg-green-100 text-green-700 border-green-300 shadow" : "bg-gray-100 text-gray-700 border-gray-200"}`} onClick={() => setFlagged(flagged === "No" ? "" : "No")}>No</button>
              </div>
              {/* Clear All Button */}
              <button
                className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700 border border-gray-300 transition shadow-sm"
                onClick={resetFilters}
              >
                <XMarkIcon className="w-4 h-4" /> Clear All
              </button>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-4">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl flex flex-col gap-1 animate-fade-in hover:scale-[1.03] transition-transform relative overflow-hidden">
            <div className="absolute right-4 top-4 opacity-20 text-5xl pointer-events-none select-none">💬</div>
            <h3 className="text-sm flex items-center gap-2 font-semibold"><ChatBubbleLeftRightIcon className="w-5 h-5" /> Total Messages</h3>
            <p className="text-3xl font-bold drop-shadow-lg">{totalMessages}</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${totalDelta.up ? 'text-green-300' : 'text-red-300'}`} data-tooltip-id="stat-delta-tooltip" data-tooltip-content={`$${totalDelta.up ? '+' : '-'}${totalDelta.val}% vs. last 7 days`} data-tooltip-place="top">
              {totalDelta.up ? <ArrowUpRightIcon className="w-4 h-4" /> : <ArrowDownRightIcon className="w-4 h-4" />} {totalDelta.val}%
            </span>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl flex flex-col gap-1 animate-fade-in hover:scale-[1.03] transition-transform relative overflow-hidden">
            <div className="absolute right-4 top-4 opacity-20 text-5xl pointer-events-none select-none">✨</div>
            <h3 className="text-sm flex items-center gap-2 font-semibold"><SparklesIcon className="w-5 h-5" /> % Pricing Inquiries</h3>
            <p className="text-3xl font-bold drop-shadow-lg">{pricingInquiryPct}%</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${pricingDelta.up ? 'text-green-300' : 'text-red-300'}`} data-tooltip-id="stat-delta-tooltip" data-tooltip-content={`$${pricingDelta.up ? '+' : '-'}${pricingDelta.val}% vs. last 7 days`} data-tooltip-place="top">
              {pricingDelta.up ? <ArrowUpRightIcon className="w-4 h-4" /> : <ArrowDownRightIcon className="w-4 h-4" />} {pricingDelta.val}%
            </span>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl flex flex-col gap-1 animate-fade-in hover:scale-[1.03] transition-transform relative overflow-hidden">
            <div className="absolute right-4 top-4 opacity-20 text-5xl pointer-events-none select-none">⏱️</div>
            <h3 className="text-sm flex items-center gap-2 font-semibold"><ClockIcon className="w-5 h-5" /> Avg. Response Time</h3>
            <p className="text-3xl font-bold drop-shadow-lg">{avgResponseTime} min</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${respDelta.up ? 'text-red-300' : 'text-green-300'}`} data-tooltip-id="stat-delta-tooltip" data-tooltip-content={`$${respDelta.up ? '+' : '-'}${respDelta.val}% vs. last 7 days`} data-tooltip-place="top">
              {respDelta.up ? <ArrowUpRightIcon className="w-4 h-4" /> : <ArrowDownRightIcon className="w-4 h-4" />} {respDelta.val}%
            </span>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xl flex flex-col gap-1 animate-fade-in hover:scale-[1.03] transition-transform relative overflow-hidden">
            <div className="absolute right-4 top-4 opacity-20 text-5xl pointer-events-none select-none">🚩</div>
            <h3 className="text-sm flex items-center gap-2 font-semibold"><FlagIcon className="w-5 h-5" /> Flagged Messages</h3>
            <p className="text-3xl font-bold drop-shadow-lg">{flaggedCount}</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${flaggedDelta.up ? 'text-red-300' : 'text-green-300'}`} data-tooltip-id="stat-delta-tooltip" data-tooltip-content={`$${flaggedDelta.up ? '+' : '-'}${flaggedDelta.val}% vs. last 7 days`} data-tooltip-place="top">
              {flaggedDelta.up ? <ArrowUpRightIcon className="w-4 h-4" /> : <ArrowDownRightIcon className="w-4 h-4" />} {flaggedDelta.val}%
            </span>
          </div>
        </div>

        {/* Charts Section */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 px-4">
          <div className="relative bg-white/80 dark:bg-gray-900/80 p-6 rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-900 animate-fade-in overflow-hidden group transition-all" style={{ boxShadow: SHADOW }}>
            <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-indigo-50/60 to-transparent dark:from-indigo-900/30" />
            <h2 className="text-lg font-semibold mb-2">Message Volume Over Time</h2>
            <ResponsiveContainer width="100%" height={220}>
              <RLineChart data={volumeData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }} />
                {comparisonData ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey={comparisonData.valueA}
                      name={comparisonData.valueA}
                      stroke="#6366f1"
                      strokeWidth={4}
                      dot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                      isAnimationActive
                    />
                    <Line
                      type="monotone"
                      dataKey={comparisonData.valueB}
                      name={comparisonData.valueB}
                      stroke="#a21caf"
                      strokeWidth={4}
                      dot={{ r: 5, fill: '#a21caf', stroke: '#fff', strokeWidth: 2 }}
                      isAnimationActive
                    />
                  </>
                ) : (
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={4}
                    dot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive
                  />
                )}
                <Legend />
              </RLineChart>
            </ResponsiveContainer>
          </div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 p-6 rounded-3xl shadow-2xl border border-cyan-100 dark:border-cyan-900 animate-fade-in overflow-hidden group transition-all" style={{ boxShadow: SHADOW }}>
            <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-cyan-50/60 to-transparent dark:from-cyan-900/30" />
            <h2 className="text-lg font-semibold mb-2">Tag Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <RBarChart data={tagData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tag" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }} />
                {comparisonData ? (
                  <>
                    <Bar dataKey={comparisonData.valueA} name={comparisonData.valueA} fill="#6366f1" radius={[8, 8, 0, 0]} />
                    <Bar dataKey={comparisonData.valueB} name={comparisonData.valueB} fill="#a21caf" radius={[8, 8, 0, 0]} />
                  </>
                ) : (
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]}>
                    {tagData.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                        style={{ filter: 'drop-shadow(0 2px 8px #6366f133)' }}
                      />
                    ))}
                  </Bar>
                )}
                <Legend />
              </RBarChart>
            </ResponsiveContainer>
          </div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 p-6 rounded-3xl shadow-2xl border border-green-100 dark:border-green-900 animate-fade-in overflow-hidden group transition-all" style={{ boxShadow: SHADOW }}>
            <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-green-50/60 to-transparent dark:from-green-900/30" />
            <h2 className="text-lg font-semibold mb-2">Sentiment Breakdown</h2>
            <ResponsiveContainer width="100%" height={220}>
              <RPieChart>
                <Pie
                  data={sentimentData}
                  dataKey="count"
                  nameKey="sentiment"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#6366f1"
                  label
                  isAnimationActive
                  style={{ filter: PIE_SHADOW }}
                >
                  {sentimentData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                      style={{ filter: 'drop-shadow(0 2px 8px #6366f144)' }}
                      onMouseOver={e => ((e.target as SVGElement).style.opacity = '0.8')}
                      onMouseOut={e => ((e.target as SVGElement).style.opacity = '1')}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }} />
              </RPieChart>
            </ResponsiveContainer>
          </div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 p-6 rounded-3xl shadow-2xl border border-yellow-100 dark:border-yellow-900 animate-fade-in overflow-hidden group transition-all" style={{ boxShadow: SHADOW }}>
            <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-yellow-50/60 to-transparent dark:from-yellow-900/30" />
            <h2 className="text-lg font-semibold mb-2">Avg. Response Time by Tag</h2>
            <ResponsiveContainer width="100%" height={220}>
              <RBarChart data={responseTimeByTag} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="tag" type="category" />
                <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }} />
                <Bar dataKey="avg" isAnimationActive radius={[8, 8, 8, 8]}>
                  {responseTimeByTag.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                      style={{ filter: 'drop-shadow(0 2px 8px #6366f133)' }}
                      onMouseOver={e => ((e.target as SVGElement).style.opacity = '0.8')}
                      onMouseOut={e => ((e.target as SVGElement).style.opacity = '1')}
                    />
                  ))}
                </Bar>
              </RBarChart>
            </ResponsiveContainer>
          </div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 p-6 rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-900 animate-fade-in overflow-hidden group transition-all" style={{ boxShadow: SHADOW }}>
            <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-purple-50/60 to-transparent dark:from-purple-900/30" />
            <h2 className="text-lg font-semibold mb-2">Pricing Inquiry Trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <RLineChart data={pricingInquiryTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#a21caf"
                  strokeWidth={4}
                  dot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2, filter: 'drop-shadow(0 2px 6px #a21cafaa)' }}
                  isAnimationActive
                  activeDot={{ r: 8, fill: '#fff', stroke: '#a21caf', strokeWidth: 3, filter: 'drop-shadow(0 2px 8px #a21cafbb)' }}
                />
              </RLineChart>
            </ResponsiveContainer>
          </div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 p-6 rounded-3xl shadow-2xl border border-pink-100 dark:border-pink-900 animate-fade-in overflow-hidden group transition-all" style={{ boxShadow: SHADOW }}>
            <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-pink-50/60 to-transparent dark:from-pink-900/30" />
            <h2 className="text-lg font-semibold mb-2">Flagged vs. Not Flagged</h2>
            <ResponsiveContainer width="100%" height={220}>
              <RPieChart>
                <Pie
                  data={flaggedPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#f43f5e"
                  label
                  isAnimationActive
                  style={{ filter: PIE_SHADOW }}
                >
                  {flaggedPie.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                      style={{ filter: 'drop-shadow(0 2px 8px #f43f5e44)' }}
                      onMouseOver={e => ((e.target as SVGElement).style.opacity = '0.8')}
                      onMouseOut={e => ((e.target as SVGElement).style.opacity = '1')}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }} />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Highlights Section - full width below charts */}
        <div className="max-w-7xl mx-auto px-4 bg-indigo-50/80 dark:bg-indigo-900/40 p-6 rounded-2xl border-l-4 border-indigo-500 shadow-lg animate-fade-in flex flex-col gap-2 relative mb-12 mt-8">
          <span className="absolute -top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-bounce">
            <SparklesIcon className="w-4 h-4" /> AI Insights
          </span>
          <h3 className="font-semibold text-indigo-700 dark:text-indigo-200 mt-2">InexraAI Highlights</h3>
          <ul className="list-disc pl-5 text-sm text-gray-800 dark:text-gray-100 mt-2 space-y-1">
            <li className="flex items-center gap-2"><ArrowTrendingUpIcon className="w-4 h-4 text-blue-500" /> Pricing inquiries spiked 32% this week</li>
            <li className="flex items-center gap-2"><ExclamationTriangleIcon className="w-4 h-4 text-red-500" /> Most complaints were tagged with delayed response</li>
            <li className="flex items-center gap-2"><FaceSmileIcon className="w-4 h-4 text-green-500" /> High confidence leads originated from Instagram</li>
          </ul>
        </div>

        {/* InexraAI Alert Insights (scaffold) */}
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="flex flex-col gap-2">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-xl shadow flex items-center gap-3 animate-fade-in">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
              <span className="font-semibold">AI Alert:</span>
              <span>It&apos;s a great day!</span>
            </div>
            <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-xl shadow flex items-center gap-3 animate-fade-in">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              <span className="font-semibold">AI Alert:</span>
              <span>&apos;shipping&apos; and &apos;Collab&apos; mentioned frequently</span>
            </div>
          </div>
        </div>

        {/* Exit comparison mode button */}
        {comparisonData && (
          <div className="max-w-7xl mx-auto px-4 mb-4">
            <div className="bg-indigo-50 border-l-4 border-indigo-500 text-indigo-900 p-4 rounded-xl shadow flex items-center gap-3 animate-fade-in">
              <span className="font-semibold">Comparison Summary:</span>
              <span>{summaryText}</span>
            </div>
            <button
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
              onClick={() => setComparisonData(null)}
            >
              <XMarkIcon className="w-4 h-4" />
              Exit Comparison Mode
            </button>
          </div>
        )}

        {/* Only one Tooltip at the root for stat deltas */}
        <ReactTooltip id="stat-delta-tooltip" />
      </div>
    </>
  );
} 
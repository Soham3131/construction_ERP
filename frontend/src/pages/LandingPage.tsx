import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Building2,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Scale,
  Calculator,
  Lock,
  Menu,
  X,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  MapPin,
  Award,
  HardHat,
  ChevronDown,
  CheckCircle2,
  Users,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  BarChart3,
  FileText,
  Landmark,
  Compass,
  Briefcase,
  Layers2,
  Play,
  Activity,
  Zap,
  TrendingUp,
  Check,
  RefreshCw
} from 'lucide-react';

// Stage Visual Fallback Component — Ensures no broken image alt text ever renders
function StageImageVisual({
  src,
  alt,
  title,
  stageId,
  role,
  fallbackIcon: FallbackIcon
}: {
  src: string;
  alt: string;
  title: string;
  stageId: number;
  role: string;
  fallbackIcon: any;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-full h-full min-h-[300px] lg:min-h-[360px] bg-gradient-to-br from-slate-900 via-govt-navy-dark to-slate-950 overflow-hidden flex items-center justify-center group">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

      {!imageError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
        />
      ) : (
        /* Vector Fallback UI when remote image fails to load */
        <div className="relative z-10 p-8 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-xl animate-float">
            <FallbackIcon className="w-10 h-10 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-300 uppercase tracking-widest">Digital Stage {stageId} Blueprint</div>
            <div className="text-xl font-extrabold text-white font-gov mt-1">{title}</div>
            <div className="text-xs text-slate-300 mt-2 max-w-xs mx-auto">
              Automated 12-Stage Verified Governance Module
            </div>
          </div>
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

      {/* Stage Badge overlay */}
      <div className="absolute bottom-4 left-4 right-4 text-white z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
            STAGE {stageId} OF 12
          </span>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Verified Module
          </span>
        </div>
        <div className="text-xl font-bold font-gov text-white truncate">{title}</div>
        <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 truncate">
          <Users className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
          <span>Primary Role: <strong className="text-white">{role}</strong></span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [activeRole, setActiveRole] = useState('CE');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  
  // Hero Cycling Headline Index
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const headlines = [
    'Automated 12-Stage Governance',
    'Zero Ghost Billing e-MB Digital Books',
    'Dual-Cover Encrypted eTendering',
    '100% CVC & CAG Audit Readiness'
  ];

  // Hero Interactive Project Switcher
  const [activeHeroProject, setActiveHeroProject] = useState(0);
  const heroProjects = [
    {
      title: '4-Lane Highway Bypass & Flyover Bridge',
      ref: '#PWD-2026-8902',
      budget: '₹48.5 Cr',
      stage: 'Stage 8: Execution',
      progress: 78,
      mbStatus: '₹12.4 Cr Approved',
      billStatus: 'RA-03 Released (UTR #99014)',
      img: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80',
      badgeColor: 'bg-emerald-500'
    },
    {
      title: '500-Bed Govt Medical College Complex',
      ref: '#CPWD-2026-4019',
      budget: '₹120.0 Cr',
      stage: 'Stage 6: Bid Evaluation (Auto-L1)',
      progress: 42,
      mbStatus: 'Pre-Qualification Passed',
      billStatus: 'Auto-L1 Identified (₹112.5 Cr)',
      img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      badgeColor: 'bg-amber-500'
    },
    {
      title: 'Smart City Urban Drainage & Pipeline',
      ref: '#NHAI-2026-1104',
      budget: '₹32.8 Cr',
      stage: 'Stage 11: Treasury Disbursal',
      progress: 95,
      mbStatus: 'Final e-MB Verification',
      billStatus: 'RTGS Disbursement Completed',
      img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      badgeColor: 'bg-cyan-500'
    }
  ];

  const stageNavRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  // Automatic headline rotator
  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [headlines.length]);

  // Quick Demo Accounts
  const demoUsers = [
    { role: 'Chief Engineer (CE)', email: 'ce@erp.gov.in', pass: 'pass@123', badge: 'State Governance & Oversight', icon: Award, color: 'bg-purple-600' },
    { role: 'Executive Engineer (EE)', email: 'ee@erp.gov.in', pass: 'pass@123', badge: 'Division Operations & Approvals', icon: Building2, color: 'bg-blue-600' },
    { role: 'Sub-Divisional Officer (SDO)', email: 'sdo@erp.gov.in', pass: 'pass@123', badge: 'Sub-Division Verification', icon: HardHat, color: 'bg-indigo-600' },
    { role: 'Junior Engineer (JE)', email: 'je@erp.gov.in', pass: 'pass@123', badge: 'Field Inspection & MB Entry', icon: MapPin, color: 'bg-teal-600' },
    { role: 'Tender Officer', email: 'tender@erp.gov.in', pass: 'pass@123', badge: 'BOQ & e-Tender Management', icon: FileCheck2, color: 'bg-emerald-600' },
    { role: 'Contractor', email: 'contractor@abc.com', pass: 'pass@123', badge: 'Bidding & RA Bill Submissions', icon: HardHat, color: 'bg-amber-600' },
    { role: 'Accountant', email: 'accounts@erp.gov.in', pass: 'pass@123', badge: 'Bill Audit & Tax Deductions', icon: Calculator, color: 'bg-cyan-600' },
  ];

  // 12-Stage Workflow Data
  const stages = [
    {
      id: 1,
      title: 'Project Proposal',
      role: 'Junior Engineer (JE)',
      desc: 'Creation of comprehensive technical estimates, SSR rate book selection, DPR uploads, and structural preliminary proposals.',
      img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80',
      icon: Compass,
      highlights: ['Automated SSR rate book integration', 'Multi-file GIS coordinates tag', 'Preliminary cost estimation generator']
    },
    {
      id: 2,
      title: 'Sanction & Approvals',
      role: 'JE → SDO → EE → CE Chain',
      desc: 'Sequential 4-tier approval engine with authority financial thresholds (e.g. CE sanction required for projects above ₹2 Cr).',
      img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
      icon: ShieldCheck,
      highlights: ['Strict financial delegation limits', 'Digital signature timestamping', 'Real-time approval bottleneck tracking']
    },
    {
      id: 3,
      title: 'Tender Creation',
      role: 'Tender Officer',
      desc: 'Formulation of Notice Inviting Tender (NIT), BOQ creation, Earnest Money Deposit (EMD) parameters, and eligibility criteria.',
      img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
      icon: FileText,
      highlights: ['Item-rate & percentage BOQs', 'Pre-qualification criteria setup', 'Automated EMD & document fee rules']
    },
    {
      id: 4,
      title: 'Tender Published',
      role: 'Public Portal',
      desc: 'Live public publication of NIT notices, downloadable tender documents, corrigendum updates, and pre-bid meeting logs.',
      img: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1000&q=80',
      icon: Layers2,
      highlights: ['Public e-Procurement bulletin', 'Automated countdown timers', 'Encrypted bid container activation']
    },
    {
      id: 5,
      title: 'Dual-Cover Bidding',
      role: 'Registered Contractors',
      desc: 'Two-cover digital submission: Cover 1 (Technical compliance, GST, PAN, EMD) & Cover 2 (Encrypted Financial Quote).',
      img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1000&q=80',
      icon: KeyRound,
      highlights: ['Cryptographic bid sealing', 'Automated EMD verification', 'Technical document checklist']
    },
    {
      id: 6,
      title: 'Bid Evaluation (Auto L1)',
      role: 'Tender Committee / EE',
      desc: 'Technical qualification marking, opening of financial bids for qualified bidders, and instant automatic L1 ranking.',
      img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
      icon: BarChart3,
      highlights: ['Automated L1 identification', 'Comparative statement generation', 'Abnormally low bid warning flag']
    },
    {
      id: 7,
      title: 'Tender Award & Work Order',
      role: 'Executive Engineer',
      desc: 'Issuance of Letter of Acceptance (LOA), Security Deposit collection, and formal Work Order generation.',
      img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80',
      icon: Briefcase,
      highlights: ['Automated WO pdf generation', 'Performance guarantee verification', 'Contractor agreement binding']
    },
    {
      id: 8,
      title: 'Project Execution & Milestones',
      role: 'JE & Site Manager',
      desc: 'Gantt-chart schedule tracking, daily progress reporting (DPR), site photo uploads, and material consumption logs.',
      img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      icon: HardHat,
      highlights: ['Interactive milestone tracker', 'Weather & site bottleneck logs', 'Geo-tagged field photo uploads']
    },
    {
      id: 9,
      title: 'Digital Measurement Book',
      role: 'JE → SDO → EE Verification',
      desc: 'Replacement of physical MB registers with digital e-MB (Length × Breadth × Depth calculations with automatic rates).',
      img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80',
      icon: FileSpreadsheet,
      highlights: ['Zero ghost measurement guarantee', 'Historical MB measurement audit', 'Formula-driven volume calculations']
    },
    {
      id: 10,
      title: 'Automated Billing (RA Bills)',
      role: 'Contractor & Accountant',
      desc: 'Automatic generation of Running Account (RA) bills directly linked to approved MB items with statutory tax deductions.',
      img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
      icon: Calculator,
      highlights: ['Auto GST 18% & TDS 1% deduction', '5% Security deposit retention', 'Cumulative vs current bill audit']
    },
    {
      id: 11,
      title: 'Treasury Payment Release',
      role: 'Treasury Officer / Accounts',
      desc: 'Direct bank transfer integration via RTGS/NEFT with UTR number recording and instant payment vouchers.',
      img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1000&q=80',
      icon: Landmark,
      highlights: ['Direct bank UTR tracking', 'Automated payment voucher', 'Real-time cashbook reconciliation']
    },
    {
      id: 12,
      title: 'Audit & CVC Compliance',
      role: 'Chief Engineer & CAG Audit',
      desc: 'Complete immutable log of all 12 stages, user IP signatures, file versioning, and Central Vigilance Commission compliance reporting.',
      img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
      icon: Scale,
      highlights: ['100% CVC inspection ready', 'Immutable log trail', 'Exportable CAG audit dossier']
    }
  ];

  // Role Features
  const roleDetails: Record<string, { title: string; subtitle: string; desc: string; metrics: string[]; icon: any }> = {
    CE: {
      title: 'Chief Engineer (CE)',
      subtitle: 'Executive Governance & State Oversight',
      desc: 'Complete high-level visibility across all divisions, high-value sanction approvals, contractor performance ranking, and risk dashboard.',
      metrics: ['100% Budget Utilization Oversight', 'High-Value Project Approval Queue', 'Vigilance & Audit Dossiers'],
      icon: Award
    },
    EE: {
      title: 'Executive Engineer (EE)',
      subtitle: 'Division Head & Tender Sanction Authority',
      desc: 'Issues Work Orders, approves MB books, manages division tenders, monitors milestone deadlines, and sanctions payments.',
      metrics: ['Division Budget Allocation', 'Tender Award Authority', 'Work Order Management'],
      icon: Building2
    },
    SDO: {
      title: 'Sub-Divisional Officer (SDO)',
      subtitle: 'Field Supervision & First-level Verification',
      desc: 'Verifies JE Measurement Book entries, conducts 10% site verification spot checks, and reviews daily progress reports.',
      metrics: ['Field Spot Check Verification', 'MB Quality Audit', 'Daily Progress Validation'],
      icon: HardHat
    },
    JE: {
      title: 'Junior Engineer (JE)',
      subtitle: 'Field Officer & Site Execution Leader',
      desc: 'Records physical site dimensions in e-MB, takes geo-tagged site photos, creates initial project proposals, and monitors daily labor/materials.',
      metrics: ['e-MB Dimension Recording', 'Geo-tagged Progress Photos', 'Site Diary Management'],
      icon: MapPin
    },
    Contractor: {
      title: 'Contractor Portal',
      subtitle: 'Transparent e-Bidding & Fast Bill Disbursement',
      desc: 'Submit technical and financial bids seamlessly, track work orders in real-time, generate RA bills, and monitor payment release UTRs.',
      metrics: ['Encrypted Bid Vault', 'Digital RA Bill Submission', 'Live RTGS Payment Status'],
      icon: HardHat
    },
    Accountant: {
      title: 'Accountant & Treasury',
      subtitle: 'Automated Tax Calculation & Ledger Audits',
      desc: 'Automatic computation of GST 18%, TDS 1%, Security Retention 5%, voucher entry, budget check, and Treasury RTGS dispatch.',
      metrics: ['Automated Tax Deduction Engine', 'Budget Ledger Monitoring', 'Treasury RTGS Dispatch'],
      icon: Calculator
    }
  };

  // FAQ list
  const faqs = [
    {
      q: 'How does Constructor ERP comply with Central Vigilance Commission (CVC) guidelines?',
      a: 'The platform enforces dual-cover encrypted e-tendering, automated financial bid scoring (auto-L1 detection), and non-repudiable audit logs for every approval, dimension edit, and payment disbursal. All actions carry cryptographic timestamps and user IP trails.'
    },
    {
      q: 'Can physical Measurement Books (MB) be completely replaced by this system?',
      a: 'Yes! The Digital Measurement Book (e-MB) module replaces physical paper registers. JEs enter exact dimensions (Length × Width × Height), which auto-calculate volume and total cost based on sanctioned SSR rates. SDOs and EEs verify measurements digitally with built-in tolerance checks.'
    },
    {
      q: 'How are statutory taxes like GST and TDS handled during bill creation?',
      a: 'The built-in Billing Engine automatically calculates net payable amounts by deducting GST (18%), TDS (1%), Security Deposit (5%), and Labour Cess (1%) upon RA Bill entry, eliminating manual math errors.'
    },
    {
      q: 'Is the platform mobile responsive for field engineers on construction sites?',
      a: 'Absolutely. Junior Engineers (JEs) and SDOs can record measurements, inspect daily progress, and upload site inspection photos directly from smartphones or tablets with full responsive design.'
    },
    {
      q: 'How fast can a new PWD department or municipality onboard onto the system?',
      a: 'Organizations can be provisioned within 24 hours. The platform includes standard SSR rate items, multi-tier approval hierarchy templates, and role-based access presets out of the box.'
    }
  ];

  const scrollStageNav = (direction: 'left' | 'right') => {
    if (stageNavRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      stageNavRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const currProj = heroProjects[activeHeroProject];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col overflow-x-hidden">
      {/* Top Govt Tricolor Accent Strip */}
      <div className="h-1.5 tricolor-strip fixed top-0 left-0 right-0 z-50" />

      {/* Main Navigation Header */}
      <header className="sticky top-1.5 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-govt-navy flex items-center justify-center text-white font-bold shadow-md group-hover:bg-govt-navy-dark transition-all duration-300 group-hover:scale-105">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-govt-saffron" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-semibold text-govt-saffron uppercase tracking-wider whitespace-nowrap">Government ERP</span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded whitespace-nowrap">v2.4 Live</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-govt-navy font-gov truncate">
                Constructor ERP <span className="text-slate-400 font-normal hidden sm:inline">| eTender</span>
              </h1>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-600 whitespace-nowrap">
            <a href="#features" className="hover:text-govt-navy transition-colors duration-200 py-1">Key Features</a>
            <a href="#workflow" className="hover:text-govt-navy transition-colors duration-200 py-1">12-Stage Workflow</a>
            <a href="#roles" className="hover:text-govt-navy transition-colors duration-200 py-1">Department Roles</a>
            <a href="#impact" className="hover:text-govt-navy transition-colors duration-200 py-1">Impact Metrics</a>
            <a href="#faq" className="hover:text-govt-navy transition-colors duration-200 py-1">FAQ</a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden xl:flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 text-amber-900 border border-amber-300 font-semibold rounded-lg hover:bg-amber-100 hover:shadow-sm transition-all duration-200 text-sm whitespace-nowrap active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
              Quick Demo Accounts
            </button>

            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-gov whitespace-nowrap shadow-sm hover:shadow transition-all duration-200">
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-gov-outline whitespace-nowrap hover:shadow-sm transition-all duration-200">
                  Sign In
                </Link>
                <Link to="/register-organization" className="btn-gov whitespace-nowrap shadow-sm hover:shadow transition-all duration-200">
                  Register Dept
                </Link>
              </>
            )}
          </div>

          {/* Mobile & Tablet Navigation Toggle */}
          <div className="xl:hidden flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold rounded-lg flex items-center gap-1 whitespace-nowrap transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 font-medium py-2 border-b border-slate-100 hover:text-govt-navy transition-colors"
            >
              Key Features
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 font-medium py-2 border-b border-slate-100 hover:text-govt-navy transition-colors"
            >
              12-Stage Workflow
            </a>
            <a
              href="#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 font-medium py-2 border-b border-slate-100 hover:text-govt-navy transition-colors"
            >
              Department Roles
            </a>
            <a
              href="#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 font-medium py-2 border-b border-slate-100 hover:text-govt-navy transition-colors"
            >
              Impact Metrics
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 font-medium py-2 border-b border-slate-100 hover:text-govt-navy transition-colors"
            >
              FAQ
            </a>

            <div className="pt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-gov text-center py-2.5">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-gov-outline text-center py-2.5">
                    Sign In Securely
                  </Link>
                  <Link to="/register-organization" className="btn-gov text-center py-2.5">
                    Register Organization / Dept
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ULTRA-ANIMATED HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-govt-navy-dark to-slate-900 text-white pt-10 pb-20 lg:pt-16 lg:pb-32">
        
        {/* Dynamic Animated Ambient Background Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none animate-float-alt" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

        {/* High-Tech Blueprint Grid overlay */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Text with Cycler & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Live Status Pill with Glowing Radar Pulse */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-amber-300 shadow-xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span>Next-Gen Civil Infrastructure & e-Tendering OS</span>
              </div>

              {/* Dynamic Headline with Animated Cycler */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-gov">
                Transform Public Works with <br />
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-400 transition-all duration-500 min-h-[1.2em]">
                  {headlines[headlineIndex]}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                The complete digital Operating System for PWD, CPWD, NHAI, Smart Cities & Infrastructure Enterprises. Digitise proposals, multi-tier approvals, e-Tendering, digital Measurement Books (e-MB), and RTGS payments in one audit-ready platform.
              </p>

              {/* Primary Buttons & Overview Video Trigger */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => setDemoModalOpen(true)}
                  className="w-full sm:w-auto px-7 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-xl shadow-amber-500/25 transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-base"
                >
                  <Sparkles className="w-5 h-5 text-slate-950 animate-pulse" />
                  Explore System Live Demo
                </button>

                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 backdrop-blur transition-all duration-200 flex items-center justify-center gap-3 text-base group"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-3.5 h-3.5 text-amber-300 fill-amber-300 ml-0.5" />
                  </div>
                  <span>Watch 60s Video</span>
                </button>
              </div>

              {/* Live Interactive Hero Stats Counters */}
              <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-3 text-left">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-bold">Processed</span>
                  </div>
                  <div className="text-base sm:text-xl font-extrabold text-white font-gov whitespace-nowrap">₹8,500+ Cr</div>
                  <div className="text-[10px] text-slate-400">Total Project Value</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold">Accuracy</span>
                  </div>
                  <div className="text-base sm:text-xl font-extrabold text-white font-gov whitespace-nowrap">100% e-MB</div>
                  <div className="text-[10px] text-slate-400">Zero Ghost Billing</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-1.5 text-purple-400 mb-1">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-bold">Compliance</span>
                  </div>
                  <div className="text-base sm:text-xl font-extrabold text-white font-gov whitespace-nowrap">CVC Ready</div>
                  <div className="text-[10px] text-slate-400">CAG Audit Passed</div>
                </div>
              </div>

            </div>

            {/* Right Column: INTERACTIVE ANIMATED HERO WIDGET */}
            <div className="lg:col-span-5 relative">
              
              {/* Floating Animated Badge 1 (Top Left) */}
              <div className="absolute -top-5 -left-5 z-30 bg-slate-900/90 backdrop-blur border border-emerald-500/40 text-white p-3 rounded-xl shadow-2xl animate-float hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">4-Tier Approval Chain</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span>JE ➔ SDO ➔ EE ➔ CE</span>
                    <span className="font-bold text-amber-300">✓ Sanctioned</span>
                  </div>
                </div>
              </div>

              {/* Floating Animated Badge 2 (Bottom Right) */}
              <div className="absolute -bottom-6 -right-4 z-30 bg-slate-900/90 backdrop-blur border border-amber-500/40 text-white p-3 rounded-xl shadow-2xl animate-float-alt hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">Auto-L1 Evaluation</div>
                  <div className="text-[10px] text-amber-300 font-mono">14 Sealed Bids Scored</div>
                </div>
              </div>

              {/* Main Interactive Project Showcase Card */}
              <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-slate-900/90 backdrop-blur shadow-2xl p-4 transition-all duration-500 hover:border-amber-400/40">
                
                {/* Hero Interactive Project Selector Tabs */}
                <div className="flex items-center justify-between gap-1 mb-3 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                  {heroProjects.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveHeroProject(i)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                        activeHeroProject === i
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Project {i + 1}
                    </button>
                  ))}
                </div>

                {/* Animated Project Image Container */}
                <div className="relative h-64 sm:h-72 rounded-xl overflow-hidden group">
                  <StageImageVisual
                    src={currProj.img}
                    alt={currProj.title}
                    title={currProj.title}
                    stageId={8}
                    role="Junior Engineer & Site Officer"
                    fallbackIcon={HardHat}
                  />

                  {/* Top Floating Badge Overlay */}
                  <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 shadow z-20">
                    <span className={`w-2 h-2 rounded-full ${currProj.badgeColor} animate-pulse`} />
                    <span>{currProj.stage}</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow z-20">
                    {currProj.budget}
                  </div>
                </div>

                {/* Live Milestone Progress Bar */}
                <div className="mt-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Physical Milestone Progress</span>
                    <span className="text-emerald-400 font-bold font-mono">{currProj.progress}% Completed</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${currProj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Floating Metrics Widgets */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">Measurement Book (e-MB)</div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">{currProj.mbStatus}</div>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">RA Bill Status</div>
                    <div className="text-xs sm:text-sm font-bold text-amber-300 mt-0.5 truncate">{currProj.billStatus}</div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Trust & Compliance Strip */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Built strictly in accordance with official public procurement standards
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center gap-2.5 transition-all hover:bg-white hover:shadow-sm">
              <ShieldCheck className="w-5 h-5 text-govt-navy flex-shrink-0" />
              <span className="text-xs font-bold text-slate-800 whitespace-nowrap">CVC Guideline Compliant</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center gap-2.5 transition-all hover:bg-white hover:shadow-sm">
              <Lock className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-800 whitespace-nowrap">Dual-Cover Encrypted Bids</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center gap-2.5 transition-all hover:bg-white hover:shadow-sm">
              <FileSpreadsheet className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-800 whitespace-nowrap">Digital e-MB Verification</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center gap-2.5 transition-all hover:bg-white hover:shadow-sm">
              <Scale className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-800 whitespace-nowrap">100% CAG Audit Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* 12-Stage Workflow Explorer Section */}
      <section id="workflow" className="py-14 lg:py-20 bg-slate-100/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-govt-saffron uppercase tracking-widest bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
              End-to-End Lifecycle
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-gov mt-3">
              The Complete 12-Stage Construction & eTender Workflow
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Every project follows an immutable 12-stage chain. From initial proposal drafting to digital Measurement Book verification and final audit log.
            </p>
          </div>

          {/* Stepper Tabs with Scroll Navigation Controls */}
          <div className="relative mb-6">
            <button
              onClick={() => scrollStageNav('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition hidden sm:flex"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={stageNavRef}
              className="flex items-center overflow-x-auto gap-2 py-2 px-1 sm:px-10 no-scrollbar scroll-smooth"
            >
              {stages.map((stg, idx) => {
                const isActive = activeStage === idx;
                return (
                  <button
                    key={stg.id}
                    onClick={() => setActiveStage(idx)}
                    className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-govt-navy text-white font-bold shadow-md scale-105 ring-2 ring-govt-navy/30'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {stg.id}
                    </span>
                    <span className="whitespace-nowrap">{stg.title}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollStageNav('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition hidden sm:flex"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Selected Stage Detail Card with Smooth Animation */}
          {stages[activeStage] && (
            <div key={activeStage} className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-fade-in">
              
              {/* Left Column: Image with Fallback Visual */}
              <div className="lg:col-span-5 relative">
                <StageImageVisual
                  src={stages[activeStage].img}
                  alt={stages[activeStage].title}
                  title={stages[activeStage].title}
                  stageId={stages[activeStage].id}
                  role={stages[activeStage].role}
                  fallbackIcon={stages[activeStage].icon}
                />
              </div>

              {/* Right Column: Stage Details */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm shadow">
                      {stages[activeStage].id}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-gov">
                      {stages[activeStage].title}
                    </h3>
                  </div>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                    {stages[activeStage].desc}
                  </p>

                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                    Stage Functional Capabilities
                  </h4>
                  <div className="space-y-2.5">
                    {stages[activeStage].highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 truncate">
                    Next Stage: <strong className="text-slate-800 font-semibold">{stages[(activeStage + 1) % stages.length].title}</strong>
                  </div>
                  <button
                    onClick={() => setActiveStage((activeStage + 1) % stages.length)}
                    className="btn-gov-outline text-xs whitespace-nowrap px-3.5 py-2 hover:shadow-sm"
                  >
                    Next Stage →
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      </section>

      {/* Multi-Role Governance Section */}
      <section id="roles" className="py-14 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-govt-navy uppercase tracking-widest bg-blue-50 text-blue-900 px-3 py-1 rounded-full">
              Role-Based Access Control (RBAC)
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-gov mt-3">
              Tailored Operating Dashboards for Every Stakeholder
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              From field Junior Engineers recording dimensions to Chief Engineers monitoring statewide risk metrics — each role enjoys a purpose-built workspace.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {Object.keys(roleDetails).map((key) => {
              const roleInfo = roleDetails[key];
              const IconComp = roleInfo.icon;
              const isSelected = activeRole === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveRole(key)}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-govt-navy bg-gradient-to-b from-blue-50/80 to-white shadow-md ring-2 ring-govt-navy/20 scale-102'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <IconComp className={`w-5 h-5 mb-2 ${isSelected ? 'text-govt-navy' : 'text-slate-400'}`} />
                  <div className={`text-sm font-bold ${isSelected ? 'text-govt-navy' : 'text-slate-800'}`}>
                    {key}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{roleInfo.title.split('(')[0]}</div>
                </button>
              );
            })}
          </div>

          {/* Role Content Card with Fade In */}
          {roleDetails[activeRole] && (
            <div key={activeRole} className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                  <span>Role Focus: {roleDetails[activeRole].subtitle}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-gov text-white">
                  {roleDetails[activeRole].title}
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {roleDetails[activeRole].desc}
                </p>

                <div className="pt-2 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Dashboard Highlights</div>
                  {roleDetails[activeRole].metrics.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-200">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setDemoModalOpen(true)}
                    className="btn-gov px-5 py-2.5 text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    Test {activeRole} Dashboard Demo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-800/90 rounded-xl p-5 border border-slate-700/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <span className="text-xs font-bold text-slate-300">Live Mock KPI Card</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">Active Session</span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Pending Approvals</span>
                    <span className="text-sm font-bold text-amber-300">4 Action Items</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Monthly Disbursed</span>
                    <span className="text-sm font-bold text-emerald-400">₹8.42 Crore</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Audit Compliance</span>
                    <span className="text-sm font-bold text-purple-300">100% Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Platform Features Grid */}
      <section id="features" className="py-14 lg:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
              Built for Scale & Transparency
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-gov mt-3">
              Comprehensive Modules Engineered for Public Infrastructure
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Eliminate paper delays, prevent financial leakage, and enforce accountability at every stage of construction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Feature 1 */}
            <div className="card-gov p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-govt-navy flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-gov mb-2">
                Automated e-Tendering & L1 Scoring
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Dual-cover cryptographic bid submission with automatic technical qualification marking and instant L1 financial bid ranking.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span> Sealed digital cover encryption
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span> Automated comparative statement
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="card-gov p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-gov mb-2">
                Digital Measurement Book (e-MB)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Enter field measurements (L × W × H) directly into digital registers with SSR rate mapping and multi-tier approval verification.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span> Zero ghost measurement guarantee
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span> Spot-check tolerance validation
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="card-gov p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-gov mb-2">
                Auto Tax & RA Billing Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Auto-calculate GST 18%, TDS 1%, Security Retention 5%, and Labour Cess with one click upon RA Bill generation.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span> Automated statutory tax deductions
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span> Cumulative budget ledger protection
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="card-gov p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-gov mb-2">
                4-Tier Sequential Approval Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Configurable sanction chain (JE → SDO → EE → CE) ensuring proposals and bills cannot bypass designated authority thresholds.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span> Strict delegation of financial powers
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span> Bottleneck reminder alerts
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="card-gov p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-gov mb-2">
                GIS Map & Site Monitoring
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Geographical visualization of all civil works across divisions with geo-tagged field photos and weather condition logs.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span> Interactive Leaflet GIS mapping
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span> Geo-verified inspection photos
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="card-gov p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-gov mb-2">
                Immutable CVC Audit Trail
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Every action, bid submission, dimension record, and approval carries a cryptographically logged user ID, timestamp, and IP signature.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span> 100% Central Vigilance audit ready
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span> Exportable CAG audit dossiers
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Impact Numbers / Counter Banner */}
      <section id="impact" className="py-14 bg-gradient-to-r from-govt-navy-dark via-govt-navy to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
              <div className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-amber-300 font-gov mb-1 whitespace-nowrap">
                ₹8,500+ Cr
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                Public Infrastructure Managed
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
              <div className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-400 font-gov mb-1 whitespace-nowrap">
                1,400+
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                Active Tenders & Civil Works
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
              <div className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-purple-300 font-gov mb-1 whitespace-nowrap">
                45d → 6d
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                Tender Cycle Reduction Time
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
              <div className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-cyan-300 font-gov mb-1 whitespace-nowrap">
                0%
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                Unaudited Disbursal Guarantee
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-14 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold text-govt-navy uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-gov mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Everything you need to know about implementing Constructor ERP in your department.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 bg-white hover:bg-slate-50 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-govt-navy' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 sm:p-5 pt-0 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-14 lg:py-20 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-gov leading-tight">
            Ready to Modernize Your Infrastructure Governance?
          </h2>
          <p className="text-sm sm:text-lg font-medium text-slate-900 max-w-2xl mx-auto">
            Experience how automated e-Tendering, digital Measurement Books, and multi-tier approval chains eliminate delays and guarantee 100% audit readiness.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-3 text-base"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              Launch Instant Demo
            </button>
            <Link
              to="/register-organization"
              className="w-full sm:w-auto px-8 py-4 bg-white/90 hover:bg-white text-slate-900 font-bold rounded-xl shadow transition-all duration-200 flex items-center justify-center gap-2 text-base"
            >
              Register Department
            </Link>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
            
            <div className="space-y-3 col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 text-white">
                <div className="w-9 h-9 rounded-lg bg-govt-navy flex items-center justify-center text-white font-bold">
                  <Building2 className="w-5 h-5 text-govt-saffron" />
                </div>
                <span className="text-base sm:text-lg font-bold font-gov">Constructor ERP & eTender System</span>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Public Works Department & Infrastructure Enterprise Solution. Built for end-to-end transparency, e-Tendering, Measurement Book digitisation, and CVC-compliant audit trails.
              </p>
              <div className="text-[11px] text-amber-400 font-medium">
                सत्यमेव जयते · Government Standard Digital Architecture
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#workflow" className="hover:text-white transition-colors">12-Stage Workflow</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">Department Roles</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features & Modules</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Member Sign In</Link></li>
                <li><Link to="/register-organization" className="hover:text-white transition-colors">Register Organization</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Compliance</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-slate-400">CVC Audit Certified</span></li>
                <li><span className="text-slate-400">ISO 27001 Data Security</span></li>
                <li><span className="text-slate-400">SSR Rate Book Integration</span></li>
                <li><span className="text-slate-400">Direct Treasury RTGS</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div>
              © 2026 Constructor ERP. Built for Government PWD & Infrastructure Departments.
            </div>
            <div className="flex gap-4">
              <span className="hover:text-slate-400">Terms of Service</span>
              <span className="hover:text-slate-400">Privacy Policy</span>
              <span className="hover:text-slate-400">Vigilance Portal</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Quick Demo Credentials Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-gov">Explore System Live Demo</h3>
                <p className="text-xs text-slate-500">Select any pre-configured role to log in instantly</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {demoUsers.map((u, i) => {
                const IconC = u.icon;
                return (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-govt-navy hover:bg-blue-50/50 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${u.color} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <IconC className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{u.role}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-normal hidden sm:inline">
                            {u.badge}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {u.email}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/login?email=${encodeURIComponent(u.email)}&pass=${encodeURIComponent(u.pass)}`}
                      onClick={() => setDemoModalOpen(false)}
                      className="btn-gov text-xs py-1.5 px-3 whitespace-nowrap shadow-sm hover:shadow"
                    >
                      Login as {u.role.split('(')[0]}
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Password for all demo accounts is <strong>pass@123</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal Overview */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 text-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-800 space-y-4">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                <Play className="w-5 h-5 fill-amber-300 ml-0.5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-gov text-white">Platform Video Overview</h3>
                <p className="text-xs text-slate-400">12-Stage Automated Civil Governance & eTendering Workflow</p>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex flex-col items-center justify-center p-6 text-center space-y-4 group">
              <div className="w-16 h-16 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 fill-slate-950 ml-1" />
              </div>
              <div>
                <div className="text-lg font-bold font-gov text-white">Interactive Demonstration Mode</div>
                <div className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Click 'Explore System Live Demo' to test all 12 stages live with pre-loaded demo accounts (JE, SDO, EE, CE, Contractor).
                </div>
              </div>
              <button
                onClick={() => { setVideoModalOpen(false); setDemoModalOpen(true); }}
                className="btn-gov px-6 py-2.5 text-sm"
              >
                Launch Live Demo Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

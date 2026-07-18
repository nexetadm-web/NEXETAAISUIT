import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Megaphone,
  Folder,
  Bookmark,
  Copy,
  Palette,
  Zap,
  Key,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  Database,
  Sun,
  Moon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronLeft,
  ChevronRight,
  Globe,
  Award,
  MessageSquare,
  Send,
  Paperclip,
  Mic,
  X,
  User,
  Briefcase,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Users,
  Clock,
  Play,
  FileText,
  ShoppingBag,
  TrendingUp,
  Activity,
  Check,
  Image,
  Video,
  Share2,
  Menu,
  PenTool,
  LayoutGrid
} from 'lucide-react';


// ================= MOCK DATASETS =================



const RECENT_ACTIVITIES = [
  { id: 1, title: 'Ad copy generated for Meta Conversions', description: 'Score: 9.8/10 CTR potential', time: '10 mins ago', type: 'ad' },
  { id: 2, title: 'Upscaled 4K Thumbnail rendered', description: 'Cyberpunk desk setup concept', time: '2 hours ago', type: 'image' },
  { id: 3, title: 'Video segment US-WEST node rendering', description: 'Progress: 85% completed', time: '4 hours ago', type: 'video' },
  { id: 4, title: 'SEO script hooks written', description: 'YouTube smartwatch campaign', time: '1 day ago', type: 'script' },
  { id: 5, title: 'Marketing captions optimized', description: 'Prorated for 10% keyword density', time: '2 days ago', type: 'caption' },
];

const PROMPTS_LIBRARY = [
  { id: 1, text: 'FB Conversions Headline watch campaign' },
  { id: 2, text: 'Instagram Carousel product render setup' },
  { id: 3, text: 'TikTok Hook 3-second retention watch intro' },
  { id: 4, text: 'Google Search Ads ad copy header high-intent' },
];

const MARKETING_INSIGHTS = {
  ctr: [
    { label: 'Mon', val: 70 }, { label: 'Tue', val: 65 }, { label: 'Wed', val: 80 },
    { label: 'Thu', val: 75 }, { label: 'Fri', val: 90 }, { label: 'Sat', val: 85 }, { label: 'Sun', val: 95 }
  ],
  credits: [
    { label: 'Mon', val: 50 }, { label: 'Tue', val: 75 }, { label: 'Wed', val: 40 },
    { label: 'Thu', val: 85 }, { label: 'Fri', val: 60 }, { label: 'Sat', val: 30 }, { label: 'Sun', val: 45 }
  ],
  activity: [
    { label: 'Mon', val: 85 }, { label: 'Tue', val: 70 }, { label: 'Wed', val: 95 },
    { label: 'Thu', val: 80 }, { label: 'Fri', val: 90 }, { label: 'Sat', val: 60 }, { label: 'Sun', val: 75 }
  ]
};

const MOTIVATIONAL_MESSAGES = [
  "Nexeta creative engines are operating at peak efficiency. You have saved 15 hours of manual work this week!",
  "Your smartwatch campaign CTR is pacing 24% higher than the industry average today.",
  "AI thumbnail assets generated this week show an average engagement rating of 9.2/10.",
  "SEO scripts created yesterday are fully indexed for digital marketing algorithms."
];

// ================= MAIN COMPONENT =================

export default function Dashboard() {
  // Theme state
  const [theme, setTheme] = useState('dark');
  
  // Sidebar & Navigation states
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState([
    { id: 1, name: 'Meta Conversions smartwatch Q3', type: 'AI Ad Creator', created: 'June 24, 2026', status: 'Completed', statusColor: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' },
    { id: 2, name: 'Vlog Intro SEO Hook Script', type: 'AI Script Writer', created: 'June 23, 2026', status: 'Draft', statusColor: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' },
    { id: 3, name: 'SaaS Platform Launch Promo', type: 'AI Video Generator', created: 'June 22, 2026', status: 'Processing', statusColor: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20' },
    { id: 4, name: 'Cyberpunk Desk Setup Thumbnail', type: 'AI Thumbnail Generator', created: 'June 18, 2026', status: 'Failed', statusColor: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20' },
    { id: 5, name: 'Brand Story Instagram Copy', type: 'AI Social Media', created: 'June 15, 2026', status: 'Completed', statusColor: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' },
  ]);
  
  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Chart Tabs state
  const [activeChartTab, setActiveChartTab] = useState('CTR');

  // Copied prompt states
  const [copiedPromptId, setCopiedPromptId] = useState(null);

  // Floating AI Assistant states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'assistant', text: 'Hello!\nI am your Nexeta AI Marketing Assistant.\nWhat would you like to create today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Motivational message
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set random motivational message
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
    setMotivationalMessage(MOTIVATIONAL_MESSAGES[randomIndex]);

    // Set formatted date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
  }, []);

  // Theme effect hook
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Copy prompt handler
  const handleCopyPrompt = (id, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 1500);
    });
  };

  // Create Project handler
  const handleCreateProject = (projectType, projectName) => {
    const newProj = {
      id: Date.now(),
      name: projectName || `New ${projectType} Campaign`,
      type: projectType,
      created: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: 'Processing',
      statusColor: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20'
    };
    setProjects(prev => [newProj, ...prev]);
    setIsNewProjectModalOpen(false);
  };

  // Chat message submit handler
  const handleSendChat = (text) => {
    if (!text.trim()) return;

    // 1. Add User bubble
    const newHistory = [...chatHistory, { sender: 'user', text }];
    setChatHistory(newHistory);
    setChatInput('');
    setIsTyping(true);

    // 2. Simulated Response delay (1.2 seconds)
    setTimeout(() => {
      setIsTyping(false);
      let reply = '';
      const query = text.toLowerCase().trim();

      if (query.includes('ad copy') || query.includes('facebook') || query.includes('fb')) {
        reply = "**AI-Optimized Facebook Ad Copy:**\n\n**Headline:** Stop Charging Every Night! 🔋\n**Text:** Meet the Nexeta Smartwatch. 14-day battery, HD AMOLED display, and built-in AI health metrics. Get 50% OFF today only!\n**CTA:** Shop Now (Link)";
      } else if (query.includes('youtube') || query.includes('script') || query.includes('hook')) {
        reply = "**Retention YouTube Hook Script:**\n\n*Visual: Zoom into smartwatch display*\n**VO:** '85% of people watch social videos on mute. But you didn't scroll past this. Here is the secret technology smartwatch brands are hiding from you...'";
      } else if (query.includes('keyword') || query.includes('seo') || query.includes('optimize')) {
        reply = "**Target Keyword Analysis:**\n\n1. `#minimalistwatch` (High Vol | CTR +24%)\n2. `fitness tracker AMOLED` (Intent: Buy | CPC: Low)\n3. `smartwatch battery life` (Comp: Low | CTR: 4.8%)";
      } else {
        reply = `I have received your prompt: **"${text}"**.\n\nOptimizing your creative deliverables. Select one of the quick actions or suggested prompts in the main panel for specific campaign copies or script generators!`;
      }

      setChatHistory(prev => [...prev, { sender: 'assistant', text: reply }]);
    }, 1200);
  };

  // Close dropdowns on window click
  useEffect(() => {
    const handleGlobalClick = () => {
      setShowNotifications(false);
      setShowProfile(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className={`min-h-screen font-sans flex relative overflow-x-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#0B0B0F] text-[#E5E7EB]' : 'bg-[#F3F4F6] text-[#111827]'
    }`}>
      
      {/* Background Glowing Orbs */}
      <div className="absolute top-[10%] left-[5%] w-[500px] height-[500px] rounded-full bg-[#3B82F6]/5 blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[10%] w-[600px] height-[600px] rounded-full bg-[#8B5CF6]/5 blur-[150px] pointer-events-none z-0" />

      {/* ================= SIDEBAR ================= */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 bottom-0 bg-[#15151D] border-r border-[#2A2A35] z-50 flex flex-col justify-between py-5 px-3 transition-all duration-300 md:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        isCollapsed ? 'md:w-[76px]' : 'md:w-[260px]'
      } w-[260px]`}>
        
        {/* Sidebar Logo */}
        <div>
          <div className={`flex items-center px-2 py-1 mb-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <a href="#" className="flex items-center gap-2 font-bold text-lg select-none">
              <div className="bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold shadow-lg shadow-[#3B82F6]/30">N</div>
              {!isCollapsed && (
                <span className="font-heading tracking-tight">
                  Nexeta <span className="font-light text-xs text-[#06B6D4] ml-0.5">AI</span>
                </span>
              )}
            </a>
          </div>

          {/* Sidebar Menu Items */}
          <nav aria-label="Sidebar navigation" className="space-y-1 overflow-y-auto max-h-[60vh] pr-1 scrollbar-thin">
            {[
              { name: 'Dashboard', icon: LayoutDashboard },
              { name: 'AI Chat', icon: MessageSquare },
              { name: 'AI Ad Creator', icon: Megaphone },
              { name: 'AI Tools', icon: LayoutGrid },
              { name: 'Projects', icon: Folder },
              { name: 'Templates', icon: Copy },
              { name: 'Prompt Library', icon: Bookmark },
              { name: 'Brand Kit', icon: Palette },
              { name: 'Automation', icon: Zap },
              { name: 'API Keys', icon: Key },
              { name: 'Billing', icon: CreditCard },
              { name: 'Settings', icon: Settings },
              { name: 'Help Center', icon: HelpCircle },
            ].map(item => {
              const IconComp = item.icon;
              const isActive = activeItem === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => { setActiveItem(item.name); setIsMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 border ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-[#00D2FF]/15 to-[#3B82F6]/15 border-[#00D2FF]/40 shadow-[0_0_15px_rgba(0,210,255,0.25)] font-semibold scale-[1.02]'
                      : 'text-[#9CA3AF] border-transparent hover:text-white hover:bg-white/5 hover:translate-x-1'
                  } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                  aria-label={item.name}
                >
                  <IconComp className="w-[18px] h-[18px] shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Collapse */}
        <div className="border-t border-[#2A2A35]/60 pt-4 space-y-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-all duration-200 justify-start"
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? <ChevronRight className="w-[18px] h-[18px] mx-auto" /> : (
              <>
                <ChevronLeft className="w-[18px] h-[18px] shrink-0" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => window.location.href = 'index.html'}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/5 transition-all duration-200 ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
            aria-label="Logout"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

      </aside>

      {/* ================= MAIN CONTAINER ================= */}
      <main className={`flex-1 transition-all duration-300 py-6 px-4 md:px-8 z-10 flex flex-col gap-6 ml-0 ${
        isCollapsed ? 'md:ml-[76px]' : 'md:ml-[260px]'
      }`}>
        
        {/* Top Header bar */}
        <header className="flex justify-between items-center border-b border-[#2A2A35]/60 pb-4 gap-4">
          
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 rounded-lg border border-[#2A2A35] text-[#9CA3AF] hover:text-white hover:bg-white/5 md:hidden shrink-0"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Search bar */}
          <div className="relative w-72 max-w-xs hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search assets, tools..."
              className="w-full pl-9 pr-4 py-1.5 bg-white/5 border border-[#2A2A35] rounded-full text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:bg-white/10 transition-all duration-200"
              aria-label="Global search bar"
            />
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-4 ml-auto sm:ml-0">
            
            {/* Credit widget badge */}
            <div className="flex items-center gap-2 bg-white/5 border border-[#2A2A35] px-3.5 py-1.5 rounded-full text-xs text-[#9CA3AF]">
              <Database className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>78,450 / 100,000 Credits</span>
              <span className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 font-bold px-1.5 py-0.5 rounded-full">PRO</span>
            </div>

            {/* New Project Button */}
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="bg-gradient-to-r from-[#3B82F6] via-[#00D2FF] to-[#8B5CF6] text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:scale-105 hover:shadow-[0_0_15px_rgba(0,210,255,0.4)] shadow-md shadow-[#3B82F6]/20 transition-all duration-200"
            >
              + New Project
            </button>

            {/* Upgrade CTA */}
            <button
              onClick={() => setActiveItem('Billing')}
              className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:scale-105 shadow-md shadow-[#3B82F6]/20 transition-all duration-200"
            >
              Upgrade
            </button>

            {/* Dark/Light mode toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 rounded-full border border-[#2A2A35] hover:bg-white/5 flex items-center justify-center transition-all duration-200 text-[#9CA3AF] hover:text-white"
              aria-label="Switch theme mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications panel dropdown trigger */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="w-8 h-8 rounded-full border border-[#2A2A35] hover:bg-white/5 flex items-center justify-center transition-all duration-200 text-[#9CA3AF] hover:text-white relative"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#15151D]" />
              </button>
              
              {showNotifications && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-10 w-72 bg-[#1B1B24] border border-[#2A2A35] rounded-xl p-3 shadow-xl z-50 text-left"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#2A2A35] pb-2 mb-2">Notifications</h4>
                  <div className="space-y-3 text-xs">
                    <div className="border-b border-[#2A2A35]/40 pb-2">
                      <span className="text-[#10B981] font-bold">✔ Campaign Optimized</span>
                      <p className="text-[#9CA3AF] mt-0.5">FB conversions copy for watch launch ready.</p>
                      <span className="text-gray-500 text-[10px] block mt-1">10 mins ago</span>
                    </div>
                    <div className="border-b border-[#2A2A35]/40 pb-2">
                      <span className="text-[#F59E0B] font-bold">⚠ Credits Limit</span>
                      <p className="text-[#9CA3AF] mt-0.5">Account has used 78% of allocated credits.</p>
                      <span className="text-gray-500 text-[10px] block mt-1">2 hours ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User profile dropdown trigger */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile); setShowNotifications(false); }}
                className="w-8 h-8 rounded-full overflow-hidden border border-[#2A2A35] cursor-pointer"
                aria-label="User account details"
              >
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop')` }}
                />
              </button>

              {showProfile && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-10 w-44 bg-[#1B1B24] border border-[#2A2A35] rounded-xl p-1.5 shadow-xl z-50 text-left text-xs"
                >
                  <button onClick={() => setActiveItem('Settings')} className="w-full text-left px-3 py-2 text-[#9CA3AF] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200">My Profile</button>
                  <button onClick={() => setActiveItem('Billing')} className="w-full text-left px-3 py-2 text-[#9CA3AF] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200">Billing details</button>
                  <button onClick={() => setActiveItem('Settings')} className="w-full text-left px-3 py-2 text-[#9CA3AF] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200">Settings</button>
                  <div className="border-t border-[#2A2A35] my-1" />
                  <button onClick={() => window.location.href = 'index.html'} className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-500/5 rounded-lg transition-all duration-200">Sign Out</button>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* ================= WELCOME SECTION ================= */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3" aria-label="Welcome headers">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-heading">Welcome back 👋</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">Let's create amazing marketing content today.</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#9CA3AF] font-semibold block">{currentDate}</span>
            <span className="text-[10px] text-[#06B6D4] font-medium bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-2 py-0.5 rounded-full mt-1.5 inline-block">
              {motivationalMessage}
            </span>
          </div>
        </section>

        {/* ================= OVERVIEW CARDS (6-Card Grid) ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4" aria-label="Quick metrics overview">
          {[
            { title: 'Credits Remaining', val: '78,450', indicator: 'Reset in 6d', icon: Database, trend: 'neutral' },
            { title: 'Projects Created', val: '142', indicator: '+12.4%', icon: Folder, trend: 'up' },
            { title: 'Ads Generated', val: '86', indicator: '+4.5%', icon: Megaphone, trend: 'up' },
            { title: 'Images Generated', val: '1,280', indicator: '+8.2%', icon: Image, trend: 'up' },
            { title: 'Videos Generated', val: '420', indicator: '+18.6%', icon: Video, trend: 'up' },
            { title: 'Hours Saved', val: '180 hrs', indicator: '+15 hrs', icon: Clock, trend: 'up' },
          ].map((card, idx) => {
            const IconComp = card.icon;
            return (
              <div 
                key={idx} 
                className="bg-[#1B1B24]/50 backdrop-blur-md border border-[#2A2A35] rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-black/30 hover:border-[#00D2FF]/50 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] hover:-translate-y-1.5 transition-all duration-300 ease-out"
              >
                <div className="flex justify-between items-center text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider">
                  <span>{card.title}</span>
                  <div className={`p-1.5 rounded-md ${
                    idx % 3 === 0 ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : idx % 3 === 1 ? 'bg-[#06B6D4]/10 text-[#06B6D4]' : 'bg-[#8B5CF6]/10 text-[#8B5CF6]'
                  }`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                </div>
                
                <div className="mt-3">
                  <span className="text-xl font-extrabold tracking-tight font-heading">{card.val}</span>
                  
                  <div className={`flex items-center gap-1 text-[10px] font-bold mt-1.5 ${
                    card.trend === 'up' ? 'text-[#10B981]' : card.trend === 'down' ? 'text-red-500' : 'text-[#9CA3AF]'
                  }`}>
                    {card.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                    {card.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                    {card.trend === 'neutral' && <Minus className="w-3 h-3" />}
                    <span>{card.indicator}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ================= SPLIT GRID LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-main-grid">
          
          {/* LEFT 2 COLUMNS PANEL (Quick Actions, Table, Activity Timeline) */}
          <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
            
            {/* Quick Actions Panel */}
            <div className="bg-[#1B1B24]/40 backdrop-blur-md border border-[#2A2A35] rounded-2xl p-5 shadow-xl shadow-black/20">
              <h3 className="text-sm font-extrabold font-heading text-white flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-[#3B82F6]" /> Quick Actions
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Create AI Ad', desc: 'Design high-converting Meta, Google and LinkedIn campaigns.', icon: Megaphone },
                  { name: 'Generate AI Image', desc: 'Produce ultra-realistic creative product display assets.', icon: Image },
                  { name: 'Generate AI Video', desc: 'Render cinematic promotion hooks on our neural node.', icon: Video },
                  { name: 'Write AI Script', desc: 'Draft hooks and body scripts optimized for YouTube and Tik Tok CTR.', icon: FileText },
                  { name: 'Create Social Post', desc: 'Generate multi-channel content matching brand kit parameters.', icon: Share2 },
                  { name: 'Marketing Strategy', desc: 'Forecast budget constraints, target keywords and timelines.', icon: TrendingUp },
                ].map((act, idx) => {
                  const IconComp = act.icon;
                  return (
                    <button 
                      key={idx}
                      onClick={() => handleCreateProject(act.name)}
                      className="bg-white/[0.015] border border-[#2A2A35] rounded-xl p-4 flex flex-col justify-between gap-3 text-left hover:bg-[#3B82F6]/5 hover:border-[#00D2FF] hover:shadow-[0_0_15px_rgba(0,210,255,0.15)] hover:scale-[1.03] transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-[#2A2A35] flex items-center justify-center text-[#9CA3AF] group-hover:bg-[#3B82F6] group-hover:border-[#3B82F6] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#3B82F6]/40 transition-all duration-200">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-[#00D2FF] transition-colors duration-200">{act.name}</h4>
                      </div>
                      <p className="text-[11px] text-[#9CA3AF] leading-relaxed line-clamp-2">{act.desc}</p>
                      
                      <div className="w-full py-1 bg-white/5 border border-[#2A2A35] text-center text-[10px] font-bold rounded-lg text-[#9CA3AF] group-hover:bg-[#00D2FF] group-hover:border-[#00D2FF] group-hover:text-black transition-all duration-200">
                        Launch Tool
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Projects Table Panel */}
            <div className="bg-[#1B1B24]/40 backdrop-blur-md border border-[#2A2A35] rounded-2xl p-5 shadow-xl shadow-black/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-extrabold font-heading text-white flex items-center gap-2">
                  <Folder className="w-4 h-4 text-[#8B5CF6]" /> Recent Projects
                </h3>
                <button onClick={() => setActiveItem('Projects')} className="text-xs font-bold text-[#3B82F6] hover:underline">View All</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#2A2A35]">
                      <th className="py-2.5 px-3 text-[#9CA3AF] font-bold uppercase tracking-wider text-[10px]">Project Name</th>
                      <th className="py-2.5 px-3 text-[#9CA3AF] font-bold uppercase tracking-wider text-[10px]">Type</th>
                      <th className="py-2.5 px-3 text-[#9CA3AF] font-bold uppercase tracking-wider text-[10px]">Created</th>
                      <th className="py-2.5 px-3 text-[#9CA3AF] font-bold uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 text-right text-[#9CA3AF] font-bold uppercase tracking-wider text-[10px]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(proj => (
                      <tr key={proj.id} className="border-b border-[#2A2A35]/60 hover:bg-white/[0.01] transition-colors duration-150">
                        <td className="py-3.5 px-3 font-semibold text-white">{proj.name}</td>
                        <td className="py-3.5 px-3 text-[#9CA3AF]">{proj.type}</td>
                        <td className="py-3.5 px-3 text-[#9CA3AF]">{proj.created}</td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${proj.statusColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-current ${proj.status === 'Processing' ? 'animate-pulse' : ''}`} />
                            {proj.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button className="bg-white/5 border border-[#2A2A35] hover:border-white/20 text-white font-bold px-3 py-1 rounded-lg text-[10px] transition-all duration-200">
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity Panel (Timeline Style) */}
            <div className="bg-[#1B1B24]/40 backdrop-blur-md border border-[#2A2A35] rounded-2xl p-5 shadow-xl shadow-black/20 flex-1 flex flex-col">
              <h3 className="text-sm font-extrabold font-heading text-white flex items-center gap-2 mb-5">
                <Activity className="w-4 h-4 text-[#06B6D4]" /> Recent Activity Timeline
              </h3>
              
              <div className="relative border-l border-[#2A2A35]/80 ml-3 pl-6 space-y-5 text-left">
                {RECENT_ACTIVITIES.map(act => (
                  <div key={act.id} className="relative group">
                    {/* Pulsing timeline dot */}
                    <div className="absolute -left-[30px] top-1 w-2 h-2 rounded-full bg-[#06B6D4] ring-4 ring-[#06B6D4]/10 group-hover:scale-125 transition-transform duration-200" />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-[#06B6D4] transition-colors duration-200">{act.title}</h4>
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">{act.description}</p>
                      </div>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 1 COLUMN PANEL (Usage analytics, productivity, upgrade CTA) */}
          <div className="flex flex-col gap-6 min-w-0">
            
            {/* Productivity Panel */}
            <div className="bg-[#1B1B24]/40 backdrop-blur-md border border-[#2A2A35] rounded-2xl p-5 shadow-xl shadow-black/20 text-left">
              <h3 className="text-sm font-extrabold font-heading text-white flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Productivity Panel
              </h3>
              
              <div className="space-y-4">
                {/* Today's Goal progress */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-white">Today's Generation Goal</span>
                    <span className="font-bold text-[#10B981]">14 / 20 Assets</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-[#2A2A35]">
                    <div className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full shadow-lg" style={{ width: '70%' }} />
                  </div>
                </div>

                <div className="border-t border-[#2A2A35]/60 pt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider block">Weekly Usage</span>
                    <span className="text-sm font-extrabold text-white mt-1 block">42.5 hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider block">Credits Used</span>
                    <span className="text-sm font-extrabold text-white mt-1 block">21,550</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider block">Avg Gen Time</span>
                    <span className="text-sm font-extrabold text-white mt-1 block">2.4 sec</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Analytics Charts */}
            <div className="bg-[#1B1B24]/40 backdrop-blur-md border border-[#2A2A35] rounded-2xl p-5 shadow-xl shadow-black/20 text-left">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-extrabold font-heading text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#3B82F6]" /> Usage Analytics
                </h3>
                
                {/* Tab switcher */}
                <div className="flex bg-[#21212D] p-0.5 rounded-lg border border-[#2A2A35]">
                  {['CTR', 'Credits', 'Activity'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveChartTab(tab)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        activeChartTab === tab ? 'bg-white/5 text-white border border-white/5' : 'text-[#9CA3AF]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Render Selected SVG Chart */}
              <div className="h-28 relative flex items-end justify-between pt-4">
                {activeChartTab === 'CTR' && (
                  <>
                    <div className="absolute top-0 left-0 text-[10px] text-[#9CA3AF]">Average campaign CTR: <span className="text-[#10B981] font-bold">+4.8% (Scale)</span></div>
                    {/* SVG Line Chart */}
                    <svg viewBox="0 0 300 90" className="w-full h-24 overflow-visible">
                      <path d="M 0 80 Q 50 50 100 60 T 200 25 T 300 5 L 300 90 L 0 90 Z" fill="url(#reactChartGrad)" opacity="0.3" />
                      <path d="M 0 80 Q 50 50 100 60 T 200 25 T 300 5" fill="none" stroke="#3B82F6" strokeWidth="2" />
                      <circle cx="300" cy="5" r="3.5" fill="#06B6D4" />
                      <defs>
                        <linearGradient id="reactChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </>
                )}
                {activeChartTab === 'Credits' && (
                  <>
                    <div className="absolute top-0 left-0 text-[10px] text-[#9CA3AF]">Peak daily usage: <span className="text-[#8B5CF6] font-bold">4,250 Credits</span></div>
                    {/* SVG Area Chart */}
                    <svg viewBox="0 0 300 90" className="w-full h-24 overflow-visible">
                      <path d="M 0 70 L 50 85 L 100 30 L 150 60 L 200 10 L 250 45 L 300 5 L 300 90 L 0 90 Z" fill="url(#reactPurpGrad)" opacity="0.3" />
                      <path d="M 0 70 L 50 85 L 100 30 L 150 60 L 200 10 L 250 45 L 300 5" fill="none" stroke="#8B5CF6" strokeWidth="2" />
                      <circle cx="300" cy="5" r="3.5" fill="#8B5CF6" />
                      <defs>
                        <linearGradient id="reactPurpGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </>
                )}
                {activeChartTab === 'Activity' && (
                  <>
                    <div className="absolute top-0 left-0 text-[10px] text-[#9CA3AF]">Generations activity: <span className="text-[#06B6D4] font-bold">+18.4% weekly</span></div>
                    {/* SVG Area Chart */}
                    <svg viewBox="0 0 300 90" className="w-full h-24 overflow-visible">
                      <path d="M 0 85 Q 75 65 150 35 T 300 25 L 300 90 L 0 90 Z" fill="url(#reactCyanGrad)" opacity="0.3" />
                      <path d="M 0 85 Q 75 65 150 35 T 300 25" fill="none" stroke="#06B6D4" strokeWidth="2" />
                      <circle cx="300" cy="25" r="3.5" fill="#06B6D4" />
                      <defs>
                        <linearGradient id="reactCyanGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06B6D4" />
                          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </>
                )}
              </div>
            </div>

            {/* Upgrade Banner Section */}
            <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 border border-[#3B82F6]/40 rounded-2xl p-5 text-center relative overflow-hidden shadow-xl shadow-black/10">
              <div className="absolute w-36 h-36 rounded-full bg-[#8B5CF6]/20 blur-2xl bottom-[-60px] right-[-60px] pointer-events-none" />
              <h3 className="text-base font-extrabold tracking-tight font-heading text-white">Unlock Premium Features</h3>
              <p className="text-[11px] text-[#9CA3AF] mt-1.5 max-w-[90%] mx-auto leading-relaxed">Upgrade to Nexeta Pro or Enterprise for dedicated high-volume API rendering slots.</p>
              <button 
                onClick={() => setActiveItem('Billing')}
                className="mt-4 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white text-xs font-semibold px-5 py-2 rounded-full hover:scale-105 shadow-md shadow-[#3B82F6]/30 transition-all duration-200"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Prompt Library Quick Copier */}
            <div className="bg-[#1B1B24]/40 backdrop-blur-md border border-[#2A2A35] rounded-2xl p-5 shadow-xl shadow-black/20 text-left flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-extrabold font-heading text-white flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#8B5CF6]" /> Prompt Library
                </h3>
                <button onClick={() => setActiveItem('Prompt Library')} className="text-xs font-bold text-[#3B82F6] hover:underline">Explore</button>
              </div>

              <div className="space-y-2">
                {PROMPTS_LIBRARY.map(prompt => {
                  const isCopied = copiedPromptId === prompt.id;
                  return (
                    <button
                      key={prompt.id}
                      onClick={() => handleCopyPrompt(prompt.id, prompt.text)}
                      className="w-full flex items-center justify-between gap-3 bg-white/[0.015] border border-[#2A2A35] rounded-xl p-3 text-left hover:bg-white/5 hover:border-[#3B82F6]/40 transition-all duration-200 group text-xs text-[#E5E7EB]"
                    >
                      <span className="truncate pr-2 font-medium">{prompt.text}</span>
                      <div className="shrink-0 text-[#9CA3AF] group-hover:text-[#3B82F6] transition-colors duration-150">
                        {isCopied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* ================= FLOATING AI ASSISTANT CHAT (BOTTOM RIGHT) ================= */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          
          {/* Expanded mini chatbox */}
          {chatOpen && (
            <div className="w-80 h-96 bg-[#1B1B24] border border-[#2A2A35] rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden mb-3 animate-fade-in text-left">
              
              {/* Chat Title header */}
              <div className="bg-[#15151D] border-b border-[#2A2A35] px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] animate-pulse" />
                  <span className="text-xs font-bold text-white">Ask Nexeta AI</span>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="text-[#9CA3AF] hover:text-white transition-colors duration-200"
                  aria-label="Close Assistant chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message bubbles history */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {chatHistory.map((chat, idx) => (
                  <div key={idx} className={`flex gap-2 text-xs ${chat.sender === 'user' ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      chat.sender === 'user' ? 'bg-[#06B6D4] text-white' : 'bg-[#3B82F6] text-white'
                    }`}>
                      {chat.sender === 'user' ? 'ME' : 'NX'}
                    </div>
                    <div className={`max-w-[75%] rounded-xl px-3 py-2 border leading-relaxed ${
                      chat.sender === 'user' 
                        ? 'bg-[#3B82F6]/10 border-[#3B82F6]/20 text-white' 
                        : 'bg-[#15151D]/80 border-[#2A2A35] text-[#E5E7EB]'
                    }`}>
                      {chat.text.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Typing dots */}
                {isTyping && (
                  <div className="flex gap-2 text-xs justify-start">
                    <div className="w-6 h-6 rounded-md bg-[#3B82F6] text-white flex items-center justify-center font-bold text-[10px]">NX</div>
                    <div className="bg-[#15151D]/80 border border-[#2A2A35] rounded-xl px-3 py-2.5">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: '200ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: '400ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestion Chips */}
              <div className="px-3 py-2 bg-[#15151D]/60 border-t border-[#2A2A35]/40 flex gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
                {[
                  { name: 'Create Facebook Ad', prompt: 'Create a high-converting Facebook Ad copy for ' },
                  { name: 'Instagram Caption', prompt: 'Write an engaging Instagram Caption for ' },
                  { name: 'Generate YouTube Script', prompt: 'Write a high-CTR retention YouTube Script for ' },
                  { name: 'SEO Blog', prompt: 'Draft a 1000-word SEO optimized Blog post about ' },
                  { name: 'Google Ads Copy', prompt: 'Write Google Search Ads copies for ' },
                  { name: 'Product Description', prompt: 'Draft a premium e-commerce Product Description for ' },
                  { name: 'Generate Hashtags', prompt: 'Generate trending hashtags for ' },
                  { name: 'Email Campaign', prompt: 'Write a persuasive email marketing Campaign for ' },
                ].map(chip => (
                  <button
                    key={chip.name}
                    onClick={() => setChatInput(chip.prompt)}
                    className="px-2.5 py-1 text-[10px] font-semibold bg-white/5 border border-[#2A2A35]/60 hover:border-[#00D2FF] hover:bg-[#3B82F6]/10 text-[#9CA3AF] hover:text-white rounded-full transition-all duration-200"
                  >
                    {chip.name}
                  </button>
                ))}
              </div>

              {/* Chat input controls */}
              <div className="p-3 bg-[#15151D] border-t border-[#2A2A35] flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Need help? Ask Nexeta AI..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat(chatInput)}
                  className="flex-1 bg-white/5 border border-[#2A2A35] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6]"
                  aria-label="AI prompt helper input"
                />
                <button
                  onClick={() => handleSendChat(chatInput)}
                  className="p-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition-colors duration-150"
                  aria-label="Submit helper prompt"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* Launcher floating button */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:scale-105 text-white font-semibold px-4 py-3 rounded-full shadow-2xl shadow-[#3B82F6]/30 transition-all duration-200"
            aria-label="Toggle AI Help assistant"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Need help? Ask Nexeta AI</span>
          </button>

        </div>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-[#2A2A35]/60 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#9CA3AF]">
          <div>&copy; 2026 Nexeta AI Marketing Suite. All rights reserved.</div>
          <div className="flex flex-wrap justify-center gap-5">
            <a href="index.html#features" className="hover:text-white transition-colors">Documentation</a>
            <a href="#api" className="hover:text-white transition-colors">API Docs</a>
            <a href="#tutorials" className="hover:text-white transition-colors">Tutorials</a>
            <a href="#community" className="hover:text-white transition-colors">Community</a>
            <a href="#support" className="hover:text-white transition-colors">Support</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </footer>

        {/* ================= CREATE NEW PROJECT MODAL ================= */}
        {isNewProjectModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#15151D] border border-[#2A2A35] w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-left animate-in fade-in zoom-in-95 duration-200">
              {/* Close button */}
              <button 
                onClick={() => setIsNewProjectModalOpen(false)}
                className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-colors duration-150"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-extrabold font-heading text-white tracking-tight">Create New AI Project</h2>
                <p className="text-xs text-[#9CA3AF] mt-1">Select an AI workflow engine below to initialize your creative digital assets.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: '📢 AI Advertisement', type: 'AI Ad Creator', icon: Megaphone },
                  { name: '🖼 AI Image', type: 'AI Image Generator', icon: Image },
                  { name: '🎥 AI Video', type: 'AI Video Generator', icon: Video },
                  { name: '✍ AI Script', type: 'AI Script Writer', icon: FileText },
                  { name: '📱 Social Media Post', type: 'AI Social Media', icon: Share2 },
                  { name: '🎬 Thumbnail Generator', type: 'AI Thumbnail Generator', icon: Play },
                  { name: '📝 Blog Writer', type: 'AI Blog Writer', icon: PenTool },
                  { name: '📈 Marketing Strategy', type: 'Marketing Strategy', icon: TrendingUp },
                ].map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.name}
                      onClick={() => handleCreateProject(opt.type)}
                      className="flex items-center gap-3 bg-white/[0.015] border border-[#2A2A35] hover:bg-[#3B82F6]/5 hover:border-[#00D2FF] p-3.5 rounded-xl text-left transition-all duration-300 group hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(0,210,255,0.1)]"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/5 border border-[#2A2A35] flex items-center justify-center text-[#9CA3AF] group-hover:bg-[#3B82F6] group-hover:border-[#3B82F6] group-hover:text-white transition-all duration-200">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-[#00D2FF] transition-colors duration-200">
                          {opt.name}
                        </div>
                        <div className="text-[10px] text-[#9CA3AF] mt-0.5">Initialize engine</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

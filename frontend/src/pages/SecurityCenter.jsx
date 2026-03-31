import React, { useState } from "react";

const SecurityCenter = () => {
  // State for circuit breaker toggles
  const [breakers, setBreakers] = useState({
    aave: true,
    uniswap: true,
    ondo: false,
  });

  // State for search input
  const [searchTerm, setSearchTerm] = useState("");

  const toggleBreaker = (protocol) => {
    setBreakers((prev) => ({ ...prev, [protocol]: !prev[protocol] }));
  };

  // Handler for emergency withdrawal
  const handleEmergencyWithdrawal = () => {
    if (window.confirm("⚠️ EMERGENCY WITHDRAWAL\n\nThis action is irreversible and will move all funds to the recovery address after a 48h timelock. Are you absolutely sure?")) {
      alert("Emergency withdrawal initiated. Protocol shards paused. 48h countdown started.");
    }
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 border-r border-neutral-800/30 bg-neutral-900 dark:bg-surface-container-low flex flex-col py-6 space-y-4 z-50">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
              <span
                className="material-symbols-outlined text-on-primary text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                security
              </span>
            </div>
            <div>
              <h1 className="text-lg font-black text-primary font-headline tracking-tighter uppercase">
                Janus Protocol
              </h1>
              <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                Secure Layer v2.4
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-neutral-300 transition-colors font-mono text-sm group"
          >
            <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">
              grid_view
            </span>
            <span>Dashboard</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent text-primary border-l-4 border-primary font-mono text-sm"
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
            <span>Security Center</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-neutral-300 transition-colors font-mono text-sm group"
          >
            <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">
              lock
            </span>
            <span>Vaults</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-neutral-300 transition-colors font-mono text-sm group"
          >
            <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">
              list_alt
            </span>
            <span>Audit Logs</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-neutral-300 transition-colors font-mono text-sm group"
          >
            <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">
              tune
            </span>
            <span>Settings</span>
          </a>
        </nav>
        <div className="px-6 py-4">
          <button className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-mono text-xs font-bold py-3 px-4 rounded-sm hover:shadow-[0_0_15px_rgba(68,237,183,0.3)] transition-all active:scale-95 uppercase tracking-tighter">
            Generate ZK-Proof
          </button>
        </div>
        <div className="px-3 border-t border-outline-variant/10 pt-4">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2 text-neutral-500 hover:text-neutral-300 transition-colors font-mono text-xs"
          >
            <span className="material-symbols-outlined text-lg">menu_book</span>
            <span>Documentation</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2 text-neutral-500 hover:text-neutral-300 transition-colors font-mono text-xs"
          >
            <span className="material-symbols-outlined text-lg">help_outline</span>
            <span>Support</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen flex flex-col">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 left-64 h-16 bg-neutral-900/80 dark:bg-background/80 backdrop-blur-xl z-40 shadow-[0_0_15px_rgba(0,208,156,0.1)]">
          <div className="flex justify-between items-center px-8 h-full w-full max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-8">
              <nav className="flex gap-6">
                <a href="#" className="text-neutral-400 hover:text-neutral-200 font-headline tracking-tight text-sm">
                  Network
                </a>
                <a href="#" className="text-neutral-400 hover:text-neutral-200 font-headline tracking-tight text-sm">
                  Staking
                </a>
                <a href="#" className="text-neutral-400 hover:text-neutral-200 font-headline tracking-tight text-sm">
                  Governance
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">
                  search
                </span>
                <input
                  type="text"
                  className="bg-surface-container-lowest border-none text-xs rounded-sm py-2 pl-9 pr-4 w-64 focus:ring-1 focus:ring-primary/40 transition-all text-on-surface placeholder:text-on-surface-variant/50"
                  placeholder="Search protocol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-2 text-neutral-400 hover:bg-neutral-800/50 rounded-sm transition-all active:scale-95">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-2 text-neutral-400 hover:bg-neutral-800/50 rounded-sm transition-all active:scale-95">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 bg-surface-container-highest">
                <img
                  alt="User profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWqyiLImAPpCRv9P_y_7kFc9YORkjRCm_e4lnGBtMiQJcwbRsZccMB5dVC9JBI5OX9yMM02t-LBdTVLoBP4uq_9v9gfRY8pmTWAVthwT0N_wU2gNXaOwtkob3C8Dy8Z453SerJAot7VYO4yZDUtgJ5dZyQo8T2-k7RKpqvMwy3Gzc0shtIESbaXYne7BrkMAzENAUeChoTR-MPuiiX7W5jefkJcCN7UjFxlDu_EPAV2ldS008A-Tqw3jvyBHjBDptYJdyDj7sr-oM"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-24 px-12 pb-20 max-w-7xl w-full mx-auto space-y-12">
          {/* Section 1: Header */}
          <section className="space-y-2">
            <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface font-headline uppercase italic">
              Security Center
            </h2>
            <p className="text-on-surface-variant max-w-2xl text-lg font-light leading-relaxed">
              Monitor key shard health and adjust protocol circuit breakers. Ensure real-time
              cryptographic integrity across all network layers.
            </p>
          </section>

          {/* Section 2: Shard Status (Asymmetric Bento Grid) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card A: AI Agent Shard */}
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-sm p-6 hover:shadow-[0_0_20px_rgba(68,237,183,0.1)] transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-9xl">smart_toy</span>
              </div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center border border-primary/20">
                    <span className="material-symbols-outlined text-primary text-2xl">smart_toy</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-xl uppercase tracking-tight">
                      AI Agent Shard
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      <span className="text-[10px] font-mono text-primary uppercase tracking-widest">
                        Active &amp; Encrypted
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-1 rounded-sm border border-primary/20">
                  v3.1.2
                </span>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/5">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider">
                    Last Rotation
                  </span>
                  <span className="font-mono text-sm">2023-11-24 14:22:10 UTC</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/5">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider">
                    Entropy Source
                  </span>
                  <span className="font-mono text-sm">Quantum-Hardened Seed</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider">
                    Public Shard Hash
                  </span>
                  <span className="font-mono text-xs text-primary/80">0x88f2...7c22</span>
                </div>
              </div>
              <button className="w-full bg-surface-container-highest hover:bg-primary hover:text-on-primary transition-all py-3 font-mono text-xs uppercase font-bold tracking-widest">
                Rotate Shard Key
              </button>
            </div>

            {/* Card B: Ika Network Shard */}
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-sm p-6 hover:shadow-[0_0_20px_rgba(68,237,183,0.1)] transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-9xl">hub</span>
              </div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-sm flex items-center justify-center border border-secondary/20">
                    <span className="material-symbols-outlined text-secondary text-2xl">hub</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-xl uppercase tracking-tight">
                      Ika Network Shard
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      <span className="text-[10px] font-mono text-primary uppercase tracking-widest">
                        Synced Layer
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-secondary/10 text-secondary px-2 py-1 rounded-sm border border-secondary/20">
                  Mainnet
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="recessed-area p-4 rounded-sm">
                  <p className="text-[10px] text-on-surface-variant uppercase mb-1">Active Nodes</p>
                  <p className="font-mono text-2xl font-bold text-secondary">
                    102<span className="text-sm text-on-surface-variant">/120</span>
                  </p>
                </div>
                <div className="recessed-area p-4 rounded-sm">
                  <p className="text-[10px] text-on-surface-variant uppercase mb-1">Threshold</p>
                  <p className="font-mono text-2xl font-bold text-secondary">2-of-2</p>
                </div>
              </div>
              <button className="w-full bg-surface-container-highest hover:bg-secondary hover:text-on-secondary transition-all py-3 font-mono text-xs uppercase font-bold tracking-widest">
                View Network Nodes
              </button>
            </div>
          </section>

          {/* Section 3: Circuit Breakers (Modern Data Grid) */}
          <section className="bg-surface-container rounded-sm border border-outline-variant/5 overflow-hidden">
            <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/5 bg-surface-container-high/30">
              <div>
                <h3 className="text-xl font-headline font-bold uppercase tracking-tight">
                  Circuit Breakers
                </h3>
                <p className="text-xs text-on-surface-variant uppercase mt-1 tracking-widest">
                  Monitored Liquidity Protocols
                </p>
              </div>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/20 text-xs font-mono uppercase hover:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined text-sm">add</span> Add Protocol
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-error-container/20 text-error border border-error/30 text-xs font-mono uppercase hover:bg-error/10 transition-colors">
                  <span className="material-symbols-outlined text-sm">warning</span> Test Breaker
                </button>
              </div>
            </div>
            <div className="divide-y divide-outline-variant/5">
              {/* Protocol Row 1 - Aave */}
              <div className="grid grid-cols-12 items-center px-8 py-6 hover:bg-surface-container-high/50 transition-all group">
                <div className="col-span-3 flex items-center gap-4">
                  <img
                    alt="Aave logo"
                    className="w-10 h-10 rounded-sm"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1hj3XhwP2IIxMT7OX2BcwV1p8hhylSyE7I_fV71CS7jzHoo9BrdAKLQcmpoP47v4MwPvymOgaq6K9vvYy00bJhpkbzxbGYeio2KEZNmlcdeQriGgIY6aTChLpoq1zA_sN1Nj1C7B9edN7Gl37jg0zQmjky5hCEeSDO2CsP1PFoq1XWbLooapt1RemZ26kYzZPhLJ7hC_O3vQwbpCujbnnd7bw2WoSlr1qQw0G1b4WosCX8IVSZ6gNHdim8dVb5q_4Qkl3yUUnzXo"
                  />
                  <div>
                    <p className="font-headline font-bold text-lg">Aave V3</p>
                    <p className="text-[10px] font-mono text-on-surface-variant">Mainnet Deployment</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                      Status
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-10 h-5 rounded-full relative cursor-pointer ${
                          breakers.aave ? "bg-primary/20" : "bg-surface-container-highest border border-outline-variant/20"
                        }`}
                        onClick={() => toggleBreaker("aave")}
                      >
                        <div
                          className={`absolute top-1 w-3 h-3 bg-primary rounded-full transition-all shadow-[0_0_8px_rgba(68,237,183,0.5)] ${
                            breakers.aave ? "right-1" : "left-1"
                          }`}
                        ></div>
                      </div>
                      <span
                        className={`text-xs font-mono uppercase ${
                          breakers.aave ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {breakers.aave ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                      Alert Source
                    </span>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-surface-container-highest border border-outline-variant/20 rounded-sm">
                        Chainlink VRF
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-surface-container-highest border border-outline-variant/20 rounded-sm">
                        Custom Oracle
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                    Last Triggered
                  </p>
                  <p className="font-mono text-sm">NEVER</p>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button className="text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
              </div>

              {/* Protocol Row 2 - Uniswap */}
              <div className="grid grid-cols-12 items-center px-8 py-6 hover:bg-surface-container-high/50 transition-all group">
                <div className="col-span-3 flex items-center gap-4">
                  <img
                    alt="Uniswap logo"
                    className="w-10 h-10 rounded-sm"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyzGETn2097ZuckquDob18ZpfoI6y5pWguZQwOtis1FCVO5HKl7vf6CKVPtBtygWUJOxdIBUZoegIjXHYLGsefBIJ9M3zUj6LADsv4UkOCadQOfu9mCvLi63BgWsx7tBYRk08prdjEUmiV_x435tujvInn4HOfSQURBKWPoMvo4GNvADXbGuSi17cmJ6qW60fpxnAnMCW6XfmRj90U_WosynjRYSbowIX-lKe_gTYqv_SFg_6LSSGV-n7QFFVZlFl9U18lzB2rhbE"
                  />
                  <div>
                    <p className="font-headline font-bold text-lg">Uniswap V3</p>
                    <p className="text-[10px] font-mono text-on-surface-variant">L2 Aggregator</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                      Status
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-10 h-5 rounded-full relative cursor-pointer ${
                          breakers.uniswap ? "bg-primary/20" : "bg-surface-container-highest border border-outline-variant/20"
                        }`}
                        onClick={() => toggleBreaker("uniswap")}
                      >
                        <div
                          className={`absolute top-1 w-3 h-3 bg-primary rounded-full transition-all ${
                            breakers.uniswap ? "right-1" : "left-1"
                          }`}
                        ></div>
                      </div>
                      <span
                        className={`text-xs font-mono uppercase ${
                          breakers.uniswap ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {breakers.uniswap ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                      Alert Source
                    </span>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-surface-container-highest border border-outline-variant/20 rounded-sm">
                        The Graph
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                    Last Triggered
                  </p>
                  <p className="font-mono text-sm">12D AGO</p>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button className="text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
              </div>

              {/* Protocol Row 3 - Ondo */}
              <div className="grid grid-cols-12 items-center px-8 py-6 hover:bg-surface-container-high/50 transition-all group border-b border-outline-variant/5">
                <div className="col-span-3 flex items-center gap-4">
                  <img
                    alt="Ondo logo"
                    className="w-10 h-10 rounded-sm"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDSeWDjfF3UWbMop8n2MLAm4n8TPDmrS0PYO9Hi8YJ1D9BDLS4JOsQcb9vkMNIIJyjXjkn7IX5SMj93HrmLaUxcBuY8XaCgSD2U6rkmRr1ZXlGMFtUYCEdDbYU9i7FPXPEFxqZZt0Z8cX64A1i7yaIHGAwwQUnN12RlIn4jx90pNRUPkIkStj5lBdU5AnfeBIjH6KsHWQfdabQsu9c2pwrG-WdWRldoSjxP8TH_yxpS05HnA5sUTzt7ehg5EPtrXF-EVuRW57Afio"
                  />
                  <div>
                    <p className="font-headline font-bold text-lg">Ondo Finance</p>
                    <p className="text-[10px] font-mono text-on-surface-variant">RWA Vaults</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                      Status
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-10 h-5 rounded-full relative cursor-pointer ${
                          breakers.ondo ? "bg-primary/20" : "bg-surface-container-highest border border-outline-variant/20"
                        }`}
                        onClick={() => toggleBreaker("ondo")}
                      >
                        <div
                          className={`absolute top-1 w-3 h-3 bg-primary rounded-full transition-all ${
                            breakers.ondo ? "right-1" : "left-1"
                          }`}
                        ></div>
                      </div>
                      <span
                        className={`text-xs font-mono uppercase ${
                          breakers.ondo ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {breakers.ondo ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                      Alert Source
                    </span>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-surface-container-highest border border-outline-variant/20 rounded-sm">
                        Sentinel Nodes
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                    Last Triggered
                  </p>
                  <p className="font-mono text-sm">2H AGO (TEST)</p>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button className="text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Row: Sentiment and Emergency (Asymmetric) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Social Sentiment Feed */}
            <div className="lg:col-span-1 bg-surface-container-low border border-outline-variant/10 rounded-sm p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-6">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  rss_feed
                </span>
                <h3 className="font-headline font-bold uppercase tracking-tight text-sm">
                  Sentiment Intelligence
                </h3>
              </div>
              <div className="flex-1 space-y-4">
                <div className="p-3 bg-surface-container rounded-sm border-l-2 border-primary/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono text-primary uppercase">
                      Discord Monitor
                    </span>
                    <span className="text-[9px] text-on-surface-variant uppercase">3m ago</span>
                  </div>
                  <p className="text-xs text-on-surface leading-snug italic">
                    "Spike in @JanusProtocol mentions regarding vault withdrawal latency. Investigate status."
                  </p>
                </div>
                <div className="p-3 bg-surface-container rounded-sm border-l-2 border-tertiary/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono text-tertiary uppercase">
                      Twitter API
                    </span>
                    <span className="text-[9px] text-on-surface-variant uppercase">14m ago</span>
                  </div>
                  <p className="text-xs text-on-surface leading-snug italic">
                    "Speculation on governance vote #21 passing without shard rotation. Sentiment: Mixed."
                  </p>
                </div>
                <div className="p-3 bg-surface-container rounded-sm border-l-2 border-outline-variant/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase">
                      Telegram Scraper
                    </span>
                    <span className="text-[9px] text-on-surface-variant uppercase">1h ago</span>
                  </div>
                  <p className="text-xs text-on-surface leading-snug italic">
                    "Quiet night. No major whale movement detected in bridge contracts."
                  </p>
                </div>
              </div>
              <button className="mt-6 text-[10px] font-mono text-primary uppercase text-center hover:underline">
                Connect Advanced Feed
              </button>
            </div>

            {/* Emergency Controls */}
            <div className="lg:col-span-2 bg-surface-container-low border border-error/20 rounded-sm p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-error/5 to-transparent pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-error/10 border border-error/30 rounded-sm">
                  <span className="material-symbols-outlined text-error text-3xl">emergency_home</span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-2xl uppercase tracking-tighter text-error italic">
                    Emergency Protocol
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest">
                    Fail-safe withdrawal mechanism
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 block">
                      Masked Recovery Address
                    </label>
                    <div className="flex items-center gap-2 p-3 recessed-area rounded-sm border border-outline-variant/10">
                      <span className="font-mono text-sm text-on-surface">0x6e8f••••••••••••7a2b</span>
                      <button className="ml-auto text-primary hover:text-primary-fixed transition-colors">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 border border-outline-variant/10 rounded-sm bg-surface-container/30">
                    <span className="material-symbols-outlined text-tertiary">schedule</span>
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                        Withdrawal Timelock
                      </p>
                      <p className="font-mono text-lg font-bold">48 Hours</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-4">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Activating the emergency withdrawal will immediately pause all protocol shards
                    and start a 48h countdown to move all funds to the secure recovery address.{" "}
                    <span className="text-error font-bold italic">
                      This action cannot be reversed without 3-of-4 multisig.
                    </span>
                  </p>
                  <button
                    onClick={handleEmergencyWithdrawal}
                    className="group w-full bg-error text-on-error font-mono text-sm font-black py-4 px-6 rounded-sm hover:bg-error-container transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,77,77,0.3)] hover:shadow-[0_0_25px_rgba(255,77,77,0.5)]"
                  >
                    <span className="material-symbols-outlined group-hover:scale-125 transition-transform">
                      bolt
                    </span>
                    TRIGGER EMERGENCY WITHDRAWAL
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Contextual FAB */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 rounded-sm bg-primary text-on-primary shadow-[0_10px_30px_rgba(0,208,156,0.4)] hover:shadow-[0_10px_40px_rgba(0,208,156,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center group active:scale-95">
          <span className="material-symbols-outlined text-2xl group-hover:rotate-180 transition-transform duration-500">
            security_update_good
          </span>
        </button>
      </div>
    </div>
  );
};

export default SecurityCenter;
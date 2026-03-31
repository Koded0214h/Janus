import React, { useState } from "react";

const Policies = () => {
  // State for tabs
  const [activeTab, setActiveTab] = useState("active");

  // State for toggles (active policies)
  const [policyToggles, setPolicyToggles] = useState({
    yield: true,
    rebalance: true,
    emergency: false,
  });

  // Function to toggle policy
  const togglePolicy = (policy) => {
    setPolicyToggles((prev) => ({ ...prev, [policy]: !prev[policy] }));
  };

  // State for new policy form
  const [policyIntent, setPolicyIntent] = useState("");
  const [securityLevel, setSecurityLevel] = useState("Standard Execution");
  const [priority, setPriority] = useState("Medium (12s)");

  return (
    <div className="bg-background text-on-surface font-body overflow-x-hidden selection:bg-primary/30">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-50 bg-background border-r border-outline-variant/15 p-4">
        <div className="flex flex-col gap-1 mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-container rounded-sm flex items-center justify-center">
              <span
                className="material-symbols-outlined text-on-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                security
              </span>
            </div>
            <div>
              <h1 className="font-black text-primary text-lg leading-none uppercase tracking-tighter">
                Janus Protocol
              </h1>
              <p className="font-['JetBrains_Mono'] text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                v1.0.4-encrypted
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-300 group text-on-surface-variant opacity-70 hover:bg-surface-container-low hover:opacity-100"
          >
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span className="font-['JetBrains_Mono'] text-sm uppercase tracking-widest">
              Dashboard
            </span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-300 group text-on-surface-variant opacity-70 hover:bg-surface-container-low hover:opacity-100"
          >
            <span className="material-symbols-outlined text-xl">smart_toy</span>
            <span className="font-['JetBrains_Mono'] text-sm uppercase tracking-widest">
              AI Agent
            </span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-300 group bg-surface-container text-primary shadow-[0_0_10px_rgba(0,208,156,0.2)] border-r-2 border-primary"
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              policy
            </span>
            <span className="font-['JetBrains_Mono'] text-sm uppercase tracking-widest">
              Policies
            </span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-300 group text-on-surface-variant opacity-70 hover:bg-surface-container-low hover:opacity-100"
          >
            <span className="material-symbols-outlined text-xl">history</span>
            <span className="font-['JetBrains_Mono'] text-sm uppercase tracking-widest">
              Activity
            </span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-300 group text-on-surface-variant opacity-70 hover:bg-surface-container-low hover:opacity-100"
          >
            <span className="material-symbols-outlined text-xl">security</span>
            <span className="font-['JetBrains_Mono'] text-sm uppercase tracking-widest">
              Security Center
            </span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-300 group text-on-surface-variant opacity-70 hover:bg-surface-container-low hover:opacity-100"
          >
            <span className="material-symbols-outlined text-xl">verified_user</span>
            <span className="font-['JetBrains_Mono'] text-sm uppercase tracking-widest">
              ZK Passport
            </span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-300 group text-on-surface-variant opacity-70 hover:bg-surface-container-low hover:opacity-100 mt-auto"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="font-['JetBrains_Mono'] text-sm uppercase tracking-widest">
              Settings
            </span>
          </a>
        </nav>
        <div className="mt-6 pt-6 border-t border-outline-variant/15">
          <button className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 py-3 rounded-sm font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-95">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            New Intent
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-64 min-h-screen">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 py-3 w-full border-b border-outline-variant/15 shadow-[0_0_15px_rgba(0,208,156,0.1)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-sm border border-outline-variant/10">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-mono text-[10px] uppercase tracking-tighter text-on-surface-variant">
                Mainnet Online
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 mr-4">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                  Total Safeguarded
                </p>
                <p className="font-mono text-primary text-sm font-bold">$1,240,492.12</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="flex items-center gap-2 bg-surface-container border border-outline-variant/20 px-4 py-2 rounded-sm text-primary font-bold text-xs uppercase tracking-widest hover:bg-surface-container-high transition-all active:scale-95">
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  account_balance_wallet
                </span>
                0x44ed...db7
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-10">
            <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2 uppercase">
              Policies
            </h2>
            <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
              Define the granular rules your AI agent must follow. Policies act as the immutable
              constraints for automated capital movement and protocol interactions.
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center gap-8 mb-8 border-b border-outline-variant/10">
            <button
              onClick={() => setActiveTab("active")}
              className={`pb-4 font-bold uppercase tracking-widest text-sm ${
                activeTab === "active"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface transition-colors"
              }`}
            >
              Active Policies
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`pb-4 font-bold uppercase tracking-widest text-sm ${
                activeTab === "templates"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface transition-colors"
              }`}
            >
              Policy Templates
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`pb-4 font-bold uppercase tracking-widest text-sm flex items-center gap-2 ${
                activeTab === "create"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface transition-colors"
              }`}
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Create New
            </button>
          </div>

          {/* Active Policies Tab */}
          {activeTab === "active" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {/* Card 1 */}
              <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/10 hover:border-primary/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl">payments</span>
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 rounded-sm">
                    <span className="material-symbols-outlined text-primary">trending_up</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors text-sm">
                      edit
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-error transition-colors text-sm">
                      delete
                    </span>
                    <div
                      className={`w-10 h-5 rounded-full relative cursor-pointer shadow-[0_0_8px_rgba(68,237,183,0.4)] ${
                        policyToggles.yield ? "bg-primary" : "bg-surface-container-highest"
                      }`}
                      onClick={() => togglePolicy("yield")}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                          policyToggles.yield ? "right-0.5" : "left-0.5"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2 uppercase tracking-tight">
                  Auto-yield on idle USDC
                </h3>
                <p className="text-sm text-on-surface-variant mb-6 font-mono bg-surface-container-lowest p-3 rounded-sm leading-relaxed">
                  If <span className="text-primary">USDC balance &gt; $500</span> -&gt; deposit into{" "}
                  <span className="text-primary">Ondo (&gt;=4.5% APY)</span>
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                  <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                    Execution Count
                  </div>
                  <div className="font-mono text-primary text-sm font-bold">12 times</div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/10 hover:border-primary/30 transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 rounded-sm">
                    <span className="material-symbols-outlined text-primary">balance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors text-sm">
                      edit
                    </span>
                    <div
                      className={`w-10 h-5 rounded-full relative cursor-pointer shadow-[0_0_8px_rgba(68,237,183,0.4)] ${
                        policyToggles.rebalance ? "bg-primary" : "bg-surface-container-highest"
                      }`}
                      onClick={() => togglePolicy("rebalance")}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                          policyToggles.rebalance ? "right-0.5" : "left-0.5"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2 uppercase tracking-tight">
                  Rebalance portfolio when BTC &gt; 55%
                </h3>
                <p className="text-sm text-on-surface-variant mb-6 font-mono bg-surface-container-lowest p-3 rounded-sm leading-relaxed">
                  Ratio <span className="text-primary">BTC/Total &gt; 0.55</span> -&gt; swap{" "}
                  <span className="text-primary">excess BTC</span> for{" "}
                  <span className="text-primary">ETH</span>
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                  <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                    Execution Count
                  </div>
                  <div className="font-mono text-primary text-sm font-bold">3 times</div>
                </div>
              </div>

              {/* Card 3 */}
              <div
                className={`bg-surface-container-low p-6 rounded-sm border border-outline-variant/10 hover:border-error/30 transition-all group relative ${
                  !policyToggles.emergency ? "opacity-60 grayscale-[0.5]" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-error/10 rounded-sm">
                    <span className="material-symbols-outlined text-error">gpp_maybe</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-error transition-colors text-sm">
                      delete
                    </span>
                    <div
                      className={`w-10 h-5 rounded-full relative cursor-pointer ${
                        policyToggles.emergency ? "bg-primary" : "bg-surface-container-highest"
                      }`}
                      onClick={() => togglePolicy("emergency")}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                          policyToggles.emergency ? "right-0.5" : "left-0.5"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2 uppercase tracking-tight">
                  Emergency Protocol Exit
                </h3>
                <p className="text-sm text-on-surface-variant mb-6 font-mono bg-surface-container-lowest p-3 rounded-sm leading-relaxed">
                  Withdraw from <span className="text-error">compromised pool</span> if{" "}
                  <span className="text-error">sentiment &lt; 0.2</span>
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                  <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                    Execution Count
                  </div>
                  <div className="font-mono text-on-surface-variant text-sm font-bold">
                    0 times
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Policy Templates Tab */}
          {activeTab === "templates" && (
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-outline-variant/20"></div>
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-on-surface-variant">
                  Recommended Templates
                </h3>
                <div className="h-px flex-1 bg-outline-variant/20"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Template 1 */}
                <div className="bg-surface-container flex flex-col md:flex-row rounded-sm overflow-hidden border border-outline-variant/10 group">
                  <div className="md:w-1/3 relative h-48 md:h-auto">
                    <img
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                      alt="abstract 3d network visualization with glowing green nodes and dark architectural background representing defi protocol connections"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZwhDVR9MfenQwIwVOwbXMv892tLIcq_6vJ-A4052KKdT7MAdjI445QYEx42W6BrWqubzVT1GkrwAYlkKYuopPg9TASVYmkW0VBe7OowKXEmy7ug7x-nyu5p3de4id39589GHeidv7DiOP6m_M-U9JTvJiu-v63G5YfmpE_ZHBqpNKkAU5-pvaBYc_jlgFHOZ4WKvYtCow4fRrvA0OvstZ6UyrYkgl7NJnQqvGM7e0P19k7kE63pXtvmDFZOvo770pxFMRD-1Nt8I"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-container"></div>
                  </div>
                  <div className="md:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-primary mb-2 uppercase">
                        Yield Hunter
                      </h4>
                      <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
                        Automatically move idle stablecoins across vetted RWA and lending pools to
                        capture the highest risk-adjusted yield.
                      </p>
                    </div>
                    <button className="w-fit bg-transparent border border-primary text-primary px-6 py-2 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-primary/10 transition-colors flex items-center gap-2">
                      Use Template{" "}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
                {/* Template 2 */}
                <div className="bg-surface-container flex flex-col md:flex-row rounded-sm overflow-hidden border border-outline-variant/10 group">
                  <div className="md:w-1/3 relative h-48 md:h-auto">
                    <img
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                      alt="macro close-up of a broken circuit board with electric blue and red glowing lines representing a digital circuit breaker system"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA98Mv1zuKC5yMYgeGm3WyJisiZsKh1OyDE8G1intYebPU4Ze5YanOgSpngbhSNpDbC1M5NcQmTWEHe1f7Ywte7-DN2U0UZdBpO9qQ04c6hscg-KogV3P7qeFi9NAKAjKVpJfV9rVcfGGAGae_zXA34bkKuDf7jxOGHone4d-dAV7QB1SG_3cqRLwVXHgca4bBplPMbui1kkHxxLrMxRJDAV4u3DipZW8sCDQE_huRownkDVRpNd9pNAqJdgUJrNiWiMBODDmHjWWw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-container"></div>
                  </div>
                  <div className="md:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-tertiary mb-2 uppercase">
                        Circuit Breaker
                      </h4>
                      <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
                        Real-time monitoring of social signals and contract logs. Withdraws liquidity
                        instantly if protocol health drops below threshold.
                      </p>
                    </div>
                    <button className="w-fit bg-transparent border border-tertiary text-tertiary px-6 py-2 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-tertiary/10 transition-colors flex items-center gap-2">
                      Use Template{" "}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create New Policy Tab */}
          {activeTab === "create" && (
            <div className="bg-surface-container-low border border-outline-variant/15 rounded-sm p-8 shadow-2xl relative overflow-hidden">
              {/* Grid Decoration */}
              <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #44edb7 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              ></div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-on-surface">
                    Construct New Protocol Intent
                  </h3>
                  <div className="bg-surface-container-lowest p-1 rounded-sm flex">
                    <button className="px-6 py-2 bg-surface-container-highest text-primary font-bold text-xs uppercase tracking-widest rounded-sm">
                      Natural Language
                    </button>
                    <button className="px-6 py-2 text-on-surface-variant font-bold text-xs uppercase tracking-widest rounded-sm hover:text-on-surface transition-colors">
                      Advanced
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left: Input */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-3">
                        Define Intent in Plain English
                      </label>
                      <textarea
                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm p-4 text-on-surface font-mono text-sm focus:border-primary/50 focus:ring-0 transition-all placeholder:opacity-30"
                        placeholder="e.g. If my ETH balance in Aave falls below 5 ETH, swap 10,000 USDC for ETH and deposit it into the pool..."
                        rows="6"
                        value={policyIntent}
                        onChange={(e) => setPolicyIntent(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-3">
                          Security Level
                        </label>
                        <select
                          className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm p-3 text-on-surface text-xs uppercase font-bold tracking-widest"
                          value={securityLevel}
                          onChange={(e) => setSecurityLevel(e.target.value)}
                        >
                          <option>Standard Execution</option>
                          <option>ZK-Verified ONLY</option>
                          <option>Multi-Sig Required</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-3">
                          Priority
                        </label>
                        <select
                          className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm p-3 text-on-surface text-xs uppercase font-bold tracking-widest"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                        >
                          <option>Medium (12s)</option>
                          <option>Flash (Instant)</option>
                          <option>Low (Eco)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* Right: Live Preview */}
                  <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-sm p-6 relative">
                    <div className="absolute top-0 right-0 px-3 py-1 bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                      Live Parser
                    </div>
                    <div className="font-mono text-sm space-y-4">
                      <div className="flex items-start gap-4">
                        <span className="text-on-surface-variant/30">01</span>
                        <p className="text-on-surface">
                          <span className="text-tertiary">@trigger</span>:{" "}
                          <span className="text-primary">balance_monitor</span>
                        </p>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="text-on-surface-variant/30">02</span>
                        <p className="text-on-surface ml-4">
                          <span className="text-secondary">target</span>: "0x7a2...456"{" "}
                          <span className="text-on-surface-variant/50">// ETH/USDC Pair</span>
                        </p>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="text-on-surface-variant/30">03</span>
                        <p className="text-on-surface ml-4">
                          <span className="text-secondary">condition</span>: "val &lt; 5.0"
                        </p>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="text-on-surface-variant/30">04</span>
                        <p className="text-on-surface">
                          <span className="text-tertiary">@action</span>:{" "}
                          <span className="text-primary">atomic_swap_deposit</span>
                        </p>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="text-on-surface-variant/30">05</span>
                        <p className="text-on-surface ml-4">
                          <span className="text-secondary">input</span>: "10000 USDC"
                        </p>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="text-on-surface-variant/30">06</span>
                        <p className="text-on-surface ml-4">
                          <span className="text-secondary">slippage_max</span>: "0.5%"
                        </p>
                      </div>
                      <div className="pt-6 mt-6 border-t border-outline-variant/10 flex items-center gap-2 text-[10px] text-on-surface-variant uppercase font-bold">
                        <span className="material-symbols-outlined text-primary text-base">
                          verified
                        </span>
                        Logic verified via Janus ZK-VM
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-12 flex justify-end gap-4">
                  <button className="px-10 py-4 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface font-bold text-xs uppercase tracking-[0.2em] transition-all">
                    Cancel
                  </button>
                  <button className="px-12 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(68,237,183,0.3)] hover:scale-[1.02] transition-all active:scale-95">
                    Deploy Policy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Meta */}
          <footer className="mt-20 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  Network Load
                </span>
                <span className="font-mono text-xs text-primary">Normal (14 gwei)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  Last Sync
                </span>
                <span className="font-mono text-xs text-on-surface">2 mins ago</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-on-surface-variant/40">
              <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">
                terminal
              </span>
              <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">
                history
              </span>
              <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">
                help
              </span>
            </div>
          </footer>
        </div>
      </main>

      {/* Contextual FAB (only on mobile) */}
      <div className="fixed bottom-8 right-8 z-50 md:hidden">
        <button className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-2xl text-on-primary">
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

      {/* Mobile Navigation Shell */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-outline-variant/20 flex justify-around items-center h-16 z-50 px-2">
        <button className="flex flex-col items-center gap-1 text-on-surface-variant opacity-70">
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span className="text-[8px] uppercase tracking-tighter">Dash</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-primary">
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            policy
          </span>
          <span className="text-[8px] uppercase tracking-tighter">Policies</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant opacity-70">
          <span className="material-symbols-outlined text-xl">smart_toy</span>
          <span className="text-[8px] uppercase tracking-tighter">Agent</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant opacity-70">
          <span className="material-symbols-outlined text-xl">security</span>
          <span className="text-[8px] uppercase tracking-tighter">Vault</span>
        </button>
      </nav>
    </div>
  );
};

export default Policies;
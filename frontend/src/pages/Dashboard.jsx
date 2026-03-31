import React, { useState } from "react";

const Dashboard = () => {
  const [agentEnabled, setAgentEnabled] = useState(true);

  return (
    <div className="overflow-hidden h-screen bg-background text-on-surface">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3 w-full border-b border-[#3c4a43]/15 bg-[#121315]/80 backdrop-blur-xl shadow-[0_0_15px_rgba(0,208,156,0.1)]">
        <div className="flex items-center gap-8">
          <span className="font-['Inter'] text-xl font-black tracking-tighter text-primary uppercase">Janus Protocol</span>
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-primary border-b-2 border-primary font-['Inter'] tracking-tight font-bold text-sm py-1">Dashboard</a>
            <a href="#" className="text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-300 font-['Inter'] tracking-tight font-bold text-sm py-1 px-2">AI Agent</a>
            <a href="#" className="text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-300 font-['Inter'] tracking-tight font-bold text-sm py-1 px-2">Activity</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-surface-container-lowest px-3 py-1.5 rounded-sm border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-sm mr-2">hub</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">Network: <span className="text-primary">Janus Mainnet</span></span>
          </div>
          <div className="flex items-center bg-surface-container-lowest px-4 py-1.5 rounded-sm border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group">
            <span className="material-symbols-outlined text-primary text-sm mr-2 group-hover:scale-110 transition-transform">account_balance_wallet</span>
            <span className="font-mono text-sm font-bold text-on-surface">0x123...456</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-surface-container-highest border border-primary/20 flex items-center justify-center overflow-hidden">
            <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqAdflEmpaswAOeuR7gdNq7BevSbT1Z3wCKxvlpfqXDTtvol4Bgi2K3qGUDJhcvqTZl9y-tfzrwS0uoKdW0EeGEs5CMegBjIRfVF9aH141O26o6cyd5faz3oji2b38MK8YNPfEdFh36LT5LCqkVd5qQ56xty7CCJrGYHEEMO9FOC9cJy3g8V6Hhd5AEJLM423W-W6ARtRcVnOydG4EOLiN6WqTgDcKj888fhayaRhPZx-rsO-SUR441qGtxIBniapQy29yr3xmYF4" />
          </div>
        </div>
      </header>

      {/* Side Navigation Bar */}
      <aside className="h-screen w-64 fixed left-0 top-0 z-50 flex flex-col border-r border-[#3c4a43]/15 p-4 bg-background hidden lg:flex pt-20">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-primary-container rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          </div>
          <div>
            <h2 className="text-primary font-black text-lg leading-tight uppercase tracking-tighter">Janus</h2>
            <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">v1.0.4-encrypted</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-surface-container text-primary shadow-[0_0_10px_rgba(0,208,156,0.2)] border-r-2 border-primary font-['JetBrains_Mono'] text-sm uppercase tracking-widest transition-all">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant opacity-70 hover:bg-surface-container-low hover:opacity-100 transition-all font-['JetBrains_Mono'] text-sm uppercase tracking-widest">
            <span className="material-symbols-outlined">smart_toy</span>
            <span>AI Agent</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant opacity-70 hover:bg-surface-container-low hover:opacity-100 transition-all font-['JetBrains_Mono'] text-sm uppercase tracking-widest">
            <span className="material-symbols-outlined">policy</span>
            <span>Policies</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant opacity-70 hover:bg-surface-container-low hover:opacity-100 transition-all font-['JetBrains_Mono'] text-sm uppercase tracking-widest">
            <span className="material-symbols-outlined">history</span>
            <span>Activity</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant opacity-70 hover:bg-surface-container-low hover:opacity-100 transition-all font-['JetBrains_Mono'] text-sm uppercase tracking-widest">
            <span className="material-symbols-outlined">security</span>
            <span>Security</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant opacity-70 hover:bg-surface-container-low hover:opacity-100 transition-all font-['JetBrains_Mono'] text-sm uppercase tracking-widest">
            <span className="material-symbols-outlined">verified_user</span>
            <span>ZK Passport</span>
          </a>
        </nav>
        <button className="mt-auto mb-4 w-full bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 py-3 font-['JetBrains_Mono'] font-bold text-sm uppercase tracking-widest rounded-sm hover:shadow-[0_0_20px_rgba(68,237,183,0.3)] transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">add_circle</span>
          New Intent
        </button>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-20 px-6 pb-12 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {/* Page Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-on-surface">SYSTEM <span className="text-primary">OVERVIEW</span></h1>
              <p className="text-on-surface-variant font-medium mt-1">Autonomous Liquidity &amp; Privacy Management</p>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-sm border border-outline-variant/10">
              <div className="flex items-center gap-2 px-3 py-1 border-r border-outline-variant/20">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">Agent Online</span>
              </div>
              <div className="px-3 py-1">
                <span className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">3 Policies Active</span>
              </div>
              <div className="flex items-center pl-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={agentEnabled}
                    onChange={() => setAgentEnabled(!agentEnabled)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
            {/* Left Column (60%) */}
            <div className="xl:col-span-6 space-y-6">
              {/* Portfolio Overview Card */}
              <section className="glass-panel p-6 rounded-sm relative overflow-hidden group hover:shadow-[0_0_20px_rgba(68,237,183,0.05)] transition-shadow">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <h3 className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Total Managed Portfolio</h3>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-mono font-black tracking-tighter">$124,500</span>
                      <span className="text-primary font-mono text-lg font-bold">+5.2%</span>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="bg-surface-container-lowest p-3 border-l-2 border-primary">
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">24h Gain</p>
                        <p className="font-mono text-lg font-bold">+$6,474.00</p>
                      </div>
                      <div className="bg-surface-container-lowest p-3 border-l-2 border-tertiary">
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Volatility</p>
                        <p className="font-mono text-lg font-bold">Low</p>
                      </div>
                    </div>
                  </div>
                  {/* Donut Chart Representation */}
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" fill="transparent" r="80" stroke="#1f2022" strokeWidth="20" />
                      <circle cx="96" cy="96" fill="transparent" r="80" stroke="#44edb7" strokeDasharray="502" strokeDashoffset="301" strokeWidth="20" /> {/* BTC 40% */}
                      <circle cx="96" cy="96" fill="transparent" r="80" stroke="#5D5FEF" strokeDasharray="502" strokeDashoffset="401" strokeWidth="20" style={{ transform: "rotate(144deg)", transformOrigin: "center" }} /> {/* ETH 30% */}
                      <circle cx="96" cy="96" fill="transparent" r="80" stroke="#f6a724" strokeDasharray="502" strokeDashoffset="451" strokeWidth="20" style={{ transform: "rotate(252deg)", transformOrigin: "center" }} /> {/* SUI 20% */}
                      <circle cx="96" cy="96" fill="transparent" r="80" stroke="#bacac1" strokeDasharray="502" strokeDashoffset="476" strokeWidth="20" style={{ transform: "rotate(324deg)", transformOrigin: "center" }} /> {/* USDC 10% */}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Diversified</span>
                      <span className="font-mono text-sm font-bold">4 Assets</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-4 pt-6 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 bg-primary"></span> <span className="font-mono text-[10px] uppercase">BTC 40%</span></div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 bg-[#5D5FEF]"></span> <span className="font-mono text-[10px] uppercase">ETH 30%</span></div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 bg-tertiary"></span> <span className="font-mono text-[10px] uppercase">SUI 20%</span></div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 bg-on-surface-variant"></span> <span className="font-mono text-[10px] uppercase">USDC 10%</span></div>
                </div>
              </section>

              {/* Recent Intents Timeline */}
              <section className="glass-panel rounded-sm flex flex-col h-full">
                <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-on-surface">Recent Intent Execution</h3>
                  <button className="text-primary font-mono text-xs hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-lowest/50">
                      <tr>
                        <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Intent Action</th>
                        <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Timestamp</th>
                        <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Value Delta</th>
                        <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      <tr className="hover:bg-surface-container-high transition-colors group">
                        <td className="px-6 py-4 font-bold text-sm">Rebalanced 5% BTC -&gt; ETH</td>
                        <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">2 min ago</td>
                        <td className="px-6 py-4 font-mono text-sm text-primary text-right">+$2,340</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">Success</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-container-high transition-colors group">
                        <td className="px-6 py-4 font-bold text-sm">Gas Optimization Sweep</td>
                        <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">14 min ago</td>
                        <td className="px-6 py-4 font-mono text-sm text-on-surface text-right">-$12.40</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">Success</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-container-high transition-colors group">
                        <td className="px-6 py-4 font-bold text-sm">Automated LP Exit (SUI/USDC)</td>
                        <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">1h ago</td>
                        <td className="px-6 py-4 font-mono text-sm text-primary text-right">+$890</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">Success</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-container-high transition-colors group">
                        <td className="px-6 py-4 font-bold text-sm">Stop-Loss Trigger: SOL</td>
                        <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">3h ago</td>
                        <td className="px-6 py-4 font-mono text-sm text-error text-right">-$5,100</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-tertiary/20">Executed</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-container-high transition-colors group">
                        <td className="px-6 py-4 font-bold text-sm">Manual Wallet Sweep</td>
                        <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">5h ago</td>
                        <td className="px-6 py-4 font-mono text-sm text-on-surface text-right">$0.00</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">Success</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Right Column (40%) */}
            <div className="xl:col-span-4 space-y-6">
              {/* Security Health Card */}
              <section className="glass-panel p-6 rounded-sm border-t-2 border-primary">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-on-surface">Vault Security</h3>
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-surface-container-lowest rounded-sm">
                    <span className="text-sm font-medium">Shard Health (AI Nodes)</span>
                    <span className="font-mono text-sm font-bold text-primary">102/120 Active</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-container-lowest rounded-sm">
                    <span className="text-sm font-medium">Multi-Party Computation</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">OPTIMAL</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-container-lowest rounded-sm">
                    <span className="text-sm font-medium">Last Key Rotation</span>
                    <span className="font-mono text-xs text-on-surface-variant">2 DAYS AGO</span>
                  </div>
                  <button className="w-full py-3 bg-surface-container-highest border border-outline-variant/30 text-xs font-mono font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all rounded-sm mt-2">
                    Rotate Security Shards
                  </button>
                </div>
              </section>

              {/* Daily Limit Gauge */}
              <section className="glass-panel p-6 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-mono text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Daily Withdrawal Limit</h3>
                  <span className="font-mono text-xs text-on-surface font-bold">$420 / $500</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-primary w-[84%] shadow-[0_0_10px_#44edb7]"></div>
                </div>
                <p className="text-[10px] text-on-surface-variant italic">84% of daily automated threshold reached</p>
              </section>

              {/* Recent Alerts */}
              <section className="glass-panel p-6 rounded-sm">
                <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-on-surface mb-6">Security Intelligence</h3>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start p-3 hover:bg-surface-container-high transition-colors rounded-sm cursor-default group">
                    <span className="mt-1 w-2 h-2 rounded-full bg-tertiary flex-shrink-0 animate-pulse"></span>
                    <div>
                      <p className="text-sm font-bold leading-tight">High Gas Fees Detected</p>
                      <p className="text-xs text-on-surface-variant mt-1">Agent delaying 'LP-Compounding' for better rates.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start p-3 hover:bg-surface-container-high transition-colors rounded-sm cursor-default group">
                    <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                    <div>
                      <p className="text-sm font-bold leading-tight">Policy Verification Success</p>
                      <p className="text-xs text-on-surface-variant mt-1">ZK-Proof generated for Tax-Exempt Status 2024.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start p-3 hover:bg-surface-container-high transition-colors rounded-sm cursor-default group">
                    <span className="mt-1 w-2 h-2 rounded-full bg-secondary flex-shrink-0"></span>
                    <div>
                      <p className="text-sm font-bold leading-tight">New Whitelist Address</p>
                      <p className="text-xs text-on-surface-variant mt-1">Address 0x8a1...f2e added via Security Center.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <section className="glass-panel p-6 rounded-sm">
                <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-on-surface mb-4">Command Center</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button className="flex items-center justify-between w-full px-4 py-3 bg-tertiary-container/10 border border-tertiary/20 text-tertiary rounded-sm hover:bg-tertiary/20 transition-all font-mono text-xs font-bold uppercase tracking-widest">
                    <span>Pause Autonomous Agent</span>
                    <span className="material-symbols-outlined text-sm">pause</span>
                  </button>
                  <button className="flex items-center justify-between w-full px-4 py-3 bg-error-container/10 border border-error/20 text-error rounded-sm hover:bg-error/20 transition-all font-mono text-xs font-bold uppercase tracking-widest">
                    <span>Emergency Vault Exit</span>
                    <span className="material-symbols-outlined text-sm">emergency_home</span>
                  </button>
                  <button className="flex items-center justify-between w-full px-4 py-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface rounded-sm hover:bg-surface-container-high hover:border-primary/50 transition-all font-mono text-xs font-bold uppercase tracking-widest">
                    <span>Refill Gas Reserve</span>
                    <span className="material-symbols-outlined text-sm">local_gas_station</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Contextual FAB (Only for main intent) */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-[0_0_20px_rgba(68,237,183,0.5)] flex items-center justify-center hover:scale-110 active:scale-90 transition-transform group">
          <span className="material-symbols-outlined text-3xl font-bold">add</span>
          <span className="absolute right-full mr-4 px-3 py-1 bg-surface-container-highest text-on-surface text-[10px] font-bold uppercase tracking-widest rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-outline-variant/50">Execute Intent</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
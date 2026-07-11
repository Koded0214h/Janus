import React, { useState } from "react";

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketPriority, setTicketPriority] = useState("Low: Documentation Query");
  const [ticketDescription, setTicketDescription] = useState("");

  const handleSendTicket = () => {
    console.log("Ticket sent:", { priority: ticketPriority, description: ticketDescription });
    // Clear form or show toast
    setTicketDescription("");
  };

  return (
    <div className="bg-background text-on-background antialiased overflow-hidden flex">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/15 flex flex-col py-6 z-50">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
            <span
              className="material-symbols-outlined text-on-primary text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              security
            </span>
          </div>
          <div>
            <h1 className="text-lg font-black text-primary font-mono leading-none">
              Janus Protocol
            </h1>
            <p className="text-[10px] text-on-surface-variant/60 font-mono tracking-widest uppercase">
              Secure Node
            </p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant opacity-70 hover:bg-surface-container-highest hover:text-white transition-colors rounded-sm font-mono text-sm"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant opacity-70 hover:bg-surface-container-highest hover:text-white transition-colors rounded-sm font-mono text-sm"
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span>Assets</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant opacity-70 hover:bg-surface-container-highest hover:text-white transition-colors rounded-sm font-mono text-sm"
          >
            <span className="material-symbols-outlined">lock</span>
            <span>Vaults</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant opacity-70 hover:bg-surface-container-highest hover:text-white transition-colors rounded-sm font-mono text-sm"
          >
            <span className="material-symbols-outlined">verified_user</span>
            <span>Security</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 bg-surface-container text-primary border-l-4 border-primary font-mono text-sm"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              support_agent
            </span>
            <span>Support</span>
          </a>
        </nav>
        <div className="px-4 mt-auto space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant opacity-70 hover:bg-surface-container-highest hover:text-white transition-colors rounded-sm font-mono text-sm"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant opacity-70 hover:bg-surface-container-highest hover:text-white transition-colors rounded-sm font-mono text-sm"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </a>
          <div className="mt-6">
            <button className="w-full py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-mono font-bold text-xs rounded-sm hover:shadow-[0_0_15px_rgba(0,208,156,0.2)] transition-all">
              Connect Wallet
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <div className="ml-64 flex flex-col h-screen relative flex-1">
        {/* TopNavBar */}
        <header className="w-full top-0 sticky z-40 bg-gradient-to-b from-surface-container-low to-transparent">
          <div className="flex items-center justify-between px-8 h-16 w-full max-w-[1440px] mx-auto">
            <div className="flex items-center gap-8">
              <span className="text-xl font-bold tracking-tighter text-primary font-headline">
                Janus Protocol
              </span>
              <nav className="hidden md:flex items-center gap-6 text-sm font-headline">
                <a href="#" className="text-on-surface-variant hover:text-primary transition-all duration-300">
                  Docs
                </a>
                <a href="#" className="text-on-surface-variant hover:text-primary transition-all duration-300">
                  Network
                </a>
                <a href="#" className="text-on-surface-variant hover:text-primary transition-all duration-300">
                  Staking
                </a>
                <a href="#" className="text-on-surface-variant hover:text-primary transition-all duration-300">
                  Governance
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/30">
                <img
                  alt="User profile"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv_2CB9y141bC_lCDp3DoPtyS9TfXpUKU1NosnBXqu2Wb7uqlOXWFy2sbDfKxbS635OOXkM7kw8FE7hyK5USvJBZVOak_S875xYBm_Yf7i7wD7wBcL01COhfoMKJ-sTIB4TmXOxve08XiPRTJ6zKT4KfmMdiFFglA49jxemDPujLDQrversTXBF22P5V_ifgXeGMw4jLBnMeByeTCZsPkeiDA5IvbTkmEuHQZ6yf6yqmJY93-u_DIcMnTg0_leACsaqpjTeNI2Wug"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Hero Section */}
          <section className="px-8 pt-12 pb-16 max-w-[1200px] mx-auto text-center">
            <h2 className="text-5xl font-black font-headline tracking-tighter mb-6 bg-gradient-to-r from-on-surface to-on-surface-variant bg-clip-text text-transparent">
              How can we help?
            </h2>
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">search</span>
              </div>
              <input
                className="w-full h-14 bg-surface-container-lowest border-none pl-14 pr-6 rounded-sm text-on-surface focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-outline/50 font-mono text-sm"
                placeholder="Search the Protocol Knowledge Base..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-3 top-3 bottom-3 bg-surface-container-highest px-3 flex items-center rounded-sm text-[10px] text-on-surface-variant font-mono border border-outline-variant/20">
                CMD + K
              </div>
            </div>
          </section>

          {/* Quick Links Grid */}
          <section className="px-8 pb-20 max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="group bg-surface-container-low p-6 border border-outline-variant/10 rounded-sm hover:bg-surface-container-high hover:shadow-[0_0_15px_rgba(0,208,156,0.1)] transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-8xl">rocket_launch</span>
                </div>
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary">rocket_launch</span>
                </div>
                <h3 className="font-headline font-bold text-on-surface mb-2">Getting Started</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Initialize your first Janus vault and understand node architecture basics.
                </p>
              </div>
              {/* Card 2 */}
              <div className="group bg-surface-container-low p-6 border border-outline-variant/10 rounded-sm hover:bg-surface-container-high hover:shadow-[0_0_15px_rgba(0,208,156,0.1)] transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-8xl">admin_panel_settings</span>
                </div>
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
                </div>
                <h3 className="font-headline font-bold text-on-surface mb-2">Security &amp; MPC</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Configure Multi-Party Computation and hardware security modules.
                </p>
              </div>
              {/* Card 3 */}
              <div className="group bg-surface-container-low p-6 border border-outline-variant/10 rounded-sm hover:bg-surface-container-high hover:shadow-[0_0_15px_rgba(0,208,156,0.1)] transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-8xl">code</span>
                </div>
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary">code</span>
                </div>
                <h3 className="font-headline font-bold text-on-surface mb-2">API Reference</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Technical endpoints for automated shard rotation and protocol logic.
                </p>
              </div>
              {/* Card 4 */}
              <div className="group bg-surface-container-low p-6 border border-outline-variant/10 rounded-sm hover:bg-surface-container-high hover:shadow-[0_0_15px_rgba(0,208,156,0.1)] transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-8xl">policy</span>
                </div>
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary">policy</span>
                </div>
                <h3 className="font-headline font-bold text-on-surface mb-2">Policy Creation</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Define governance rules and custom threshold signatures for teams.
                </p>
              </div>
            </div>
          </section>

          {/* Knowledge Base Bento Section */}
          <section className="px-8 pb-20 max-w-[1200px] mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-primary font-mono text-xs uppercase tracking-widest mb-2 block">
                  Resource Library
                </span>
                <h2 className="text-3xl font-black font-headline">Knowledge Base</h2>
              </div>
              <a href="#" className="text-sm font-mono text-primary hover:underline flex items-center gap-2">
                View All Articles <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Column 1: Infrastructure */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-2 border-b border-outline-variant/10">
                  <span className="material-symbols-outlined text-on-surface-variant">terminal</span>
                  <h4 className="font-headline font-bold text-lg">Core Infrastructure</h4>
                </div>
                <ul className="space-y-6">
                  <li className="group">
                    <a href="#" className="block">
                      <h5 className="text-on-surface font-semibold group-hover:text-primary transition-colors mb-1">
                        How to rotate shards across nodes
                      </h5>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
                        Automate the re-sharding process to prevent persistent node compromise using the CLI tool.
                      </p>
                      <div className="flex gap-4">
                        <span className="text-[10px] font-mono text-on-surface-variant/50">Updated 2h ago</span>
                        <span className="text-[10px] font-mono text-primary/70">#Security</span>
                      </div>
                    </a>
                  </li>
                  <li className="group">
                    <a href="#" className="block">
                      <h5 className="text-on-surface font-semibold group-hover:text-primary transition-colors mb-1">
                        Scaling threshold signatures for DAOs
                      </h5>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
                        A technical deep dive into optimizing m-of-n signatures for 100+ participants.
                      </p>
                      <div className="flex gap-4">
                        <span className="text-[10px] font-mono text-on-surface-variant/50">Updated 1d ago</span>
                        <span className="text-[10px] font-mono text-primary/70">#Advanced</span>
                      </div>
                    </a>
                  </li>
                  <li className="group">
                    <a href="#" className="block">
                      <h5 className="text-on-surface font-semibold group-hover:text-primary transition-colors mb-1">
                        Migrating from legacy hardware wallets
                      </h5>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
                        Safe procedures for porting private keys into the Janus MPC environment.
                      </p>
                      <div className="flex gap-4">
                        <span className="text-[10px] font-mono text-on-surface-variant/50">Updated 3d ago</span>
                        <span className="text-[10px] font-mono text-primary/70">#Migration</span>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
              {/* Column 2: Identity & Compliance */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-2 border-b border-outline-variant/10">
                  <span className="material-symbols-outlined text-on-surface-variant">fingerprint</span>
                  <h4 className="font-headline font-bold text-lg">Identity &amp; Compliance</h4>
                </div>
                <ul className="space-y-6">
                  <li className="group">
                    <a href="#" className="block">
                      <h5 className="text-on-surface font-semibold group-hover:text-primary transition-colors mb-1">
                        Setting up ZK Passport for validators
                      </h5>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
                        Enable privacy-preserving KYC using Zero-Knowledge proofs for your node operators.
                      </p>
                      <div className="flex gap-4">
                        <span className="text-[10px] font-mono text-on-surface-variant/50">Updated 5h ago</span>
                        <span className="text-[10px] font-mono text-primary/70">#ZKProof</span>
                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[8px] font-mono rounded-full self-center">
                          ZK-PILL
                        </span>
                      </div>
                    </a>
                  </li>
                  <li className="group">
                    <a href="#" className="block">
                      <h5 className="text-on-surface font-semibold group-hover:text-primary transition-colors mb-1">
                        Governance whitelisting workflows
                      </h5>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
                        Manage allow-lists for institutional liquidity pools through Janus Protocol.
                      </p>
                      <div className="flex gap-4">
                        <span className="text-[10px] font-mono text-on-surface-variant/50">Updated 1w ago</span>
                        <span className="text-[10px] font-mono text-primary/70">#Compliance</span>
                      </div>
                    </a>
                  </li>
                  <li className="group">
                    <a href="#" className="block">
                      <h5 className="text-on-surface font-semibold group-hover:text-primary transition-colors mb-1">
                        Encrypted backup recovery seeds
                      </h5>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
                        Best practices for offline storage of master protocol recovery credentials.
                      </p>
                      <div className="flex gap-4">
                        <span className="text-[10px] font-mono text-on-surface-variant/50">Updated 2w ago</span>
                        <span className="text-[10px] font-mono text-primary/70">#Security</span>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Support Ticket Section */}
          <section className="px-8 pb-20 max-w-[1200px] mx-auto">
            <div className="bg-surface-container rounded-sm p-10 border border-outline-variant/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="max-w-xl">
                <h2 className="text-3xl font-black font-headline mb-4">Contact Sentinel Support</h2>
                <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
                  Can't find what you're looking for? Our Sentinel Team is standing by to assist with critical node infrastructure issues.
                  <span className="text-primary font-mono block mt-2 text-xs">Response time: ~4 hours</span>
                </p>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-outline uppercase tracking-widest">
                        Protocol ID
                      </label>
                      <input
                        className="w-full bg-surface-container-lowest border-none px-4 py-3 rounded-sm text-on-surface-variant/50 font-mono text-sm cursor-not-allowed"
                        disabled
                        type="text"
                        value="JANUS-9921-X"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-outline uppercase tracking-widest">
                        Issue Priority
                      </label>
                      <select
                        className="w-full bg-surface-container-lowest border-none px-4 py-3 rounded-sm text-on-surface font-mono text-sm focus:ring-1 focus:ring-primary/40 appearance-none"
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value)}
                      >
                        <option>Low: Documentation Query</option>
                        <option>Medium: Configuration Help</option>
                        <option>High: Node Downtime</option>
                        <option>Critical: Exploit Suspicion</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-outline uppercase tracking-widest">
                      Description
                    </label>
                    <textarea
                      className="w-full bg-surface-container-lowest border-none px-4 py-3 rounded-sm text-on-surface focus:ring-1 focus:ring-primary/40 placeholder:text-outline/40 transition-all font-body text-sm"
                      placeholder="Briefly describe your issue or question..."
                      rows="4"
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendTicket}
                    className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-mono font-bold text-sm rounded-sm hover:shadow-[0_0_20px_rgba(0,208,156,0.3)] transition-all flex items-center gap-3 group"
                  >
                    Send Ticket
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      send
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* Footer-like Links */}
          <footer className="px-8 py-10 max-w-[1200px] mx-auto border-t border-outline-variant/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-8">
                <a
                  href="#"
                  className="text-xs font-mono text-on-surface-variant hover:text-primary flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">forum</span> Discord Support
                </a>
                <a
                  href="#"
                  className="text-xs font-mono text-on-surface-variant hover:text-primary flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">share</span> Twitter Updates
                </a>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-lowest px-4 py-2 rounded-full border border-outline-variant/20">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </div>
                <span className="text-[10px] font-mono text-on-surface tracking-tighter uppercase">
                  System Status: <span className="text-primary">Nominal</span>
                </span>
              </div>
              <div className="text-[10px] font-mono text-outline/50 uppercase tracking-widest">
                v2.4.1-STABLE // BUILD 0xA4F2
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Background Decoration */}
      <div className="fixed top-0 right-0 -z-10 w-[50%] h-full opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 via-transparent to-transparent"></div>
        <img
          alt="Tech background"
          className="w-full h-full object-cover mix-blend-overlay"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDY2OSMEZXaFZFnCsSIS880A5tb08WxCgvZPoBDUYXBhqsJiUXOf0aseMJwcQLawdzbxb1iAWvwOiuCGfxogzPIOH6g5sUWSTFhrrUVXcMIHBAdU0VNZUqK_LNopIPrQCt6FVUihAyVbLoF6RUKzKxYw6rohw04o97stl9RiF7yoZexPX91jsn1CDw4WmUWVebfy0D6BNE44a4DzuyTt2YG2LLtXAiHpRdtLgm2XSHHSuYQFpcSlgamowe1cInZe_YsEKLS6yF00lI"
        />
      </div>
    </div>
  );
};

export default Support;
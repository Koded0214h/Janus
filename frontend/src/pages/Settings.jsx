import React, { useState } from "react";

const Settings = () => {
  // State for all settings
  const [theme, setTheme] = useState("dark");
  const [notifications, setNotifications] = useState(true);
  const [discordWebhook, setDiscordWebhook] = useState("https://discord.com/api/webhooks/...");
  const [language, setLanguage] = useState("English (US)");
  const [gasLimit, setGasLimit] = useState(0.01);
  const [maxSlippage, setMaxSlippage] = useState(0.5);
  const [highValueConfirmation, setHighValueConfirmation] = useState(true);
  const [autoExecuteMode, setAutoExecuteMode] = useState(false);
  const [anonymisedData, setAnonymisedData] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Handlers
  const handleSaveGeneral = () => {
    setToastMessage("Configuration synced to node");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleTestWebhook = () => {
    setToastMessage("Webhook test sent successfully");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleUpdateAgentParams = () => {
    setToastMessage("Agent parameters updated");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleDisconnectWallet = () => {
    setToastMessage("Wallet disconnected");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleExportLogs = () => {
    setToastMessage("Logs exported");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleClearCache = () => {
    setToastMessage("Cache cleared");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleDataExport = () => {
    setToastMessage("Data export started");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleDeletePolicies = () => {
    if (window.confirm("⚠️ Delete all policies? This action is irreversible.")) {
      setToastMessage("Policies deleted");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    }
  };

  const handleRevokeKeyShards = () => {
    if (window.confirm("⚠️ Revoke key shards? This will reset vault access.")) {
      setToastMessage("Key shards revoked");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    }
  };

  const handlePermanentDelete = () => {
    if (
      window.confirm(
        "⚠️ PERMANENT ACCOUNT DELETION\n\nThis action cannot be undone. Are you absolutely sure?"
      )
    ) {
      setToastMessage("Account deletion initiated");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 selection:text-primary min-h-screen flex overflow-hidden">
      {/* SideNavBar Component (Shared) */}
      <aside className="flex flex-col h-full sticky top-0 left-0 h-screen w-64 border-r border-white/5 bg-[#0A0B0D] dark:bg-[#0A0B0D] shadow-[0_0_15px_rgba(0,208,156,0.1)] z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-xl">shield_lock</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter text-white font-headline">
                Janus Protocol
              </h1>
              <p className="text-[10px] text-primary tracking-[0.2em] font-mono uppercase">
                The Digital Vault
              </p>
            </div>
          </div>
          <nav className="space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-sm text-slate-500 hover:text-white transition-colors hover:bg-white/5 group"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              <span className="font-['Inter'] font-medium tracking-tight text-sm">Dashboard</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-sm text-slate-500 hover:text-white transition-colors hover:bg-white/5 group"
            >
              <span className="material-symbols-outlined text-sm">smart_toy</span>
              <span className="font-['Inter'] font-medium tracking-tight text-sm">AI Agent</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-sm text-slate-500 hover:text-white transition-colors hover:bg-white/5 group"
            >
              <span className="material-symbols-outlined text-sm">policy</span>
              <span className="font-['Inter'] font-medium tracking-tight text-sm">Policies</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-sm text-slate-500 hover:text-white transition-colors hover:bg-white/5 group"
            >
              <span className="material-symbols-outlined text-sm">history</span>
              <span className="font-['Inter'] font-medium tracking-tight text-sm">Activity</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-sm text-slate-500 hover:text-white transition-colors hover:bg-white/5 group"
            >
              <span className="material-symbols-outlined text-sm">security</span>
              <span className="font-['Inter'] font-medium tracking-tight text-sm">
                Security Center
              </span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-sm text-slate-500 hover:text-white transition-colors hover:bg-white/5 group"
            >
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="font-['Inter'] font-medium tracking-tight text-sm">ZK Passport</span>
            </a>
            {/* Active Item */}
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-sm text-primary bg-white/5 border-r-2 border-primary group"
            >
              <span className="material-symbols-outlined text-sm">settings</span>
              <span className="font-['Inter'] font-medium tracking-tight text-sm">Settings</span>
            </a>
          </nav>
        </div>
        <div className="mt-auto p-6">
          <button className="w-full py-3 bg-primary-container/10 border border-primary/20 text-primary font-mono text-xs rounded-sm hover:bg-primary/20 transition-all flex items-center justify-center gap-2 group">
            <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">
              router
            </span>
            Connect Node
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* TopAppBar Component (Shared) */}
        <header className="flex items-center justify-between px-8 w-full border-b border-white/5 bg-[#0A0B0D]/80 backdrop-blur-xl h-16 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                search
              </span>
              <input
                className="bg-surface-container-lowest border-none text-xs text-on-surface w-full pl-10 pr-4 py-2 rounded-sm focus:ring-1 focus:ring-primary/40 placeholder:text-slate-600"
                placeholder="Search parameters..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 mr-4 border-r border-white/5 pr-6">
              <button className="text-slate-400 hover:text-primary transition-all relative">
                <span className="material-symbols-outlined text-xl">notifications</span>
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary rounded-full"></span>
              </button>
              <button className="text-slate-400 hover:text-primary transition-all">
                <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
              </button>
            </div>
            <button className="bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-sm text-primary font-mono text-[10px] tracking-widest uppercase hover:bg-primary/20 transition-all">
              Connect Wallet
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-white/10 overflow-hidden">
                <img
                  alt="User Security Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBS0pz49XTa7DL7FqNATKKylegcWErCq8WXbHWXSAMeQnBBg1X4PvsJY04ryozKsASudbwTYvYPT5g5VP5l0biSYt73FLxAn12JlRGpeIbBvaIqP45Pu7xCTpo6QnhajsxmVnJuLJwxu6naG091zWZj1RHxXdZdLB0SViq860oQMzCiNZLHrVQjId9EWjpO4Bly-l1OcQsjbHv16XkhaES4DM_pHoeZlAM4fbTkX4ZBV8i4ltErTTeJDJ_AII1X5sQgCOLyjF2L_-c"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h2 className="text-4xl font-extrabold tracking-tighter text-white mb-2 font-headline uppercase">
                Protocol Settings
              </h2>
              <p className="text-on-surface-variant font-body">
                Manage your autonomous agent parameters and vault security configurations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* General Settings Card */}
              <section className="md:col-span-8 bg-surface-container border border-white/5 rounded-xl overflow-hidden group hover:border-primary/20 transition-all duration-300">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">tune</span>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                        General Settings
                      </h3>
                    </div>
                    <button className="text-xs font-mono text-primary bg-primary/5 px-3 py-1 border border-primary/10 rounded-sm hover:bg-primary/10 transition-colors">
                      Default
                    </button>
                  </div>
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">Theme Selection</p>
                        <p className="text-xs text-on-surface-variant">
                          Switch between dark vault and high-visibility modes.
                        </p>
                      </div>
                      <div className="flex bg-surface-container-lowest p-1 rounded-sm border border-white/5">
                        <button
                          onClick={() => setTheme("dark")}
                          className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                            theme === "dark"
                              ? "bg-primary text-on-primary"
                              : "text-slate-500 hover:text-white"
                          }`}
                        >
                          Dark
                        </button>
                        <button
                          onClick={() => setTheme("light")}
                          className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                            theme === "light"
                              ? "bg-primary text-on-primary"
                              : "text-slate-500 hover:text-white"
                          }`}
                        >
                          Light
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium text-sm">Notifications</p>
                          <p className="text-xs text-on-surface-variant">
                            Get alerts for critical protocol executions.
                          </p>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notifications}
                            onChange={() => setNotifications(!notifications)}
                          />
                          <div className="w-10 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                      </div>
                      <div className="bg-surface-container-lowest p-4 rounded-sm border border-white/5">
                        <label className="block text-[10px] font-mono text-primary uppercase mb-2">
                          Discord Webhook
                        </label>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 bg-surface-container border-none text-xs font-mono text-on-surface-variant focus:ring-1 focus:ring-primary/40 rounded-sm px-3 py-2"
                            type="text"
                            value={discordWebhook}
                            onChange={(e) => setDiscordWebhook(e.target.value)}
                          />
                          <button
                            onClick={handleTestWebhook}
                            className="glass-button px-4 text-xs font-bold text-white uppercase"
                          >
                            Test
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm">Interface Language</p>
                      <select
                        className="bg-surface-container-lowest border border-white/5 text-xs text-white rounded-sm py-2 px-4 focus:ring-1 focus:ring-primary/40 min-w-[140px]"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <option>English (US)</option>
                        <option>Deutsch</option>
                        <option>日本語</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-10 pt-8 border-t border-white/5 flex justify-end">
                    <button
                      onClick={handleSaveGeneral}
                      className="bg-primary hover:bg-primary-container text-on-primary font-bold uppercase tracking-widest text-xs px-8 py-3 rounded-sm transition-all shadow-[0_0_20px_rgba(68,237,183,0.2)]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </section>

              {/* Wallet & Account Card */}
              <section className="md:col-span-4 space-y-6">
                <div className="bg-surface-container border border-white/5 rounded-xl p-6 group hover:border-primary/20 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-primary">
                      account_balance_wallet
                    </span>
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                      Account
                    </h3>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-sm mb-6">
                    <p className="text-[10px] font-mono text-primary uppercase mb-2">
                      Connected Address
                    </p>
                    <p className="font-mono text-sm text-white mb-1">0x71a3...e9f2</p>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                      <span className="text-[10px] text-on-surface-variant font-mono uppercase">
                        Sui Mainnet
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={handleDisconnectWallet}
                      className="w-full glass-button py-3 text-[10px] font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Disconnect Wallet
                    </button>
                    <button
                      onClick={handleExportLogs}
                      className="w-full glass-button py-3 text-[10px] font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      Export Logs
                    </button>
                    <a
                      href="#"
                      className="block text-center py-2 text-[10px] font-mono text-primary uppercase hover:underline"
                    >
                      View on explorer
                    </a>
                  </div>
                </div>

                {/* Status Quick View (Asymmetric layout helper) */}
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span
                      className="material-symbols-outlined text-9xl text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                  </div>
                  <h4 className="text-[10px] font-mono text-primary uppercase mb-4 tracking-tighter">
                    Node Status
                  </h4>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-4xl font-bold text-white tracking-tighter leading-none">
                      99.9
                    </span>
                    <span className="text-lg font-bold text-primary mb-1">%</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase">
                    Active Uptime
                  </p>
                </div>
              </section>

              {/* Agent Behavior Card (Bento style) */}
              <section className="md:col-span-12 bg-surface-container border border-white/5 rounded-xl overflow-hidden group">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div className="p-8 border-r border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                      <span className="material-symbols-outlined text-primary">robot_2</span>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                        Agent Behavior
                      </h3>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Configure the execution parameters for your autonomous AI agent. These settings
                      define the risk profile and gas consumption of all protocol interactions.
                    </p>
                  </div>
                  <div className="md:col-span-2 p-8 bg-surface-container-low/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <p className="text-white font-medium text-sm">Default Gas Limit</p>
                          <p className="font-mono text-xs text-primary">{gasLimit.toFixed(2)} SUI</p>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="0.1"
                          step="0.001"
                          value={gasLimit}
                          onChange={(e) => setGasLimit(parseFloat(e.target.value))}
                          className="w-full accent-primary bg-surface-container-highest h-1 rounded-full appearance-none"
                        />
                        <p className="text-[10px] text-on-surface-variant italic">
                          Maximum fee per atomic transaction.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <p className="text-white font-medium text-sm">Max Slippage</p>
                          <p className="font-mono text-xs text-primary">{maxSlippage}%</p>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.1"
                          value={maxSlippage}
                          onChange={(e) => setMaxSlippage(parseFloat(e.target.value))}
                          className="w-full accent-primary bg-surface-container-highest h-1 rounded-full appearance-none"
                        />
                        <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
                          <span>0.1%</span>
                          <span>5.0%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-surface-container-lowest border border-white/5 rounded-sm">
                        <div>
                          <p className="text-white font-medium text-xs">High Value Confirmation</p>
                          <p className="text-[10px] text-on-surface-variant">
                            Require MFA for &gt;$10k tx
                          </p>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={highValueConfirmation}
                            onChange={() => setHighValueConfirmation(!highValueConfirmation)}
                          />
                          <div className="w-8 h-4 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-surface-container-lowest border border-white/5 rounded-sm">
                        <div>
                          <p className="text-white font-medium text-xs">Auto-Execute Mode</p>
                          <p className="text-[10px] text-on-surface-variant">
                            Bypass manual approval
                          </p>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={autoExecuteMode}
                            onChange={() => setAutoExecuteMode(!autoExecuteMode)}
                          />
                          <div className="w-8 h-4 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={handleUpdateAgentParams}
                        className="bg-surface-container-highest hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] px-6 py-2 rounded-sm transition-all border border-white/10"
                      >
                        Update Parameters
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Privacy & Data */}
              <section className="md:col-span-6 bg-surface-container border border-white/5 rounded-xl p-8 group transition-all duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary">visibility_off</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                    Privacy & Data
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="pr-8">
                      <p className="text-white font-medium text-sm">Anonymised Usage Data</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Share encrypted diagnostic reports to help improve protocol stability. No
                        private keys are ever accessed.
                      </p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={anonymisedData}
                        onChange={() => setAnonymisedData(!anonymisedData)}
                      />
                      <div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleClearCache}
                      className="glass-button py-4 text-[10px] font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">delete_sweep</span>
                      Clear Cache
                    </button>
                    <button
                      onClick={handleDataExport}
                      className="glass-button py-4 text-[10px] font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">database</span>
                      Data Export
                    </button>
                  </div>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="md:col-span-6 bg-error-container/5 border border-error/20 rounded-xl p-8 group transition-all duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-error">warning</span>
                  <h3 className="text-lg font-bold text-error uppercase tracking-tight">
                    Danger Zone
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-error-container/10 border border-error/10 rounded-sm">
                    <div>
                      <p className="text-white font-medium text-sm">Purge Policies</p>
                      <p className="text-[10px] text-error opacity-80 uppercase font-mono">
                        Irreversible Action
                      </p>
                    </div>
                    <button
                      onClick={handleDeletePolicies}
                      className="bg-error hover:bg-error/80 text-on-error font-bold uppercase tracking-widest text-[10px] px-4 py-2 rounded-sm transition-all"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-error-container/10 border border-error/10 rounded-sm">
                    <div>
                      <p className="text-white font-medium text-sm">Revoke Key Shards</p>
                      <p className="text-[10px] text-error opacity-80 uppercase font-mono">
                        Reset Vault Access
                      </p>
                    </div>
                    <button
                      onClick={handleRevokeKeyShards}
                      className="bg-error hover:bg-error/80 text-on-error font-bold uppercase tracking-widest text-[10px] px-4 py-2 rounded-sm transition-all"
                    >
                      Revoke
                    </button>
                  </div>
                  <button
                    onClick={handlePermanentDelete}
                    className="w-full mt-4 border border-error/40 py-3 text-[10px] font-bold text-error uppercase tracking-[0.2em] hover:bg-error/10 transition-all rounded-sm"
                  >
                    Permanently Delete Account
                  </button>
                </div>
              </section>
            </div>
            <div className="mt-12 mb-8 flex justify-center opacity-40">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em]">
                Janus Protocol v2.4.0-Stable // Build 8820
              </p>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastVisible && (
          <div className="absolute bottom-8 right-8 flex flex-col gap-3 pointer-events-none">
            <div className="bg-surface-container-highest border-l-2 border-primary p-4 shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-500">
              <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
              <p className="text-[10px] font-mono text-white uppercase tracking-wider">
                {toastMessage}
              </p>
            </div>
          </div>
        )}

        {/* Decorative UI Element */}
        <div className="absolute bottom-0 right-0 w-1/4 h-64 bg-gradient-to-tl from-primary/5 to-transparent pointer-events-none"></div>
      </main>
    </div>
  );
};

export default Settings;
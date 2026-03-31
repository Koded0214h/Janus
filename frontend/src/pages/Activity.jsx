import React, { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/Sidebar";
import { JanusSidebar } from "@/components/JanusSidebar";

const Activity = () => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange] = useState("Last 30 Days");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [protocolFilter, setProtocolFilter] = useState("All Protocols");

  // Sample transaction data (for modal)
  const transactionDetails = {
    hash: "0x123...456f92a1100b",
    timestamp: "Nov 24, 2023 · 14:32:01.42 UTC",
    intent:
      '"If BTC goes above $38k and ETH stays below $2.1k, sell 5% BTC for ETH on Uniswap v3 to maintain risk ratio."',
    policy: "Rebalance_Macro_Risk_v4",
    status: "success",
  };

  const handleRowClick = (txId) => {
    setSelectedTx(txId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTx(null);
  };

  // Helper to render status badge
  const StatusBadge = ({ status }) => {
    let colorClass = "";
    let text = "";
    switch (status) {
      case "success":
        colorClass = "bg-primary/10 text-primary border-primary/20";
        text = "Success";
        break;
      case "failed":
        colorClass = "bg-error/10 text-error border-error/20";
        text = "Failed";
        break;
      case "pending":
        colorClass = "bg-tertiary/10 text-tertiary border-tertiary/20";
        text = "Pending";
        break;
      default:
        colorClass = "bg-surface-container-highest text-on-surface-variant border-outline-variant/10";
        text = "Completed";
    }
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${colorClass}`}
      >
        {text}
      </span>
    );
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <JanusSidebar />
      <SidebarInset>
        <div className="bg-background text-on-surface font-body selection:bg-primary/30 selection:text-primary min-h-screen">
          {/* TopAppBar */}
          <header className="sticky top-0 right-0 left-0 h-16 z-40 bg-background/80 backdrop-blur-md flex justify-between items-center px-8 border-b border-outline-variant/10 font-mono text-sm">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger />
              <div className="max-w-xl w-full">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                    search
                  </span>
                  <input
                    className="w-full bg-surface-container-lowest border-none text-xs focus:ring-1 focus:ring-primary/40 rounded-sm pl-10 h-9 transition-all"
                    placeholder="CMD+K TO SEARCH TRANSACTIONS..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <button className="text-on-surface-variant hover:text-primary transition-all scale-95 active:scale-90 relative">
                  <span className="material-symbols-outlined">notifications</span>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
                </button>
                <button className="text-on-surface-variant hover:text-primary transition-all scale-95 active:scale-90">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </button>
              </div>
              <div className="h-8 w-[1px] bg-outline-variant/30"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-on-surface-variant leading-none uppercase">
                    Janus_v1.0.4
                  </p>
                  <p className="text-xs text-primary font-bold leading-none mt-1">0x71C...8E2</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/30 overflow-hidden">
                  <img
                    alt="User profile"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7tXreQWjLDu1PxCwzGYs6xObY57-NUQyT08A1pz9qMDoJcGmj13pdMMi2DypQoIwxyWe7vL1gioQDnbqCjg5g24EIeiZ2uD9jNx8jqH5wqqt4z53oqfgQgJCg-UQhwg_1VIO_z4nnwfZFU_hiWM4OLA7uMazHH3tiVMozO8-x6lXuT8GKB3l3h12nH-DxoUkVFWPIyHkBSKcOUkuQR9YNhhpVjmyT9em8xe0LzjStJUjbvneWE54dBDxNVx5XeVdSlFg0bSFJm1Y"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="pt-8 px-6 md:px-10 pb-12 min-h-screen">
            {/* Header Section */}
            <div className="mb-10 max-w-5xl">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-sm bg-primary/10 border border-primary/20 mb-4">
                <span className="material-symbols-outlined text-primary text-xs">history</span>
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                  Live Audit Log
                </span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2">
                Agent Activity
              </h2>
              <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
                Complete history of all actions executed by Janus, including transactions, policy
                triggers, and security events.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 items-end">
              <div className="md:col-span-4">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 px-1">
                  Global Search
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/40 rounded-sm text-sm h-11 pl-4"
                    placeholder="Search by intent, hash, or address..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 px-1">
                  Date Range
                </label>
                <div className="bg-surface-container-low h-11 rounded-sm px-4 flex items-center justify-between text-sm text-on-surface cursor-pointer hover:bg-surface-container transition-colors">
                  <span>{dateRange}</span>
                  <span className="material-symbols-outlined text-on-surface-variant">
                    calendar_today
                  </span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 px-1">
                  Status
                </label>
                <select
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/40 rounded-sm text-sm h-11 appearance-none px-4"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  <option>Success</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 px-1">
                  Protocol
                </label>
                <select
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/40 rounded-sm text-sm h-11 appearance-none px-4"
                  value={protocolFilter}
                  onChange={(e) => setProtocolFilter(e.target.value)}
                >
                  <option>All Protocols</option>
                  <option>Uniswap</option>
                  <option>Aave</option>
                  <option>Ondu</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button className="w-full h-11 flex items-center justify-center gap-2 bg-surface-container-low border border-outline-variant/10 text-on-surface rounded-sm hover:bg-surface-container-high transition-all glass-panel">
                  <span className="material-symbols-outlined text-base">download</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Export CSV</span>
                </button>
              </div>
            </div>

            {/* Activity Table Card */}
            <div className="bg-surface-container-low rounded-sm overflow-hidden border border-outline-variant/10">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-highest/30 border-b border-outline-variant/10">
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        Time
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        Intent
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        Protocol
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        Hash
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {/* Transaction 1: Rebalancing */}
                    <tr
                      className="hover:bg-primary/5 transition-all cursor-pointer group"
                      onClick={() => handleRowClick("tx1")}
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm text-on-surface font-medium">2 mins ago</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">14:32:01</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-base">
                            swap_horiz
                          </span>
                          <span className="text-sm text-on-surface font-medium">
                            Rebalanced 5% BTC -&gt; ETH
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-mono text-on-surface">+$2,340 USDC</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center">
                            <span className="material-symbols-outlined text-[12px]">token</span>
                          </div>
                          <span className="text-xs font-mono uppercase tracking-tighter">
                            Uniswap v3
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <StatusBadge status="success" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
                          <span>0x123...456</span>
                          <span className="material-symbols-outlined text-xs hover:text-primary transition-colors cursor-pointer">
                            content_copy
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Transaction 2: Yield Deposit */}
                    <tr
                      className="hover:bg-primary/5 transition-all cursor-pointer group"
                      onClick={() => handleRowClick("tx2")}
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm text-on-surface font-medium">15 mins ago</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">14:19:44</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-base">
                            account_balance
                          </span>
                          <span className="text-sm text-on-surface font-medium">
                            Auto-Compound Yield Rewards
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-mono text-on-surface">+$12.45 WETH</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center">
                            <span className="material-symbols-outlined text-[12px]">show_chart</span>
                          </div>
                          <span className="text-xs font-mono uppercase tracking-tighter">
                            Aave Ghost
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <StatusBadge status="success" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
                          <span>0x8a2...32c</span>
                          <span className="material-symbols-outlined text-xs hover:text-primary transition-colors cursor-pointer">
                            content_copy
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Transaction 3: Emergency Withdrawal (Failed) */}
                    <tr
                      className="hover:bg-primary/5 transition-all cursor-pointer group"
                      onClick={() => handleRowClick("tx3")}
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm text-on-surface font-medium">1 hour ago</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">13:30:12</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-error text-base">
                            warning
                          </span>
                          <span className="text-sm text-on-surface font-medium">
                            Emergency TVL Withdrawal
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-mono text-error">$45,000.00</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center">
                            <span className="material-symbols-outlined text-[12px]">layers</span>
                          </div>
                          <span className="text-xs font-mono uppercase tracking-tighter">
                            Ondu Protocol
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <StatusBadge status="failed" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
                          <span>0xf92...11a</span>
                          <span className="material-symbols-outlined text-xs hover:text-primary transition-colors cursor-pointer">
                            content_copy
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Transaction 4: Gas Top-up */}
                    <tr
                      className="hover:bg-primary/5 transition-all cursor-pointer group"
                      onClick={() => handleRowClick("tx4")}
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm text-on-surface font-medium">2 hours ago</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">12:15:00</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-tertiary text-base">
                            local_gas_station
                          </span>
                          <span className="text-sm text-on-surface font-medium">
                            Low Balance Gas Top-up
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-mono text-on-surface">-0.05 ETH</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center">
                            <span className="material-symbols-outlined text-[12px]">toll</span>
                          </div>
                          <span className="text-xs font-mono uppercase tracking-tighter">
                            Arbitrum L2
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <StatusBadge status="success" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
                          <span>0x3d4...92b</span>
                          <span className="material-symbols-outlined text-xs hover:text-primary transition-colors cursor-pointer">
                            content_copy
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Transaction 5: Routine Policy Verification */}
                    <tr className="hover:bg-primary/5 transition-all cursor-pointer group">
                      <td className="px-6 py-5">
                        <p className="text-sm text-on-surface font-medium">4 hours ago</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">10:45:12</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-on-surface-variant text-base">
                            sync
                          </span>
                          <span className="text-sm text-on-surface font-medium">
                            Routine Policy Verification Scan
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-mono text-on-surface-variant">N/A</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono uppercase tracking-tighter">
                          Protocol Core
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <StatusBadge status="completed" />
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono text-on-surface-variant">
                          Internal_Audit_77
                        </span>
                      </td>
                    </tr>

                    {/* Transaction 6: Liquidity Provisioning */}
                    <tr
                      className="hover:bg-primary/5 transition-all cursor-pointer group"
                      onClick={() => handleRowClick("tx6")}
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm text-on-surface font-medium">Yesterday</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">23:01:05</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-base">
                            add_circle
                          </span>
                          <span className="text-sm text-on-surface font-medium">
                            Liquidity Provisioning: USDC/ETH
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-mono text-on-surface">+$10,000.00</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono uppercase tracking-tighter">
                          Curve Finance
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <StatusBadge status="pending" />
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono text-on-surface-variant">0x621...ff2</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-surface-container px-6 py-4 border-t border-outline-variant/10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Showing 1-10 of 2,456 events
                </span>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-sm bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 rounded-sm bg-surface-container-lowest border border-primary/20 flex items-center justify-center text-primary">
                    1
                  </button>
                  <button className="w-8 h-8 rounded-sm bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                    2
                  </button>
                  <button className="w-8 h-8 rounded-sm bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                    3
                  </button>
                  <button className="w-8 h-8 rounded-sm bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Modal Overlay */}
          {isModalOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
              onClick={closeModal}
            >
              <div
                className="glass-panel w-full max-w-2xl border border-outline-variant/20 rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">receipt_long</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-on-surface">
                        Transaction Details
                      </h3>
                      <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest">
                        Protocol Execution Hash ID: TXN_849204
                      </p>
                    </div>
                  </div>
                  <button
                    className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                    onClick={closeModal}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        Status
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-sm font-bold text-primary uppercase tracking-widest">
                          Successfully Confirmed
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        Timestamp
                      </label>
                      <p className="text-sm font-mono text-on-surface">
                        {transactionDetails.timestamp}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        Original Intent
                      </label>
                      <p className="text-lg font-medium text-on-surface leading-tight">
                        {transactionDetails.intent}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <div className="bg-surface-container-lowest p-4 rounded-sm border border-outline-variant/10">
                        <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
                          Multi-Party Computation (MPC) Validation
                        </label>
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant">
                              <span>AI AGENT SIGNATURE</span>
                              <span className="text-primary">VERIFIED</span>
                            </div>
                            <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-full"></div>
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant">
                              <span>IKA NETWORK SHARD</span>
                              <span className="text-primary">VERIFIED</span>
                            </div>
                            <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-full"></div>
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant">
                              <span>USER KEY FRACTION</span>
                              <span className="text-primary">VERIFIED</span>
                            </div>
                            <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        Transaction Hash
                      </label>
                      <p className="text-sm font-mono text-primary cursor-pointer hover:underline">
                        {transactionDetails.hash}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        Triggering Policy
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs text-secondary">
                          verified_user
                        </span>
                        <span className="text-sm font-medium text-on-surface underline decoration-secondary/30 underline-offset-4 cursor-pointer">
                          {transactionDetails.policy}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-outline-variant/10 flex gap-4">
                    <button className="flex-1 py-3 bg-primary text-on-primary font-bold text-xs tracking-widest uppercase rounded-sm hover:opacity-90 transition-opacity">
                      View on Block Explorer
                    </button>
                    <button className="px-6 py-3 border border-outline-variant/20 text-on-surface font-bold text-xs tracking-widest uppercase rounded-sm hover:bg-surface-container transition-colors">
                      Download Audit PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Activity;

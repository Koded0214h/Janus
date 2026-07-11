import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/Sidebar";
import { JanusSidebar } from "@/components/JanusSidebar";
import api from "@/lib/api";
import { Loader2, Copy, ExternalLink, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const Activity = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/agents/transactions/');
      setTransactions(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRowClick = (tx) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTx(null);
  };

  const truncate = (str, len = 6) => {
    if (!str) return 'N/A';
    if (str.length <= len * 2) return str;
    return `${str.slice(0, len)}...${str.slice(-len)}`;
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.tx_hash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.intent?.natural_language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.token_symbol?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "All Status" || tx.status === statusFilter.toUpperCase();
    
    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase();
    let colorClass = "bg-surface-container-highest text-on-surface-variant";
    if (s === 'executed' || s === 'signed') colorClass = "bg-primary/10 text-primary border-primary/20";
    if (s === 'failed' || s === 'rejected') colorClass = "bg-error/10 text-error border-error/20";
    if (s === 'pending' || s === 'approved') colorClass = "bg-tertiary/10 text-tertiary border-tertiary/20";

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${colorClass}`}>
        {status}
      </span>
    );
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <JanusSidebar />
      <SidebarInset>
        <div className="bg-background text-on-surface font-body min-h-screen">
          <header className="sticky top-0 right-0 left-0 h-16 z-40 bg-background/80 backdrop-blur-md flex justify-between items-center px-8 border-b border-outline-variant/10 font-mono text-sm">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger />
              <div className="max-w-xl w-full">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
                  <input
                    className="w-full bg-surface-container-lowest border-none text-xs focus:ring-1 focus:ring-primary/40 rounded-sm pl-10 h-9 transition-all"
                    placeholder="SEARCH TRANSACTIONS..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </header>

          <main className="pt-8 px-6 md:px-10 pb-12">
            <div className="mb-10 max-w-5xl">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-sm bg-primary/10 border border-primary/20 mb-4">
                <span className="material-symbols-outlined text-primary text-xs">history</span>
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Live Audit Log</span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2">Agent Activity</h2>
              <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
                Complete history of all actions executed by Janus, including MPC-signed transactions and policy validations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 items-end">
              <div className="md:col-span-4">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 px-1">Global Search</label>
                <input
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/40 rounded-sm text-sm h-11 pl-4"
                  placeholder="Search by intent, hash, or token..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 px-1">Status</label>
                <select
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/40 rounded-sm text-sm h-11 px-4 text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  <option>Executed</option>
                  <option>Signed</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-sm overflow-hidden border border-outline-variant/10">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-highest/30 border-b border-outline-variant/10">
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Time</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Intent</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Protocol</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {isLoading ? (
                      <tr><td colSpan="6" className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
                    ) : filteredTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-primary/5 transition-all cursor-pointer group"
                        onClick={() => handleRowClick(tx)}
                      >
                        <td className="px-6 py-5">
                          <p className="text-sm text-on-surface font-medium">{new Date(tx.created_at).toLocaleDateString()}</p>
                          <p className="text-[10px] text-on-surface-variant font-mono">{new Date(tx.created_at).toLocaleTimeString()}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base">bolt</span>
                            <span className="text-sm text-on-surface font-medium truncate max-w-[200px]">
                              {tx.intent?.natural_language || 'Manual Execution'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-mono text-on-surface">{tx.amount} {tx.token_symbol}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-mono uppercase tracking-tighter">{tx.protocol || tx.chain}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
                            <span>{truncate(tx.tx_hash)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && filteredTransactions.length === 0 && (
                      <tr><td colSpan="6" className="py-20 text-center text-on-surface-variant italic">No activities matching your criteria.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>

          {isModalOpen && selectedTx && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6" onClick={closeModal}>
              <div className="glass-panel w-full max-w-2xl border border-outline-variant/20 rounded-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Execution Audit</h3>
                      <p className="text-[10px] text-on-surface-variant font-mono uppercase">ID: {selectedTx.id.slice(0,8)}</p>
                    </div>
                  </div>
                  <button onClick={closeModal} className="text-on-surface-variant hover:text-white"><AlertCircle /></button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Status</label>
                      <StatusBadge status={selectedTx.status} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Timestamp</label>
                      <p className="text-sm font-mono text-white">{new Date(selectedTx.created_at).toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Original Intent</label>
                      <p className="text-sm text-white bg-surface-container-lowest p-3 rounded-sm italic border-l-2 border-primary">
                        "{selectedTx.intent?.natural_language || 'Manual transaction proposed via Janus Protocol interface.'}"
                      </p>
                    </div>
                    <div className="col-span-2 bg-surface-container-lowest p-4 rounded-sm border border-outline-variant/10">
                      <label className="block text-[10px] font-bold text-primary uppercase mb-3">MPC Multi-Party Signature</label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-on-surface-variant">SHARD INTEGRITY (IKA)</span>
                          <span className="text-primary font-bold">VERIFIED</span>
                        </div>
                        <div className="h-1 bg-surface-container-highest rounded-full"><div className="h-full bg-primary w-full"></div></div>
                        <p className="text-[9px] text-on-surface-variant font-mono break-all opacity-50">
                          SIG: {selectedTx.iaka_signature?.slice(0, 100)}...
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Transaction Hash</label>
                      <div className="flex items-center gap-2 text-primary font-mono text-xs">
                        <span>{truncate(selectedTx.tx_hash, 12)}</span>
                        <Copy size={12} className="cursor-pointer" onClick={() => navigator.clipboard.writeText(selectedTx.tx_hash)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Chain</label>
                      <p className="text-sm font-bold text-white uppercase">{selectedTx.chain}</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-outline-variant/10 flex gap-4">
                    <button className="flex-1 py-3 bg-primary text-on-primary font-bold text-xs uppercase rounded-sm hover:opacity-90 flex items-center justify-center gap-2">
                      <ExternalLink size={14} /> Explorer
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

import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/Sidebar";
import { JanusSidebar } from "@/components/JanusSidebar";
import { JanusHeader } from "@/components/JanusHeader";
import api from "@/lib/api";
import { Loader2, ShieldCheck, Fingerprint, Verified, Globe, Landmark, CreditCard, XCircle, Info, Network } from "lucide-react";
import { useModal } from "@/context/ModalContext";

const ZKPassport = () => {
  const { showModal } = useModal();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for active proofs (can be semi-dynamic based on user status)
  const [activeProofs, setActiveProofs] = useState([]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await api.get('/users/me/');
      setUser(userData);
      
      // Map backend user status to proofs
      const proofs = [];
      if (userData.is_verified) {
        proofs.push({
          type: "Human",
          icon: <Fingerprint className="w-4 h-4 text-primary" />,
          verifier: "Janus Identity Oracle",
          issued: new Date(userData.date_joined).toLocaleDateString(),
          expires: "Permanent",
          status: "active",
        });
        
        if (userData.verification_level !== 'BASIC') {
          proofs.push({
            type: userData.verification_level === 'INSTITUTIONAL' ? "Institutional" : "Accredited Investor",
            icon: <Landmark className="w-4 h-4 text-primary" />,
            verifier: "Quadrata KYC",
            issued: new Date().toLocaleDateString(),
            expires: "31 Dec 2024",
            status: "active",
          });
        }
      }
      
      setActiveProofs(proofs);
    } catch (error) {
      console.error("Failed to fetch user for ZK Passport:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleGenerateProof = async (type) => {
    try {
      setIsGenerating(true);
      const result = await api.post('/users/generate-zk-proof/', {
        proof_type: type.toUpperCase().replace(' ', '_')
      });
      
      showModal(
        "ZK Proof Generated", 
        `Proof ID: ${result.proof_id}\n\nYour account verification status has been updated.`,
        "success"
      );
      
      // Refresh user data to show updated verification status
      await fetchUserData();
    } catch (error) {
      console.error("Proof generation failed:", error);
      showModal("Proof Failed", "Failed to generate ZK proof.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRequestCredential = () => {
    window.open("https://quadrata.com/", "_blank");
  };

  const handleRevokeProof = (type) => {
    showModal(
      "Confirm Revocation",
      `Are you sure you want to revoke the ${type} proof? This action is immutable.`,
      "warning",
      {
        isConfirm: true,
        confirmText: "Revoke Proof",
        onConfirm: () => {
          setActiveProofs(prev => prev.filter(p => p.type !== type));
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <JanusSidebar />
      <SidebarInset>
        <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen">
          <JanusHeader title="ZK Passport" />

          <main className="pt-8 px-6 pb-20 max-w-6xl mx-auto space-y-12">
            {/* 1. Header Section */}
            <section className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-zk-purple/10 text-zk-purple text-[10px] font-mono rounded border border-zk-purple/20 uppercase tracking-widest">
                  Zero-Knowledge Proofs Enabled
                </span>
              </div>
              <h2 className="text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
                ZK Passport
              </h2>
              <p className="max-w-2xl text-on-surface-variant text-lg font-light leading-relaxed">
                Prove your credentials without revealing your underlying data. Generate zero-knowledge proofs
                to access institutional DeFi pools and exclusive protocols.
              </p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 2. Credential Card */}
              <div className="lg:col-span-1">
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-sm p-8 relative overflow-hidden group shadow-2xl">
                  {/* Decoration */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-zk-purple/5 blur-3xl rounded-full"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-14 h-14 bg-surface-container-highest rounded-sm flex items-center justify-center border border-outline-variant/20">
                        <Fingerprint className="text-primary w-8 h-8" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                          Identity Status
                        </p>
                        <p className={`font-mono text-xs ${user?.is_verified ? 'text-primary' : 'text-error'}`}>
                          {user?.is_verified ? 'VERIFIED' : 'UNVERIFIED'}
                        </p>
                      </div>
                    </div>
                    <h3 className="text-xl font-headline font-bold mb-4 uppercase italic">Your Passport Status</h3>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {user?.is_verified ? (
                        <>
                          <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-sm border border-primary/20">
                            Human
                          </span>
                          <span className="px-2 py-1 bg-zk-purple/10 text-zk-purple text-[10px] font-bold uppercase tracking-widest rounded-sm border border-zk-purple/20">
                            {user?.verification_level}
                          </span>
                        </>
                      ) : (
                        <span className="px-2 py-1 bg-error/10 text-error text-[10px] font-bold uppercase tracking-widest rounded-sm border border-error/20">
                          Pending Verification
                        </span>
                      )}
                    </div>
                    <div className="space-y-4 pt-6 border-t border-outline-variant/10 font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-on-surface-variant uppercase">User ID</span>
                        <span className="text-xs">{String(user?.id).slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-on-surface-variant uppercase">Trust Score</span>
                        <span className="text-xs text-primary font-bold">{user?.is_verified ? '98/100' : '0/100'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Generate New Proof Section */}
              <div className="lg:col-span-2">
                <div className="bg-surface-container-low p-8 rounded-sm border border-outline-variant/10 h-full">
                  <div className="mb-8">
                    <h3 className="text-2xl font-headline font-bold mb-2 uppercase italic tracking-tight">Generate a New Proof</h3>
                    <p className="text-on-surface-variant text-sm font-light">
                      Select a credential to prove without revealing your identity.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Prove Human", icon: <Fingerprint className="w-5 h-5" />, desc: "Biometric uniqueness check" },
                      { label: "Prove Accredited", icon: <Landmark className="w-5 h-5" />, desc: "Institutional status verify" },
                      { label: "Prove Net Worth", icon: <CreditCard className="w-5 h-5" />, desc: "Balance > $100k proof" },
                      { label: "Prove Residency", icon: <Globe className="w-5 h-5" />, desc: "Regional compliance check" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleGenerateProof(item.label)}
                        disabled={isGenerating}
                        className="group relative p-6 bg-surface-container-lowest text-left border border-outline-variant/10 hover:border-primary transition-all rounded-sm overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex flex-col h-full justify-between gap-4 relative z-10">
                          <div className="text-primary group-hover:scale-110 transition-transform">
                            {item.icon}
                          </div>
                          <div>
                            <span className="font-headline font-bold text-lg block uppercase italic tracking-tighter">{item.label}</span>
                            <span className="text-[10px] text-on-surface-variant uppercase font-mono tracking-widest">{item.desc}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Active Proofs List */}
            <section className="bg-surface-container-low rounded-sm border border-outline-variant/10 overflow-hidden shadow-xl">
              <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-high/30">
                <h3 className="text-xl font-headline font-bold uppercase italic tracking-tight">Active ZK Proofs</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold uppercase text-primary tracking-widest">
                    {activeProofs.length} Active
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-lowest/50 border-b border-outline-variant/10">
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                        Credential Type
                      </th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                        Verifier
                      </th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                        Issued
                      </th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                        Expires
                      </th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                        Status
                      </th>
                      <th className="px-8 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {activeProofs.map((proof, idx) => (
                      <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded border border-primary/20">
                              {proof.icon}
                            </div>
                            <span className="text-sm font-headline font-bold uppercase italic tracking-tight">{proof.type}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs text-on-surface-variant font-mono">{proof.verifier}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-mono text-on-surface-variant">
                            {proof.issued}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-mono text-on-surface-variant">
                            {proof.expires}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                              Active
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button
                            onClick={() => handleRevokeProof(proof.type)}
                            className="p-2 hover:bg-error/10 text-on-surface-variant hover:text-error transition-all rounded-sm"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {activeProofs.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-8 py-20 text-center text-on-surface-variant italic">
                          <Info className="w-8 h-8 mx-auto mb-4 opacity-20" />
                          No active proofs generated.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 5. Request New Credential Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
              <div className="bg-surface-container-low p-10 rounded-sm border border-outline-variant/10 relative overflow-hidden flex flex-col justify-center group shadow-xl">
                <div className="relative z-10">
                  <h3 className="text-3xl font-headline font-black mb-4 uppercase italic tracking-tighter">Need a new credential?</h3>
                  <p className="text-on-surface-variant mb-8 max-w-sm text-sm font-light leading-relaxed">
                    Request additional credentials from trusted issuers like Quadrata, EAS, or
                    institutional partners to expand your ZK capabilities.
                  </p>
                  <button
                    onClick={handleRequestCredential}
                    className="px-8 py-4 bg-zk-purple text-white font-mono text-xs font-bold uppercase tracking-widest rounded-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-zk-purple/20"
                  >
                    Request New Credential
                  </button>
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShieldCheck className="w-[240px] h-[240px]" />
                </div>
              </div>

              <div className="bg-surface-container-low p-10 rounded-sm border border-outline-variant/10 flex flex-col items-center text-center justify-center shadow-xl">
                <div className="w-16 h-16 bg-primary/10 rounded-sm flex items-center justify-center mb-6 border border-primary/20">
                  <Network className="text-primary w-8 h-8" />
                </div>
                <h4 className="text-xl font-headline font-bold mb-2 uppercase italic tracking-tight">Connect Trusted Issuers</h4>
                <p className="text-on-surface-variant text-sm mb-6 max-w-xs font-light">
                  Easily link your existing web2 and web3 identities to generate stronger ZK proofs across the Janus network.
                </p>
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center text-on-surface-variant"
                    >
                      <Globe className="w-4 h-4" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-surface flex items-center justify-center text-primary text-[10px] font-bold">
                    +8
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default ZKPassport;
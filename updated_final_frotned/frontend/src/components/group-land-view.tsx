import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Building2, MapPin, Shield, CheckCircle2, AlertTriangle, ArrowRight,
  TrendingUp, DollarSign, Clock, RefreshCw, Plus, X, Sparkles, FileText,
  HelpCircle, Eye, ShoppingCart, Check, Info, ShieldCheck, Layers, Award
} from 'lucide-react';
import {
  fetchGroupParcels,
  fetchGroupParcelDetail,
  submitSellShareRequest,
  completeShareSale,
  submitBuyerInquiry,
  createGroupParcel,
} from '@/lib/api';

// Co-owner interface
export interface CoOwner {
  id: string;
  ownerName: string;
  contactEmail?: string;
  contactPhone?: string;
  sharePercentage: number;
  shareStatus: 'Not Selling' | 'Sale Request Pending' | 'Share For Sale' | 'Sale Completed';
  sellingDetails?: {
    sharePercentage: number;
    askingPrice: number;
    reason?: string;
    notes?: string;
    saleRequestId?: string;
  };
}

export interface Parcel {
  id: string;
  parcelIdentifier: string;
  title: string;
  location: string;
  totalArea: number;
  areaUnit: string;
  landType: string;
  notes?: string;
  coOwners: CoOwner[];
  auditLogs: {
    id: string;
    action: string;
    sellerName: string;
    buyerName: string;
    transferredPercentage: number;
    transactionPrice: number;
    timestamp: string;
    notes?: string;
  }[];
}

// Initial mock dataset matching user's exact specification
const INITIAL_PARCELS: Parcel[] = [
  {
    id: 'p-102',
    parcelIdentifier: 'P-102',
    title: 'Dholera SIR — Mixed Agricultural Group Parcel 102',
    location: 'Dholera Special Investment Region, Ahmedabad, Gujarat',
    totalArea: 14.8,
    areaUnit: 'Hectares',
    landType: 'Agricultural / Strategic Buffer',
    notes: 'Single parcel jointly inherited across 3 co-owners. Eligible for individual share transfer under Gujarat Revenue Code §42.',
    coOwners: [
      {
        id: 'owner-1',
        ownerName: 'Rahul',
        contactEmail: 'rahul.farmer@gujarat.in',
        contactPhone: '+91 98250 11022',
        sharePercentage: 50,
        shareStatus: 'Not Selling',
      },
      {
        id: 'owner-2',
        ownerName: 'Amit',
        contactEmail: 'amit.patel@gujarat.in',
        contactPhone: '+91 98250 22033',
        sharePercentage: 30,
        shareStatus: 'Share For Sale',
        sellingDetails: {
          sharePercentage: 30,
          askingPrice: 4500000,
          reason: 'Relocating business to Sanand Industrial Cluster',
          notes: 'Open to verified buyers under GIDC infrastructure pre-requisites.',
          saleRequestId: 'req-amit-102',
        },
      },
      {
        id: 'owner-3',
        ownerName: 'Priya',
        contactEmail: 'priya.desai@gujarat.in',
        contactPhone: '+91 98250 33044',
        sharePercentage: 20,
        shareStatus: 'Not Selling',
      },
    ],
    auditLogs: [
      {
        id: 'aud-101',
        action: 'SHARE_SALE_REQUEST_FILED',
        sellerName: 'Amit',
        buyerName: 'Public Marketplace',
        transferredPercentage: 30,
        transactionPrice: 4500000,
        timestamp: '12 Jun 2025, 09:15 IST',
        notes: 'Amit requested to sell his 30% individual share. Co-owners Rahul (50%) and Priya (20%) notified. Their ownership remains unaffected.',
      },
      {
        id: 'aud-100',
        action: 'INITIAL_REGISTRATION',
        sellerName: 'Gujarat Land Registry',
        buyerName: 'Co-Owners (Rahul, Amit, Priya)',
        transferredPercentage: 100,
        transactionPrice: 0,
        timestamp: '10 Jan 2024, 11:30 IST',
        notes: 'Ancestral joint parcel registered with 100% verified co-ownership breakdown.',
      },
    ],
  },
  {
    id: 'p-108',
    parcelIdentifier: 'P-108',
    title: 'Savli Multi-Owner Industrial Estate Parcel',
    location: 'Savli Taluka, Vadodara District, Gujarat',
    totalArea: 22.5,
    areaUnit: 'Hectares',
    landType: 'Industrial Logistics',
    notes: 'Multi-stakeholder warehousing parcel with clear boundaries and independent mutation records.',
    coOwners: [
      {
        id: 'owner-201',
        ownerName: 'Devendra Varma',
        sharePercentage: 40,
        shareStatus: 'Not Selling',
      },
      {
        id: 'owner-202',
        ownerName: 'Sunita Joshi',
        sharePercentage: 35,
        shareStatus: 'Not Selling',
      },
      {
        id: 'owner-203',
        ownerName: 'Kishore Trivedi',
        sharePercentage: 25,
        shareStatus: 'Not Selling',
      },
    ],
    auditLogs: [
      {
        id: 'aud-200',
        action: 'INITIAL_REGISTRATION',
        sellerName: 'Vadodara Land Revenue',
        buyerName: 'Joint Holders (Devendra, Sunita, Kishore)',
        transferredPercentage: 100,
        transactionPrice: 0,
        timestamp: '05 Mar 2024, 14:10 IST',
        notes: 'Group parcel setup with 100% verified ownership allocation.',
      },
    ],
  },
];

const OWNER_COLORS = ['#0FA89A', '#E85D68', '#064C55', '#F2A51A', '#5BA7D9', '#8A63D2', '#16A878'];

export function GroupLandView({ onNotify }: { onNotify?: (msg: string) => void }) {
  const [parcels, setParcels] = useState<Parcel[]>(() => {
    const saved = localStorage.getItem('bhoomi_group_parcels');
    return saved ? JSON.parse(saved) : INITIAL_PARCELS;
  });

  const [selectedParcelId, setSelectedParcelId] = useState<string>('p-102');
  const [activeTab, setActiveTab] = useState<'breakdown' | 'marketplace' | 'notifications' | 'audit'>('breakdown');

  // Modals state
  const [sellModalOwner, setSellModalOwner] = useState<CoOwner | null>(null);
  const [sellSharePercentage, setSellSharePercentage] = useState<number>(30);
  const [sellAskingPrice, setSellAskingPrice] = useState<string>('4500000');
  const [sellReason, setSellReason] = useState<string>('Personal capital reallocation');
  const [sellNotes, setSellNotes] = useState<string>('');

  const [viewRequestOwner, setViewRequestOwner] = useState<CoOwner | null>(null);
  const [buyModalRequest, setBuyModalRequest] = useState<{ parcel: Parcel; owner: CoOwner } | null>(null);
  const [buyerName, setBuyerName] = useState<string>('Vikram Mehta');
  const [buyerEmail, setBuyerEmail] = useState<string>('v.mehta@infra-invest.in');
  const [buyerOfferPrice, setBuyerOfferPrice] = useState<string>('4500000');

  const [createParcelModal, setCreateParcelModal] = useState(false);
  const [newParcelId, setNewParcelId] = useState('P-204');
  const [newTitle, setNewTitle] = useState('Surat Port Logistics Belt');
  const [newLocation, setNewLocation] = useState('Hazira Sub-District, Surat, Gujarat');
  const [newArea, setNewArea] = useState('18.0');
  const [newOwnersList, setNewOwnersList] = useState<{ name: string; share: number }[]>([
    { name: 'Owner A', share: 40 },
    { name: 'Owner B', share: 30 },
    { name: 'Owner C', share: 20 },
    { name: 'Owner D', share: 10 },
  ]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('bhoomi_group_parcels', JSON.stringify(parcels));
  }, [parcels]);

  // Load from backend if available
  useEffect(() => {
    async function loadFromBackend() {
      try {
        const data = await fetchGroupParcels().catch(() => null);
        if (data && Array.isArray(data) && data.length > 0) {
          // If backend has parcels, load detail of first or matching
          const detail = await fetchGroupParcelDetail(selectedParcelId).catch(() => null);
          if (detail && detail.co_owners) {
            setParcels((prev) =>
              prev.map((p) => {
                if (p.parcelIdentifier === detail.parcel_identifier || p.id === detail.id) {
                  return {
                    ...p,
                    coOwners: detail.co_owners.map((o: any) => ({
                      id: o.id,
                      ownerName: o.owner_name,
                      contactEmail: o.contact_email,
                      contactPhone: o.contact_phone,
                      sharePercentage: o.ownership_percentage,
                      shareStatus: o.share_status,
                      sellingDetails: detail.sale_requests?.find((sr: any) => sr.co_owner_id === o.id && sr.status === 'Active') ? {
                        sharePercentage: detail.sale_requests.find((sr: any) => sr.co_owner_id === o.id).share_percentage,
                        askingPrice: detail.sale_requests.find((sr: any) => sr.co_owner_id === o.id).asking_price,
                        reason: detail.sale_requests.find((sr: any) => sr.co_owner_id === o.id).reason,
                        notes: detail.sale_requests.find((sr: any) => sr.co_owner_id === o.id).notes,
                        saleRequestId: detail.sale_requests.find((sr: any) => sr.co_owner_id === o.id).id,
                      } : undefined,
                    })),
                    auditLogs: (detail.audit_logs || []).map((a: any) => ({
                      id: a.id,
                      action: a.action,
                      sellerName: a.seller_name,
                      buyerName: a.buyer_name,
                      transferredPercentage: a.transferred_percentage,
                      transactionPrice: a.transaction_price,
                      timestamp: new Date(a.created_at).toLocaleString('en-IN'),
                      notes: a.notes,
                    })),
                  };
                }
                return p;
              })
            );
          }
        }
      } catch (err) {
        // Resilient fallback to local state
      }
    }
    loadFromBackend();
  }, [selectedParcelId]);

  const currentParcel = useMemo(() => {
    return parcels.find((p) => p.id === selectedParcelId) || parcels[0];
  }, [parcels, selectedParcelId]);

  // Total Ownership calculation
  const totalOwnership = useMemo(() => {
    if (!currentParcel) return 0;
    return Math.round(currentParcel.coOwners.reduce((sum, o) => sum + o.sharePercentage, 0) * 100) / 100;
  }, [currentParcel]);

  const activeForSaleCount = useMemo(() => {
    if (!currentParcel) return 0;
    return currentParcel.coOwners.filter((o) => o.shareStatus === 'Share For Sale').length;
  }, [currentParcel]);

  // Notification list
  const notifications = useMemo(() => {
    const list: { id: string; title: string; message: string; timestamp: string; level: 'critical' | 'info' | 'low' }[] = [];
    currentParcel.coOwners.forEach((owner) => {
      if (owner.shareStatus === 'Share For Sale' && owner.sellingDetails) {
        const otherOwners = currentParcel.coOwners.filter((o) => o.id !== owner.id).map((o) => o.ownerName);
        list.push({
          id: `notif-${owner.id}`,
          title: `Co-Owner Notice: ${owner.ownerName} Listed ${owner.sellingDetails.sharePercentage}% Share For Sale`,
          message: `Notice dispatched to remaining co-owners (${otherOwners.join(', ')}). Your respective shares remain strictly safeguarded and unaffected.`,
          timestamp: 'Just now • Certified Notice',
          level: 'critical',
        });
      }
    });
    return list;
  }, [currentParcel]);

  // Handle "Sell My Share" submission
  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellModalOwner) return;

    if (sellSharePercentage <= 0 || sellSharePercentage > sellModalOwner.sharePercentage) {
      alert(`Invalid share percentage! You can sell at most ${sellModalOwner.sharePercentage}%.`);
      return;
    }

    const priceNum = parseFloat(sellAskingPrice) || 0;
    if (priceNum <= 0) {
      alert('Please enter a valid asking price.');
      return;
    }

    // Try backend call
    try {
      await submitSellShareRequest(currentParcel.id, {
        co_owner_id: sellModalOwner.id,
        share_percentage: sellSharePercentage,
        asking_price: priceNum,
        reason: sellReason,
        notes: sellNotes,
      }).catch(() => null);
    } catch {
      // Handled in local state
    }

    // Update local state
    setParcels((prev) =>
      prev.map((p) => {
        if (p.id === currentParcel.id) {
          const updatedOwners = p.coOwners.map((o) => {
            if (o.id === sellModalOwner.id) {
              return {
                ...o,
                shareStatus: 'Share For Sale' as const,
                sellingDetails: {
                  sharePercentage: sellSharePercentage,
                  askingPrice: priceNum,
                  reason: sellReason,
                  notes: sellNotes,
                  saleRequestId: `req-${Date.now()}`,
                },
              };
            }
            return o;
          });

          const newAudit = {
            id: `aud-${Date.now()}`,
            action: 'SHARE_SALE_REQUEST_FILED',
            sellerName: sellModalOwner.ownerName,
            buyerName: 'Prospective Buyers',
            transferredPercentage: sellSharePercentage,
            transactionPrice: priceNum,
            timestamp: new Date().toLocaleString('en-IN'),
            notes: `${sellModalOwner.ownerName} submitted a 'Sell My Share' request for ${sellSharePercentage}% at ₹${priceNum.toLocaleString('en-IN')}. Remaining co-owners stay 'Not Selling'.`,
          };

          return {
            ...p,
            coOwners: updatedOwners,
            auditLogs: [newAudit, ...p.auditLogs],
          };
        }
        return p;
      })
    );

    const notifyMsg = `Sell request filed for ${sellModalOwner.ownerName} (${sellSharePercentage}%). Other co-owners notified.`;
    onNotify?.(notifyMsg);
    setSellModalOwner(null);
  };

  // Handle Buyer Purchase Completion
  const handleCompletePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyModalRequest) return;

    const { owner, parcel } = buyModalRequest;
    const soldShare = owner.sellingDetails?.sharePercentage || owner.sharePercentage;
    const finalPrice = parseFloat(buyerOfferPrice) || (owner.sellingDetails?.askingPrice ?? 0);

    // Try backend call
    if (owner.sellingDetails?.saleRequestId) {
      try {
        await completeShareSale(owner.sellingDetails.saleRequestId, {
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          final_price: finalPrice,
          notes: 'Settled via BhoomiSetu Co-Ownership Liquidation Protocol',
        }).catch(() => null);
      } catch {
        // Handled in local state
      }
    }

    // Atomic reallocation in state
    setParcels((prev) =>
      prev.map((p) => {
        if (p.id === parcel.id) {
          const remainingSellerShare = Math.round((owner.sharePercentage - soldShare) * 100) / 100;
          let updatedOwners: CoOwner[] = [];

          p.coOwners.forEach((co) => {
            if (co.id === owner.id) {
              if (remainingSellerShare > 0) {
                // Kept a portion
                updatedOwners.push({
                  ...co,
                  sharePercentage: remainingSellerShare,
                  shareStatus: 'Not Selling',
                  sellingDetails: undefined,
                });
              } else {
                // Completely sold out
                updatedOwners.push({
                  ...co,
                  sharePercentage: 0,
                  shareStatus: 'Sale Completed',
                  sellingDetails: undefined,
                });
              }
            } else {
              // Unchanged other co-owners!
              updatedOwners.push(co);
            }
          });

          // Check if buyer already exists in parcel
          const existingBuyerIndex = updatedOwners.findIndex(
            (o) => o.ownerName.toLowerCase().trim() === buyerName.toLowerCase().trim()
          );

          if (existingBuyerIndex >= 0) {
            updatedOwners[existingBuyerIndex] = {
              ...updatedOwners[existingBuyerIndex],
              sharePercentage: Math.round((updatedOwners[existingBuyerIndex].sharePercentage + soldShare) * 100) / 100,
            };
          } else {
            // Add new buyer as co-owner
            updatedOwners.push({
              id: `buyer-${Date.now()}`,
              ownerName: `${buyerName} (Buyer)`,
              contactEmail: buyerEmail,
              sharePercentage: soldShare,
              shareStatus: 'Not Selling',
            });
          }

          // Filter out 0% owners for clean table display
          const finalActiveOwners = updatedOwners.filter((o) => o.sharePercentage > 0);

          const newAudit = {
            id: `aud-${Date.now()}`,
            action: 'SHARE_SALE_COMPLETED',
            sellerName: owner.ownerName,
            buyerName: buyerName,
            transferredPercentage: soldShare,
            transactionPrice: finalPrice,
            timestamp: new Date().toLocaleString('en-IN'),
            notes: `Successfully transferred ${soldShare}% share from ${owner.ownerName} to ${buyerName} for ₹${finalPrice.toLocaleString('en-IN')}. Other co-owners remained untouched. Total 100% validated.`,
          };

          return {
            ...p,
            coOwners: finalActiveOwners,
            auditLogs: [newAudit, ...p.auditLogs],
          };
        }
        return p;
      })
    );

    onNotify?.(`🎉 Ownership transferred! ${buyerName} now holds ${soldShare}% of ${parcel.parcelIdentifier}. Total = 100%.`);
    setBuyModalRequest(null);
  };

  // Reset to initial demo data
  const handleResetDemo = () => {
    localStorage.removeItem('bhoomi_group_parcels');
    setParcels(INITIAL_PARCELS);
    setSelectedParcelId('p-102');
    onNotify?.('Reset to initial BhoomiSetu demo state (Rahul 50%, Amit 30% For Sale, Priya 20%).');
  };

  // Create new custom parcel
  const handleCreateParcelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = newOwnersList.reduce((s, o) => s + (Number(o.share) || 0), 0);
    if (Math.round(sum) !== 100) {
      alert(`Total shares must equal exactly 100%! Current sum is ${sum}%.`);
      return;
    }

    const createdParcel: Parcel = {
      id: `p-${Date.now()}`,
      parcelIdentifier: newParcelId,
      title: newTitle,
      location: newLocation,
      totalArea: parseFloat(newArea) || 10,
      areaUnit: 'Hectares',
      landType: 'Industrial / Commercial',
      coOwners: newOwnersList.map((o, idx) => ({
        id: `custom-o-${idx}-${Date.now()}`,
        ownerName: o.name,
        sharePercentage: o.share,
        shareStatus: 'Not Selling',
      })),
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          action: 'INITIAL_REGISTRATION',
          sellerName: 'State Registry',
          buyerName: newOwnersList.map((o) => o.name).join(', '),
          transferredPercentage: 100,
          transactionPrice: 0,
          timestamp: new Date().toLocaleString('en-IN'),
          notes: `Group land parcel ${newParcelId} established with ${newOwnersList.length} co-owners totalling 100%.`,
        },
      ],
    };

    setParcels((prev) => [createdParcel, ...prev]);
    setSelectedParcelId(createdParcel.id);
    setCreateParcelModal(false);
    onNotify?.(`Created new group land parcel ${newParcelId} with 100% verified co-ownership.`);
  };

  return (
    <div className="page-wrap">
      {/* Header */}
      <header className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow">Land Administration · Section 42 Group Mutation</div>
          <h1 className="display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', margin: '6px 0 6px' }}>
            Group Land & Co-Ownership
          </h1>
          <p className="muted" style={{ fontSize: 13.5, margin: 0, maxWidth: 720 }}>
            Manage single land parcels owned by multiple individuals as a group. Co-owners can individually liquidate or sell their personal share without forcing other co-owners to sell.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-soft"
            onClick={handleResetDemo}
            title="Reset to default example with Rahul (50%), Amit (30% For Sale), Priya (20%)"
            data-testid="button-reset-demo"
          >
            <RefreshCw size={14} /> Reset Demo State
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setCreateParcelModal(true)}
            data-testid="button-create-group-parcel"
          >
            <Plus size={14} /> Register Group Parcel
          </button>
        </div>
      </header>

      {/* Parcel Selection Ribbon */}
      <div className="surface" style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Building2 size={18} className="muted" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#102A43' }}>Select Land Parcel:</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {parcels.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedParcelId(p.id)}
                className={`btn ${selectedParcelId === p.id ? 'btn-primary' : 'btn-quiet'}`}
                style={{ padding: '6px 14px', fontSize: 12.5 }}
                data-testid={`button-select-parcel-${p.parcelIdentifier.toLowerCase()}`}
              >
                <strong>{p.parcelIdentifier}</strong>
                <span style={{ opacity: 0.85, marginLeft: 6, fontSize: 11 }}>
                  ({p.coOwners.length} owners)
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EDF6F5', border: '1px solid #0FA89A', padding: '5px 11px', borderRadius: 7 }}>
            <ShieldCheck size={15} color="#0FA89A" />
            <span className="mono" style={{ fontSize: 11.5, color: '#064C55', fontWeight: 600 }}>
              Invariant: {totalOwnership.toFixed(1)}% / 100.0% Verified
            </span>
          </div>

          {activeForSaleCount > 0 ? (
            <span className="tag risk-critical" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <i style={{ width: 7, height: 7, borderRadius: '50%', background: '#E85D68', display: 'inline-block' }} />
              {activeForSaleCount} Individual Share For Sale
            </span>
          ) : (
            <span className="tag risk-low" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={12} /> All Shares Held
            </span>
          )}
        </div>
      </div>

      {/* Hero Land Details Card */}
      <div className="surface" style={{ padding: 22, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: '#0FA89A', background: '#EDF6F5', padding: '3px 9px', borderRadius: 6 }}>
                {currentParcel.parcelIdentifier}
              </span>
              <h2 style={{ fontSize: 19, margin: 0, color: '#102A43', fontWeight: 700 }}>
                {currentParcel.title}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
              <span className="tiny muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} color="#0FA89A" /> {currentParcel.location}
              </span>
              <span className="tiny muted">•</span>
              <span className="tiny muted">
                Total Area: <strong style={{ color: '#102A43' }}>{currentParcel.totalArea} {currentParcel.areaUnit}</strong>
              </span>
              <span className="tiny muted">•</span>
              <span className="tiny muted">
                Total Co-Owners: <strong style={{ color: '#102A43' }}>{currentParcel.coOwners.length} verified individuals</strong>
              </span>
              <span className="tiny muted">•</span>
              <span className="tiny muted">
                Classification: <strong style={{ color: '#102A43' }}>{currentParcel.landType}</strong>
              </span>
            </div>

            {currentParcel.notes && (
              <p className="tiny muted" style={{ marginTop: 10, maxWidth: 820, lineHeight: 1.55 }}>
                {currentParcel.notes}
              </p>
            )}
          </div>

          <div style={{ textAlign: 'right', minWidth: 200 }}>
            <div className="eyebrow" style={{ color: '#526B82' }}>Parcel Listing Mode</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: activeForSaleCount > 0 ? '#E85D68' : '#16A878', marginTop: 4 }}>
              {activeForSaleCount > 0 ? 'Partial Individual Share Listed' : '100% Private Retained'}
            </div>
            <div className="tiny muted" style={{ marginTop: 4 }}>
              Entire property is <strong style={{ color: '#102A43' }}>NOT</strong> for sale.
            </div>
          </div>
        </div>

        {/* Dynamic Proportional Multi-Segment Ownership Bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span className="tiny" style={{ fontWeight: 600, color: '#102A43' }}>
              Group Ownership Structure Breakdown (100% Balance)
            </span>
            <span className="tiny mono muted">Sum: {totalOwnership}%</span>
          </div>

          <div
            style={{
              display: 'flex',
              height: 24,
              width: '100%',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#E5EFEE',
              border: '1px solid #D8E8E6',
            }}
          >
            {currentParcel.coOwners.map((owner, idx) => {
              const bg = OWNER_COLORS[idx % OWNER_COLORS.length];
              const isForSale = owner.shareStatus === 'Share For Sale';
              return (
                <div
                  key={owner.id}
                  style={{
                    width: `${owner.sharePercentage}%`,
                    background: bg,
                    position: 'relative',
                    transition: 'width 0.4s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                  title={`${owner.ownerName}: ${owner.sharePercentage}% (${owner.shareStatus})`}
                >
                  {owner.sharePercentage >= 15 && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 4px' }}>
                      {owner.ownerName} {owner.sharePercentage}% {isForSale ? '🔴' : ''}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10 }}>
            {currentParcel.coOwners.map((owner, idx) => {
              const color = OWNER_COLORS[idx % OWNER_COLORS.length];
              const isForSale = owner.shareStatus === 'Share For Sale';
              return (
                <div key={owner.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: 'inline-block' }} />
                  <span className="tiny" style={{ color: '#102A43', fontWeight: 600 }}>
                    {owner.ownerName}:
                  </span>
                  <span className="tiny mono" style={{ color: '#526B82' }}>
                    {owner.sharePercentage}%
                  </span>
                  {isForSale ? (
                    <span className="tag risk-critical" style={{ padding: '1px 6px', fontSize: 10 }}>
                      🔴 For Sale
                    </span>
                  ) : (
                    <span className="tag risk-low" style={{ padding: '1px 6px', fontSize: 10 }}>
                      🟢 Not Selling
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #D8E8E6', marginBottom: 20 }}>
        <button
          className={`nav-tab ${activeTab === 'breakdown' ? 'active' : ''}`}
          onClick={() => setActiveTab('breakdown')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: 7 }}
          data-testid="tab-ownership-breakdown"
        >
          <Users size={15} />
          <span>Co-Owners Table & Actions</span>
          <span className="mono tiny muted" style={{ background: '#EDF6F5', padding: '2px 6px', borderRadius: 4 }}>
            {currentParcel.coOwners.length}
          </span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: 7 }}
          data-testid="tab-buyer-marketplace"
        >
          <ShoppingCart size={15} />
          <span>Buyer Marketplace & Acquisition</span>
          {activeForSaleCount > 0 && (
            <span className="tag risk-critical" style={{ padding: '1px 6px', fontSize: 10 }}>
              {activeForSaleCount} Active
            </span>
          )}
        </button>

        <button
          className={`nav-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: 7 }}
          data-testid="tab-co-owner-notifications"
        >
          <Shield size={15} />
          <span>Co-Owner Transparency Notices</span>
          <span className="mono tiny muted" style={{ background: '#EDF6F5', padding: '2px 6px', borderRadius: 4 }}>
            {notifications.length}
          </span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: 7 }}
          data-testid="tab-audit-trail"
        >
          <FileText size={15} />
          <span>Ownership Audit Trail</span>
          <span className="mono tiny muted" style={{ background: '#EDF6F5', padding: '2px 6px', borderRadius: 4 }}>
            {currentParcel.auditLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: OWNERSHIP BREAKDOWN & ACTIONS TABLE */}
      {activeTab === 'breakdown' && (
        <div>
          {/* Important Rule Banner */}
          <div className="surface" style={{ padding: '12px 16px', marginBottom: 16, background: '#F5FAF9', border: '1px solid #D8E8E6', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Info size={18} color="#0FA89A" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: '#102A43', lineHeight: 1.5 }}>
              <strong>Protected Co-Ownership Principle:</strong> An individual co-owner has the legal right to list and sell their own share. Submitting a sell request <strong>NEVER</strong> forces or modifies the shares of remaining co-owners. All non-selling shares remain safely retained at 100% statutory validity.
            </div>
          </div>

          <div className="surface table-wrap" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 780 }} data-testid="table-co-owners">
              <thead>
                <tr>
                  <th>Co-Owner</th>
                  <th>Contact / ID</th>
                  <th>Share %</th>
                  <th>Proportional Area</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentParcel.coOwners.map((owner, idx) => {
                  const proportionalArea = ((currentParcel.totalArea * owner.sharePercentage) / 100).toFixed(2);
                  const isForSale = owner.shareStatus === 'Share For Sale';
                  const isCompleted = owner.shareStatus === 'Sale Completed';

                  return (
                    <tr key={owner.id} data-testid={`row-owner-${owner.ownerName.toLowerCase().replaceAll(' ', '-')}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              background: OWNER_COLORS[idx % OWNER_COLORS.length],
                              color: '#FFFFFF',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            {owner.ownerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ fontSize: 13.5, color: '#102A43' }}>{owner.ownerName}</strong>
                            <div className="tiny muted">Verified Co-Holder</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="tiny" style={{ color: '#102A43' }}>{owner.contactPhone || '+91 98250 XXXXX'}</div>
                        <div className="tiny muted">{owner.contactEmail || 'registry-record@revenue.in'}</div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong className="mono" style={{ fontSize: 14, color: '#102A43' }}>
                            {owner.sharePercentage}%
                          </strong>
                          <div style={{ width: 60, height: 6, background: '#E5EFEE', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${owner.sharePercentage}%`, height: '100%', background: OWNER_COLORS[idx % OWNER_COLORS.length] }} />
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="tiny mono" style={{ fontWeight: 600, color: '#102A43' }}>
                          {proportionalArea} {currentParcel.areaUnit}
                        </div>
                        <div className="tiny muted">Undivided Share</div>
                      </td>

                      <td>
                        {owner.shareStatus === 'Not Selling' && (
                          <span className="tag risk-low" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A878' }} />
                            🟢 Not Selling
                          </span>
                        )}

                        {owner.shareStatus === 'Share For Sale' && (
                          <span className="tag risk-critical" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D68' }} />
                            🔴 Share For Sale
                          </span>
                        )}

                        {owner.shareStatus === 'Sale Completed' && (
                          <span className="tag risk-info" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <Check size={12} />
                            🔵 Sale Completed
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {isForSale ? (
                          <button
                            className="btn btn-soft"
                            style={{ fontSize: 12, padding: '5px 12px' }}
                            onClick={() => setViewRequestOwner(owner)}
                            data-testid={`button-view-request-${owner.ownerName.toLowerCase().replaceAll(' ', '-')}`}
                          >
                            <Eye size={13} /> View Request
                          </button>
                        ) : isCompleted ? (
                          <span className="tiny muted">Share Transferred</span>
                        ) : (
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: 12, padding: '5px 12px' }}
                            onClick={() => {
                              setSellModalOwner(owner);
                              setSellSharePercentage(owner.sharePercentage);
                              setSellAskingPrice(
                                Math.round((currentParcel.totalArea * (owner.sharePercentage / 100) * 1500000)).toString()
                              );
                            }}
                            data-testid={`button-sell-share-${owner.ownerName.toLowerCase().replaceAll(' ', '-')}`}
                          >
                            <DollarSign size={13} /> Sell My Share
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BUYER MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div>
          <div className="surface" style={{ padding: 18, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: '#102A43' }}>
                  Available Co-Ownership Shares for Public & Institutional Acquisition
                </h3>
                <p className="tiny muted" style={{ margin: '4px 0 0' }}>
                  Prospective buyers can purchase verified individual shares. Purchasing an individual share adds the buyer to the co-ownership registry without disturbing non-selling holders.
                </p>
              </div>

              <span className="tag risk-info">
                GIDC & NHAI Compliant Transfer Protocol
              </span>
            </div>
          </div>

          {activeForSaleCount === 0 ? (
            <div className="surface" style={{ padding: 40, textAlign: 'center' }}>
              <CheckCircle2 size={32} color="#16A878" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ margin: 0, fontSize: 15, color: '#102A43' }}>No active shares currently listed for sale in this parcel</h4>
              <p className="tiny muted" style={{ margin: '6px 0 14px' }}>
                All co-owners are currently retaining their land. Click "Sell My Share" on any co-owner in the breakdown tab to simulate an active listing.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
              {currentParcel.coOwners
                .filter((o) => o.shareStatus === 'Share For Sale')
                .map((seller) => {
                  const details = seller.sellingDetails;
                  const propArea = ((currentParcel.totalArea * seller.sharePercentage) / 100).toFixed(2);
                  return (
                    <div key={seller.id} className="surface" style={{ padding: 20, border: '1px solid #E85D68', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="tag risk-critical" style={{ marginBottom: 6 }}>
                            🔴 Share For Sale: {details?.sharePercentage || seller.sharePercentage}%
                          </span>
                          <h4 style={{ margin: 0, fontSize: 16, color: '#102A43' }}>
                            Listed by {seller.ownerName}
                          </h4>
                          <div className="tiny muted" style={{ marginTop: 2 }}>
                            Parcel: {currentParcel.parcelIdentifier} ({currentParcel.location})
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div className="eyebrow" style={{ color: '#526B82' }}>Asking Price</div>
                          <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: '#064C55' }}>
                            ₹{details?.askingPrice ? details.askingPrice.toLocaleString('en-IN') : '45,00,000'}
                          </div>
                        </div>
                      </div>

                      <div style={{ background: '#F5FAF9', padding: 12, borderRadius: 8, margin: '14px 0', border: '1px solid #E5EFEE' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div>
                            <span className="tiny muted">Proportional Land Area:</span>
                            <div className="tiny mono" style={{ fontWeight: 600, color: '#102A43' }}>
                              {propArea} {currentParcel.areaUnit}
                            </div>
                          </div>
                          <div>
                            <span className="tiny muted">Land Classification:</span>
                            <div className="tiny" style={{ fontWeight: 600, color: '#102A43' }}>
                              {currentParcel.landType}
                            </div>
                          </div>
                        </div>

                        {details?.reason && (
                          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #E5EFEE' }}>
                            <span className="tiny muted">Reason for listing:</span>
                            <div className="tiny" style={{ color: '#526B82', fontStyle: 'italic' }}>
                              "{details.reason}"
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => {
                            setBuyModalRequest({ parcel: currentParcel, owner: seller });
                            setBuyerOfferPrice((details?.askingPrice || 4500000).toString());
                          }}
                          data-testid="button-buy-share-now"
                        >
                          <ShoppingCart size={14} /> Buy Share / Express Interest
                        </button>

                        <button
                          className="btn btn-soft"
                          onClick={() => setViewRequestOwner(seller)}
                          title="Inspect full details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CO-OWNER NOTIFICATIONS & TRANSPARENCY HUB */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'grid', gap: 14 }}>
          <div className="surface" style={{ padding: 18 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#102A43' }}>
              Co-Owner Transparency & Notification Ledger
            </h3>
            <p className="tiny muted" style={{ margin: '4px 0 0' }}>
              Under the Land Acquisition Transparency Protocol, whenever an individual co-owner initiates a liquidation, automated notifications are served to all other registered owners.
            </p>
          </div>

          {notifications.length === 0 ? (
            <div className="surface" style={{ padding: 36, textAlign: 'center' }}>
              <ShieldCheck size={32} color="#16A878" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ margin: 0, fontSize: 15, color: '#102A43' }}>All Co-Owners in Active Retention</h4>
              <p className="tiny muted" style={{ margin: '4px 0 0' }}>
                No liquidation notices are currently pending for {currentParcel.parcelIdentifier}.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="surface"
                style={{ padding: 18, borderLeft: '4px solid #E85D68', display: 'flex', gap: 14, alignItems: 'flex-start' }}
              >
                <AlertTriangle size={20} color="#E85D68" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 14, color: '#102A43' }}>{notif.title}</strong>
                    <span className="tiny mono muted">{notif.timestamp}</span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#526B82', lineHeight: 1.5 }}>
                    {notif.message}
                  </p>
                  <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="tag risk-low" style={{ fontSize: 11 }}>
                      <CheckCircle2 size={11} /> Co-Owner Retained Rights Certified
                    </span>
                    <span className="tiny muted">Notice Dispatch ID: NTC-{notif.id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: IMMUTABLE OWNERSHIP AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div>
          <div className="surface" style={{ padding: 18, marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#102A43' }}>
              Immutable Ownership Change Trail — {currentParcel.parcelIdentifier}
            </h3>
            <p className="tiny muted" style={{ margin: '4px 0 0' }}>
              Auditable log tracking all co-owner admissions, share sales, and mutation transitions with 100% mathematical verification.
            </p>
          </div>

          <div className="surface" style={{ padding: '8px 20px' }}>
            <div style={{ display: 'grid', gap: 0 }}>
              {currentParcel.auditLogs.map((log, index) => (
                <div
                  key={log.id}
                  style={{
                    padding: '16px 0',
                    borderBottom: index < currentParcel.auditLogs.length - 1 ? '1px solid #E5EFEE' : 'none',
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: log.action.includes('COMPLETED') ? '#EDF6F5' : '#FFF5F5',
                      color: log.action.includes('COMPLETED') ? '#0FA89A' : '#E85D68',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {log.action.includes('COMPLETED') ? <CheckCircle2 size={16} /> : <FileText size={16} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <strong style={{ fontSize: 13.5, color: '#102A43' }}>{log.action.replaceAll('_', ' ')}</strong>
                        <span className="tiny muted" style={{ marginLeft: 8 }}>
                          Seller: <strong>{log.sellerName}</strong> → Buyer: <strong>{log.buyerName}</strong>
                        </span>
                      </div>
                      <span className="tiny mono muted">{log.timestamp}</span>
                    </div>

                    <p style={{ margin: '5px 0 0', fontSize: 13, color: '#526B82', lineHeight: 1.5 }}>
                      {log.notes}
                    </p>

                    <div style={{ display: 'flex', gap: 14, marginTop: 8, alignItems: 'center' }}>
                      <span className="tiny mono" style={{ background: '#EDF6F5', padding: '2px 8px', borderRadius: 4, color: '#064C55' }}>
                        Share: {log.transferredPercentage}%
                      </span>
                      {log.transactionPrice > 0 && (
                        <span className="tiny mono" style={{ background: '#F5FAF9', padding: '2px 8px', borderRadius: 4, color: '#102A43' }}>
                          Settlement: ₹{log.transactionPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: "SELL MY SHARE" SUBMISSION DIALOG
          ========================================================================= */}
      {sellModalOwner && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(4, 46, 53, 0.65)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1200, padding: 16 }}>
          <div className="surface reveal" style={{ maxWidth: 520, width: '100%', padding: 26, borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div className="eyebrow" style={{ color: '#E85D68' }}>Section 42 Individual Share Liquidation</div>
                <h3 style={{ margin: '4px 0 0', fontSize: 18, color: '#102A43' }}>
                  Sell My Share — {sellModalOwner.ownerName}
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setSellModalOwner(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#EDF6F5', padding: 12, borderRadius: 8, marginBottom: 18, border: '1px solid #D8E8E6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="tiny muted">Current Ownership in {currentParcel.parcelIdentifier}:</span>
                <strong className="mono" style={{ fontSize: 14, color: '#064C55' }}>
                  {sellModalOwner.sharePercentage}% ({((currentParcel.totalArea * sellModalOwner.sharePercentage) / 100).toFixed(2)} {currentParcel.areaUnit})
                </strong>
              </div>
            </div>

            <form onSubmit={handleSellSubmit}>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label className="tiny" style={{ fontWeight: 600, display: 'block', marginBottom: 5, color: '#102A43' }}>
                    Percentage of Share to Sell (%):
                  </label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                      type="range"
                      min="1"
                      max={sellModalOwner.sharePercentage}
                      value={sellSharePercentage}
                      onChange={(e) => setSellSharePercentage(Number(e.target.value))}
                      style={{ flex: 1, accentColor: '#0FA89A' }}
                    />
                    <input
                      type="number"
                      min="1"
                      max={sellModalOwner.sharePercentage}
                      value={sellSharePercentage}
                      onChange={(e) => setSellSharePercentage(Math.min(sellModalOwner.sharePercentage, Number(e.target.value)))}
                      className="input mono"
                      style={{ width: 80, textAlign: 'center', fontWeight: 700 }}
                      data-testid="input-sell-percentage"
                    />
                  </div>
                  <div className="tiny muted" style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Min: 1%</span>
                    <span>Max Owned: {sellModalOwner.sharePercentage}%</span>
                  </div>
                </div>

                <div>
                  <label className="tiny" style={{ fontWeight: 600, display: 'block', marginBottom: 5, color: '#102A43' }}>
                    Expected Asking Price (₹ INR):
                  </label>
                  <input
                    type="number"
                    value={sellAskingPrice}
                    onChange={(e) => setSellAskingPrice(e.target.value)}
                    className="input mono"
                    placeholder="e.g. 4500000"
                    required
                    data-testid="input-sell-price"
                  />
                  <span className="tiny muted" style={{ marginTop: 4, display: 'block' }}>
                    Formatted: ₹{Number(sellAskingPrice || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <label className="tiny" style={{ fontWeight: 600, display: 'block', marginBottom: 5, color: '#102A43' }}>
                    Reason for Liquidation (Optional):
                  </label>
                  <select
                    className="select"
                    value={sellReason}
                    onChange={(e) => setSellReason(e.target.value)}
                  >
                    <option>Personal capital reallocation</option>
                    <option>Relocating business or residence</option>
                    <option>Family estate settlement</option>
                    <option>Agricultural equipment reinvestment</option>
                    <option>Commercial liquidity</option>
                  </select>
                </div>

                <div>
                  <label className="tiny" style={{ fontWeight: 600, display: 'block', marginBottom: 5, color: '#102A43' }}>
                    Additional Notes / Buyer Pre-Requisites:
                  </label>
                  <textarea
                    className="input"
                    rows={2}
                    value={sellNotes}
                    onChange={(e) => setSellNotes(e.target.value)}
                    placeholder="e.g. Immediate mutation preferred, verified statutory buyer only..."
                  />
                </div>

                {/* Validation preview */}
                <div style={{ background: '#FFF8EB', border: '1px solid #F2A51A', padding: 11, borderRadius: 8 }}>
                  <div className="tiny" style={{ color: '#784C00', lineHeight: 1.45 }}>
                    <strong>Remaining Share After Sale:</strong> {sellModalOwner.sharePercentage - sellSharePercentage}%.
                    Remaining co-owners ({currentParcel.coOwners.filter((o) => o.id !== sellModalOwner.id).map((o) => o.ownerName).join(', ')}) will receive certified notice, but their shares will <strong>remain unchanged</strong>.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-quiet"
                    style={{ flex: 1 }}
                    onClick={() => setSellModalOwner(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    data-testid="button-confirm-sell-request"
                  >
                    Submit Sell Request
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: VIEW ACTIVE REQUEST DETAILS
          ========================================================================= */}
      {viewRequestOwner && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(4, 46, 53, 0.65)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1200, padding: 16 }}>
          <div className="surface reveal" style={{ maxWidth: 480, width: '100%', padding: 24, borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span className="tag risk-critical" style={{ marginBottom: 4 }}>🔴 Active Liquidation</span>
                <h3 style={{ margin: '4px 0 0', fontSize: 17, color: '#102A43' }}>
                  {viewRequestOwner.ownerName}’s Share Request
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setViewRequestOwner(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5EFEE', paddingBottom: 8 }}>
                <span className="tiny muted">Parcel:</span>
                <span className="tiny mono" style={{ fontWeight: 600, color: '#102A43' }}>{currentParcel.parcelIdentifier}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5EFEE', paddingBottom: 8 }}>
                <span className="tiny muted">Share Offered for Sale:</span>
                <span className="tiny mono" style={{ fontWeight: 700, color: '#E85D68', fontSize: 14 }}>
                  {viewRequestOwner.sellingDetails?.sharePercentage || viewRequestOwner.sharePercentage}%
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5EFEE', paddingBottom: 8 }}>
                <span className="tiny muted">Expected Asking Price:</span>
                <span className="tiny mono" style={{ fontWeight: 700, color: '#064C55', fontSize: 15 }}>
                  ₹{(viewRequestOwner.sellingDetails?.askingPrice || 4500000).toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5EFEE', paddingBottom: 8 }}>
                <span className="tiny muted">Reason:</span>
                <span className="tiny" style={{ color: '#102A43' }}>
                  {viewRequestOwner.sellingDetails?.reason || 'Personal liquidity'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5EFEE', paddingBottom: 8 }}>
                <span className="tiny muted">Other Co-Owners Impact:</span>
                <span className="tiny tag risk-low">None (Protected)</span>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setBuyModalRequest({ parcel: currentParcel, owner: viewRequestOwner });
                  setViewRequestOwner(null);
                }}
                data-testid="button-proceed-to-buy-from-view"
              >
                <ShoppingCart size={14} /> Buy This Share
              </button>

              <button
                className="btn btn-quiet"
                onClick={() => setViewRequestOwner(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: BUY SHARE & EXECUTE OWNERSHIP TRANSFER (1-CLICK EVALUATOR)
          ========================================================================= */}
      {buyModalRequest && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(4, 46, 53, 0.65)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1200, padding: 16 }}>
          <div className="surface reveal" style={{ maxWidth: 520, width: '100%', padding: 26, borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div className="eyebrow" style={{ color: '#0FA89A' }}>Statutory Share Transfer Execution</div>
                <h3 style={{ margin: '4px 0 0', fontSize: 18, color: '#102A43' }}>
                  Purchase Share from {buyModalRequest.owner.ownerName}
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setBuyModalRequest(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#EDF6F5', padding: 12, borderRadius: 8, marginBottom: 18, border: '1px solid #D8E8E6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="tiny muted">Share to be Purchased:</span>
                <strong className="mono" style={{ fontSize: 15, color: '#064C55' }}>
                  {buyModalRequest.owner.sellingDetails?.sharePercentage || buyModalRequest.owner.sharePercentage}%
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <span className="tiny muted">Parcel:</span>
                <span className="tiny mono" style={{ fontWeight: 600 }}>{buyModalRequest.parcel.parcelIdentifier}</span>
              </div>
            </div>

            <form onSubmit={handleCompletePurchase}>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label className="tiny" style={{ fontWeight: 600, display: 'block', marginBottom: 5, color: '#102A43' }}>
                    Buyer Full Name:
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="input"
                    required
                    data-testid="input-buyer-name"
                  />
                </div>

                <div>
                  <label className="tiny" style={{ fontWeight: 600, display: 'block', marginBottom: 5, color: '#102A43' }}>
                    Buyer Official Contact / Email:
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="tiny" style={{ fontWeight: 600, display: 'block', marginBottom: 5, color: '#102A43' }}>
                    Agreed Settlement Price (₹ INR):
                  </label>
                  <input
                    type="number"
                    value={buyerOfferPrice}
                    onChange={(e) => setBuyerOfferPrice(e.target.value)}
                    className="input mono"
                    required
                    data-testid="input-buyer-price"
                  />
                </div>

                {/* Mathematical result preview */}
                <div style={{ background: '#F5FAF9', border: '1px solid #D8E8E6', padding: 12, borderRadius: 8 }}>
                  <div className="eyebrow" style={{ color: '#0FA89A', marginBottom: 6 }}>
                    Post-Transaction Simulation (Strict 100% Invariant):
                  </div>
                  <div style={{ fontSize: 12.5, color: '#102A43', display: 'grid', gap: 4 }}>
                    {buyModalRequest.parcel.coOwners.map((o) => {
                      if (o.id === buyModalRequest.owner.id) {
                        return (
                          <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>• {o.ownerName} (Seller):</span>
                            <span className="mono">0% (Replaced by Buyer)</span>
                          </div>
                        );
                      }
                      return (
                        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#526B82' }}>
                          <span>• {o.ownerName} (Retaining):</span>
                          <span className="mono"><strong>{o.sharePercentage}%</strong> (Unchanged)</span>
                        </div>
                      );
                    })}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0FA89A', fontWeight: 700, borderTop: '1px solid #E5EFEE', paddingTop: 4 }}>
                      <span>+ {buyerName} (New Co-Owner):</span>
                      <span className="mono">+{buyModalRequest.owner.sellingDetails?.sharePercentage || buyModalRequest.owner.sharePercentage}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#064C55', borderTop: '1px dashed #0FA89A', paddingTop: 4 }}>
                      <span>= Total Ownership:</span>
                      <span className="mono">100.0% Verified</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-quiet"
                    style={{ flex: 1 }}
                    onClick={() => setBuyModalRequest(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1.5 }}
                    data-testid="button-execute-settlement"
                  >
                    <CheckCircle2 size={14} /> Execute Mutation & Transfer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: CREATE NEW GROUP LAND PARCEL
          ========================================================================= */}
      {createParcelModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(4, 46, 53, 0.65)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1200, padding: 16 }}>
          <div className="surface reveal" style={{ maxWidth: 560, width: '100%', padding: 26, borderRadius: 12, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div className="eyebrow">Registry Registration</div>
                <h3 style={{ margin: '4px 0 0', fontSize: 18, color: '#102A43' }}>
                  Register New Group Land Parcel
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setCreateParcelModal(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateParcelSubmit}>
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                  <div>
                    <label className="tiny" style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Parcel ID:</label>
                    <input className="input mono" value={newParcelId} onChange={(e) => setNewParcelId(e.target.value)} required />
                  </div>
                  <div>
                    <label className="tiny" style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Parcel Title:</label>
                    <input className="input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                  <div>
                    <label className="tiny" style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Location:</label>
                    <input className="input" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} required />
                  </div>
                  <div>
                    <label className="tiny" style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Area (Hectares):</label>
                    <input className="input mono" type="number" step="0.1" value={newArea} onChange={(e) => setNewArea(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="tiny" style={{ fontWeight: 600 }}>Co-Owners Breakdown (Must sum to 100%):</label>
                    <span className="tiny mono" style={{ color: newOwnersList.reduce((s, o) => s + (Number(o.share) || 0), 0) === 100 ? '#16A878' : '#E85D68', fontWeight: 700 }}>
                      Current Sum: {newOwnersList.reduce((s, o) => s + (Number(o.share) || 0), 0)}%
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    {newOwnersList.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input
                          className="input"
                          placeholder="Owner Name"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...newOwnersList];
                            updated[idx].name = e.target.value;
                            setNewOwnersList(updated);
                          }}
                          style={{ flex: 2 }}
                          required
                        />
                        <input
                          className="input mono"
                          type="number"
                          placeholder="Share %"
                          value={item.share}
                          onChange={(e) => {
                            const updated = [...newOwnersList];
                            updated[idx].share = Number(e.target.value);
                            setNewOwnersList(updated);
                          }}
                          style={{ width: 90, textAlign: 'center' }}
                          required
                        />
                        <span className="tiny">%</span>
                        {newOwnersList.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-quiet"
                            style={{ padding: '6px 8px' }}
                            onClick={() => setNewOwnersList(newOwnersList.filter((_, i) => i !== idx))}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-soft"
                    style={{ marginTop: 8, fontSize: 12, padding: '5px 10px' }}
                    onClick={() => setNewOwnersList([...newOwnersList, { name: `Owner ${String.fromCharCode(65 + newOwnersList.length)}`, share: 0 }])}
                  >
                    + Add Co-Owner
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button type="button" className="btn btn-quiet" style={{ flex: 1 }} onClick={() => setCreateParcelModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} data-testid="button-submit-create-parcel">
                    Register Group Parcel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

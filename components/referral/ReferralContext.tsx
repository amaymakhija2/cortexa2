import React, { createContext, useContext, useState, ReactNode } from 'react';

// =============================================================================
// REFERRAL CONTEXT
// =============================================================================
// Manages referral state: invites remaining, earnings, referral history
// =============================================================================

export interface Referral {
  id: string;
  email: string;
  status: 'pending' | 'confirmed';
  invitedAt: Date;
  confirmedAt?: Date;
}

interface ReferralContextType {
  // Invite management
  invitesRemaining: number;
  totalInvites: number;
  referralCode: string;

  // Earnings
  pendingEarnings: number;
  confirmedEarnings: number;
  payoutThreshold: number;
  rewardPerReferral: number;

  // Payout setup
  isPayoutSetup: boolean;
  setPayoutSetup: (setup: boolean) => void;

  // Referral history
  referrals: Referral[];

  // Actions
  useInvite: (email: string) => boolean;
}

const ReferralContext = createContext<ReferralContextType | null>(null);

// Generate a unique referral code based on user
const generateReferralCode = (): string => {
  // In production, this would come from the backend
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const ReferralProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [invitesRemaining, setInvitesRemaining] = useState(5);
  const [isPayoutSetup, setPayoutSetup] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([
    // Demo data - in production this comes from backend
    {
      id: '1',
      email: 'sarah.t@mindfultherapy.com',
      status: 'confirmed',
      invitedAt: new Date('2024-11-15'),
      confirmedAt: new Date('2024-12-01'),
    },
    {
      id: '2',
      email: 'michael.r@serenitygroup.com',
      status: 'pending',
      invitedAt: new Date('2024-12-05'),
    },
  ]);

  const [referralCode] = useState(() => generateReferralCode());

  const totalInvites = 5;
  const rewardPerReferral = 200;
  const payoutThreshold = 200;

  // Calculate earnings
  const confirmedEarnings = referrals.filter(r => r.status === 'confirmed').length * rewardPerReferral;
  const pendingEarnings = referrals.filter(r => r.status === 'pending').length * rewardPerReferral;

  const useInvite = (email: string): boolean => {
    if (invitesRemaining <= 0) return false;

    const newReferral: Referral = {
      id: Date.now().toString(),
      email,
      status: 'pending',
      invitedAt: new Date(),
    };

    setReferrals(prev => [...prev, newReferral]);
    setInvitesRemaining(prev => prev - 1);
    return true;
  };

  return (
    <ReferralContext.Provider value={{
      invitesRemaining,
      totalInvites,
      referralCode,
      pendingEarnings,
      confirmedEarnings,
      payoutThreshold,
      rewardPerReferral,
      isPayoutSetup,
      setPayoutSetup,
      referrals,
      useInvite,
    }}>
      {children}
    </ReferralContext.Provider>
  );
};

export const useReferral = (): ReferralContextType => {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
};

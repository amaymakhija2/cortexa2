import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, Users, Clock } from 'lucide-react';
import { AnimatedSection, Grid } from '../design-system';
import { ConfigCard } from './shared';
import type { EHRConnection } from './shared';

export const EHRConnectionTab: React.FC<{
  ehr: EHRConnection;
  onRefresh: () => void;
}> = ({ ehr, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onRefresh();
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTimeUntilNextSync = () => {
    const now = new Date();
    const next = new Date(ehr.nextSyncAvailable);
    const diff = next.getTime() - now.getTime();
    if (diff <= 0) return 'Available now';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <div>
      <AnimatedSection delay={0}>
        <div className="mb-8">
          <h2
            className="text-3xl font-bold text-stone-800"
            style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
          >
            EHR Connection
          </h2>
          <p className="text-stone-500 text-lg mt-1">Manage your data sync with your practice management system</p>
        </div>
      </AnimatedSection>

      <Grid cols={2}>
        {/* Connection Status Card */}
        <AnimatedSection delay={0.05} className="col-span-2">
          <ConfigCard accent={ehr.status === 'connected' ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)'}>
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Provider Logo */}
                  <div
                    className={`
                      w-20 h-20 rounded-2xl flex items-center justify-center
                      ${ehr.status === 'connected' ? 'bg-emerald-50' : 'bg-rose-50'}
                    `}
                  >
                    {ehr.status === 'connected' ? (
                      <Wifi size={36} className="text-emerald-600" />
                    ) : (
                      <WifiOff size={36} className="text-rose-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-4">
                      <h3
                        className="text-2xl font-bold text-stone-800"
                        style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                      >
                        {ehr.provider}
                      </h3>
                      <span
                        className={`
                          px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wide
                          ${ehr.status === 'connected'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ehr.status === 'syncing'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'}
                        `}
                      >
                        {ehr.status === 'syncing' ? 'Syncing...' : ehr.status}
                      </span>
                    </div>
                    <p className="text-stone-500 mt-1">
                      Last synced: {formatDate(ehr.lastSync)}
                    </p>
                  </div>
                </div>

                {/* Refresh Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`
                    flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-lg
                    ${isRefreshing
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : 'bg-stone-800 text-white hover:bg-stone-700'}
                    transition-colors
                  `}
                >
                  <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                  {isRefreshing ? 'Syncing...' : 'Refresh Now'}
                </motion.button>
              </div>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Sync Stats */}
        <AnimatedSection delay={0.1}>
          <ConfigCard>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-800">Synced Data</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-stone-50 text-center">
                  <p
                    className="text-4xl font-bold text-stone-800"
                    style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                  >
                    {ehr.totalClients}
                  </p>
                  <p className="text-stone-500 mt-1">Active Clients</p>
                </div>
                <div className="p-5 rounded-xl bg-stone-50 text-center">
                  <p
                    className="text-4xl font-bold text-stone-800"
                    style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                  >
                    {ehr.totalClinicians}
                  </p>
                  <p className="text-stone-500 mt-1">Clinicians</p>
                </div>
              </div>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Next Sync */}
        <AnimatedSection delay={0.15}>
          <ConfigCard>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock size={24} className="text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-800">Next Automatic Sync</h3>
              </div>

              <div className="p-5 rounded-xl bg-amber-50 text-center">
                <p
                  className="text-4xl font-bold text-amber-700"
                  style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                >
                  {getTimeUntilNextSync()}
                </p>
                <p className="text-amber-600 mt-1">
                  {new Date(ehr.nextSyncAvailable) <= new Date()
                    ? 'Manual refresh available'
                    : formatDate(ehr.nextSyncAvailable)}
                </p>
              </div>

              <p className="text-stone-400 text-sm mt-4 text-center">
                Data syncs automatically once per day. Manual refresh available when countdown reaches zero.
              </p>
            </div>
          </ConfigCard>
        </AnimatedSection>
      </Grid>
    </div>
  );
};

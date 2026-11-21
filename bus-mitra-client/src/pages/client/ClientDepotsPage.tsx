import React, { useState } from 'react';
import { PhoneCall, Building2, MapPin, Search, ShieldCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ClientDepotsPage: React.FC = () => {
  const { depots, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter only active depots for client users
  const activeDepots = depots.filter((d) => d.status === 'Active');

  const filteredDepots = activeDepots.filter(
    (d) =>
      d.depotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phoneNumber.includes(searchQuery)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
          <Building2 className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Depot Contacts
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Official KSRTC & NWKRTC enquiry and helpline numbers.
        </p>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search depot or district (e.g. Kumta, Sirsi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Depots List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-2">
                <div className="h-5 bg-slate-200 rounded w-40" />
                <div className="h-4 bg-slate-100 rounded w-24" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredDepots.length > 0 ? (
          filteredDepots.map((depot) => (
            <div
              key={depot.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {depot.depotName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {depot.district}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                  {depot.address && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {depot.address}
                    </p>
                  )}
                </div>

                {/* Call Button (Opens phone dialer) */}
                <a
                  href={`tel:${depot.phoneNumber.replace(/[^0-9]/g, '')}`}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ml-2 touch-press"
                  title={`Call ${depot.depotName}`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>

              {/* Phone number display */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Direct Line:</span>
                <span className="font-mono font-bold text-slate-900 tracking-wider">
                  {depot.phoneNumber}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Depots Found</h4>
            <p className="text-xs text-slate-400 mt-1">Try another search keyword.</p>
          </div>
        )}
      </div>
    </div>
  );
};

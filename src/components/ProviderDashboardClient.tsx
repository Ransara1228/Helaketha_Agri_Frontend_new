'use client';

import { useMemo, useState } from 'react';

type ProviderMode = 'tractor' | 'harvester' | 'fertilizer';

type ProviderProfile = {
  id: number;
  name: string;
  email: string;
  phone: string;
  machineQuantity?: number;
  availableMachines?: number;
  fertilizerType?: string;
  pricePerAcre?: number;
  pricePerLiter?: number;
};

type BookingRow = {
  bookingId: number;
  farmerId: number;
  providerId: number;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  totalCost: number;
  status: string;
};

type ProviderDashboardClientProps = {
  mode: ProviderMode;
  userLabel: string;
  provider: ProviderProfile | null;
  initialBookings: BookingRow[];
};

function normalizeStatus(value: unknown): string {
  const raw = typeof value === 'string' ? value : 'Pending';
  const clean = raw.replaceAll('_', ' ').trim();
  if (!clean) return 'Pending';
  const upper = clean.toUpperCase();
  if (upper === 'CANCELED' || upper === 'CANCELLED') return 'Cancelled';
  if (upper === 'INPROGRESS' || upper === 'IN PROGRESS') return 'In Progress';
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

function statusClass(status: string): string {
  const s = normalizeStatus(status).toLowerCase();
  if (s === 'completed') return 'bg-green-100 text-green-700 border-green-200';
  if (s === 'pending') return 'bg-amber-100 text-amber-700 border-amber-200';
  if (s === 'confirmed') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (s === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
  if (s.includes('progress')) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function unwrapServicesPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.items)) return o.items;
  }
  return [];
}

function readServiceProviderId(row: unknown): number {
  if (!row || typeof row !== 'object') return 0;
  const o = row as Record<string, unknown>;
  const keys = [
    'providerId',
    'provider_id',
    'harvesterDriverId',
    'harvester_driver_id',
    'tractorDriverId',
    'tractor_driver_id',
    'supplierId',
    'supplier_id',
  ];
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return 0;
}

function getModeMeta(mode: ProviderMode) {
  if (mode === 'tractor') {
    return {
      label: 'Tractor Driver',
      profileEndpoint: '/api/tractor-drivers',
      priceFieldLabel: 'Price / Acre (LKR)',
      accent: 'from-emerald-600 to-teal-600',
      softAccent: 'from-emerald-50 to-teal-50',
    };
  }
  if (mode === 'harvester') {
    return {
      label: 'Harvester Driver',
      profileEndpoint: '/api/harvester-drivers',
      priceFieldLabel: 'Price / Acre (LKR)',
      accent: 'from-cyan-600 to-blue-600',
      softAccent: 'from-cyan-50 to-blue-50',
    };
  }
  return {
    label: 'Fertilizer Supplier',
    profileEndpoint: '/api/fertilizer-suppliers',
    priceFieldLabel: 'Price / Liter (LKR)',
    accent: 'from-amber-600 to-orange-600',
    softAccent: 'from-amber-50 to-orange-50',
  };
}

function bookingServiceMatchesMode(mode: ProviderMode, serviceType: string): boolean {
  const v = (serviceType || '').toUpperCase();
  if (mode === 'tractor') return v.includes('TRACTOR');
  if (mode === 'harvester') return v.includes('HARVEST') || v.includes('HARVESTER');
  return v.includes('FERTILIZER') || v.includes('FERTILISER');
}

export default function ProviderDashboardClient({
  mode,
  userLabel,
  provider,
  initialBookings,
}: ProviderDashboardClientProps) {
  const meta = getModeMeta(mode);

  const [bookings, setBookings] = useState<BookingRow[]>(initialBookings);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [busyBookingId, setBusyBookingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [machineQuantity, setMachineQuantity] = useState<number>(provider?.machineQuantity ?? 0);
  const [availableMachines, setAvailableMachines] = useState<number>(provider?.availableMachines ?? 0);
  const [fertilizerType, setFertilizerType] = useState<string>(provider?.fertilizerType ?? '');
  const [pricePerAcre, setPricePerAcre] = useState<number>(provider?.pricePerAcre ?? 0);
  const [pricePerLiter, setPricePerLiter] = useState<number>(provider?.pricePerLiter ?? 0);

  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => normalizeStatus(b.status).toLowerCase() === 'completed').length;
    const pending = bookings.filter((b) => normalizeStatus(b.status).toLowerCase() === 'pending').length;
    const earnings = bookings
      .filter((b) => normalizeStatus(b.status).toLowerCase() === 'completed')
      .reduce((sum, b) => sum + (Number.isFinite(b.totalCost) ? b.totalCost : 0), 0);
    return { total, completed, pending, earnings };
  }, [bookings]);

  const refreshBookings = async () => {
    if (!provider?.id) return;
    try {
      setLoadingBookings(true);
      const response = await fetch('/api/services', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to load bookings');
      }
      const payload = await response.json();
      const rows = unwrapServicesPayload(payload);
      const normalized = rows
        .map((row: any) => ({
          bookingId: Number(row?.bookingId ?? row?.booking_id ?? row?.id ?? 0),
          farmerId: Number(row?.farmerId ?? row?.farmer_id ?? 0),
          providerId: readServiceProviderId(row),
          serviceType: String(row?.serviceType ?? row?.service_type ?? ''),
          bookingDate: String(row?.bookingDate ?? row?.booking_date ?? ''),
          bookingTime: String(row?.bookingTime ?? row?.booking_time ?? ''),
          totalCost: Number(row?.totalCost ?? row?.total_cost ?? 0),
          status: normalizeStatus(row?.status),
        }))
        .filter(
          (row) =>
            row.bookingId > 0 &&
            row.providerId === provider.id &&
            bookingServiceMatchesMode(mode, row.serviceType)
        )
        .sort((a, b) => b.bookingId - a.bookingId);
      setBookings(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const updateBookingStatus = async (booking: BookingRow, status: string) => {
    try {
      setBusyBookingId(booking.bookingId);
      setError(null);
      setMessage(null);

      const currentResponse = await fetch(`/api/services/${booking.bookingId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const currentPayload = currentResponse.ok ? await currentResponse.json() : booking;

      const response = await fetch(`/api/services/${booking.bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentPayload,
          farmerId: Number(currentPayload?.farmerId ?? booking.farmerId),
          providerId: Number(currentPayload?.providerId ?? booking.providerId),
          serviceType: String(currentPayload?.serviceType ?? booking.serviceType),
          bookingDate: String(currentPayload?.bookingDate ?? booking.bookingDate),
          bookingTime: String(currentPayload?.bookingTime ?? booking.bookingTime),
          totalCost: Number(currentPayload?.totalCost ?? booking.totalCost),
          status,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to update booking status');
      }

      setBookings((prev) =>
        prev.map((row) => (row.bookingId === booking.bookingId ? { ...row, status: normalizeStatus(status) } : row))
      );
      setMessage(`Booking #${booking.bookingId} updated to ${normalizeStatus(status)}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setBusyBookingId(null);
    }
  };

  const deleteBooking = async (bookingId: number) => {
    try {
      setBusyBookingId(bookingId);
      setError(null);
      setMessage(null);

      const response = await fetch(`/api/services/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete booking');
      }

      setBookings((prev) => prev.filter((row) => row.bookingId !== bookingId));
      setMessage(`Booking #${bookingId} deleted successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete booking');
    } finally {
      setBusyBookingId(null);
    }
  };

  const updateProfile = async () => {
    if (!provider?.id) {
      setError('Provider profile is not linked yet.');
      return;
    }

    try {
      setSavingProfile(true);
      setError(null);
      setMessage(null);

      const currentResponse = await fetch(`${meta.profileEndpoint}/${provider.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!currentResponse.ok) {
        throw new Error('Failed to load current profile');
      }
      const current = await currentResponse.json();

      const payload =
        mode === 'tractor'
          ? {
              ...current,
              machineQuantity: Number(machineQuantity),
              pricePerAcre: Number(pricePerAcre),
            }
          : mode === 'harvester'
            ? {
                ...current,
                availableMachines: Number(availableMachines),
                pricePerAcre: Number(pricePerAcre),
              }
            : {
                ...current,
                fertilizerType: fertilizerType.trim(),
                pricePerLiter: Number(pricePerLiter),
              };

      const response = await fetch(`${meta.profileEndpoint}/${provider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to update profile');
      }

      setMessage(`${meta.label} profile updated successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <main className={`relative min-h-screen bg-gradient-to-br ${meta.softAccent} via-slate-50 to-white py-8`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -right-10 top-24 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className={`mb-8 overflow-hidden rounded-3xl bg-gradient-to-r ${meta.accent} p-8 text-white shadow-2xl`}>
          <p className="mb-2 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
            Provider Control Center
          </p>
          <h1 className="text-3xl font-extrabold md:text-4xl">{meta.label}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">
            Welcome, {userLabel}. Manage your profile and all provider bookings from this dashboard.
          </p>
          <div className="mt-5 inline-flex items-center rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold text-white/95 backdrop-blur">
            {provider?.id ? `Linked Profile ID #${provider.id}` : 'Profile not linked yet'}
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm">{error}</div>
        ) : null}
        {message ? (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/95 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm">{message}</div>
        ) : null}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">All Bookings</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
            <p className="mt-2 text-2xl font-extrabold text-amber-700">{stats.pending}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-700">{stats.completed}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Earnings</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">LKR {stats.earnings.toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Update Profile</h2>
            <button
              type="button"
              onClick={updateProfile}
              disabled={savingProfile || !provider?.id}
              className={`rounded-xl bg-gradient-to-r ${meta.accent} px-4 py-2 text-sm font-semibold text-white shadow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {!provider?.id ? (
            <p className="text-sm text-slate-500">Your provider profile is not found yet. Contact admin to link your account.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {mode === 'tractor' ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Available Machine Quantity</label>
                    <input
                      type="number"
                      min={0}
                      value={machineQuantity}
                      onChange={(e) => setMachineQuantity(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{meta.priceFieldLabel}</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={pricePerAcre}
                      onChange={(e) => setPricePerAcre(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </>
              ) : null}

              {mode === 'harvester' ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Available Machines</label>
                    <input
                      type="number"
                      min={0}
                      value={availableMachines}
                      onChange={(e) => setAvailableMachines(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{meta.priceFieldLabel}</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={pricePerAcre}
                      onChange={(e) => setPricePerAcre(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </>
              ) : null}

              {mode === 'fertilizer' ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Fertilizer Type</label>
                    <input
                      type="text"
                      value={fertilizerType}
                      onChange={(e) => setFertilizerType(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{meta.priceFieldLabel}</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={pricePerLiter}
                      onChange={(e) => setPricePerLiter(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-sm overflow-hidden backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-extrabold text-slate-900">All My Bookings</h2>
            <button
              type="button"
              onClick={refreshBookings}
              disabled={loadingBookings || !provider?.id}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingBookings ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-slate-800">
              <thead className={`bg-gradient-to-r ${meta.accent} text-white`}>
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Booking ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Farmer ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={7}>
                      No bookings found for your account.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={`provider-booking-${booking.bookingId}`} className="transition hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-semibold text-slate-900">#{booking.bookingId}</td>
                      <td className="px-4 py-3">{booking.farmerId}</td>
                      <td className="px-4 py-3">{booking.bookingDate || 'N/A'}</td>
                      <td className="px-4 py-3">{booking.bookingTime || 'N/A'}</td>
                      <td className="px-4 py-3">LKR {booking.totalCost.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(booking.status)}`}>
                          {normalizeStatus(booking.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(booking, 'Completed')}
                            disabled={busyBookingId === booking.bookingId}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(booking, 'Cancelled')}
                            disabled={busyBookingId === booking.bookingId}
                            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBooking(booking.bookingId)}
                            disabled={busyBookingId === booking.bookingId}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

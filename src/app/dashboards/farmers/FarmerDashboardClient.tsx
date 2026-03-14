'use client';

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type TractorDriverRow = {
  id: number;
  name: string;
  phone: string;
  email: string;
  machineQuantity: number;
  pricePerAcre: number;
};

type HarvesterDriverRow = {
  id: number;
  name: string;
  phone: string;
  email: string;
  availableMachines: number;
  pricePerAcre: number;
};

type FertilizerSupplierRow = {
  id: number;
  name: string;
  phone: string;
  email: string;
  fertilizerType: string;
  stockQuantityLiters: number;
  pricePerLiter: number;
};

type ServiceType = "TRACTOR" | "HARVESTER" | "FERTILIZER";
type DashboardTab = "BOOKINGS" | "TRACTOR" | "HARVESTER" | "FERTILIZER";

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

interface FarmerDashboardClientProps {
  userLabel: string;
  defaultFarmerId: number;
  tractorDrivers: TractorDriverRow[];
  harvesterDrivers: HarvesterDriverRow[];
  fertilizerSuppliers: FertilizerSupplierRow[];
}

export default function FarmerDashboardClient({
  userLabel,
  defaultFarmerId,
  tractorDrivers,
  harvesterDrivers,
  fertilizerSuppliers,
}: FarmerDashboardClientProps) {
  const searchParams = useSearchParams();
  const [activeType, setActiveType] = useState<ServiceType | null>(null);
  const [farmerId, setFarmerId] = useState<number>(defaultFarmerId);
  const [providerId, setProviderId] = useState<number>(0);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("BOOKINGS");

  useEffect(() => {
    const tab = (searchParams.get("tab") ?? "").toUpperCase();
    if (tab === "TRACTOR" || tab === "HARVESTER" || tab === "FERTILIZER" || tab === "BOOKINGS") {
      setActiveTab(tab as DashboardTab);
      return;
    }
    setActiveTab("BOOKINGS");
  }, [searchParams]);

  const normalizeStatus = (value: unknown): string => {
    const raw = typeof value === "string" ? value : "Pending";
    const clean = raw.replaceAll("_", " ").trim();
    if (!clean) return "Pending";
    const upper = clean.toUpperCase();
    if (upper === "CANCELED" || upper === "CANCELLED") return "Cancelled";
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  };

  const statusKey = (value: unknown): string => {
    return normalizeStatus(value).toLowerCase();
  };

  const formatServiceType = (value: string): string => {
    const upper = value.toUpperCase();
    if (upper.includes("TRACTOR")) return "Tractor";
    if (upper.includes("HARVEST")) return "Harvester";
    if (upper.includes("FERTILIZER")) return "Fertilizer";
    return value;
  };

  const selectedProviderPrice = useMemo(() => {
    if (!activeType || providerId <= 0) return 0;
    if (activeType === "TRACTOR") {
      return tractorDrivers.find((d) => d.id === providerId)?.pricePerAcre ?? 0;
    }
    if (activeType === "HARVESTER") {
      return harvesterDrivers.find((d) => d.id === providerId)?.pricePerAcre ?? 0;
    }
    return fertilizerSuppliers.find((d) => d.id === providerId)?.pricePerLiter ?? 0;
  }, [activeType, providerId, tractorDrivers, harvesterDrivers, fertilizerSuppliers]);

  const totalCost = useMemo(() => {
    const safeQuantity = quantity > 0 ? quantity : 1;
    return Math.round(selectedProviderPrice * safeQuantity * 100) / 100;
  }, [selectedProviderPrice, quantity]);

  const fetchBookings = async () => {
    if (farmerId <= 0) {
      setBookings([]);
      return;
    }
    try {
      setBookingsLoading(true);
      const response = await fetch("/api/services", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!response.ok) {
        setBookings([]);
        return;
      }
      const rows = await response.json();
      const normalized = (Array.isArray(rows) ? rows : [])
        .map((row) => ({
          bookingId: Number(row?.bookingId ?? row?.id ?? 0),
          farmerId: Number(row?.farmerId ?? 0),
          providerId: Number(row?.providerId ?? 0),
          serviceType: String(row?.serviceType ?? ""),
          bookingDate: String(row?.bookingDate ?? ""),
          bookingTime: String(row?.bookingTime ?? ""),
          totalCost: Number(row?.totalCost ?? 0),
          status: normalizeStatus(row?.status),
        }))
        .filter((row) => row.bookingId > 0 && row.farmerId === farmerId)
        .sort((a, b) => b.bookingId - a.bookingId);
      setBookings(normalized);
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [farmerId]);

  const openBooking = (type: ServiceType, initialProviderId?: number) => {
    setActiveType(type);
    setError(null);
    setSuccess(null);
    const firstProvider =
      type === "TRACTOR"
        ? tractorDrivers[0]?.id
        : type === "HARVESTER"
          ? harvesterDrivers[0]?.id
          : fertilizerSuppliers[0]?.id;
    setProviderId(initialProviderId ?? firstProvider ?? 0);
    setQuantity(1);
  };

  const closeBooking = () => {
    setActiveType(null);
    setError(null);
  };

  const submitBooking = async () => {
    if (!activeType) return;
    if (farmerId <= 0) {
      setError("Farmer ID is required.");
      return;
    }
    if (providerId <= 0) {
      setError("Please select a provider.");
      return;
    }
    if (!bookingDate || !bookingTime) {
      setError("Please select booking date and time.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const formattedBookingTime =
        bookingTime && /^\d{2}:\d{2}$/.test(bookingTime)
          ? `${bookingTime}:00`
          : bookingTime;
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId,
          serviceType: activeType,
          providerId,
          bookingDate,
          bookingTime: formattedBookingTime,
          totalCost,
          status: "Pending",
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create booking.");
      }

      setSuccess("Booking created successfully.");
      setActiveType(null);
      await fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const providersForType =
    activeType === "TRACTOR"
      ? tractorDrivers.map((d) => ({ id: d.id, name: d.name }))
      : activeType === "HARVESTER"
        ? harvesterDrivers.map((d) => ({ id: d.id, name: d.name }))
        : activeType === "FERTILIZER"
          ? fertilizerSuppliers.map((d) => ({ id: d.id, name: d.name }))
          : [];

  const bookingStats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => statusKey(b.status) === "pending").length;
    const completed = bookings.filter((b) => statusKey(b.status) === "completed").length;
    const totalSpent = bookings.reduce((sum, b) => sum + (Number.isFinite(b.totalCost) ? b.totalCost : 0), 0);
    return { total, pending, completed, totalSpent };
  }, [bookings]);

  const statusBadgeClass = (status: string) => {
    const s = statusKey(status);
    if (s === "completed") return "bg-green-100 text-green-800 border-green-200";
    if (s === "pending") return "bg-amber-100 text-amber-800 border-amber-200";
    if (s === "confirmed") return "bg-blue-100 text-blue-800 border-blue-200";
    if (s.includes("progress")) return "bg-cyan-100 text-cyan-800 border-cyan-200";
    if (s === "cancelled") return "bg-red-100 text-red-800 border-red-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <header className="mb-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 p-8 text-white shadow-2xl">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-yellow-300/10 blur-3xl" />

            <p className="mb-3 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
              Farmer Control Center
            </p>
            <h1 className="text-4xl font-extrabold md:text-5xl">Farmer Dashboard</h1>
            <p className="mt-2 text-sm text-white/90 md:text-base">
              Welcome, {userLabel}. Manage your bookings and discover providers in one place.
            </p>
            <div className="mt-5 inline-flex items-center rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold text-white/95 backdrop-blur">
              {defaultFarmerId > 0 ? `Linked Farmer ID #${defaultFarmerId}` : 'Profile not linked yet'}
            </div>
          </div>
        </header>

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
            {success}
          </div>
        )}

        {activeTab === "BOOKINGS" && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Total Bookings</p>
                <p className="mt-2 text-2xl font-extrabold text-gray-900">{bookingStats.total}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Pending</p>
                <p className="mt-2 text-2xl font-extrabold text-amber-700">{bookingStats.pending}</p>
              </div>
              <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Completed</p>
                <p className="mt-2 text-2xl font-extrabold text-green-700">{bookingStats.completed}</p>
              </div>
              <div className="rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Total Cost</p>
                <p className="mt-2 text-2xl font-extrabold text-cyan-700">
                  LKR {bookingStats.totalSpent.toLocaleString()}
                </p>
              </div>
            </section>

            <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">My Booking Details</h2>
                <button
                  type="button"
                  onClick={fetchBookings}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-slate-800">
                  <thead className="bg-slate-100 text-slate-900">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Booking ID</th>
                      <th className="px-4 py-3 text-left font-semibold">Service</th>
                      <th className="px-4 py-3 text-left font-semibold">Provider ID</th>
                      <th className="px-4 py-3 text-left font-semibold">Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Time</th>
                      <th className="px-4 py-3 text-left font-semibold">Total Cost</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 [&>tr>td]:text-slate-800 [&>tr>td]:font-medium">
                    {bookingsLoading ? (
                      <tr>
                        <td className="px-4 py-4 text-gray-500" colSpan={7}>
                          Loading booking details...
                        </td>
                      </tr>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td className="px-4 py-4 text-gray-500" colSpan={7}>
                          No bookings found for this farmer.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr key={`booking-${booking.bookingId}`}>
                          <td className="px-4 py-3 font-semibold text-gray-800">#{booking.bookingId}</td>
                          <td className="px-4 py-3">{formatServiceType(booking.serviceType)}</td>
                          <td className="px-4 py-3">{booking.providerId}</td>
                          <td className="px-4 py-3">{booking.bookingDate || "N/A"}</td>
                          <td className="px-4 py-3">{booking.bookingTime || "N/A"}</td>
                          <td className="px-4 py-3">LKR {booking.totalCost.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(booking.status)}`}>
                              {normalizeStatus(booking.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === "TRACTOR" && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Tractor Drivers</h2>
            <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
              <table className="min-w-full text-sm text-slate-800">
                <thead className="bg-slate-100 text-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Available Machines</th>
                    <th className="px-4 py-3 text-left font-semibold">Price / Acre</th>
                    <th className="px-4 py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 [&>tr>td]:text-slate-800 [&>tr>td]:font-medium">
                  {tractorDrivers.length === 0 ? (
                    <tr><td className="px-4 py-4 text-gray-500" colSpan={6}>No tractor drivers found.</td></tr>
                  ) : (
                    tractorDrivers.map((driver) => (
                      <tr key={`tractor-${driver.id}-${driver.email}`}>
                        <td className="px-4 py-3">{driver.name}</td>
                        <td className="px-4 py-3">{driver.phone}</td>
                        <td className="px-4 py-3">{driver.email}</td>
                        <td className="px-4 py-3">{driver.machineQuantity}</td>
                        <td className="px-4 py-3">LKR {driver.pricePerAcre.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => openBooking("TRACTOR", driver.id)} className="rounded-lg bg-green-600 px-3 py-1.5 text-white hover:bg-green-700">
                            Book
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "HARVESTER" && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Harvester Drivers</h2>
            <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
              <table className="min-w-full text-sm text-slate-800">
                <thead className="bg-slate-100 text-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Available Machines</th>
                    <th className="px-4 py-3 text-left font-semibold">Price / Acre</th>
                    <th className="px-4 py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 [&>tr>td]:text-slate-800 [&>tr>td]:font-medium">
                  {harvesterDrivers.length === 0 ? (
                    <tr><td className="px-4 py-4 text-gray-500" colSpan={6}>No harvester drivers found.</td></tr>
                  ) : (
                    harvesterDrivers.map((driver) => (
                      <tr key={`harvester-${driver.id}-${driver.email}`}>
                        <td className="px-4 py-3">{driver.name}</td>
                        <td className="px-4 py-3">{driver.phone}</td>
                        <td className="px-4 py-3">{driver.email}</td>
                        <td className="px-4 py-3">{driver.availableMachines}</td>
                        <td className="px-4 py-3">LKR {driver.pricePerAcre.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => openBooking("HARVESTER", driver.id)} className="rounded-lg bg-cyan-600 px-3 py-1.5 text-white hover:bg-cyan-700">
                            Book
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "FERTILIZER" && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Fertilizer Suppliers</h2>
            <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
              <table className="min-w-full text-sm text-slate-800">
                <thead className="bg-slate-100 text-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Fertilizer Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Stock (Liters)</th>
                    <th className="px-4 py-3 text-left font-semibold">Price / Liter</th>
                    <th className="px-4 py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 [&>tr>td]:text-slate-800 [&>tr>td]:font-medium">
                  {fertilizerSuppliers.length === 0 ? (
                    <tr><td className="px-4 py-4 text-gray-500" colSpan={7}>No fertilizer suppliers found.</td></tr>
                  ) : (
                    fertilizerSuppliers.map((supplier) => (
                      <tr key={`fertilizer-${supplier.id}-${supplier.email}`}>
                        <td className="px-4 py-3">{supplier.name}</td>
                        <td className="px-4 py-3">{supplier.phone}</td>
                        <td className="px-4 py-3">{supplier.email}</td>
                        <td className="px-4 py-3">{supplier.fertilizerType}</td>
                        <td className="px-4 py-3">{supplier.stockQuantityLiters}</td>
                        <td className="px-4 py-3">LKR {supplier.pricePerLiter.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => openBooking("FERTILIZER", supplier.id)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700">
                            Book
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {activeType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-1">
              {activeType === "TRACTOR" ? "Book Tractor Driver" : activeType === "HARVESTER" ? "Book Harvester Driver" : "Order Fertilizer"}
            </h3>
            <p className="mb-4 text-sm text-slate-600">
              Fill in details and submit your booking request.
            </p>

            {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-300 px-3 py-2 text-red-700 font-medium">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Farmer ID</label>
                <input
                  type="number"
                  min={1}
                  value={farmerId}
                  onChange={(e) => setFarmerId(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Provider</label>
                <select
                  value={providerId}
                  onChange={(e) => setProviderId(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value={0}>Select provider</option>
                  {providersForType.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      #{provider.id} - {provider.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Booking Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Booking Time</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Quantity ({activeType === "FERTILIZER" ? "liters" : "acres"})
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Estimated Total Cost</label>
                <input
                  type="text"
                  readOnly
                  value={`LKR ${totalCost.toLocaleString()}`}
                  className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-semibold text-emerald-800"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeBooking} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitBooking}
                disabled={isSubmitting}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit Booking"}
              </button>
            </div>

            {defaultFarmerId <= 0 && (
              <p className="mt-3 text-xs text-amber-700">
                Farmer ID was not detected from your account, so please enter it manually.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

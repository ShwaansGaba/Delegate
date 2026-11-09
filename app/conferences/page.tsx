"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { DelegatoIcon, DelegatoHorizontalLogo } from "@/components/ui/DelegatoBrand";
import { formatDateDDMMYYYY, formatRangeDDMMYYYY } from "@/lib/dateUtils";
import { Search, X, MapPin, Calendar, Users, Award, ChevronDown, User, Check, ExternalLink, LocateFixed } from "lucide-react";

interface ConferenceItem {
  id: string;
  name: string;
  dates?: string;
  date_from?: string;
  date_to?: string;
  venue?: string;
  city?: string;
  fee?: number;
  school_fee_per_student?: number;
  deadline?: string;
  deadline_date?: string;
  status?: string;
  banner_url?: string;
  bannerUrl?: string;
  image_url?: string;
  imageUrl?: string;
  committees?: {
    id: string;
    name: string;
    total_seats: number;
    portfolios?: { id: string; status: string }[];
  }[];
}

const MAJOR_HUBS: { name: string; lat: number; lon: number }[] = [
  { name: "Delhi", lat: 28.6139, lon: 77.2090 },
  { name: "Gurugram", lat: 28.4595, lon: 77.0266 },
  { name: "Noida", lat: 28.5355, lon: 77.3910 },
  { name: "Faridabad", lat: 28.4089, lon: 77.3178 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Dehradun", lat: 30.3165, lon: 78.0322 },
];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const BANNER_PALETTES = [
  { bg: "#0B1B33", text: "#FFFFFF", dateColor: "#FFD23F", badgeBg: "#FFFFFF", badgeText: "#0B1B33" },
  { bg: "#FFD23F", text: "#0B1B33", dateColor: "#0B1B33", badgeBg: "#0B1B33", badgeText: "#FFFFFF" },
  { bg: "#0F4C96", text: "#FFFFFF", dateColor: "#FFD23F", badgeBg: "#FFFFFF", badgeText: "#0B1B33" },
  { bg: "#FFFFFF", text: "#1560BD", dateColor: "#0B1B33", badgeBg: "#1560BD", badgeText: "#FFFFFF" },
  { bg: "#EAF1FB", text: "#0B1B33", dateColor: "#1560BD", badgeBg: "#1560BD", badgeText: "#FFFFFF" },
];

export default function AvailableConferencesPage() {
  const router = useRouter();
  const { event, committees, portfolios, user } = useApp();
  const [selectedConfForModal, setSelectedConfForModal] = useState<string | null>(null);
  const [conferences, setConferences] = useState<ConferenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChip, setActiveChip] = useState<"all" | "this_month" | "closing_soon" | "school_teams" | "under_1500">("all");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Explore MUN Conferences | Delegato";

    async function loadLiveConferences() {
      setLoading(true);
      const collected: ConferenceItem[] = [];

      // 1. Fetch only published conferences from Supabase
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: eventsData, error: evErr } = await supabase
            .from("events")
            .select("*")
            .eq("status", "published");

          if (!evErr && eventsData && eventsData.length > 0) {
            const eventIds = eventsData.map((e) => e.id);
            const { data: commsData } = await supabase
              .from("committees")
              .select("*")
              .in("event_id", eventIds);

            const commIds = (commsData || []).map((c) => c.id);
            let portsData: { id: string; committee_id: string; status: string }[] = [];
            if (commIds.length > 0) {
              const res = await supabase
                .from("portfolios")
                .select("id, committee_id, status")
                .in("committee_id", commIds);
              portsData = res.data || [];
            }

            eventsData.forEach((ev) => {
              if (ev.status === "published" && ev.name && ev.name.trim().length > 0) {
                const evComms = (commsData || [])
                  .filter((c) => c.event_id === ev.id)
                  .map((c) => ({
                    id: c.id,
                    name: c.name,
                    total_seats: c.total_seats,
                    portfolios: portsData.filter((p) => p.committee_id === c.id),
                  }));

                collected.push({
                  id: ev.id,
                  name: ev.name,
                  dates: ev.dates,
                  date_from: ev.date_from,
                  date_to: ev.date_to,
                  venue: ev.venue,
                  city: ev.city || ev.rules?.city || (ev.venue ? ev.venue.split(",").pop()?.trim() : ""),
                  fee: Number(ev.fee) || 0,
                  school_fee_per_student: Number(ev.school_fee_per_student) || 0,
                  deadline: ev.deadline,
                  deadline_date: ev.deadline_date,
                  status: ev.status,
                  banner_url: ev.banner_url || ev.bannerUrl || ev.image_url || ev.imageUrl,
                  committees: evComms,
                });
              }
            });
          }
        } catch (err) {
          console.warn("Live conferences load notice:", err);
        }
      }

      // 2. Offline / Local Storage fallback & merge (Only published conferences)
      if (typeof window !== "undefined") {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith("delegate_public_conf_") || key.startsWith("delegate_storage_"))) {
              const raw = localStorage.getItem(key);
              if (raw) {
                const parsed = JSON.parse(raw);
                const list: ConferenceItem[] = parsed.myConferences || (parsed.name ? [parsed] : []);
                list.forEach((c) => {
                  if (c.status === "published" && c.name && c.name.trim() && !collected.some((existing) => existing.id === c.id)) {
                    collected.push({
                      id: c.id,
                      name: c.name,
                      dates: c.dates,
                      date_from: c.date_from || (c as unknown as { dateFrom?: string }).dateFrom,
                      date_to: c.date_to || (c as unknown as { dateTo?: string }).dateTo,
                      venue: c.venue,
                      city: c.city || (c as unknown as { rules?: { city?: string } }).rules?.city || (c.venue ? c.venue.split(",").pop()?.trim() : ""),
                      fee: c.fee,
                      school_fee_per_student: c.school_fee_per_student || (c as unknown as { schoolFeePerStudent?: number }).schoolFeePerStudent,
                      deadline: c.deadline,
                      deadline_date: c.deadline_date || (c as unknown as { deadlineDate?: string }).deadlineDate,
                      status: c.status,
                      banner_url: c.banner_url || (c as unknown as { bannerUrl?: string }).bannerUrl || (c as unknown as { imageUrl?: string }).imageUrl,
                    });
                  }
                });
              }
            }
          }
        } catch {}
      }

      // 3. Fallback to active conference ONLY if published
      if (event.status === "published" && event.name && event.name.trim() && !collected.some((c) => c.id === event.id)) {
        collected.push({
          id: event.id,
          name: event.name,
          dates: event.dates,
          date_from: event.dateFrom,
          date_to: event.dateTo,
          venue: event.venue,
          city: event.city || (event.venue ? event.venue.split(",").pop()?.trim() : ""),
          fee: event.fee,
          school_fee_per_student: event.schoolFeePerStudent,
          deadline: event.deadline,
          status: event.status,
          banner_url: event.bannerUrl || event.imageUrl,
          committees: committees.map((c) => ({
            id: c.id,
            name: c.name,
            total_seats: c.totalSeats,
            portfolios: portfolios.filter((p) => p.committeeId === c.id),
          })),
        });
      }

      setConferences(collected);
      setLoading(false);
    }

    loadLiveConferences();

    // Realtime listener for live synchronization
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const channel = client
        .channel("realtime_conferences_browse")
        .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => {
          loadLiveConferences();
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [event.name, event.id, event.dates, event.dateFrom, event.dateTo, event.venue, event.fee, event.schoolFeePerStudent, event.deadline, event.status, event.bannerUrl, event.imageUrl, committees, portfolios]);

  // Request approximate device location permission on mount or on button click
  const requestApproxLocation = useCallback(async () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        let matchedCity: string | null = null;
        let minD = Infinity;
        for (const hub of MAJOR_HUBS) {
          const d = getDistanceKm(lat, lon, hub.lat, hub.lon);
          if (d < minD) {
            minD = d;
            matchedCity = hub.name;
          }
        }
        if (matchedCity && minD <= 120) {
          setDetectedCity(matchedCity);
          setSelectedCity(matchedCity);
        } else {
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            if (res.ok) {
              const data = await res.json();
              const cName = data.city || data.locality || data.principalSubdivision;
              if (cName) {
                setDetectedCity(cName);
                setSelectedCity(cName);
              }
            }
          } catch {}
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn("Approx location notice:", err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  }, []);

  // Request approx permission when user enters the page
  useEffect(() => {
    requestApproxLocation();
  }, [requestApproxLocation]);

  // Extract cities from conferences (from dedicated city field or venue)
  const detectedCities = useMemo(() => {
    const set = new Set<string>();
    conferences.forEach((c) => {
      const cityName = c.city?.trim() || (c.venue ? c.venue.split(",").pop()?.trim() : "");
      if (cityName && cityName.length < 35) {
        set.add(cityName);
      }
    });
    return Array.from(set).sort();
  }, [conferences]);

  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    conferences.forEach((c) => {
      const cityName = c.city?.trim() || (c.venue ? c.venue.split(",").pop()?.trim() : "");
      if (cityName) {
        counts[cityName] = (counts[cityName] || 0) + 1;
      }
    });
    return counts;
  }, [conferences]);

  // Compute seats for a conference
  const getSeatsLeft = (conf: ConferenceItem) => {
    let seats = 0;
    if (conf.committees && conf.committees.length > 0) {
      conf.committees.forEach((c) => {
        const open = c.portfolios?.filter((p) => p.status === "open").length;
        seats += open !== undefined ? open : c.total_seats || 20;
      });
    } else {
      seats = 36; // sensible default
    }
    return Math.max(1, seats);
  };

  // Filtered conferences
  const filteredConferences = useMemo(() => {
    return conferences.filter((conf) => {
      // 1. City filter
      if (selectedCity !== "All") {
        const target = selectedCity.toLowerCase().trim();
        const confCity = (conf.city || "").toLowerCase().trim();
        const confVenue = (conf.venue || "").toLowerCase().trim();
        const isMatch =
          confCity.includes(target) ||
          confVenue.includes(target) ||
          (target === "delhi" && (confCity.includes("noida") || confCity.includes("gurugram") || confCity.includes("faridabad") || confVenue.includes("noida") || confVenue.includes("gurugram") || confVenue.includes("faridabad")));
        if (!isMatch) {
          return false;
        }
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = conf.name.toLowerCase().includes(q);
        const matchesVenue = (conf.venue || "").toLowerCase().includes(q);
        const matchesComm = (conf.committees || []).some((c) => c.name.toLowerCase().includes(q));
        if (!matchesName && !matchesVenue && !matchesComm) {
          return false;
        }
      }

      // 3. Chip filter
      if (activeChip === "this_month") {
        const now = new Date();
        const curMonth = now.toLocaleString("default", { month: "short" }).toLowerCase();
        const datesStr = (conf.dates || conf.date_from || "").toLowerCase();
        return datesStr.includes(curMonth);
      }
      if (activeChip === "closing_soon") {
        const seats = getSeatsLeft(conf);
        return seats < 30;
      }
      if (activeChip === "school_teams") {
        return (conf.school_fee_per_student || 0) > 0;
      }
      if (activeChip === "under_1500") {
        return (conf.fee || 0) <= 1500;
      }

      return true;
    });
  }, [conferences, selectedCity, searchQuery, activeChip]);

  // Featured conference (first in list)
  const featuredConf = filteredConferences[0];

  return (
    <main className="min-h-screen bg-[#1560BD] text-white font-sans antialiased selection:bg-[#FFD23F] selection:text-[#0B1B33] pb-24 md:pb-12">
      {/* Container */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
        {/* ========================================================
            DESKTOP HEADER (from reference HTML)
        ======================================================== */}
        <header className="hidden md:flex items-center gap-5 h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center group select-none shrink-0" aria-label="Delegato Home">
            <DelegatoHorizontalLogo className="h-8 lg:h-10 w-auto group-hover:scale-105 transition-transform" />
          </Link>

          {/* City Dropdown Chip */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                const nextState = !isCityDropdownOpen;
                setIsCityDropdownOpen(nextState);
                if (nextState && !detectedCity && !isLocating) {
                  requestApproxLocation();
                }
              }}
              className="inline-flex items-center gap-1.5 border-2 border-white rounded-full px-4 py-2 font-bold text-base bg-white text-[#0B1B33] hover:bg-neutral-100 transition-colors cursor-pointer shadow-sm"
              title="Filter by City or use device location"
            >
              <MapPin className="w-4 h-4 text-[#1560BD]" />
              <span>{selectedCity === "All" ? "All Cities" : selectedCity}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isCityDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white text-[#0B1B33] rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn divide-y divide-gray-100">
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      requestApproxLocation();
                    }}
                    disabled={isLocating}
                    className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1560BD] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-[#1560BD]" : ""}`} />
                      <span>{isLocating ? "Detecting approx location..." : detectedCity ? `Nearby: ${detectedCity}` : "Detect my city"}</span>
                    </span>
                    <span className="text-[10px] text-blue-500 underline font-normal">Approx</span>
                  </button>
                </div>

                <div className="py-1 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity("All");
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-bold flex items-center justify-between hover:bg-blue-50 transition-colors ${selectedCity === "All" ? "text-[#1560BD] bg-blue-50/50" : "text-gray-700"}`}
                  >
                    <span className="flex items-center gap-2">
                      All Cities
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">{conferences.length}</span>
                    </span>
                    {selectedCity === "All" && <Check className="w-4 h-4 text-[#1560BD]" />}
                  </button>
                  {detectedCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-bold flex items-center justify-between hover:bg-blue-50 transition-colors ${selectedCity === city ? "text-[#1560BD] bg-blue-50/50" : "text-gray-700"}`}
                    >
                      <span className="flex items-center gap-2">
                        {city}
                        {cityCounts[city] ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">{cityCounts[city]}</span>
                        ) : null}
                      </span>
                      {selectedCity === city && <Check className="w-4 h-4 text-[#1560BD]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3 bg-white text-[#3b4660] rounded-2xl h-14 px-4 text-base flex-1 shadow-sm">
            <Search className="w-5 h-5 text-[#3b4660] shrink-0" strokeWidth={2.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conferences, schools, or cities"
              className="bg-transparent text-[#0B1B33] placeholder-[#3b4660] font-medium outline-none w-full text-base"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick links & Host Button */}
          <Link
            href="/status"
            className="font-bold text-white hover:text-[#FFD23F] transition-colors text-base shrink-0"
          >
            Check status
          </Link>

          <Link
            href={user ? "/organizer/conferences" : "/login"}
            className="font-bold text-white hover:text-[#FFD23F] transition-colors text-base shrink-0"
          >
            {user ? "Dashboard" : "Log in"}
          </Link>

          <Link
            href="/organizer/conferences"
            className="bg-[#FFD23F] text-[#0B1B33] font-bold text-lg px-5 py-3 rounded-xl hover:bg-yellow-400 active:scale-95 transition-all shrink-0 shadow-sm"
          >
            Organize an MUN
          </Link>
        </header>

        {/* ========================================================
            MOBILE HEADER
        ======================================================== */}
        <header className="md:hidden pt-3 pb-2 space-y-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center select-none" aria-label="Delegato Home">
              <DelegatoHorizontalLogo className="h-6 sm:h-7 w-auto" />
            </Link>

            <div className="flex items-center gap-2">
              {/* City pill */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !isCityDropdownOpen;
                  setIsCityDropdownOpen(nextState);
                  if (nextState && !detectedCity && !isLocating) {
                    requestApproxLocation();
                  }
                }}
                className="inline-flex items-center gap-1 border border-white rounded-full px-3 py-1 text-xs font-bold bg-white text-[#0B1B33]"
              >
                <MapPin className="w-3 h-3 text-[#1560BD]" />
                <span>{selectedCity === "All" ? "Cities" : selectedCity}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Account icon */}
              <Link
                href={user ? "/organizer/conferences" : "/login"}
                className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-white"
                aria-label="Account"
              >
                <User className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mobile City Dropdown */}
          {isCityDropdownOpen && (
            <div className="bg-white text-[#0B1B33] rounded-2xl shadow-xl border border-gray-100 p-2 z-50 divide-y divide-gray-100">
              <div className="pb-1.5">
                <button
                  type="button"
                  onClick={() => requestApproxLocation()}
                  disabled={isLocating}
                  className="w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-[#1560BD] flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <LocateFixed className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
                    <span>{isLocating ? "Detecting approx..." : detectedCity ? `Nearby: ${detectedCity}` : "Detect my city"}</span>
                  </span>
                  <span className="text-[10px] text-blue-500 underline">Approx</span>
                </button>
              </div>
              <div className="pt-1 max-h-48 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity("All");
                    setIsCityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-bold flex items-center justify-between ${selectedCity === "All" ? "text-[#1560BD] bg-blue-50/50" : "text-gray-700"}`}
                >
                  <span>All Cities ({conferences.length})</span>
                  {selectedCity === "All" && <Check className="w-3.5 h-3.5 text-[#1560BD]" />}
                </button>
                {detectedCities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedCity(c);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-bold flex items-center justify-between ${selectedCity === c ? "text-[#1560BD] bg-blue-50/50" : "text-gray-700"}`}
                  >
                    <span>{c} {cityCounts[c] ? `(${cityCounts[c]})` : ""}</span>
                    {selectedCity === c && <Check className="w-3.5 h-3.5 text-[#1560BD]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Search input */}
          <div className="flex items-center gap-2 bg-white text-[#3b4660] rounded-xl h-11 px-3 text-sm shadow-sm">
            <Search className="w-4 h-4 text-[#3b4660] shrink-0" strokeWidth={2.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conferences, schools, or cities"
              className="bg-transparent text-[#0B1B33] placeholder-[#3b4660] font-medium outline-none w-full text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-gray-400 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* ========================================================
            HERO / FEATURED CARD
        ======================================================== */}
        {loading ? (
          <div className="bg-white text-[#0B1B33] rounded-[22px] p-10 text-center my-4 animate-pulse">
            <p className="font-heading font-extrabold text-2xl text-gray-700">
              Loading conferences...
            </p>
          </div>
        ) : featuredConf ? (
          <div className="mt-2 sm:mt-4">
            {/* Desktop Hero Card */}
            <div className="hidden md:flex bg-white text-[#0B1B33] rounded-[22px] overflow-hidden min-h-[360px] shadow-lg">
              {/* Poster Column */}
              <div
                style={{
                  backgroundColor: featuredConf.banner_url ? undefined : BANNER_PALETTES[0].bg,
                  backgroundImage: featuredConf.banner_url ? `url(${featuredConf.banner_url})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                className="w-[480px] shrink-0 relative flex flex-col justify-between p-7 select-none"
              >
                {featuredConf.banner_url && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                )}
                <span className="relative z-10 self-start bg-white text-[#0B1B33] border-2 border-[#0B1B33] rounded-[10px] px-3 py-0.5 text-sm font-bold shadow-sm">
                  Closing soon
                </span>
                <div className="relative z-10 font-heading font-extrabold text-4xl lg:text-5xl text-white leading-[1.02] tracking-tight drop-shadow-md">
                  {featuredConf.name}
                </div>
                <div className="relative z-10 text-lg font-bold text-[#FFD23F] drop-shadow-sm">
                  {formatDateDDMMYYYY(featuredConf.dates) || (featuredConf.date_from ? formatRangeDDMMYYYY(featuredConf.date_from, featuredConf.date_to) : "Dates TBA")}
                </div>
              </div>

              {/* Details Column */}
              <div className="p-8 lg:p-10 flex-1 flex flex-col justify-center">
                <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-[#0B1B33] leading-tight">
                  {featuredConf.name}
                </h2>
                <p className="mt-2 text-lg text-[#3b4660] font-medium">
                  {formatDateDDMMYYYY(featuredConf.dates) || "Upcoming"}, {featuredConf.venue || "Campus Venue"}, {featuredConf.committees?.length || 3} committees
                </p>
                <p className="mt-4 text-xl lg:text-2xl font-bold text-[#0B1B33]">
                  ₹{(featuredConf.fee || 1500).toLocaleString("en-IN")} per delegate
                </p>
                <p className="text-base text-gray-600 font-medium mt-0.5">
                  ₹{(featuredConf.school_fee_per_student || featuredConf.fee || 1200).toLocaleString("en-IN")} per student for school teams
                </p>
                <p className="mt-3 mb-6 text-lg font-bold text-[#B3261E]">
                  {getSeatsLeft(featuredConf)} seats left
                </p>
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => setSelectedConfForModal(featuredConf.id)}
                    className="bg-[#FFD23F] text-[#0B1B33] font-bold text-lg px-7 py-3.5 rounded-xl hover:bg-yellow-400 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    Register
                  </button>
                  <Link
                    href={`/browse?event=${encodeURIComponent(featuredConf.id)}`}
                    className="bg-white text-[#0B1B33] border-2 border-[#0B1B33] font-bold text-lg px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Hero Card */}
            <div className="md:hidden bg-white text-[#0B1B33] rounded-[22px] overflow-hidden shadow-md mt-2">
              <div
                style={{
                  backgroundColor: featuredConf.banner_url ? undefined : BANNER_PALETTES[0].bg,
                  backgroundImage: featuredConf.banner_url ? `url(${featuredConf.banner_url})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                className="relative h-[170px] p-4 flex flex-col justify-between"
              >
                {featuredConf.banner_url && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                )}
                <span className="relative z-10 self-start bg-white text-[#0B1B33] border-2 border-[#0B1B33] rounded-[10px] px-2.5 py-0.5 text-xs font-bold">
                  Closing soon
                </span>
                <div className="relative z-10 font-heading font-extrabold text-2xl text-white leading-tight">
                  {featuredConf.name}
                </div>
                <div className="relative z-10 text-sm font-bold text-[#FFD23F]">
                  {formatDateDDMMYYYY(featuredConf.dates) || (featuredConf.date_from ? formatRangeDDMMYYYY(featuredConf.date_from, featuredConf.date_to) : "Dates TBA")}
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-[#0B1B33]">
                    ₹{(featuredConf.fee || 1500).toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs font-bold text-[#B3261E]">
                    {getSeatsLeft(featuredConf)} seats left
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedConfForModal(featuredConf.id)}
                  className="bg-[#FFD23F] text-[#0B1B33] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-yellow-400 active:scale-95 transition-all"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ========================================================
            FILTER CHIPS
        ======================================================== */}
        <div className="mt-6 sm:mt-8 flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setActiveChip("all")}
            className={`px-5 py-2 rounded-full font-bold text-sm sm:text-base whitespace-nowrap transition-all cursor-pointer ${
              activeChip === "all"
                ? "bg-white text-[#0B1B33] shadow-sm"
                : "border-2 border-white text-white hover:bg-white/10"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveChip("this_month")}
            className={`px-5 py-2 rounded-full font-bold text-sm sm:text-base whitespace-nowrap transition-all cursor-pointer ${
              activeChip === "this_month"
                ? "bg-white text-[#0B1B33] shadow-sm"
                : "border-2 border-white text-white hover:bg-white/10"
            }`}
          >
            This month
          </button>
          <button
            type="button"
            onClick={() => setActiveChip("closing_soon")}
            className={`px-5 py-2 rounded-full font-bold text-sm sm:text-base whitespace-nowrap transition-all cursor-pointer ${
              activeChip === "closing_soon"
                ? "bg-white text-[#0B1B33] shadow-sm"
                : "border-2 border-white text-white hover:bg-white/10"
            }`}
          >
            Closing soon
          </button>
          <button
            type="button"
            onClick={() => setActiveChip("school_teams")}
            className={`px-5 py-2 rounded-full font-bold text-sm sm:text-base whitespace-nowrap transition-all cursor-pointer ${
              activeChip === "school_teams"
                ? "bg-white text-[#0B1B33] shadow-sm"
                : "border-2 border-white text-white hover:bg-white/10"
            }`}
          >
            School teams
          </button>
          <button
            type="button"
            onClick={() => setActiveChip("under_1500")}
            className={`px-5 py-2 rounded-full font-bold text-sm sm:text-base whitespace-nowrap transition-all cursor-pointer ${
              activeChip === "under_1500"
                ? "bg-white text-[#0B1B33] shadow-sm"
                : "border-2 border-white text-white hover:bg-white/10"
            }`}
          >
            Under Rs 1,500
          </button>

          {selectedCity !== "All" && (
            <button
              type="button"
              onClick={() => setSelectedCity("All")}
              className="px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-sm bg-[#FFD23F] text-[#0B1B33] shadow-sm hover:bg-yellow-400 transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 shrink-0"
              title="Click to clear city filter"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>City: {selectedCity}</span>
              <X className="w-3.5 h-3.5 ml-0.5" />
            </button>
          )}
        </div>

        {/* Empty state when no conferences match filter */}
        {!loading && filteredConferences.length === 0 && (
          <div className="bg-white text-[#0B1B33] rounded-[22px] p-8 sm:p-14 text-center my-8 shadow-sm">
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33] mb-2">
              No Conferences Found
            </h3>
            <p className="text-neutral-600 font-medium max-w-md mx-auto mb-6 text-sm sm:text-base">
              {conferences.length === 0
                ? "There are currently no active Model United Nations conferences open for registration."
                : "No conferences matched your search or active filter. Try resetting your search or filters."}
            </p>
            {conferences.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveChip("all");
                  setSelectedCity("All");
                }}
                className="bg-[#1560BD] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            ) : (
              <Link href="/organizer/conferences">
                <button
                  type="button"
                  className="bg-[#FFD23F] text-[#0B1B33] px-6 py-3.5 rounded-xl font-heading font-extrabold text-base hover:bg-yellow-400 transition-colors shadow-sm cursor-pointer"
                >
                  Set Up Your Conference →
                </button>
              </Link>
            )}
          </div>
        )}

        {/* ========================================================
            "CLOSING SOON" HORIZONTAL SECTION (from reference HTML)
        ======================================================== */}
        {filteredConferences.length > 0 && (
          <section className="mt-8 sm:mt-11">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white mb-4 sm:mb-5">
              Closing soon
            </h2>

            {/* Scrollable on mobile, flex grid on desktop */}
            <div className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-3 pt-1">
              {filteredConferences.slice(0, 4).map((conf, idx) => {
                const palette = BANNER_PALETTES[(idx + 1) % BANNER_PALETTES.length];
                const seatsLeft = getSeatsLeft(conf);

                return (
                  <div
                    key={`soon-${conf.id}`}
                    onClick={() => setSelectedConfForModal(conf.id)}
                    className="w-[220px] sm:w-[262px] shrink-0 bg-white text-[#0B1B33] rounded-[22px] overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 group"
                  >
                    {/* Top Poster Banner (ready for image upload) */}
                    <div
                      style={{
                        backgroundColor: conf.banner_url ? undefined : palette.bg,
                        color: conf.banner_url ? "#FFFFFF" : palette.text,
                        backgroundImage: conf.banner_url ? `url(${conf.banner_url})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      className="relative h-[220px] sm:h-[290px] p-4 sm:p-5 flex flex-col justify-between select-none"
                    >
                      {conf.banner_url && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                      )}
                      <span
                        style={{
                          backgroundColor: conf.status === "paused" ? "#F59E0B" : (conf.banner_url ? "#FFFFFF" : palette.badgeBg),
                          color: conf.status === "paused" ? "#FFFFFF" : (conf.banner_url ? "#0B1B33" : palette.badgeText),
                          borderColor: conf.status === "paused" ? "#F59E0B" : (conf.banner_url ? "#0B1B33" : palette.badgeBg),
                        }}
                        className="relative z-10 self-start border-2 rounded-[10px] px-2.5 py-0.5 text-xs sm:text-sm font-bold shadow-sm"
                      >
                        {conf.status === "paused" ? "Paused" : (idx === 0 ? "Closing soon" : "Filling fast")}
                      </span>

                      <div className="relative z-10 font-heading font-extrabold text-xl sm:text-[28px] leading-[1.05] drop-shadow-sm group-hover:scale-[1.02] transition-transform">
                        {conf.name}
                      </div>

                      <div
                        style={{ color: conf.banner_url ? "#FFD23F" : palette.dateColor }}
                        className="relative z-10 text-sm sm:text-lg font-bold"
                      >
                        {formatDateDDMMYYYY(conf.dates) || (conf.date_from ? formatRangeDDMMYYYY(conf.date_from, conf.date_to) : "Dates TBA")}
                      </div>
                    </div>

                    {/* Bottom Card Body */}
                    <div className="p-4 sm:p-[18px] flex-1 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-base sm:text-[20px] leading-tight text-[#0B1B33] line-clamp-1">
                          {conf.name}
                        </div>
                        <div className="mt-1 text-xs sm:text-base text-[#3b4660] line-clamp-1">
                          {formatDateDDMMYYYY(conf.dates) || "Upcoming"}, {conf.venue?.split(",")[0] || "Delhi"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs sm:text-base">
                        <span className="font-bold text-[#0B1B33]">
                          From ₹{(conf.fee || 1500).toLocaleString("en-IN")}
                        </span>
                        <span className="font-bold text-[#B3261E]">
                          {seatsLeft} seats left
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================
            "ALL CONFERENCES" SECTION (from reference HTML)
        ======================================================== */}
        {filteredConferences.length > 0 && (
          <section className="mt-10 sm:mt-12">
            <div className="flex items-baseline justify-between mb-4 sm:mb-5">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white">
                All conferences
              </h2>
              <span className="font-bold text-sm sm:text-lg text-blue-100">
                {filteredConferences.length} open
              </span>
            </div>

            {/* Desktop: Grid of cards */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredConferences.map((conf, idx) => {
                const palette = BANNER_PALETTES[idx % BANNER_PALETTES.length];
                const seatsLeft = getSeatsLeft(conf);

                return (
                  <div
                    key={`all-desk-${conf.id}`}
                    onClick={() => setSelectedConfForModal(conf.id)}
                    className="bg-white text-[#0B1B33] rounded-[22px] overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 group"
                  >
                    {/* Top Poster Banner */}
                    <div
                      style={{
                        backgroundColor: conf.banner_url ? undefined : palette.bg,
                        color: conf.banner_url ? "#FFFFFF" : palette.text,
                        backgroundImage: conf.banner_url ? `url(${conf.banner_url})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      className="relative h-[250px] p-5 flex flex-col justify-between select-none"
                    >
                      {conf.banner_url && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                      )}
                      <span className="relative z-10 self-start text-xs font-bold opacity-0">
                        Badge
                      </span>
                      <div className="relative z-10 font-heading font-extrabold text-[24px] leading-[1.05] drop-shadow-sm group-hover:scale-[1.02] transition-transform">
                        {conf.name}
                      </div>
                      <div
                        style={{ color: conf.banner_url ? "#FFD23F" : palette.dateColor }}
                        className="relative z-10 text-base font-bold"
                      >
                        {formatDateDDMMYYYY(conf.dates) || "Upcoming"}
                      </div>
                    </div>

                    {/* Bottom Card Body */}
                    <div className="p-[18px] flex-1 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-[19px] leading-tight text-[#0B1B33] line-clamp-1">
                          {conf.name}
                        </div>
                        <div className="mt-1 text-sm text-[#3b4660] line-clamp-1">
                          {formatDateDDMMYYYY(conf.dates) || "Upcoming"}, {conf.venue?.split(",")[0] || "Auditorium"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <span className="font-bold text-[#0B1B33]">
                          From ₹{(conf.fee || 1500).toLocaleString("en-IN")}
                        </span>
                        <span className="font-bold text-[#B3261E]">
                          {seatsLeft} seats left
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile: Horizontal list matching template_2.html */}
            <div className="sm:hidden space-y-3.5">
              {filteredConferences.map((conf, idx) => {
                const palette = BANNER_PALETTES[idx % BANNER_PALETTES.length];
                const seatsLeft = getSeatsLeft(conf);
                const shortTitle = conf.name.split(" ")[0] || "MUN";

                return (
                  <div
                    key={`all-mob-${conf.id}`}
                    onClick={() => setSelectedConfForModal(conf.id)}
                    className="bg-white text-[#0B1B33] rounded-[20px] overflow-hidden flex shadow-sm active:scale-[0.99] transition-transform cursor-pointer"
                  >
                    {/* Left Poster (ready for image) */}
                    <div
                      style={{
                        backgroundColor: conf.banner_url ? undefined : palette.bg,
                        color: conf.banner_url ? "#FFFFFF" : palette.text,
                        backgroundImage: conf.banner_url ? `url(${conf.banner_url})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      className="w-[112px] shrink-0 p-3 flex flex-col justify-between relative select-none"
                    >
                      {conf.banner_url && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      )}
                      <span className="relative z-10 text-[10px] font-bold opacity-0">.</span>
                      <div className="relative z-10 font-heading font-extrabold text-[20px] leading-[1.02] line-clamp-2">
                        {shortTitle}
                      </div>
                      <div
                        style={{ color: conf.banner_url ? "#FFD23F" : palette.dateColor }}
                        className="relative z-10 text-xs font-bold"
                      >
                        {formatDateDDMMYYYY(conf.dates)?.split(" ")[0] || ""}
                      </div>
                    </div>

                    {/* Right Details */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-[17px] leading-tight text-[#0B1B33] line-clamp-1">
                          {conf.name}
                        </div>
                        <div className="mt-1 text-xs text-[#3b4660] line-clamp-1">
                          {formatDateDDMMYYYY(conf.dates) || "Upcoming"}, {conf.venue?.split(",")[0] || "Auditorium"}
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="text-sm font-bold text-[#0B1B33]">
                          ₹{(conf.fee || 1500).toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs font-bold text-[#B3261E]">
                          {seatsLeft} seats left
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================
            FOOTER (from reference HTML)
        ======================================================== */}
        <footer className="mt-16 pt-8 pb-10 border-t border-white/20 text-blue-100 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DelegatoHorizontalLogo className="h-5 sm:h-6 w-auto" />
            <span>• The MUN Operations Platform</span>
          </div>

          <div className="flex items-center gap-5 font-medium">
            <Link href="/status" className="hover:text-white transition-colors">
              Check status
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/organizer/conferences" className="hover:text-white font-bold text-[#FFD23F]">
              Organizers
            </Link>
          </div>
        </footer>
      </div>

      {/* ========================================================
          MOBILE FLOATING BOTTOM NAV (from template_1 & template_2)
      ======================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0F4C96] border-t border-white/10 z-40 flex items-center justify-around text-sm font-bold text-white shadow-2xl">
        <Link
          href="/conferences"
          className="flex flex-col items-center justify-center h-full px-4 border-b-4 border-[#FFD23F] text-white"
        >
          <span>Explore</span>
        </Link>
        <Link
          href="/status"
          className="flex flex-col items-center justify-center h-full px-4 text-blue-200 hover:text-white font-medium"
        >
          <span>Check status</span>
        </Link>
        <Link
          href={user ? "/organizer/conferences" : "/login"}
          className="flex flex-col items-center justify-center h-full px-4 text-blue-200 hover:text-white font-medium"
        >
          <span>{user ? "Dashboard" : "Account"}</span>
        </Link>
      </div>

      {/* ========================================================
          REGISTRATION MODE MODAL
      ======================================================== */}
      {selectedConfForModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1B33]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-[#0B1B33] border border-gray-200 shadow-2xl animate-slideUp">
            <h3 className="text-2xl font-heading font-extrabold mb-1 text-[#0B1B33]">
              Choose Registration Type
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-5 font-medium">
              Event: <span className="font-mono text-xs bg-slate-100 p-1 rounded font-bold text-[#1560BD] break-all">{selectedConfForModal}</span>
            </p>

            <div className="space-y-3 sm:space-y-4">
              <button
                type="button"
                onClick={() => router.push(`/register?event=${encodeURIComponent(selectedConfForModal)}`)}
                className="w-full p-4 sm:p-5 text-left border-2 border-gray-200 hover:border-[#1560BD] rounded-2xl transition-all duration-200 hover:bg-blue-50/50 cursor-pointer group"
              >
                <div className="text-lg sm:text-xl font-heading font-extrabold text-[#0B1B33] group-hover:text-[#1560BD]">
                  Individual Delegate
                </div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                  Pick committee preferences and submit your portfolio preferences directly.
                </div>
              </button>

              <button
                type="button"
                onClick={() => router.push(`/register/team?event=${encodeURIComponent(selectedConfForModal)}`)}
                className="w-full p-4 sm:p-5 text-left border-2 border-gray-200 hover:border-[#1560BD] rounded-2xl transition-all duration-200 hover:bg-blue-50/50 cursor-pointer group"
              >
                <div className="text-lg sm:text-xl font-heading font-extrabold text-[#0B1B33] group-hover:text-[#1560BD]">
                  School Delegation Team
                </div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                  Head delegate or teacher coordinator registering multiple delegates with discounted fees.
                </div>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const link = `${window.location.origin}${window.location.pathname.startsWith("/Delegate") ? "/Delegate" : ""}/register?event=${encodeURIComponent(selectedConfForModal)}`;
                  navigator.clipboard?.writeText(link);
                  alert("Conference registration link copied!");
                }}
                className="text-[#1560BD] font-bold text-xs sm:text-sm underline cursor-pointer"
              >
                Copy registration link
              </button>

              <button
                type="button"
                onClick={() => setSelectedConfForModal(null)}
                className="text-gray-500 hover:text-gray-800 font-bold text-sm sm:text-base px-3 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

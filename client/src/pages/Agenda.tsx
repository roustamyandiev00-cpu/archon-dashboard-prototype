/*
 * DESIGN: "Obsidian Intelligence" - Agenda Page
 * - Calendar integration (Google)
 * - Timeline view of appointments
 * - Meeting details and quick actions
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Video,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MoreVertical
} from "lucide-react";
import { nanoid } from "nanoid";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { useStoredState } from "@/hooks/useStoredState";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Appointment {
  id: string;
  title: string;
  type: "meeting" | "site_visit" | "call" | "deadline";
  date: string;
  time: string;
  duration: string;
  client: string;
  location?: string;
  platform?: "google_meet" | "zoom" | "teams";
  joinUrl?: string;
  attendees: string[];
  status: "confirmed" | "pending" | "cancelled";
}

const defaultAppointments: Appointment[] = [];

export default function Agenda() {
  const [appointments, setAppointments] = useStoredState<Appointment[]>("appointments", defaultAppointments);
  const [isGoogleConnected] = useState(false);
  const [isSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [formState, setFormState] = useState({
    id: "",
    title: "",
    type: "meeting" as Appointment["type"],
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    duration: "30m",
    client: "",
    location: "",
    platform: "google_meet" as Appointment["platform"],
    joinUrl: "",
    attendees: "",
    status: "confirmed" as Appointment["status"],
  });
  const [, navigate] = useLocation();

  const handleConnectGoogle = () => {
    toast.info("Google Agenda koppeling", {
      description: "Koppel de integratie via je backend configuratie.",
    });
  };

  const handleSync = () => {
    toast.info("Synchronisatie", {
      description: "Activeer de integratie om afspraken te synchroniseren.",
    });
  };

  const monthLabel = currentMonth.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const startDay = (new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 6) % 7;
  const calendarDays = [
    ...Array.from({ length: startDay }).map(() => null),
    ...Array.from({ length: daysInMonth }).map((_, i) => i + 1),
  ];

  const isSameDay = (date: Date, target: Date) =>
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate();

  const hasEvent = (day: number) =>
    appointments.some((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate.getFullYear() === currentMonth.getFullYear() &&
        aptDate.getMonth() === currentMonth.getMonth() &&
        aptDate.getDate() === day;
    });

  const viewAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    if (viewMode === "day") {
      return isSameDay(aptDate, selectedDate);
    }
    if (viewMode === "week") {
      const start = new Date(selectedDate);
      start.setDate(selectedDate.getDate() - ((selectedDate.getDay() + 6) % 7));
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return aptDate >= start && aptDate <= end;
    }
    return aptDate.getMonth() === selectedDate.getMonth() && aptDate.getFullYear() === selectedDate.getFullYear();
  });

  const openCreateDialog = () => {
    setActiveAppointment(null);
    setFormState({
      id: "",
      title: "",
      type: "meeting",
      date: selectedDate.toISOString().split("T")[0],
      time: "09:00",
      duration: "30m",
      client: "",
      location: "",
      platform: "google_meet",
      joinUrl: "",
      attendees: "",
      status: "confirmed",
    });
    setFormOpen(true);
  };

  const openEditDialog = (appointment: Appointment) => {
    setActiveAppointment(appointment);
    setFormState({
      id: appointment.id,
      title: appointment.title,
      type: appointment.type,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration || "30m",
      client: appointment.client,
      location: appointment.location ?? "",
      platform: appointment.platform ?? "google_meet",
      joinUrl: appointment.joinUrl ?? "",
      attendees: appointment.attendees.join(", "),
      status: appointment.status,
    });
    setFormOpen(true);
  };

  const openDetailDialog = (appointment: Appointment) => {
    setActiveAppointment(appointment);
    setDetailOpen(true);
  };

  const handleFormSubmit = () => {
    if (!formState.title.trim()) {
      toast.error("Titel ontbreekt", { description: "Geef de afspraak een titel." });
      return;
    }
    if (!formState.client.trim()) {
      toast.error("Klant ontbreekt", { description: "Vul een klant of interne label in." });
      return;
    }

    const attendees = formState.attendees
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => `https://i.pravatar.cc/150?u=${encodeURIComponent(entry)}`);

    const payload: Appointment = {
      id: formState.id || nanoid(8),
      title: formState.title.trim(),
      type: formState.type,
      date: formState.date,
      time: formState.time,
      duration: formState.duration,
      client: formState.client.trim(),
      location: formState.location.trim() || undefined,
      platform: formState.platform,
      joinUrl: formState.joinUrl.trim() || undefined,
      attendees,
      status: formState.status,
    };

    if (activeAppointment) {
      setAppointments((prev) => prev.map((apt) => (apt.id === payload.id ? payload : apt)));
      toast.success("Afspraak bijgewerkt", { description: `${payload.title} is aangepast.` });
    } else {
      setAppointments((prev) => [payload, ...prev]);
      toast.success("Afspraak toegevoegd", { description: `${payload.title} is aangemaakt.` });
    }
    setFormOpen(false);
    setActiveAppointment(payload);
  };

  const handleDelete = (appointment: Appointment) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== appointment.id));
    toast.success("Afspraak verwijderd", { description: `${appointment.title} is verwijderd.` });
  };

  const handleCopyLink = (appointment: Appointment) => {
    if (!appointment.joinUrl) {
      toast.error("Geen link beschikbaar", { description: "Deze afspraak heeft geen online link." });
      return;
    }
    navigator.clipboard.writeText(appointment.joinUrl).then(() => {
      toast.success("Link gekopieerd", { description: "De vergaderlink staat op je klembord." });
    });
  };

  const handleJoin = (appointment: Appointment) => {
    if (appointment.joinUrl) {
      window.open(appointment.joinUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.info("Geen online link", { description: "Deze afspraak heeft geen online link." });
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Agenda"
        subtitle="Beheer je planning en afspraken."
        rightSlot={
          <div className="flex gap-3">
            {isGoogleConnected && (
              <Button
                variant="outline"
                className="border-white/10 hover:bg-white/5"
                onClick={handleSync}
                disabled={isSyncing}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
                Sync
              </Button>
            )}
            <Button
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg glow-cyan"
              onClick={openCreateDialog}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Afspraak
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Calendar & Sync */}
        <div className="space-y-6 lg:col-span-1">
          {/* Calendar Widget Placeholder - Visual Only */}
          <Card className="glass-card border-white/5 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{monthLabel}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                <span>Ma</span><span>Di</span><span>Wo</span><span>Do</span><span>Vr</span><span>Za</span><span>Zo</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }
                  const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const isSelected = isSameDay(dayDate, selectedDate);
                  const isToday = isSameDay(dayDate, new Date());
                  const eventDay = hasEvent(day);
                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(dayDate)}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative cursor-pointer hover:bg-white/5 transition-colors",
                        isSelected && "bg-cyan-500 text-white font-bold hover:bg-cyan-600 shadow-lg shadow-cyan-500/20",
                        !isSelected && isToday && "border border-cyan-500/40 text-cyan-300"
                      )}
                    >
                      {day}
                      {eventDay && !isSelected && (
                        <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-cyan-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Google Sync Status Card */}
          <Card className={cn(
            "glass-card border-white/5 overflow-hidden transition-all duration-300",
            isGoogleConnected ? "bg-green-500/5 border-green-500/10" : "bg-card/50"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 0.307 5.387 0 12s5.867 12 12.48 12c3.6 0 6.347-1.187 8.587-3.2 2.293-2.08 2.907-5.133 2.907-7.467 0-.747-.053-1.28-.16-1.413H12.48z" />
                </svg>
                Google Agenda
              </CardTitle>
              <CardDescription className="text-xs">
                {isGoogleConnected
                  ? "Verbonden met jouw Google account"
                  : "Synchroniseer je afspraken automatisch"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGoogleConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Actieve verbinding</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Laatste sync: Zojuist
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 border-white/10 hover:bg-white/5 text-xs"
                    onClick={() => navigate("/instellingen")}
                  >
                    Instellingen beheren
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Verbind je Google Agenda om al je afspraken in één overzicht te zien.
                  </p>
                  <Button
                    onClick={handleConnectGoogle}
                    disabled={isSyncing}
                    className="w-full bg-white text-black hover:bg-gray-200"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <>
                        Verbind Google
                        <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Appointment List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {viewMode === "day"
                ? selectedDate.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })
                : viewMode === "week"
                  ? `Week van ${selectedDate.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}`
                  : selectedDate.toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
            </h2>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "day" ? "outline" : "ghost"}
                size="sm"
                className={cn("hidden sm:flex border-white/10", viewMode === "day" ? "hover:bg-white/5" : "text-muted-foreground")}
                onClick={() => setViewMode("day")}
              >
                Dag
              </Button>
              <Button
                variant={viewMode === "week" ? "outline" : "ghost"}
                size="sm"
                className={cn("hidden sm:flex border-white/10", viewMode === "week" ? "hover:bg-white/5" : "text-muted-foreground")}
                onClick={() => setViewMode("week")}
              >
                Week
              </Button>
              <Button
                variant={viewMode === "month" ? "outline" : "ghost"}
                size="sm"
                className={cn("hidden sm:flex border-white/10", viewMode === "month" ? "hover:bg-white/5" : "text-muted-foreground")}
                onClick={() => setViewMode("month")}
              >
                Maand
              </Button>
            </div>
          </div>

          <div className="relative border-l border-white/10 ml-3 space-y-8 pb-8">
            {viewAppointments.map((apt, index) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative pl-8"
              >
                {/* Timeline Dot */}
                <div className={cn(
                  "absolute -left-[5px] top-6 w-2.5 h-2.5 rounded-full border-2 border-background",
                  apt.type === "meeting" ? "bg-cyan-500" :
                    apt.type === "deadline" ? "bg-red-500" :
                      "bg-blue-500"
                )} />

                <Card className="glass-card border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Time & Title */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="border-white/10 bg-white/5 text-muted-foreground font-mono">
                            {apt.time}
                          </Badge>
                          {apt.duration && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {apt.duration}
                            </span>
                          )}
                          {apt.status === "pending" && (
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-0 text-[10px] h-5">
                              Te bevestigen
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg">{apt.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {apt.client}
                          </span>
                          {apt.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {apt.location}
                            </span>
                          )}
                          {apt.platform === "google_meet" && (
                            <span className="flex items-center gap-1.5 text-green-400">
                              <Video className="w-3.5 h-3.5" />
                              Google Meet
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Attendees & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-white/5">
                        <div className="flex -space-x-2">
                          {apt.attendees.map((avatar, i) => (
                            <Avatar key={i} className="w-8 h-8 border-2 border-background">
                              <AvatarImage src={avatar} />
                              <AvatarFallback>U{i}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-white/10">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-card border-white/10">
                            <DropdownMenuItem onClick={() => openDetailDialog(apt)}>Bekijk details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(apt)}>Bewerken</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(apt)}>Verwijderen</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Quick Action for Google Meet */}
                    {apt.platform === "google_meet" && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleJoin(apt)}>
                          <Video className="w-3.5 h-3.5 mr-2" />
                          Deelnemen
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => handleCopyLink(apt)}>
                          Link kopiëren
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0B0D12]/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50">
          <DialogHeader>
            <DialogTitle>{activeAppointment ? "Afspraak bewerken" : "Nieuwe afspraak"}</DialogTitle>
            <DialogDescription>Plan een afspraak of deadline in je agenda.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Titel</label>
              <Input
                value={formState.title}
                onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={formState.type}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, type: value as Appointment["type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="site_visit">Site visit</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formState.status}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, status: value as Appointment["status"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    <SelectItem value="confirmed">Bevestigd</SelectItem>
                    <SelectItem value="pending">In afwachting</SelectItem>
                    <SelectItem value="cancelled">Geannuleerd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Datum</label>
                <Input
                  type="date"
                  value={formState.date}
                  onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Tijd</label>
                <Input
                  type="time"
                  value={formState.time}
                  onChange={(e) => setFormState((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Duur</label>
                <Input
                  value={formState.duration}
                  onChange={(e) => setFormState((prev) => ({ ...prev, duration: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Klant / Team</label>
                <Input
                  value={formState.client}
                  onChange={(e) => setFormState((prev) => ({ ...prev, client: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Locatie</label>
              <Input
                value={formState.location}
                onChange={(e) => setFormState((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Platform</label>
                <Select
                  value={formState.platform ?? "google_meet"}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, platform: value as Appointment["platform"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    <SelectItem value="google_meet">Google Meet</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="teams">Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Vergaderlink</label>
                <Input
                  value={formState.joinUrl}
                  onChange={(e) => setFormState((prev) => ({ ...prev, joinUrl: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Deelnemers (komma-gescheiden)</label>
              <Input
                value={formState.attendees}
                onChange={(e) => setFormState((prev) => ({ ...prev, attendees: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setFormOpen(false)}>
              Annuleren
            </Button>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={handleFormSubmit}>
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0B0D12]/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50">
          <DialogHeader>
            <DialogTitle>Afspraakdetails</DialogTitle>
            <DialogDescription>Bekijk de gegevens van deze afspraak.</DialogDescription>
          </DialogHeader>
          {activeAppointment && (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold">{activeAppointment.title}</p>
                <p className="text-sm text-muted-foreground">{activeAppointment.client}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Datum</p>
                  <p className="font-medium">{new Date(activeAppointment.date).toLocaleDateString("nl-NL")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tijd</p>
                  <p className="font-medium">{activeAppointment.time}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duur</p>
                  <p className="font-medium">{activeAppointment.duration || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{activeAppointment.status}</p>
                </div>
                {activeAppointment.location && (
                  <div className="sm:col-span-2">
                    <p className="text-muted-foreground">Locatie</p>
                    <p className="font-medium">{activeAppointment.location}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {activeAppointment && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
                <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => openEditDialog(activeAppointment)}>
                  Bewerken
                </Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => handleDelete(activeAppointment)}>
                  Verwijderen
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

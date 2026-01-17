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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { cn } from "@/lib/utils";

// Mock Data
interface Appointment {
  id: string;
  title: string;
  type: "meeting" | "site_visit" | "call" | "deadline";
  time: string;
  duration: string;
  client: string;
  location?: string;
  platform?: "google_meet" | "zoom" | "teams";
  attendees: string[];
  status: "confirmed" | "pending" | "cancelled";
}

const appointments: Appointment[] = [
  {
    id: "1",
    title: "Kick-off Renovatie Herengracht",
    type: "meeting",
    time: "09:30",
    duration: "45m",
    client: "Fam. Jansen",
    location: "Kantoor Amsterdam",
    attendees: ["https://i.pravatar.cc/150?u=1", "https://i.pravatar.cc/150?u=2"],
    status: "confirmed"
  },
  {
    id: "2",
    title: "Inspectie Elektra",
    type: "site_visit",
    time: "11:00",
    duration: "1u 30m",
    client: "Tech Solutions BV",
    location: "Zuidas 405, Amsterdam",
    attendees: ["https://i.pravatar.cc/150?u=3"],
    status: "confirmed"
  },
  {
    id: "3",
    title: "Video call: Offerte bespreking",
    type: "call",
    time: "14:00",
    duration: "30m",
    client: "Mvr. de Vries",
    platform: "google_meet",
    attendees: ["https://i.pravatar.cc/150?u=4"],
    status: "pending"
  },
  {
    id: "4",
    title: "Deadline: Materiaal bestelling",
    type: "deadline",
    time: "17:00",
    duration: "",
    client: "Intern",
    attendees: [],
    status: "confirmed"
  }
];

export default function Agenda() {
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnectGoogle = () => {
    setIsSyncing(true);
    // Simulate connection delay
    setTimeout(() => {
      setIsGoogleConnected(true);
      setIsSyncing(false);
      toast.success("Google Agenda succesvol gekoppeld", {
        description: "Je afspraken worden nu gesynchroniseerd."
      });
    }, 1500);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Agenda gesynchroniseerd", {
        description: "Alle afspraken zijn up-to-date."
      });
    }, 1000);
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
              onClick={() => toast("Nieuwe Afspraak", { description: "Functionaliteit komt binnenkort." })}
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
                <span className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Januari 2024</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                <span>Ma</span><span>Di</span><span>Wo</span><span>Do</span><span>Vr</span><span>Za</span><span>Zo</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === 24; // Mock today
                  const hasEvent = [10, 15, 24, 28].includes(day);
                  return (
                    <div
                      key={i}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative cursor-pointer hover:bg-white/5 transition-colors",
                        isToday && "bg-cyan-500 text-white font-bold hover:bg-cyan-600 shadow-lg shadow-cyan-500/20"
                      )}
                    >
                      {day}
                      {hasEvent && !isToday && (
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
                  <Button variant="outline" size="sm" className="w-full mt-2 border-white/10 hover:bg-white/5 text-xs">
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
              Vandaag, 24 Januari
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex border-white/10 hover:bg-white/5">
                Dag
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground">
                Week
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground">
                Maand
              </Button>
            </div>
          </div>

          <div className="relative border-l border-white/10 ml-3 space-y-8 pb-8">
            {appointments.map((apt, index) => (
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
                        <Button variant="ghost" size="icon" className="hover:bg-white/10">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>

                    {/* Quick Action for Google Meet */}
                    {apt.platform === "google_meet" && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <Video className="w-3.5 h-3.5 mr-2" />
                          Deelnemen
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5">
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
    </div>
  );
}

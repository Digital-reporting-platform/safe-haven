import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Gavel, AlertCircle, CheckCircle, ArrowRight, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { legalWorkflowService } from '@/services/legalWorkflowService';

const CourtCalendar = () => {
  const [events, setEvents] = useState<
    Array<{
      id: string;
      title: string;
      date: string;
      location: string;
      status: string;
      priority: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await legalWorkflowService.getCourtCalendar();
        setEvents(data);
      } catch (error: any) {
        console.error('Failed to load legal calendar', error);
        toast.error(error?.message || 'Failed to load court calendar');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--surface-surface-primary)]">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--colors-primary-cta)]/10 to-[var(--colors-accent-highlight)]/10 blur-3xl" />
        <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[var(--role-legal-bg)]/10 to-[var(--colors-olive-5)]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-r from-[var(--colors-primary-cta)] to-[var(--colors-accent-highlight)] p-4 shadow-lg">
              <CalendarDays className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--colors-heading-text)]">
                Court Calendar
              </h1>
              <p className="text-[var(--colors-body-text)] mt-1">
                Track legal dates, deadlines, and court appearances
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <Card className="border-0 bg-gradient-to-r from-[var(--colors-primary-cta)] to-[var(--colors-terracotta-6)] shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Upcoming Events</p>
                  <p className="text-3xl font-bold text-white">{events.length}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[#DDA15E] to-[#DDA15E]/90 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">High Priority</p>
                  <p className="text-3xl font-bold text-white">
                    {events.filter(e => e.priority?.toLowerCase().includes('high') || e.priority?.toLowerCase().includes('critical')).length}
                  </p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-[#414435] to-[#414435]/90 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Confirmed</p>
                  <p className="text-3xl font-bold text-white">
                    {events.filter(e => e.status?.toLowerCase().includes('confirmed') || e.status?.toLowerCase().includes('scheduled')).length}
                  </p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Events List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-[#C15B3E]/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#C15B3E]/20 p-2">
                  <Gavel className="h-5 w-5 text-[#C15B3E]" />
                </div>
                <CardTitle className="text-xl font-bold text-[#414435]">
                  Upcoming Court Events
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#414435] border-t-transparent"></div>
                  <p className="mt-4 text-[#6B705C]">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-[#6B705C]">No upcoming court events yet.</p>
                  <p className="text-sm text-[#6B705C]/70 mt-1">
                    Court dates and deadlines will appear here when assigned.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event, idx) => {
                    const isHighPriority = event.priority?.toLowerCase().includes('high') || event.priority?.toLowerCase().includes('critical');
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`group rounded-xl p-5 border transition-all duration-300 hover:shadow-md ${
                          isHighPriority
                            ? 'bg-red-50/50 border-red-200 hover:bg-red-100/50'
                            : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`rounded-lg p-3 shrink-0 ${isHighPriority ? 'bg-red-100' : 'bg-slate-100'}`}>
                              <Calendar className={`h-5 w-5 ${isHighPriority ? 'text-red-600' : 'text-slate-600'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-[#414435] truncate group-hover:text-[#6B705C] transition-colors">
                                {event.title}
                              </h4>
                              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                                <span className="flex items-center gap-1.5 text-[#6B705C]">
                                  <Clock className="h-3.5 w-3.5" />
                                  {new Date(event.date).toLocaleString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <span className="flex items-center gap-1.5 text-[#6B705C]">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {event.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <Badge className={`${
                              isHighPriority
                                ? 'bg-red-100 text-red-700 border-red-300'
                                : event.priority?.toLowerCase().includes('medium')
                                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                                  : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                            } px-2 py-1 text-xs`}>
                              {event.priority || 'Normal'}
                            </Badge>
                            <Badge variant="outline" className="border-slate-200 text-slate-600 text-xs">
                              {event.status || 'Scheduled'}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-0 bg-gradient-to-br from-amber-50/80 to-amber-100/50 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-[#414435]">
                  Important Reminders
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-[#6B705C] text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-amber-600" />
                  Arrive at least 30 minutes before your scheduled court time
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-amber-600" />
                  Bring all required documents and evidence files
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-amber-600" />
                  Notify survivors of court dates at least 48 hours in advance
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CourtCalendar;

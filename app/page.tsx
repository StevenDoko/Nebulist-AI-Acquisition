"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Badge } from "@/components/ui";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  ArrowUpRight,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { leadsApi } from "@/lib/api/leads";
import { eventsApi } from "@/lib/api/events";
import { tasksApi } from "@/lib/api/tasks";
import { getAllBranches } from "@/data/branches";
import Link from "next/link";
import type { Lead, Event, Task } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Add timeout to prevent infinite loading
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );

        const [leadsData, eventsData, tasksData] = await Promise.race([
          Promise.all([
            leadsApi.getAll().catch(err => {
              console.error("Error fetching leads:", err);
              return [];
            }),
            eventsApi.getAll().catch(err => {
              console.error("Error fetching events:", err);
              return [];
            }),
            tasksApi.getAll().catch(err => {
              console.error("Error fetching tasks:", err);
              return [];
            })
          ]),
          timeout
        ]) as [any[], any[], any[]];

        setLeads(leadsData);
        setEvents(eventsData);
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set empty arrays on error so dashboard still renders
        setLeads([]);
        setEvents([]);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalLeads = leads.length;
  const coldLeads = leads.filter(l => l.status === "cold").length;
  const warmLeads = leads.filter(l => l.status === "warm").length;
  const reservations = leads.filter(l => l.status === "reservation").length;
  const bookings = leads.filter(l => l.status === "booked").length;
  const upcomingEvents = events.filter(e => e.status === "final_booking" || e.status === "reservation").length;
  const urgentTasks = tasks.filter(t => t.priority === "urgent" && t.status !== "completed").length;

  const totalRevenue = leads
    .filter(l => l.status === "booked")
    .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  const projectedRevenue = leads
    .filter(l => l.status === "reservation" || l.status === "warm")
    .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  const branches = getAllBranches();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gradient mb-2"
          >
            Welcome back, {user?.name || user?.username || 'User'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Here's what's happening with your creative acquisition pipeline
          </motion.p>
        </div>
        <Link href="/discovery">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-purple-500/30"
          >
            <Zap className="w-5 h-5" />
            Discover New Leads
          </motion.button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <Badge variant="default">+12%</Badge>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{totalLeads}</p>
            <p className="text-sm text-muted-foreground">Total Leads</p>
            <div className="mt-4 flex items-center gap-4 text-xs">
              <span className="text-blue-400">{coldLeads} cold</span>
              <span className="text-orange-400">{warmLeads} warm</span>
              <span className="text-green-400">{bookings} booked</span>
            </div>
          </div>
        </Card>

        <Card hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <Badge variant="booked">Active</Badge>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">€{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Confirmed Revenue</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
              <ArrowUpRight className="w-4 h-4" />
              <span>€{projectedRevenue.toLocaleString()} projected</span>
            </div>
          </div>
        </Card>

        <Card hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-pink-400" />
              </div>
              <Badge variant="reservation">{upcomingEvents} upcoming</Badge>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{events.length}</p>
            <p className="text-sm text-muted-foreground">Total Events</p>
            <div className="mt-4 text-xs text-muted-foreground">
              Next: July 12, 2026
            </div>
          </div>
        </Card>

        <Card hover className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
              {urgentTasks > 0 && <Badge variant="hot">{urgentTasks} urgent</Badge>}
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{tasks.length}</p>
            <p className="text-sm text-muted-foreground">Active Tasks</p>
            <div className="mt-4 text-xs text-muted-foreground">
              {tasks.filter(t => t.status === "in-progress").length} in progress
            </div>
          </div>
        </Card>
      </div>

      {/* Branch Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Branch Performance</h2>
            <Link href="/crm" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {branches.map((branch, index) => {
              const branchLeads = leads.filter(l => l.branch === branch.id);
              const branchBookings = branchLeads.filter(l => l.status === "booked").length;
              const branchRevenue = branchLeads
                .filter(l => l.status === "booked")
                .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

              return (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg glass-dark hover:glass-strong transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg gradient-${branch.id} flex items-center justify-center text-2xl`}>
                        {branch.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{branch.name}</p>
                        <p className="text-xs text-muted-foreground">{branchLeads.length} leads</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">€{branchRevenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{branchBookings} bookings</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(branchBookings / branchLeads.length) * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                      className={`h-full gradient-${branch.id}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-4">
            {leads.slice(0, 5).map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg gradient-${lead.branch} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                  {lead.companyName.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{lead.companyName}</p>
                  <p className="text-sm text-muted-foreground truncate">{lead.contactPerson}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={lead.status as any}>{lead.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lead.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-bold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/outreach">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 rounded-xl glass-dark hover:glass-strong transition-all cursor-pointer border border-white/10"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Generate AI Outreach</h3>
              <p className="text-sm text-muted-foreground">Create personalized outreach emails with AI</p>
            </motion.div>
          </Link>

          <Link href="/crm">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 rounded-xl glass-dark hover:glass-strong transition-all cursor-pointer border border-white/10"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Manage Leads</h3>
              <p className="text-sm text-muted-foreground">View and update your lead pipeline</p>
            </motion.div>
          </Link>

          <Link href="/planning">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 rounded-xl glass-dark hover:glass-strong transition-all cursor-pointer border border-white/10"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Plan Events</h3>
              <p className="text-sm text-muted-foreground">Schedule and manage upcoming installations</p>
            </motion.div>
          </Link>
        </div>
      </Card>
    </div>
  );
}

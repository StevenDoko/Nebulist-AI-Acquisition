"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Badge, Button, Input, Select } from "@/components/ui";
import { 
  Search, 
  Sparkles, 
  MapPin, 
  Globe, 
  Users, 
  TrendingUp,
  Plus,
  ExternalLink,
  Share2,
  Mail,
  Phone,
  Building2,
  Target,
  Zap,
  Filter,
  Download,
  CheckCircle2,
  X,
  Calendar,
  DollarSign,
  Info,
  Flame,
  Thermometer,
  Snowflake
} from "lucide-react";
import { getAllBranches } from "@/data/branches";
import { leadsApi } from "@/lib/api/leads";
import { calculateCompatibilityScore, getCompatibilityColor } from "@/lib/compatibility";
import type { Branch } from "@/types";

interface DiscoveredProspect {
  id: string;
  name: string;
  type: string;
  location: string;
  contactPerson?: string;
  website?: string;
  email?: string;
  phone?: string;
  description: string;
  estimatedBudget: string;
  eventFrequency: string;
  eventDate: string; // ISO date string for upcoming event
  socialMedia: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  aiInsights: string[];
  temperature: 'hot' | 'warm' | 'cold';
  branch: string;
}

const mockProspects: DiscoveredProspect[] = [
  {
    id: "disc-1",
    name: "Amsterdam Dance Event",
    type: "Music Festival",
    location: "Amsterdam, Netherlands",
    contactPerson: "Duncan Stutterheim",
    website: "https://www.amsterdam-dance-event.nl",
    email: "info@ade.nl",
    description: "Europe's largest electronic music festival and conference, hosting 2,500+ artists across 200+ venues",
    estimatedBudget: "€50,000 - €100,000",
    eventFrequency: "Annual (October)",
    eventDate: "2026-10-15",
    socialMedia: {
      instagram: "@amsterdamdanceevent",
      facebook: "AmsterdamDanceEvent",
      linkedin: "amsterdam-dance-event"
    },
    aiInsights: [
      "Large-scale event with 400,000+ attendees - perfect for multiple installations",
      "Strong focus on innovation and immersive experiences",
      "Previous partnerships with creative tech companies",
      "High social media engagement (500K+ followers)"
    ],
    temperature: 'warm',
    branch: "festivals"
  },
  {
    id: "disc-2",
    name: "International School of Amsterdam",
    type: "International School",
    location: "Amsterdam, Netherlands",
    contactPerson: "Dr. Sarah Mitchell",
    website: "https://www.isa.nl",
    email: "admissions@isa.nl",
    description: "Leading international school with 1,300+ students, known for innovative STEAM programs",
    estimatedBudget: "€15,000 - €30,000",
    eventFrequency: "Multiple events per year",
    eventDate: "2026-06-20",
    socialMedia: {
      instagram: "@isaamsterdam",
      linkedin: "international-school-amsterdam"
    },
    aiInsights: [
      "Strong emphasis on arts and technology integration",
      "Annual science fair and cultural festivals",
      "Budget allocated for experiential learning",
      "Previous investment in interactive installations"
    ],
    temperature: 'hot',
    branch: "schools"
  },
  {
    id: "disc-3",
    name: "De Kromhouthal",
    type: "Wedding & Event Venue",
    location: "Amsterdam, Netherlands",
    contactPerson: "Lisa van der Berg",
    website: "https://www.kromhouthal.nl",
    email: "info@kromhouthal.nl",
    description: "Industrial-chic wedding venue in historic shipyard, hosting 80+ weddings annually",
    estimatedBudget: "€8,000 - €20,000",
    eventFrequency: "Weekly events",
    eventDate: "2026-06-14",
    socialMedia: {
      instagram: "@kromhouthal",
      facebook: "DeKromhouthal"
    },
    aiInsights: [
      "Couples seeking unique, artistic wedding experiences",
      "Venue actively promotes creative vendors",
      "High-end clientele with premium budgets",
      "Strong Instagram presence (50K+ followers)"
    ],
    temperature: 'warm',
    branch: "wedding"
  },
  {
    id: "disc-4",
    name: "Shelter Amsterdam",
    type: "Underground Club",
    location: "Amsterdam Noord, Netherlands",
    contactPerson: "Mark Jansen",
    website: "https://www.shelteramsterdam.nl",
    email: "booking@shelter.nl",
    description: "Iconic underground techno club in former shipyard bunker, known for immersive experiences",
    estimatedBudget: "€20,000 - €40,000",
    eventFrequency: "Weekly events + special occasions",
    eventDate: "2026-06-06",
    socialMedia: {
      instagram: "@shelteramsterdam",
      facebook: "ShelterAmsterdam"
    },
    aiInsights: [
      "Reputation for cutting-edge visual experiences",
      "Hosts international DJs and special events",
      "Strong brand identity around immersive atmosphere",
      "Previous collaborations with visual artists"
    ],
    temperature: 'warm',
    branch: "nightclub"
  },
  {
    id: "disc-5",
    name: "Lowlands Festival",
    type: "Music & Arts Festival",
    location: "Biddinghuizen, Netherlands",
    contactPerson: "Eric van Eerdenburg",
    website: "https://www.lowlands.nl",
    email: "info@lowlands.nl",
    description: "Major 3-day music and arts festival with 60,000 attendees, featuring diverse art installations",
    estimatedBudget: "€80,000 - €150,000",
    eventFrequency: "Annual (August)",
    eventDate: "2026-08-20",
    socialMedia: {
      instagram: "@lowlandsfestival",
      facebook: "LowlandsFestival",
      linkedin: "lowlands-festival"
    },
    aiInsights: [
      "Dedicated art & innovation area with budget for installations",
      "60,000+ attendees over 3 days",
      "Previous art installations have been highly successful",
      "Strong focus on creating memorable experiences"
    ],
    temperature: 'warm',
    branch: "festivals"
  },
  {
    id: "disc-6",
    name: "British School of Amsterdam",
    type: "International School",
    location: "Amsterdam, Netherlands",
    contactPerson: "James Thompson",
    website: "https://www.britishschool.nl",
    email: "info@britishschool.nl",
    description: "Premium international school with 2,000+ students, hosting major annual events",
    estimatedBudget: "€12,000 - €25,000",
    eventFrequency: "4-6 major events per year",
    eventDate: "2026-07-10",
    socialMedia: {
      instagram: "@britishschoolamsterdam",
      linkedin: "british-school-amsterdam"
    },
    aiInsights: [
      "Annual gala and fundraising events",
      "Strong parent community with high engagement",
      "Budget for memorable student experiences",
      "Previous partnerships with creative agencies"
    ],
    temperature: 'hot',
    branch: "schools"
  },
  {
    id: "disc-7",
    name: "Bali Spirit Festival",
    type: "Wellness & Music Festival",
    location: "Ubud, Indonesia",
    contactPerson: "Meghan Pappenheim",
    website: "https://www.balispiritfestival.com",
    email: "info@balispiritfestival.com",
    description: "International yoga, dance, and music festival attracting 6,000+ participants from 50+ countries",
    estimatedBudget: "€30,000 - €60,000",
    eventFrequency: "Annual (March)",
    eventDate: "2027-03-25",
    socialMedia: {
      instagram: "@balispiritfestival",
      facebook: "BaliSpiritFestival",
      linkedin: "bali-spirit-festival"
    },
    aiInsights: [
      "6,000+ international attendees seeking transformative experiences",
      "Strong focus on art installations and immersive spaces",
      "Previous collaborations with international artists",
      "High-end wellness clientele with premium budgets"
    ],
    temperature: 'warm',
    branch: "festivals"
  },
  {
    id: "disc-8",
    name: "Jakarta International School",
    type: "International School",
    location: "Jakarta, Indonesia",
    contactPerson: "Timothy Carr",
    website: "https://www.jisedu.or.id",
    email: "admissions@jis.edu",
    description: "Premier international school with 2,400+ students, hosting major cultural and educational events",
    estimatedBudget: "€20,000 - €40,000",
    eventFrequency: "6-8 major events per year",
    eventDate: "2026-06-25",
    socialMedia: {
      instagram: "@jakartaintlschool",
      linkedin: "jakarta-international-school"
    },
    aiInsights: [
      "Large expatriate community with high purchasing power",
      "Annual international day and cultural festivals",
      "Strong emphasis on arts and innovation",
      "Budget for memorable student experiences"
    ],
    temperature: 'hot',
    branch: "schools"
  },
  {
    id: "disc-9",
    name: "Potato Head Beach Club",
    type: "Beach Club & Event Venue",
    location: "Seminyak, Indonesia",
    contactPerson: "Ronald Akili",
    website: "https://www.ptthead.com",
    email: "events@potatohead.co",
    description: "Iconic beach club and event space known for creative installations and weekly events",
    estimatedBudget: "€15,000 - €35,000",
    eventFrequency: "Weekly events + special occasions",
    eventDate: "2026-06-12",
    socialMedia: {
      instagram: "@potatoheadbali",
      facebook: "PotatoHeadBeachClub"
    },
    aiInsights: [
      "Reputation for cutting-edge art and design",
      "Hosts international DJs and cultural events",
      "Strong brand identity around sustainability and creativity",
      "Previous collaborations with visual artists and designers"
    ],
    temperature: 'warm',
    branch: "nightclub"
  },
  {
    id: "disc-10",
    name: "Sunburn Festival India",
    type: "Electronic Music Festival",
    location: "Goa, India",
    contactPerson: "Shailendra Singh",
    website: "https://www.sunburn.in",
    email: "info@sunburn.in",
    description: "Asia's largest electronic music festival with 350,000+ attendees over 3 days",
    estimatedBudget: "€70,000 - €120,000",
    eventFrequency: "Annual (December)",
    eventDate: "2026-12-28",
    socialMedia: {
      instagram: "@sunburnfestival",
      facebook: "SunburnFestival",
      linkedin: "sunburn-festival"
    },
    aiInsights: [
      "350,000+ attendees - massive scale opportunity",
      "Strong focus on stage design and visual experiences",
      "Previous partnerships with international production companies",
      "High social media engagement (2M+ followers)"
    ],
    temperature: 'warm',
    branch: "festivals"
  },
  {
    id: "disc-11",
    name: "The Oberoi Mumbai",
    type: "Luxury Hotel & Wedding Venue",
    location: "Mumbai, India",
    contactPerson: "Vikram Oberoi",
    website: "https://www.oberoihotels.com",
    email: "events@oberoihotels.com",
    description: "Five-star luxury hotel hosting 100+ high-end weddings and corporate events annually",
    estimatedBudget: "€40,000 - €80,000",
    eventFrequency: "Weekly events",
    eventDate: "2026-06-18",
    socialMedia: {
      instagram: "@oberoihotels",
      linkedin: "oberoi-hotels"
    },
    aiInsights: [
      "Ultra-high-net-worth clientele seeking unique experiences",
      "Venue actively promotes innovative event concepts",
      "Strong reputation for flawless execution",
      "Previous investment in premium installations"
    ],
    temperature: 'warm',
    branch: "wedding"
  },
  {
    id: "disc-12",
    name: "Fabric London",
    type: "Nightclub",
    location: "London, United Kingdom",
    contactPerson: "Cameron Leslie",
    website: "https://www.fabriclondon.com",
    email: "bookings@fabriclondon.com",
    description: "World-renowned nightclub with cutting-edge sound and visual systems, hosting weekly events",
    estimatedBudget: "€25,000 - €50,000",
    eventFrequency: "Weekly events + special occasions",
    eventDate: "2026-07-05",
    socialMedia: {
      instagram: "@fabriclondon",
      facebook: "FabricLondon",
      linkedin: "fabric-london"
    },
    aiInsights: [
      "Iconic venue known for innovation in club experiences",
      "Hosts international artists and special events",
      "Strong brand identity around immersive atmosphere",
      "Previous collaborations with visual and lighting artists"
    ],
    temperature: 'warm',
    branch: "nightclub"
  },
  {
    id: "disc-13",
    name: "Glastonbury Festival",
    type: "Music & Arts Festival",
    location: "Somerset, United Kingdom",
    website: "https://www.glastonburyfestivals.co.uk",
    email: "info@glastonburyfestivals.co.uk",
    description: "Legendary 5-day festival with 200,000+ attendees, featuring extensive art installations",
    estimatedBudget: "€100,000 - €200,000",
    eventFrequency: "Annual (June)",
    eventDate: "2027-06-23",
    socialMedia: {
      instagram: "@glastofest",
      facebook: "GlastonburyFestivals",
      linkedin: "glastonbury-festivals"
    },
    aiInsights: [
      "200,000+ attendees over 5 days - massive reach",
      "Dedicated art fields with substantial budgets",
      "World-renowned for innovative installations",
      "Previous year featured 50+ major art pieces"
    ],
    temperature: 'warm',
    branch: "festivals"
  },
  {
    id: "disc-14",
    name: "Marina Bay Sands",
    type: "Luxury Hotel & Event Complex",
    location: "Singapore",
    website: "https://www.marinabaysands.com",
    email: "events@marinabaysands.com",
    description: "Iconic integrated resort hosting 200+ premium events annually, including weddings and corporate galas",
    estimatedBudget: "€50,000 - €100,000",
    eventFrequency: "Weekly events",
    eventDate: "2026-08-08",
    socialMedia: {
      instagram: "@marinabaysands",
      facebook: "MarinaBaySands",
      linkedin: "marina-bay-sands"
    },
    aiInsights: [
      "Ultra-premium clientele seeking world-class experiences",
      "Venue known for spectacular event productions",
      "Strong emphasis on innovation and technology",
      "Previous partnerships with international creative agencies"
    ],
    temperature: 'warm',
    branch: "wedding"
  },
  {
    id: "disc-15",
    name: "Zouk Singapore",
    type: "Nightclub & Entertainment Complex",
    location: "Singapore",
    website: "https://www.zoukclub.com",
    email: "bookings@zoukclub.com",
    description: "Award-winning nightclub with state-of-the-art production, hosting weekly events and festivals",
    estimatedBudget: "€30,000 - €60,000",
    eventFrequency: "Weekly events + monthly festivals",
    eventDate: "2026-07-18",
    socialMedia: {
      instagram: "@zoukclubsg",
      facebook: "ZoukClubSG",
      linkedin: "zouk-singapore"
    },
    aiInsights: [
      "Multiple awards for best club in Asia",
      "Known for cutting-edge visual and audio experiences",
      "Hosts international DJs and special events",
      "Strong investment in immersive technologies"
    ],
    temperature: 'warm',
    branch: "nightclub"
  }
];

// Temperature classification function
function classifyLeadTemperature(name: string, type: string, description: string): 'hot' | 'warm' | 'cold' {
  const text = `${name} ${type} ${description}`.toLowerCase();
  
  // HOT - Very suitable for bubble machines (kids, family, celebrations)
  const hotKeywords = [
    'kids', 'children', 'child', 'birthday', 'school', 'kindergarten', 
    'playground', 'carnival', 'family festival', 'anak', 'ulang tahun',
    'sekolah', 'taman kanak', 'pesta anak', 'family fun', 'kids party'
  ];
  
  // COLD - Not suitable (business, professional, formal)
  const coldKeywords = [
    'conference', 'seminar', 'business', 'professional', 'corporate meeting',
    'accounting', 'finance', 'konferensi', 'bisnis', 'summit', 'symposium',
    'workshop', 'training', 'b2b', 'enterprise', 'corporate training'
  ];
  
  // Check for HOT keywords
  if (hotKeywords.some(keyword => text.includes(keyword))) {
    return 'hot';
  }
  
  // Check for COLD keywords
  if (coldKeywords.some(keyword => text.includes(keyword))) {
    return 'cold';
  }
  
  // Default to WARM (weddings, general events, festivals)
  return 'warm';
}

// TemperatureBadge component
function TemperatureBadge({ temperature }: { temperature: 'hot' | 'warm' | 'cold' }) {
  const config = {
    hot: {
      icon: Flame,
      label: 'Hot Lead',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-500',
      borderColor: 'border-red-500/20',
      description: 'Highly suitable for bubble machines'
    },
    warm: {
      icon: Thermometer,
      label: 'Warm Lead',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-500',
      borderColor: 'border-amber-500/20',
      description: 'Moderately suitable'
    },
    cold: {
      icon: Snowflake,
      label: 'Cold Lead',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500/20',
      description: 'Less suitable'
    }
  };

  const { icon: Icon, label, bgColor, textColor, borderColor } = config[temperature];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${bgColor} ${borderColor}`}>
      <Icon className={`w-4 h-4 ${textColor}`} />
      <span className={`text-sm font-medium ${textColor}`}>{label}</span>
    </div>
  );
}

// Popular countries for autocomplete
const COUNTRIES = [
  "Netherlands", "Belgium", "Germany", "France", "United Kingdom", 
  "Spain", "Italy", "Portugal", "Switzerland", "Austria",
  "Denmark", "Sweden", "Norway", "Finland", "Poland",
  "Czech Republic", "Hungary", "Greece", "Turkey", "Russia",
  "United States", "Canada", "Mexico", "Brazil", "Argentina",
  "China", "Japan", "South Korea", "India", "Indonesia",
  "Singapore", "Thailand", "Malaysia", "Philippines", "Vietnam",
  "Australia", "New Zealand", "South Africa", "Egypt", "Morocco"
];

export default function DiscoveryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [location, setLocation] = useState("Netherlands");
  const [budgetRange, setBudgetRange] = useState("all");
  const [eventFrequency, setEventFrequency] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [prospects, setProspects] = useState<DiscoveredProspect[]>([]);
  const [selectedProspects, setSelectedProspects] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<DiscoveredProspect | null>(null);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSearchInfo, setShowSearchInfo] = useState(false);

  const branches = getAllBranches();

  // Handle location input change with autocomplete
  const handleLocationChange = (value: string) => {
    setLocation(value);
    
    if (value.trim().length > 0) {
      const filtered = COUNTRIES.filter(country => 
        country.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8); // Limit to 8 suggestions
      
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(filtered.length > 0);
    } else {
      setShowLocationSuggestions(false);
      setLocationSuggestions([]);
    }
  };

  const selectLocationSuggestion = (country: string) => {
    setLocation(country);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setProspects([]);
    
    // Simulate AI search with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Calculate temperature for each prospect based on compatibility score
    const prospectsWithTemperature = mockProspects.map(prospect => {
      const { score } = calculateCompatibilityScore({
        branch: prospect.branch as "festivals" | "schools" | "wedding" | "nightclub",
        eventType: prospect.type,
        eventFrequency: prospect.eventFrequency,
        estimatedBudget: prospect.estimatedBudget,
        eventDescription: prospect.description,
        website: prospect.website
      });
      
      // Calculate temperature: Hot = 71-100%, Warm = 41-70%, Cold = 0-40%
      const temperature: "hot" | "warm" | "cold" = 
        score >= 71 ? "hot" : 
        score >= 41 ? "warm" : 
        "cold";
      
      return {
        ...prospect,
        temperature
      };
    });
    
    // Filter prospects based on all criteria
    let filtered = prospectsWithTemperature;
    
    // Filter by branch
    if (selectedBranch !== "all") {
      filtered = filtered.filter(p => p.branch === selectedBranch);
    }
    
    // Filter by search query (search in name, type, description, location)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
      );
    }
    
    // Filter by location
    if (location.trim() && location !== "Netherlands") {
      const loc = location.toLowerCase();
      filtered = filtered.filter(p => 
        p.location.toLowerCase().includes(loc)
      );
    }
    
    // Filter by budget range
    if (budgetRange !== "all") {
      filtered = filtered.filter(p => {
        const budget = p.estimatedBudget.toLowerCase();
        if (budgetRange === "small") {
          return budget.includes("5") || budget.includes("10") || budget.includes("12") || budget.includes("15") || budget.includes("20");
        } else if (budgetRange === "medium") {
          return budget.includes("25") || budget.includes("30") || budget.includes("35") || budget.includes("40") || budget.includes("45") || budget.includes("50");
        } else if (budgetRange === "large") {
          return budget.includes("60") || budget.includes("70") || budget.includes("80") || budget.includes("100") || budget.includes("150");
        }
        return true;
      });
    }
    
    // Filter by event frequency
    if (eventFrequency !== "all") {
      filtered = filtered.filter(p => {
        const freq = p.eventFrequency.toLowerCase();
        if (eventFrequency === "weekly") {
          return freq.includes("week");
        } else if (eventFrequency === "monthly") {
          return freq.includes("month");
        } else if (eventFrequency === "annual") {
          return freq.includes("annual") || freq.includes("year");
        }
        return true;
      });
    }
    
    // Filter by date range
    if (dateFrom || dateTo) {
      filtered = filtered.filter(p => {
        if (!p.eventDate) return false;
        
        const eventDate = new Date(p.eventDate);
        
        if (dateFrom && dateTo) {
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          return eventDate >= fromDate && eventDate <= toDate;
        } else if (dateFrom) {
          const fromDate = new Date(dateFrom);
          return eventDate >= fromDate;
        } else if (dateTo) {
          const toDate = new Date(dateTo);
          return eventDate <= toDate;
        }
        
        return true;
      });
    }
    
    setProspects(filtered);
    setIsSearching(false);
  };

  const toggleProspect = (id: string) => {
    const newSelected = new Set(selectedProspects);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProspects(newSelected);
  };

  const handleExport = () => {
    // Get selected prospects data
    const selectedData = prospects.filter(p => selectedProspects.has(p.id));
    
    // Convert to CSV format
    const headers = ["Name", "Type", "Location", "Website", "Email", "Budget", "Frequency", "Temperature"];
    const csvRows = [
      headers.join(","),
      ...selectedData.map(p => [
        `"${p.name}"`,
        `"${p.type}"`,
        `"${p.location}"`,
        `"${p.website || ''}"`,
        `"${p.email || ''}"`,
        `"${p.estimatedBudget}"`,
        `"${p.eventFrequency}"`,
        p.temperature
      ].join(","))
    ];
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `prospects_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertProspectToLead = (prospect: DiscoveredProspect) => {
    const locationParts = prospect.location.split(',').map(s => s.trim());
    const country = locationParts[locationParts.length - 1] || "Netherlands";
    const province = locationParts[0] || prospect.location;
    
    // Calculate compatibility score
    const { score, reason } = calculateCompatibilityScore({
      branch: prospect.branch as "festivals" | "schools" | "wedding" | "nightclub",
      eventType: prospect.type,
      eventFrequency: prospect.eventFrequency,
      estimatedBudget: prospect.estimatedBudget
    });
    
    // Calculate temperature based on compatibility score
    // Hot: 71-100% (highest match), Warm: 41-70% (medium match), Cold: 0-40% (low match)
    const temperature: "hot" | "warm" | "cold" = 
      score >= 71 ? "hot" : 
      score >= 41 ? "warm" : 
      "cold";
    
    const now = new Date().toISOString();
    
    return {
      companyName: prospect.name,
      contactPerson: prospect.contactPerson || "Contact Person",
      email: prospect.email || `info@${prospect.name.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: prospect.phone || "+31 20 123 4567",
      website: prospect.website || "",
      branch: prospect.branch as "festivals" | "schools" | "wedding" | "nightclub",
      status: "cold" as const,
      temperature: temperature,
      province: province,
      country: country,
      eventCategory: prospect.type,
      eventType: prospect.type,
      eventFrequency: prospect.eventFrequency,
      estimatedBudget: prospect.estimatedBudget,
      socialLinks: prospect.socialMedia || {},
      assignedTo: "You",
      notes: [{
        id: `note-${Date.now()}`,
        content: `Discovered via AI search. ${prospect.description}`,
        author: "System",
        createdAt: now,
        type: "internal" as const
      }],
      interactions: [],
      nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedValue: parseInt(prospect.estimatedBudget.replace(/[^0-9]/g, '')) || 15000,
      eventDate: prospect.eventDate,
      reservationType: prospect.type, // Use event type as reservation type
      emailStatus: "not_sent" as const,
      compatibilityScore: score,
      compatibilityReason: reason
    };
  };

  const handleAddSingleToCRM = async (prospect: DiscoveredProspect) => {
    try {
      console.log("=== DEBUG: Add to CRM Started ===");
      console.log("Prospect data:", prospect);
      
      const newLead = convertProspectToLead(prospect);
      console.log("Converted lead data:", newLead);
      console.log("Lead data keys:", Object.keys(newLead));
      console.log("Lead data JSON:", JSON.stringify(newLead, null, 2));
      
      const result = await leadsApi.create(newLead);
      console.log("Create result:", result);
      
      // Show success message
      alert(`Successfully added "${prospect.name}" to CRM! Redirecting...`);
      
      // Redirect to CRM page after a short delay
      setTimeout(() => {
        router.push('/crm');
      }, 500);
    } catch (error) {
      console.error("=== ERROR: Add to CRM Failed ===");
      console.error("Error details:", error);
      console.error("Error JSON:", JSON.stringify(error, null, 2));
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      
      // Try to extract more details from the error
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      alert(`Failed to add prospect to CRM. Error: ${errorMessage}`);
    }
  };

  const handleAddToCRM = async () => {
    try {
      // Get selected prospects data
      const selectedData = prospects.filter(p => selectedProspects.has(p.id));
      
      // Convert prospects to CRM lead format (matching Lead interface)
      const newLeads = selectedData.map(convertProspectToLead);
      
      // Add new leads to Supabase database
      for (const lead of newLeads) {
        await leadsApi.create(lead);
      }
      
      // Clear selection
      setSelectedProspects(new Set());
      
      // Show success message and redirect to CRM
      alert(`Successfully added ${selectedProspects.size} prospects to CRM! Redirecting...`);
      
      // Redirect to CRM page after a short delay
      setTimeout(() => {
        router.push('/crm');
      }, 500);
    } catch (error) {
      console.error("Error adding to CRM:", error);
      alert("Failed to add prospects to CRM. Please try again.");
    }
  };

  const handleViewDetails = (prospect: DiscoveredProspect) => {
    setSelectedProspect(prospect);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Lead Discovery</h1>
          <p className="text-muted-foreground">
            AI-powered prospect research to find your next clients
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-dark">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="text-sm text-muted-foreground">AI Research Engine</span>
        </div>
      </div>

      {/* Search Interface */}
      <Card className="relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Query */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                What are you looking for?
              </label>
              <Input
                placeholder="E.g., Electronic music festivals in Netherlands, International schools, Wedding venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>

            {/* Branch Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Branch / Event Type
              </label>
              <Select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                options={[
                  { value: "all", label: "All Branches" },
                  ...branches.map(branch => ({
                    value: branch.id,
                    label: `${branch.icon} ${branch.name}`,
                  })),
                ]}
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
            </Button>
            <div className="flex-1" />
            <Button
              variant="primary"
              onClick={handleSearch}
              disabled={isSearching}
              className="flex items-center gap-2 px-6"
            >
              {isSearching ? (
                <>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Searching with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Discover Prospects
                </>
              )}
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10"
              >
                <div className="relative">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location
                  </label>
                  <Input
                    placeholder="City or country"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onFocus={() => {
                      if (location.trim().length > 0) {
                        const filtered = COUNTRIES.filter(country => 
                          country.toLowerCase().includes(location.toLowerCase())
                        ).slice(0, 8);
                        setLocationSuggestions(filtered);
                        setShowLocationSuggestions(filtered.length > 0);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow click on suggestion
                      setTimeout(() => setShowLocationSuggestions(false), 200);
                    }}
                    icon={<MapPin className="w-4 h-4" />}
                  />
                  
                  {/* Location Suggestions Dropdown */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-[9999] w-full mt-1 bg-gray-900 border border-white/20 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                      {locationSuggestions.map((country, index) => (
                        <button
                          key={index}
                          onClick={() => selectLocationSuggestion(country)}
                          className="w-full px-4 py-3 text-left hover:bg-purple-500/20 transition-colors flex items-center gap-2 text-sm text-foreground border-b border-white/5 last:border-b-0"
                        >
                          <Globe className="w-4 h-4 text-purple-400" />
                          <span>{country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Budget Range
                  </label>
                  <Select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    options={[
                      { value: "all", label: "All Budgets" },
                      { value: "small", label: "€5K - €20K" },
                      { value: "medium", label: "€20K - €50K" },
                      { value: "large", label: "€50K+" },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Event Frequency
                  </label>
                  <Select
                    value={eventFrequency}
                    onChange={(e) => setEventFrequency(e.target.value)}
                    options={[
                      { value: "all", label: "All Frequencies" },
                      { value: "weekly", label: "Weekly" },
                      { value: "monthly", label: "Monthly" },
                      { value: "annual", label: "Annual" },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Event Date From
                  </label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="Start date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Event Date To
                  </label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="End date"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Results Header */}
      {prospects.length > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-foreground">
              Found {prospects.length} prospects
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedProspects.size} selected
            </p>
          </div>
          {selectedProspects.size > 0 && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export ({selectedProspects.size})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {prospects.map((prospect, index) => {
            const branch = branches.find(b => b.id === prospect.branch);
            const isSelected = selectedProspects.has(prospect.id);
            
            return (
              <motion.div
                key={prospect.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  hover
                  className={`relative ${isSelected ? "ring-2 ring-purple-500" : ""}`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-4 right-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleProspect(prospect.id)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-purple-600 border-purple-600"
                          : "border-white/20 hover:border-purple-500"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </motion.button>
                  </div>

                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-14 h-14 rounded-xl gradient-${prospect.branch} flex items-center justify-center text-2xl flex-shrink-0`}
                    >
                      {branch?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground mb-1 truncate">
                        {prospect.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{prospect.type}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{branch?.name}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {prospect.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Temperature & Compatibility Badges */}
                  <div className="mb-4 flex items-center gap-2">
                    <TemperatureBadge temperature={prospect.temperature} />
                    {(() => {
                      const { score } = calculateCompatibilityScore({
                        branch: prospect.branch as "festivals" | "schools" | "wedding" | "nightclub",
                        eventType: prospect.type,
                        eventFrequency: prospect.eventFrequency,
                        estimatedBudget: prospect.estimatedBudget
                      });
                      const colors = getCompatibilityColor(score);
                      return (
                        <div className={`px-3 py-1 rounded-full ${colors.bg} border ${colors.border} flex items-center gap-1.5`}>
                          <Sparkles className={`w-3 h-3 ${colors.text}`} />
                          <span className={`text-xs font-semibold ${colors.text}`}>
                            {score}% Match
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {prospect.description}
                  </p>

                  {/* Key Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg glass-dark">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Budget Range</p>
                      <p className="text-sm font-medium text-foreground">{prospect.estimatedBudget}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Frequency</p>
                      <p className="text-sm font-medium text-foreground">{prospect.eventFrequency}</p>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-semibold text-foreground">AI Insights</span>
                    </div>
                    <ul className="space-y-1">
                      {prospect.aiInsights.slice(0, 2).map((insight, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Contact & Social */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      {prospect.website && (
                        <a
                          href={prospect.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg glass-dark hover:glass-strong flex items-center justify-center transition-all"
                          title="Visit website"
                        >
                          <Globe className="w-4 h-4 text-muted-foreground" />
                        </a>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => handleViewDetails(prospect)}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Details
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!isSearching && prospects.length === 0 && (
        <Card className="py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Ready to Discover Prospects
            </h3>
            <p className="text-muted-foreground mb-6">
              Use our AI-powered research engine to find potential clients that match your
              branch criteria. Enter your search parameters and let AI do the work.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                <span>High Match Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Real-time Data</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Prospect Detail Modal */}
      <AnimatePresence>
        {selectedProspect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProspect(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="relative">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProspect(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-lg glass-dark hover:glass-strong flex items-center justify-center transition-all z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="relative pb-6 border-b border-white/10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                  <div className="relative flex items-start gap-6">
                    <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        {selectedProspect.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge variant="default">{selectedProspect.type}</Badge>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {selectedProspect.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TemperatureBadge temperature={selectedProspect.temperature} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6 pt-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-purple-400" />
                      About
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProspect.description}
                    </p>
                  </div>

                  {/* Budget & Frequency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg glass-dark">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Estimated Budget
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        {selectedProspect.estimatedBudget}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg glass-dark">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Event Frequency
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        {selectedProspect.eventFrequency}
                      </p>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      AI Insights
                    </h3>
                    <ul className="space-y-2">
                      {selectedProspect.aiInsights.map((insight, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg glass-dark"
                        >
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span className="text-muted-foreground">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-purple-400" />
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      {selectedProspect.contactPerson && (
                        <div className="flex items-center gap-3 p-3 rounded-lg glass-dark">
                          <Users className="w-5 h-5 text-muted-foreground" />
                          <span className="text-foreground font-medium">
                            {selectedProspect.contactPerson}
                          </span>
                        </div>
                      )}
                      {selectedProspect.website && (
                        <div className="flex items-center gap-3 p-3 rounded-lg glass-dark">
                          <Globe className="w-5 h-5 text-muted-foreground" />
                          <a
                            href={selectedProspect.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            {selectedProspect.website}
                          </a>
                        </div>
                      )}
                      {selectedProspect.email && (
                        <div className="flex items-center gap-3 p-3 rounded-lg glass-dark">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <a
                            href={`mailto:${selectedProspect.email}`}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            {selectedProspect.email}
                          </a>
                        </div>
                      )}
                      {selectedProspect.phone && (
                        <div className="flex items-center gap-3 p-3 rounded-lg glass-dark">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <a
                            href={`tel:${selectedProspect.phone}`}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            {selectedProspect.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Media */}
                  {(selectedProspect.socialMedia.instagram ||
                    selectedProspect.socialMedia.facebook ||
                    selectedProspect.socialMedia.linkedin) && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-purple-400" />
                        Social Media
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedProspect.socialMedia.instagram && (
                          <div className="px-4 py-2 rounded-lg glass-dark text-sm text-muted-foreground">
                            Instagram: {selectedProspect.socialMedia.instagram}
                          </div>
                        )}
                        {selectedProspect.socialMedia.facebook && (
                          <div className="px-4 py-2 rounded-lg glass-dark text-sm text-muted-foreground">
                            Facebook: {selectedProspect.socialMedia.facebook}
                          </div>
                        )}
                        {selectedProspect.socialMedia.linkedin && (
                          <div className="px-4 py-2 rounded-lg glass-dark text-sm text-muted-foreground">
                            LinkedIn: {selectedProspect.socialMedia.linkedin}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <Button
                      variant="primary"
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={() => handleAddSingleToCRM(selectedProspect)}
                    >
                      <Plus className="w-4 h-4" />
                      Add to CRM
                    </Button>
                    {selectedProspect.website && (
                      <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                        onClick={() => window.open(selectedProspect.website, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit Website
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

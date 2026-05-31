import { BranchConfig, BranchType } from "@/types";

export const branchConfigs: Record<BranchType, BranchConfig> = {
  festivals: {
    id: "festivals",
    name: "Festivals",
    icon: "🎪",
    color: "#FF6B9D",
    gradient: "from-pink-500 via-purple-500 to-indigo-600",
    description: "Large-scale music festivals, cultural events, and outdoor celebrations",
    tone: "Energetic, playful, and visually spectacular. Focus on creating unforgettable moments and Instagram-worthy experiences.",
    visualStyle: "Cinematic night atmosphere with laser visuals and vibrant energy",
    targetAudience: "Festival organizers, event production companies, cultural institutions",
    website: "https://nebulist.nl/festivals",
    outreachStrategy: {
      tone: "energetic and creative",
      hooks: [
        "Transform your festival into an unforgettable visual spectacle",
        "Create Instagram-worthy moments that attendees will share for weeks",
        "Stand out from other festivals with unique interactive experiences",
        "Boost ticket sales with attractions that generate massive social buzz"
      ],
      painPoints: [
        "Struggling to differentiate your festival from competitors",
        "Need attractions that create shareable social media moments",
        "Looking for experiences that justify premium ticket prices",
        "Want to increase attendee engagement and dwell time"
      ],
      cta: [
        "Let's discuss how we can make your next festival legendary",
        "Schedule a call to explore custom installations for your event",
        "See our festival portfolio and get inspired",
        "Get a custom proposal tailored to your festival's vibe"
      ]
    }
  },
  schools: {
    id: "schools",
    name: "Schools",
    icon: "🎓",
    color: "#4ECDC4",
    gradient: "from-cyan-400 via-teal-500 to-emerald-600",
    description: "Educational institutions, science fairs, and children's events",
    tone: "Educational, safe, and wonder-inspiring. Emphasize learning through play and scientific exploration.",
    visualStyle: "Bright, educational visuals with children interaction and bubble experiments",
    targetAudience: "School administrators, science teachers, educational event coordinators",
    website: "https://nebulist.nl/schools",
    outreachStrategy: {
      tone: "educational and trustworthy",
      hooks: [
        "Make science come alive with hands-on interactive experiences",
        "Engage students with STEM learning through play and wonder",
        "Create memorable educational moments that inspire curiosity",
        "Turn your science fair into an unforgettable learning adventure"
      ],
      painPoints: [
        "Need engaging activities that align with educational goals",
        "Looking for safe, supervised experiences for students",
        "Want to make science and learning more exciting and accessible",
        "Seeking budget-friendly options for school events"
      ],
      cta: [
        "Let's discuss educational packages for your school",
        "Schedule a demo to see our installations in action",
        "Get a custom quote for your next science fair or school event",
        "Explore our educational programs and special school rates"
      ]
    }
  },
  wedding: {
    id: "wedding",
    name: "Wedding Planners",
    icon: "💍",
    color: "#FFB6C1",
    gradient: "from-rose-300 via-pink-400 to-purple-500",
    description: "Wedding planners, venues, and romantic celebrations",
    tone: "Romantic, elegant, and emotionally resonant. Focus on creating magical, once-in-a-lifetime moments.",
    visualStyle: "Elegant placement mockups with romantic cinematic atmosphere",
    targetAudience: "Wedding planners, venues, couples planning unique celebrations",
    website: "https://nebulist.nl/wedding",
    outreachStrategy: {
      tone: "romantic and elegant",
      hooks: [
        "Create magical moments that couples will treasure forever",
        "Add a unique touch that sets your weddings apart",
        "Offer experiences that guests will talk about for years",
        "Transform ordinary venues into enchanted wonderlands"
      ],
      painPoints: [
        "Couples want unique experiences beyond traditional weddings",
        "Need to justify premium pricing with extraordinary offerings",
        "Looking for Instagram-worthy moments for the big day",
        "Want to create emotional, memorable experiences for guests"
      ],
      cta: [
        "Let's create magic together for your next wedding",
        "Schedule a consultation to discuss custom wedding installations",
        "See how we've transformed weddings into fairy tales",
        "Get a personalized proposal for your venue or event"
      ]
    }
  },
  nightclub: {
    id: "nightclub",
    name: "Night Clubs",
    icon: "🌙",
    color: "#9D4EDD",
    gradient: "from-purple-600 via-violet-600 to-fuchsia-600",
    description: "Night clubs, bars, and late-night entertainment venues",
    tone: "Edgy, atmospheric, and experiential. Emphasize creating immersive nightlife experiences.",
    visualStyle: "Dark, moody atmosphere with neon accents and club aesthetics",
    targetAudience: "Club owners, entertainment venues, nightlife event producers",
    website: "https://nebulist.nl/nightclub",
    outreachStrategy: {
      tone: "edgy and experiential",
      hooks: [
        "Transform your venue into an immersive nightlife destination",
        "Create viral moments that pack your club every weekend",
        "Stand out in the competitive nightlife scene with unique experiences",
        "Boost bottle service and VIP bookings with Instagram-worthy installations"
      ],
      painPoints: [
        "Need to differentiate from other clubs in the area",
        "Looking for attractions that increase dwell time and spending",
        "Want to create shareable moments that drive social media buzz",
        "Seeking experiences that justify premium cover charges and VIP packages"
      ],
      cta: [
        "Let's discuss how to elevate your nightlife experience",
        "Schedule a venue visit to explore custom installations",
        "See our nightclub portfolio and get inspired",
        "Get a proposal tailored to your venue's vibe and audience"
      ]
    }
  }
};

export const getBranchConfig = (branch: BranchType | string): BranchConfig => {
  // Fallback to festivals if branch is invalid or not found
  const config = branchConfigs[branch as BranchType];
  if (!config) {
    console.warn(`Invalid branch type: "${branch}". Falling back to festivals.`);
    return branchConfigs.festivals;
  }
  return config;
};

export const getAllBranches = (): BranchConfig[] => {
  return Object.values(branchConfigs);
};

export const getBranchById = (branchId: string): BranchConfig | undefined => {
  return branchConfigs[branchId as BranchType];
};

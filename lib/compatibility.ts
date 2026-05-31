import type { BranchType, Lead } from "@/types";

/**
 * Calculate compatibility score (0-100%) between event and bubble machines
 * Based on event type, branch, and event characteristics
 */
export function calculateCompatibilityScore(params: {
  branch: BranchType;
  eventType?: string;
  eventCategory?: string;
  eventDescription?: string;
  website?: string;
  eventFrequency?: string;
  estimatedBudget?: string;
}): { score: number; reason: string; category: 'hot' | 'warm' | 'cold' } {
  const { branch, eventType, eventCategory, eventDescription, website, eventFrequency, estimatedBudget } = params;
  let score = 50; // Base score
  const reasons: string[] = [];

  // Branch-specific scoring (40% weight)
  const branchScores: Record<BranchType, number> = {
    festivals: 85, // High compatibility - festivals love visual effects
    nightclub: 75, // Good compatibility - clubs use atmosphere effects
    wedding: 60, // Medium compatibility - depends on wedding style
    schools: 45, // Lower compatibility - educational focus
  };

  score = branchScores[branch];
  reasons.push(`${branch} events typically ${score >= 70 ? 'highly suitable' : score >= 50 ? 'moderately suitable' : 'less suitable'} for bubble machines`);

  // Event type/category scoring (30% weight)
  const eventText = `${eventType || ''} ${eventCategory || ''}`.toLowerCase();
  if (eventText) {
    // High compatibility categories
    if (eventText.includes('music') || eventText.includes('festival') || eventText.includes('concert')) {
      score += 10;
      reasons.push('Music events create perfect atmosphere for bubble effects');
    }
    if (eventText.includes('dance') || eventText.includes('edm') || eventText.includes('electronic')) {
      score += 10;
      reasons.push('Dance/electronic events highly visual and immersive');
    }
    if (eventText.includes('party') || eventText.includes('celebration')) {
      score += 8;
      reasons.push('Party atmosphere enhanced by bubble machines');
    }
    if (eventText.includes('wedding') && branch === 'wedding') {
      score += 5;
      reasons.push('Wedding celebrations benefit from romantic bubble effects');
    }
    
    // Medium compatibility
    if (eventText.includes('corporate') || eventText.includes('conference')) {
      score -= 5;
      reasons.push('Corporate events may prefer subtle effects');
    }
    if (eventText.includes('education') || eventText.includes('school')) {
      score -= 10;
      reasons.push('Educational events focus on learning over entertainment');
    }
    
    // Low compatibility
    if (eventText.includes('sport') || eventText.includes('athletic')) {
      score -= 15;
      reasons.push('Sports events typically not suitable for bubble machines');
    }
  }

  // Event frequency scoring (20% weight)
  if (eventFrequency) {
    const freq = eventFrequency.toLowerCase();
    if (freq.includes('weekly') || freq.includes('monthly') || freq.includes('regular')) {
      score += 8;
      reasons.push('Regular events provide recurring revenue opportunity');
    } else if (freq.includes('annual') || freq.includes('yearly')) {
      score += 5;
      reasons.push('Annual events are reliable repeat customers');
    } else if (freq.includes('one-time') || freq.includes('single')) {
      score += 2;
      reasons.push('One-time event with potential for referrals');
    }
  }

  // Budget scoring (10% weight)
  if (estimatedBudget) {
    const budgetNum = parseInt(estimatedBudget.replace(/[^0-9]/g, '')) || 0;
    if (budgetNum >= 100000) {
      score += 10;
      reasons.push('High budget indicates premium event with room for special effects');
    } else if (budgetNum >= 50000) {
      score += 7;
      reasons.push('Medium-high budget suitable for bubble machine rental');
    } else if (budgetNum >= 20000) {
      score += 4;
      reasons.push('Moderate budget may accommodate bubble effects');
    } else if (budgetNum > 0) {
      score += 1;
      reasons.push('Limited budget may require cost-effective solutions');
    }
  }

  // Description/website keyword analysis
  const content = `${eventDescription || ''} ${website || ''}`.toLowerCase();
  
  if (content.includes('immersive') || content.includes('experience') || content.includes('visual')) {
    score += 8;
    reasons.push('Event emphasizes immersive visual experiences');
  }
  if (content.includes('atmosphere') || content.includes('ambiance') || content.includes('mood')) {
    score += 5;
    reasons.push('Focus on atmosphere creation');
  }
  if (content.includes('outdoor') || content.includes('open air')) {
    score += 5;
    reasons.push('Outdoor events ideal for bubble effects');
  }
  if (content.includes('indoor') && branch === 'nightclub') {
    score += 3;
    reasons.push('Indoor nightclub setting works well with bubbles');
  }
  if (content.includes('children') || content.includes('kids') || content.includes('family')) {
    score += 7;
    reasons.push('Family/children events love bubble machines');
  }
  if (content.includes('luxury') || content.includes('premium') || content.includes('exclusive')) {
    score += 5;
    reasons.push('Premium events appreciate unique installations');
  }

  // Cap score between 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine category
  const category = getCompatibilityCategory(score);

  // Generate final reason
  let finalReason = reasons.slice(0, 3).join('. ');
  if (score >= 71) {
    finalReason = `🔥 High Match (${score}%): ` + finalReason;
  } else if (score >= 41) {
    finalReason = `⚡ Medium Match (${score}%): ` + finalReason;
  } else {
    finalReason = `❄️ Low Match (${score}%): ` + finalReason;
  }

  return { score, reason: finalReason, category };
}

/**
 * Get compatibility category based on score
 */
export function getCompatibilityCategory(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 71) return 'hot';
  if (score >= 41) return 'warm';
  return 'cold';
}

/**
 * Get compatibility color for UI display
 */
export function getCompatibilityColor(score: number): {
  text: string;
  bg: string;
  border: string;
} {
  if (score >= 71) {
    return {
      text: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    };
  }
  if (score >= 41) {
    return {
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    };
  }
  return {
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  };
}

/**
 * Sync temperature based on email status
 * Email engagement should influence lead temperature
 */
export function syncTemperatureWithEmailStatus(
  emailStatus?: string,
  currentTemperature?: string
): 'hot' | 'warm' | 'cold' {
  // Email status takes priority over current temperature
  switch (emailStatus) {
    case 'responded':
      return 'hot'; // Lead responded - highest interest
    case 'email_opened':
      return 'warm'; // Lead opened email - medium interest
    case 'email_sent':
    case 'bounced':
    case 'not_sent':
    default:
      return 'cold'; // No engagement yet
  }
}

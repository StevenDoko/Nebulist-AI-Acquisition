import { NextRequest, NextResponse } from "next/server";

// Smart fallback email generator for instant UX
function generateSmartEmail(lead: any, branch: any, type: string, installation: any) {
  const templates = {
    intro: {
      festivals: {
        subject: `Transform ${lead.companyName} into an Unforgettable Experience`,
        body: `Dear ${lead.contactPerson},

I hope this message finds you well. I'm Cheesecake Milo, Creative Director at Nebulist, and I've been following ${lead.companyName}'s incredible work in creating memorable festival experiences.

We specialize in crafting immersive artistic installations that transform events into unforgettable sensory journeys. Our installations have captivated audiences at major festivals across Europe, creating those magical moments that attendees talk about for years.

I'd love to explore how we could collaborate to elevate ${lead.companyName} with installations that perfectly complement your festival's unique atmosphere and vision.

Would you be open to a brief call next week to discuss some exciting possibilities?

Warm regards,
Cheesecake Milo
Creative Director, Nebulist`
      },
      schools: {
        subject: `Inspiring Educational Experiences for ${lead.companyName}`,
        body: `Dear ${lead.contactPerson},

I'm reaching out from Nebulist, where we create interactive artistic installations designed specifically for educational environments.

Our installations combine art, technology, and pedagogy to create engaging learning experiences that inspire curiosity and creativity in students. We've worked with schools across the Netherlands to transform spaces into interactive learning environments.

I believe ${lead.companyName} would be an excellent fit for our educational installations, and I'd love to share some ideas tailored to your institution's vision.

Could we schedule a brief conversation to explore how we might collaborate?

Best regards,
Cheesecake Milo
Creative Director, Nebulist`
      },
      wedding: {
        subject: `Create Magical Moments for ${lead.companyName}`,
        body: `Dear ${lead.contactPerson},

I'm Emma from Nebulist, and I wanted to reach out about creating truly magical experiences for your wedding events.

We specialize in elegant, romantic installations that transform venues into dreamlike spaces. From ethereal light sculptures to interactive art pieces, we create those breathtaking moments that make weddings truly unforgettable.

I'd love to show you how we can elevate ${lead.companyName}'s events with installations that perfectly match your aesthetic and vision.

Would you be available for a quick call to explore some beautiful possibilities?

Warmly,
Cheesecake Milo
Creative Director, Nebulist`
      },
      nightclub: {
        subject: `Electrify ${lead.companyName} with Immersive Installations`,
        body: `Dear ${lead.contactPerson},

I'm reaching out from Nebulist - we create cutting-edge installations that transform nightlife experiences.

Our work combines art, technology, and atmosphere to create those electric moments that keep people coming back. We've designed installations for top venues across Europe, creating immersive environments that amplify the energy of the night.

I think ${lead.companyName} would be perfect for some of our most innovative concepts, and I'd love to discuss how we can take your venue to the next level.

Are you free for a quick chat this week?

Best,
Cheesecake Milo
Creative Director, Nebulist`
      }
    },
    followup: {
      subject: `Following Up: ${lead.companyName} Partnership`,
      body: `Dear ${lead.contactPerson},

I wanted to follow up on my previous message about potential collaboration between Nebulist and ${lead.companyName}.

I understand you're busy, but I'm genuinely excited about the possibilities of working together. Our installations could bring a unique dimension to your events that sets them apart.

Would you have 15 minutes this week for a quick call? I'd love to share some specific ideas tailored to ${lead.companyName}.

Looking forward to connecting,
Cheesecake Milo
Creative Director, Nebulist`
    },
    proposal: {
      subject: `Custom Proposal for ${lead.companyName}`,
      body: `Dear ${lead.contactPerson},

Thank you for your interest in working with Nebulist! I'm excited to present a custom proposal for ${lead.companyName}.

${installation ? `I believe our "${installation.name}" installation would be perfect for your event. ${installation.description}` : 'Based on our conversation, I\'ve designed a concept specifically for your needs.'}

I've prepared detailed specifications, pricing, and logistics. When would be a good time to walk through the proposal together?

I'm confident we can create something truly special for ${lead.companyName}.

Best regards,
Cheesecake Milo
Creative Director, Nebulist`
    }
  };

  const branchId = branch.id as keyof typeof templates.intro;
  
  // Handle intro emails with branch-specific templates
  if (type === 'intro' && templates.intro[branchId]) {
    return templates.intro[branchId];
  }
  
  // Handle followup and proposal emails
  if (type === 'followup') {
    return templates.followup;
  }
  
  if (type === 'proposal') {
    return templates.proposal;
  }
  
  // Generic fallback
  return {
    subject: `Partnership Opportunity with ${lead.companyName}`,
    body: `Dear ${lead.contactPerson},\n\nI'm reaching out from Nebulist to explore potential collaboration opportunities with ${lead.companyName}.\n\nWe specialize in creating immersive artistic installations that transform events into unforgettable experiences.\n\nI'd love to discuss how we might work together.\n\nBest regards,\nEmma van der Berg\nCreative Director, Nebulist`
  };
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { lead, branch, type, installation, prompt } = requestBody;

    // Build the system prompt based on branch strategy
    const systemPrompt = `You are Cheesecake Milo, Creative Director at Nebulist, a Dutch artistic installation company. 

Branch: ${branch.name}
Tone: ${branch.outreachStrategy.tone}
Key Hooks: ${branch.outreachStrategy.hooks.join(", ")}
Pain Points to Address: ${branch.outreachStrategy.painPoints.join(", ")}
Call-to-Action Style: ${branch.outreachStrategy.cta.join(", ")}

Write a professional, engaging ${type} email to ${lead.contactPerson} at ${lead.companyName}.
${installation ? `Feature the "${installation.name}" installation: ${installation.description}` : ""}
${prompt ? `Additional context: ${prompt}` : ""}

The email should:
- Be warm, professional, and creative
- Match the ${branch.outreachStrategy.tone} tone
- Address relevant pain points for ${branch.name} events
- Include a clear call-to-action
- Be concise (200-300 words)
- Feel personal and authentic, not templated

Return ONLY the email in this exact format:
Subject: [subject line]

[email body]`;

    // Try Ollama with 8-second timeout for better UX
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
      const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen2.5:1.5b",
          prompt: systemPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 400,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (ollamaResponse.ok) {
        const ollamaData = await ollamaResponse.json();
        const generatedText = ollamaData.response;

        // Parse the response to extract subject and body
        const subjectMatch = generatedText.match(/Subject:\s*(.+?)(?:\n|$)/i);
        const subject = subjectMatch ? subjectMatch[1].trim() : `${type.charAt(0).toUpperCase() + type.slice(1)}: ${branch.name} Experience for ${lead.companyName}`;
        
        // Extract body (everything after the subject line)
        const bodyMatch = generatedText.split(/Subject:.*?\n\n?/i);
        const body = bodyMatch.length > 1 ? bodyMatch[1].trim() : generatedText;

        return NextResponse.json({
          subject,
          body,
          metadata: {
            model: "qwen2.5:1.5b",
            mode: "ollama",
            generatedAt: new Date().toISOString(),
          },
        });
      }
    } catch (ollamaError) {
      // Timeout or connection error - use smart fallback
      console.log("Ollama timeout/unavailable, using smart template");
    }

    // Smart fallback for instant UX
    const smartEmail = generateSmartEmail(lead, branch, type, installation);
    
    return NextResponse.json({
      subject: smartEmail.subject,
      body: smartEmail.body,
      metadata: {
        model: "smart-template",
        mode: "fallback",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating email:", error);
    
    // Emergency fallback
    return NextResponse.json({
      subject: "Partnership Opportunity",
      body: "Dear colleague,\n\nI'd like to discuss a potential collaboration.\n\nBest regards,\nEmma van der Berg\nNebulist",
      metadata: {
        model: "emergency-fallback",
        mode: "error",
        generatedAt: new Date().toISOString(),
      },
    });
  }
}

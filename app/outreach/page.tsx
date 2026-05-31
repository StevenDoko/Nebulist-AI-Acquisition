"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Badge, Button, Input, Textarea, Select } from "@/components/ui";
import { 
  Sparkles, 
  Send, 
  Copy, 
  RefreshCw,
  Mail,
  CheckCircle2,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Building2,
  Phone
} from "lucide-react";
import { getAllBranches, getBranchById } from "@/data/branches";
import { leadsApi } from "@/lib/api/leads";
import { installationsApi } from "@/lib/api/installations";
import type { Lead, Installation, Branch, BranchType, LeadTemperature } from "@/types";

interface EmailTemplate {
  subject: string;
  body: string;
}

interface MatchedLead extends Lead {
  personalizedEmail: {
    subject: string;
    body: string;
  };
}

export default function OutreachPage() {
  // User inputs - criteria
  const [selectedTemperature, setSelectedTemperature] = useState<LeadTemperature | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [emailType, setEmailType] = useState<"introduction" | "follow-up" | "proposal">("introduction");
  
  // Email tone parameters (0-100 scale)
  const [emailLength, setEmailLength] = useState(50);
  const [professionalism, setProfessionalism] = useState(70);
  const [friendliness, setFriendliness] = useState(60);
  
  const [customPrompt, setCustomPrompt] = useState("");
  
  // Results
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate | null>(null);
  const [matchedLeads, setMatchedLeads] = useState<MatchedLead[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);

  const branches = getAllBranches();
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, installationsData] = await Promise.all([
        leadsApi.getAll(),
        installationsApi.getAll()
      ]);
      setLeads(leadsData);
      setInstallations(installationsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTemplate = async () => {
    if (!selectedTemperature || !selectedBranch) return;

    setIsGenerating(true);
    setEmailTemplate(null);
    setMatchedLeads([]);
    
    const branch = getBranchById(selectedBranch as BranchType);
    if (!branch) {
      setIsGenerating(false);
      return;
    }

    try {
      // Generate email template
      const template = generateEmailTemplate(branch, emailType);
      setEmailTemplate(template);
      
      // Fetch matching leads from database
      const filtered = await leadsApi.getByTemperatureAndBranch(
        selectedTemperature,
        selectedBranch
      );

      // Personalize emails for each lead
      const leadsWithEmails = filtered.map(lead => ({
        ...lead,
        personalizedEmail: personalizeEmail(template, lead)
      }));
      
      setMatchedLeads(leadsWithEmails);
    } catch (error) {
      console.error('Failed to generate template and find leads:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateEmailTemplate = (branch: Branch, type: "introduction" | "follow-up" | "proposal"): EmailTemplate => {
    // Adjust content based on tone sliders
    const lengthModifier = emailLength < 33 ? "brief" : emailLength > 66 ? "detailed" : "moderate";
    const isHighlyProfessional = professionalism > 66;
    const isCasual = professionalism < 33;
    const isVeryFriendly = friendliness > 66;
    const isNeutral = friendliness < 33;
    
    let subject = "";
    let body = "";

    // Greeting variations based on friendliness
    const greeting = isVeryFriendly 
      ? "I hope this email finds you well and that you're having a great day!" 
      : isNeutral 
      ? "I hope this email finds you well."
      : "I hope this email finds you well.";

    // Introduction variations based on professionalism
    const introduction = isHighlyProfessional
      ? "I am writing to you on behalf of Nebulist"
      : isCasual
      ? "I'm reaching out from Nebulist"
      : "My name is [Your Name] from Nebulist, and I'm reaching out";

    // Closing variations based on professionalism and friendliness
    const closing = isHighlyProfessional
      ? isVeryFriendly
        ? "I would be delighted to discuss this opportunity with you at your earliest convenience."
        : "I would appreciate the opportunity to discuss this matter further at your convenience."
      : isCasual
      ? isVeryFriendly
        ? "Would love to chat about this! Let me know when you're free."
        : "Let me know if you'd like to discuss this further."
      : isVeryFriendly
      ? "I'd love to schedule a call to explore how we can work together!"
      : "I'd be happy to schedule a call to discuss this further.";

    const signature = isHighlyProfessional
      ? "Respectfully,\n[Your Name]\nNebulist - Artistic Installations\nEmail: [your.email@nebulist.com]\nPhone: +31 20 123 4567"
      : isCasual
      ? "Cheers,\n[Your Name]\nNebulist"
      : "Best regards,\n[Your Name]\nNebulist - Artistic Installations";

    if (type === "introduction") {
      subject = isHighlyProfessional
        ? `Professional Inquiry: Artistic Installation Services for [COMPANY]`
        : isCasual
        ? `Quick idea for [COMPANY]'s next event`
        : `Transform Your Event with Nebulist's Artistic Installations`;
      
      if (lengthModifier === "brief") {
        body = `Dear [CONTACT_PERSON],

${introduction} about our ${branch.name.toLowerCase()} installations.

${branch.description}

${closing}

${signature}`;
      } else if (lengthModifier === "detailed") {
        const detailIntro = isVeryFriendly
          ? `${greeting}\n\n${introduction}, and I'm really excited to share something special with you. I believe we can add something truly memorable to [COMPANY]'s upcoming events in [LOCATION].`
          : `${greeting}\n\n${introduction} because I believe we can add significant value to [COMPANY]'s upcoming events in [LOCATION].`;

        const detailBody = isVeryFriendly
          ? `We specialize in creating immersive artistic installations specifically designed for ${branch.name.toLowerCase()} events, and we absolutely love what we do! Our installations have transformed events across the Netherlands, creating unforgettable experiences that guests talk about long after the event ends.\n\n${branch.description}\n\nWhat really sets us apart is our commitment to creating custom experiences that align perfectly with your event's theme and audience. We handle everything from concept to execution, ensuring a seamless integration with your event. Plus, we're always available to answer questions and make adjustments along the way!`
          : `We specialize in creating immersive artistic installations for ${branch.name.toLowerCase()} events. Our installations have been successfully implemented across the Netherlands, delivering memorable experiences for event attendees.\n\n${branch.description}\n\nOur approach focuses on creating custom experiences that align with your event's objectives and audience. We manage the complete process from concept development to execution, ensuring seamless integration with your event.`;

        body = `Dear [CONTACT_PERSON],

${detailIntro}

${detailBody}

${closing}

${signature}`;
      } else {
        const moderateIntro = isVeryFriendly
          ? `${greeting}\n\n${introduction}, and I think we could create something really special for [COMPANY]'s upcoming events.`
          : `${greeting}\n\n${introduction} because I believe we can enhance [COMPANY]'s upcoming events.`;

        const moderateBody = isVeryFriendly
          ? `We specialize in creating immersive artistic installations for ${branch.name.toLowerCase()} events. Our work has transformed events across the Netherlands, and we'd love to do the same for you!\n\n${branch.description}`
          : `We specialize in creating artistic installations for ${branch.name.toLowerCase()} events. Our installations have been successfully implemented across the Netherlands.\n\n${branch.description}`;

        body = `Dear [CONTACT_PERSON],

${moderateIntro}

${moderateBody}

${closing}

${signature}`;
      }
    } else if (type === "follow-up") {
      subject = isHighlyProfessional
        ? `Follow-up: Artistic Installation Proposal for [COMPANY]`
        : isCasual
        ? `Following up on our chat`
        : `Following Up: [COMPANY] x Nebulist Collaboration`;
      
      const followUpIntro = isVeryFriendly
        ? `${greeting}\n\nI wanted to follow up on my previous email - I've been thinking about your event and I'm really excited about the possibilities!`
        : isHighlyProfessional
        ? `I am writing to follow up on my previous correspondence regarding artistic installation services for [COMPANY].`
        : `I wanted to follow up on my previous email about Nebulist's artistic installations for [COMPANY].`;

      const followUpBody = isVeryFriendly
        ? `I've been brainstorming some specific ideas for your [EVENT_CATEGORY], and I think we could create something truly amazing together. Our team has just completed a similar project that exceeded all expectations, and the feedback has been incredible!\n\n${branch.description}\n\nI'd love to share these ideas with you over a quick call. When would be a good time for you? I'm pretty flexible and happy to work around your schedule!`
        : isHighlyProfessional
        ? `I have developed several concepts that may be suitable for your [EVENT_CATEGORY]. Our team has recently completed a comparable project with excellent results.\n\n${branch.description}\n\nI would appreciate the opportunity to discuss these concepts with you at your convenience.`
        : `I've been thinking about your [EVENT_CATEGORY], and I have some specific ideas that could really elevate the experience. Our team has just completed a similar project that exceeded all expectations.\n\n${branch.description}\n\nWould you have time for a quick call this week? I'm flexible with timing and happy to work around your schedule.`;

      body = `Dear [CONTACT_PERSON],

${followUpIntro}

${followUpBody}

${signature}`;
    } else {
      subject = isHighlyProfessional
        ? `Formal Proposal: Artistic Installation Services for [COMPANY]`
        : isCasual
        ? `Proposal for [COMPANY]'s event`
        : `Proposal: Nebulist Installation for [COMPANY]`;
      
      const proposalIntro = isVeryFriendly
        ? `${greeting}\n\nThank you so much for the opportunity to submit this proposal! We're really excited about the possibility of working with [COMPANY] on your [EVENT_CATEGORY].`
        : isHighlyProfessional
        ? `I am pleased to submit this formal proposal for artistic installation services for [COMPANY]'s [EVENT_CATEGORY].`
        : `Thank you for the opportunity to submit this proposal for [COMPANY]'s [EVENT_CATEGORY].`;

      const proposalBody = `PROPOSAL OVERVIEW
Event: [EVENT_CATEGORY]
Location: [LOCATION]

RECOMMENDED INSTALLATION
Based on ${isVeryFriendly ? 'our conversations and your vision' : isHighlyProfessional ? 'the requirements discussed' : 'our discussions'}, we recommend our ${branch.name} installation package.

${branch.description}

WHAT'S INCLUDED:
• Complete installation setup and breakdown
• Professional operators throughout the event
• All necessary equipment and materials
• Liability insurance coverage
• Pre-event site visit and planning

INVESTMENT
Estimated Investment: [ESTIMATED_VALUE]

${isVeryFriendly ? "I'd absolutely love to schedule a call to walk through this proposal and answer any questions you might have. This is going to be amazing!" : isHighlyProfessional ? "I would be pleased to schedule a meeting to review this proposal in detail and address any questions you may have." : "I'd be happy to schedule a call to walk through this proposal and answer any questions."}`;

      body = `Dear [CONTACT_PERSON],

${proposalIntro}

${proposalBody}

${signature}`;
    }

    return { subject, body };
  };

  const personalizeEmail = (template: EmailTemplate, lead: Lead): { subject: string; body: string } => {
    let subject = template.subject
      .replace('[COMPANY]', lead.companyName);
    
    let body = template.body
      .replace(/\[CONTACT_PERSON\]/g, lead.contactPerson)
      .replace(/\[COMPANY\]/g, lead.companyName)
      .replace(/\[LOCATION\]/g, `${lead.province}, ${lead.country}`)
      .replace(/\[EVENT_CATEGORY\]/g, lead.eventCategory || 'event')
      .replace('[ESTIMATED_VALUE]', lead.estimatedValue ? `€${lead.estimatedValue.toLocaleString()}` : 'Custom pricing based on your requirements');

    return { subject, body };
  };

  const handleSendEmail = (lead: MatchedLead) => {
    const { subject, body } = lead.personalizedEmail;
    const mailtoLink = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const handleCopyEmail = (lead: MatchedLead) => {
    const { subject, body } = lead.personalizedEmail;
    const fullEmail = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullEmail);
  };

  const handleCopyTemplate = () => {
    if (!emailTemplate) return;
    const fullEmail = `Subject: ${emailTemplate.subject}\n\n${emailTemplate.body}`;
    navigator.clipboard.writeText(fullEmail);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading outreach tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Outreach Assistant
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure your email criteria and find matching leads
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration Panel */}
        <Card className="p-6 space-y-6 lg:col-span-1">
          <div>
            <h2 className="text-xl font-semibold mb-4">Email Configuration</h2>
          </div>

          {/* Temperature Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Lead Temperature</label>
            <div className="grid grid-cols-3 gap-2">
              {(["cold", "warm", "hot"] as const).map((temp) => (
                <button
                  key={temp}
                  onClick={() => setSelectedTemperature(temp)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium capitalize ${
                    selectedTemperature === temp
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>

          {/* Branch Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Branch</label>
            <Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">Select branch...</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Email Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(["introduction", "follow-up", "proposal"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setEmailType(type)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    emailType === type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {type === "introduction" && "Intro"}
                  {type === "follow-up" && "Follow-up"}
                  {type === "proposal" && "Proposal"}
                </button>
              ))}
            </div>
          </div>

          {/* Email Tone Sliders */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Email Tone</label>
            
            {/* Email Length */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Email Length</span>
                <span className="text-xs font-medium">{emailLength}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={emailLength}
                onChange={(e) => setEmailLength(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Short</span>
                <span>Long</span>
              </div>
            </div>

            {/* Professionalism */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Professionalism</span>
                <span className="text-xs font-medium">{professionalism}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={professionalism}
                onChange={(e) => setProfessionalism(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Casual</span>
                <span>Formal</span>
              </div>
            </div>

            {/* Friendliness */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Friendliness</span>
                <span className="text-xs font-medium">{friendliness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={friendliness}
                onChange={(e) => setFriendliness(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Neutral</span>
                <span>Very Friendly</span>
              </div>
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Context (Optional)</label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add any specific details..."
              rows={3}
            />
          </div>

          {/* Generate Button */}
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGenerateTemplate}
            disabled={!selectedTemperature || !selectedBranch || isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Email & Find Leads
              </>
            )}
          </Button>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Email Template Preview */}
          <AnimatePresence mode="wait">
            {emailTemplate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Email Template</h2>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyTemplate}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Template
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Subject:</span>
                      <p className="text-sm font-medium mt-1">{emailTemplate.subject}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Body:</span>
                      <div className="mt-1 p-4 rounded-lg glass-dark">
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                          {emailTemplate.body}
                        </pre>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Matching Leads */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Matching Leads {matchedLeads.length > 0 && `(${matchedLeads.length})`}
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {!emailTemplate ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="p-12 flex flex-col items-center justify-center text-center">
                    <Mail className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Configure your email settings and click "Generate Email & Find Leads"
                    </p>
                  </Card>
                </motion.div>
              ) : matchedLeads.length === 0 ? (
                <motion.div
                  key="no-leads"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="p-12 flex flex-col items-center justify-center text-center">
                    <User className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      No matching leads found for the selected criteria
                    </p>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {matchedLeads.map((lead, index) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6 space-y-4">
                        {/* Lead Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{lead.companyName}</h3>
                              <Badge variant={lead.temperature} className="capitalize">
                                {lead.temperature}
                              </Badge>
                              <Badge variant={lead.status}>{lead.status}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" />
                                <span>{lead.contactPerson}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <span>{lead.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{lead.province}, {lead.country}</span>
                              </div>
                              {lead.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="w-4 h-4" />
                                  <span>{lead.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Building2 className="w-4 h-4" />
                                <span>{lead.eventCategory || 'Event'}</span>
                              </div>
                              {lead.estimatedValue && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <DollarSign className="w-4 h-4" />
                                  <span>€{lead.estimatedValue.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Personalized Email Preview */}
                        <div className="p-4 rounded-lg glass-dark space-y-3">
                          <div>
                            <span className="text-xs text-muted-foreground">Subject:</span>
                            <p className="text-sm font-medium">{lead.personalizedEmail.subject}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Preview:</span>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {lead.personalizedEmail.body}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Button
                            variant="primary"
                            className="flex-1 flex items-center justify-center gap-2"
                            onClick={() => handleSendEmail(lead)}
                          >
                            <Send className="w-4 h-4" />
                            Send Email
                          </Button>
                          <Button
                            variant="secondary"
                            className="flex items-center justify-center gap-2"
                            onClick={() => handleCopyEmail(lead)}
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

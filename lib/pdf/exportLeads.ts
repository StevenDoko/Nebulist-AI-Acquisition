import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Lead } from "@/types";
import { format } from "date-fns";

/**
 * Export single lead to PDF
 */
export function exportLeadToPDF(lead: Lead) {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(139, 92, 246); // Purple
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("Nebulist CRM", 15, 20);
  
  doc.setFontSize(12);
  doc.text("Lead Details", 15, 30);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Company Info
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(lead.companyName || "N/A", 15, 55);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Contact Information
  let yPos = 65;
  
  const addField = (label: string, value: string | null | undefined) => {
    if (value) {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 15, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(value, 60, yPos);
      yPos += 7;
    }
  };
  
  addField("Contact Person", lead.contactPerson);
  addField("Email", lead.email);
  addField("Phone", lead.phone);
  addField("Website", lead.website);
  addField("Country", lead.country);
  addField("Branch", lead.branch);
  addField("Status", lead.status);
  addField("Temperature", lead.temperature);
  
  if (lead.estimatedValue) {
    addField("Estimated Value", `€${lead.estimatedValue.toLocaleString()}`);
  }
  
  if (lead.nextFollowUp) {
    addField("Next Follow-up", format(new Date(lead.nextFollowUp), "PPP"));
  }
  
  if (lead.eventDate) {
    addField("Event Date", format(new Date(lead.eventDate), "PPP"));
  }
  
  // Notes section
  if (lead.notes && lead.notes.length > 0) {
    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 15, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    
    const notesText = lead.notes.map(note => `${note.content} (${note.author})`).join("\n\n");
    const splitNotes = doc.splitTextToSize(notesText, 180);
    doc.text(splitNotes, 15, yPos);
    yPos += splitNotes.length * 5;
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${format(new Date(), "PPP 'at' p")}`,
    15,
    doc.internal.pageSize.height - 10
  );
  
  // Save PDF
  const fileName = `Lead_${lead.companyName?.replace(/[^a-z0-9]/gi, '_')}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}

/**
 * Export multiple leads to PDF
 */
export function exportLeadsToPDF(leads: Lead[]) {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(139, 92, 246); // Purple
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("Nebulist CRM", 15, 20);
  
  doc.setFontSize(12);
  doc.text(`All Leads Export (${leads.length} leads)`, 15, 30);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Summary Statistics
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 15, 50);
  
  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalValue = leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Total Leads: ${leads.length}`, 15, 58);
  doc.text(`Total Estimated Value: €${totalValue.toLocaleString()}`, 15, 65);
  
  let yPos = 72;
  Object.entries(statusCounts).forEach(([status, count]) => {
    doc.text(`${status}: ${count}`, 15, yPos);
    yPos += 7;
  });
  
  // Table of leads
  const tableData = leads.map(lead => [
    lead.companyName || "N/A",
    lead.contactPerson || "N/A",
    lead.email || "N/A",
    lead.phone || "N/A",
    lead.status || "N/A",
    lead.estimatedValue ? `€${lead.estimatedValue.toLocaleString()}` : "€0",
  ]);
  
  autoTable(doc, {
    startY: yPos + 10,
    head: [["Company", "Contact", "Email", "Phone", "Status", "Value"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [139, 92, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
    },
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated on ${format(new Date(), "PPP 'at' p")} | Page ${i} of ${pageCount}`,
      15,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Save PDF
  const fileName = `Nebulist_All_Leads_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}

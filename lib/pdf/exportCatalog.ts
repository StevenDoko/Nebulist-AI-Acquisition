import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Installation, BranchType } from "@/types";

interface ExportOptions {
  branch?: BranchType | "all";
  includeImages?: boolean;
}

const BRANCH_NAMES: Record<BranchType | "all", string> = {
  all: "All Branches",
  festivals: "Festivals",
  schools: "Schools",
  wedding: "Wedding",
  nightclub: "Nightclub",
};

export async function exportSingleInstallationToPDF(installation: Installation) {
  // Create PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Add header
  doc.setFillColor(139, 92, 246); // Purple gradient color
  doc.rect(0, 0, pageWidth, 40, "F");

  // Add logo/title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("De Nebulist", margin, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Installation Details", margin, 30);

  // Add date
  const today = new Date().toLocaleDateString("en-GB");
  doc.text(`Generated: ${today}`, pageWidth - margin - 40, 30);

  // Reset text color
  doc.setTextColor(0, 0, 0);

  let yPosition = 50;

  // Installation name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(139, 92, 246);
  doc.text(installation.name, margin, yPosition);
  yPosition += 10;

  // Availability badge
  const availText = installation.availability ? "Available" : "Unavailable";
  const availColor = installation.availability ? [34, 197, 94] : [239, 68, 68];
  doc.setFontSize(10);
  doc.setTextColor(availColor[0], availColor[1], availColor[2]);
  doc.text(availText, margin, yPosition);
  yPosition += 10;

  doc.setTextColor(0, 0, 0);

  // Description
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Description", margin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const descLines = doc.splitTextToSize(
    installation.description || "No description",
    pageWidth - 2 * margin
  );
  doc.text(descLines, margin, yPosition);
  yPosition += descLines.length * 5 + 8;

  // Technical Specifications
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Technical Specifications", margin, yPosition);
  yPosition += 8;

  const tableData = [
    ["Type", installation.type],
    [
      "Dimensions",
      `${installation.dimensions.width}m × ${installation.dimensions.height}m × ${installation.dimensions.depth}m`,
    ],
    ["Operators Required", installation.requirements.operators.toString()],
    ["Setup Time", `${installation.requirements.setupTime} minutes`],
    ["Electricity", installation.requirements.electricity],
    ["Wind Resistance", installation.requirements.windResistance],
    ["Space Required", installation.requirements.space],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: tableData,
    theme: "striped",
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: pageWidth - 2 * margin - 50 },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Pricing
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Pricing", margin, yPosition);
  yPosition += 8;

  const pricingData = [
    ["Per Day", `€${installation.pricing.perDay.toLocaleString()}`],
    ["Per Weekend", `€${installation.pricing.perWeekend.toLocaleString()}`],
    ["Per Week", `€${installation.pricing.perWeek.toLocaleString()}`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: pricingData,
    theme: "striped",
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: pageWidth - 2 * margin - 50 },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Suitable for branches
  if (installation.suitableFor.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Suitable For", margin, yPosition);
    yPosition += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const branchNames = installation.suitableFor
      .map((b) => BRANCH_NAMES[b])
      .join(", ");
    doc.text(branchNames, margin, yPosition);
    yPosition += 10;
  }

  // Specifications
  if (installation.specifications && installation.specifications.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Additional Specifications", margin, yPosition);
    yPosition += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    installation.specifications.forEach((spec) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`• ${spec}`, margin + 2, yPosition);
      yPosition += 5;
    });
  }

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(
      "De Nebulist - Installation Details",
      margin,
      pageHeight - 10
    );
  }

  // Generate filename
  const filename = `nebulist-${installation.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`;

  // Save PDF
  doc.save(filename);

  return {
    success: true,
    filename,
  };
}

export async function exportCatalogToPDF(
  installations: Installation[],
  options: ExportOptions = {}
) {
  const { branch = "all", includeImages = false } = options;

  // Filter installations by branch
  const filteredInstallations =
    branch === "all"
      ? installations
      : installations.filter((inst) => inst.suitableFor.includes(branch));

  if (filteredInstallations.length === 0) {
    throw new Error("No installations found for the selected branch");
  }

  // Create PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Add header
  doc.setFillColor(139, 92, 246); // Purple gradient color
  doc.rect(0, 0, pageWidth, 40, "F");

  // Add logo/title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("De Nebulist", margin, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Installation Catalog", margin, 30);

  // Add branch filter info
  doc.setFontSize(10);
  doc.text(`Branch: ${BRANCH_NAMES[branch]}`, pageWidth - margin - 40, 30);

  // Add date
  const today = new Date().toLocaleDateString("en-GB");
  doc.text(`Generated: ${today}`, pageWidth - margin - 40, 35);

  // Reset text color
  doc.setTextColor(0, 0, 0);

  let yPosition = 50;

  // Add summary stats
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", margin, yPosition);
  yPosition += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Total Installations: ${filteredInstallations.length}`, margin, yPosition);
  yPosition += 5;
  doc.text(
    `Available: ${filteredInstallations.filter((i) => i.availability).length}`,
    margin,
    yPosition
  );
  yPosition += 10;

  // Add installations
  for (let i = 0; i < filteredInstallations.length; i++) {
    const installation = filteredInstallations[i];

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Installation header
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 10, "F");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 92, 246);
    doc.text(`${i + 1}. ${installation.name}`, margin + 2, yPosition);

    // Availability badge
    const availText = installation.availability ? "Available" : "Unavailable";
    const availColor = installation.availability ? [34, 197, 94] : [239, 68, 68];
    doc.setFontSize(8);
    doc.setTextColor(availColor[0], availColor[1], availColor[2]);
    doc.text(availText, pageWidth - margin - 20, yPosition);

    yPosition += 10;
    doc.setTextColor(0, 0, 0);

    // Description
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(
      installation.description || "No description",
      pageWidth - 2 * margin - 10
    );
    doc.text(descLines, margin + 2, yPosition);
    yPosition += descLines.length * 4 + 3;

    // Details table
    const tableData = [
      ["Type", installation.type],
      [
        "Dimensions",
        `${installation.dimensions.width}m × ${installation.dimensions.height}m × ${installation.dimensions.depth}m`,
      ],
      ["Operators", installation.requirements.operators.toString()],
      ["Setup Time", `${installation.requirements.setupTime} minutes`],
      ["Electricity", installation.requirements.electricity],
      ["Wind Resistance", installation.requirements.windResistance],
      ["Space Required", installation.requirements.space],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: tableData,
      theme: "plain",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 35 },
        1: { cellWidth: pageWidth - 2 * margin - 35 - 10 },
      },
      margin: { left: margin + 2, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 5;

    // Pricing
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Pricing:", margin + 2, yPosition);
    yPosition += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      `Per Day: €${installation.pricing.perDay} | Per Weekend: €${installation.pricing.perWeekend} | Per Week: €${installation.pricing.perWeek}`,
      margin + 2,
      yPosition
    );
    yPosition += 5;

    // Suitable for branches
    if (installation.suitableFor.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Suitable For:", margin + 2, yPosition);
      doc.setFont("helvetica", "normal");
      const branchNames = installation.suitableFor
        .map((b) => BRANCH_NAMES[b])
        .join(", ");
      doc.text(branchNames, margin + 25, yPosition);
      yPosition += 5;
    }

    // Specifications
    if (installation.specifications.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Specifications:", margin + 2, yPosition);
      yPosition += 4;

      doc.setFont("helvetica", "normal");
      installation.specifications.forEach((spec) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`• ${spec}`, margin + 4, yPosition);
        yPosition += 4;
      });
    }

    yPosition += 8; // Space before next installation
  }

  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(
      "De Nebulist - Installation Catalog",
      margin,
      pageHeight - 10
    );
  }

  // Generate filename
  const branchSlug = branch === "all" ? "all-branches" : branch;
  const filename = `nebulist-catalog-${branchSlug}-${Date.now()}.pdf`;

  // Save PDF
  doc.save(filename);

  return {
    success: true,
    filename,
    installationCount: filteredInstallations.length,
  };
}

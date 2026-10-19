import { NextRequest } from "next/server";
import PDFDocument from "pdfkit";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { buildLeadWhere } from "@/lib/lead-filters";
import { statusLabel } from "@/components/StatusPill";

const COLUMNS = [
  { key: "date", label: "Date", width: 60 },
  { key: "motherName", label: "Mother", width: 90 },
  { key: "contact", label: "Contact", width: 75 },
  { key: "centre", label: "Centre", width: 85 },
  { key: "location", label: "Location", width: 85 },
  { key: "coordinator", label: "Coordinator", width: 70 },
  { key: "status", label: "Status", width: 80 },
  { key: "reason", label: "Reason", width: 150 },
] as const;

export async function GET(request: NextRequest) {
  await requireAdmin();

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const where = buildLeadWhere(params);

  const leads = await prisma.lead.findMany({
    where,
    include: { centre: true, coordinator: true, reasonNotJoining: true },
    orderBy: { dateOfInquiry: "desc" },
  });

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 30 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.font("Helvetica-Bold").fontSize(16).fillColor("#24143f").text("Sanskar Shakti — Leads Report");
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#6b6478")
    .text(
      `Generated ${format(new Date(), "d MMM yyyy, h:mm a")} · ${leads.length} lead${
        leads.length === 1 ? "" : "s"
      }`
    );
  doc.moveDown(0.8);

  const startX = doc.page.margins.left;
  let y = doc.y;
  const rowHeight = 20;

  function drawHeader() {
    let x = startX;
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#24143f");
    for (const col of COLUMNS) {
      doc.text(col.label, x, y, { width: col.width, ellipsis: true });
      x += col.width;
    }
    y += rowHeight;
    doc
      .moveTo(startX, y - 4)
      .lineTo(x, y - 4)
      .strokeColor("#e7ddcd")
      .stroke();
  }

  drawHeader();

  doc.font("Helvetica").fontSize(8).fillColor("#24143f");
  for (const lead of leads) {
    if (y > doc.page.height - doc.page.margins.bottom - rowHeight) {
      doc.addPage();
      y = doc.page.margins.top;
      drawHeader();
      doc.font("Helvetica").fontSize(8).fillColor("#24143f");
    }

    const row: Record<(typeof COLUMNS)[number]["key"], string> = {
      date: format(lead.dateOfInquiry, "dd-MM-yyyy"),
      motherName: lead.motherName,
      contact: lead.contactNumber,
      centre: lead.centre.name,
      location: lead.motherLocation,
      coordinator: lead.coordinator.name,
      status: statusLabel(lead.status),
      reason: lead.reasonNotJoining?.label || "",
    };

    let x = startX;
    for (const col of COLUMNS) {
      doc.text(row[col.key], x, y, { width: col.width, ellipsis: true });
      x += col.width;
    }
    y += rowHeight;
  }

  doc.end();
  const buffer = await done;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="sanskar-shakti-leads-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.pdf"`,
    },
  });
}

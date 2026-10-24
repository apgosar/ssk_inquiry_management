import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { buildLeadWhere } from "@/lib/lead-filters";
import { statusLabel } from "@/components/StatusPill";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const where = buildLeadWhere(params);

  const leads = await prisma.lead.findMany({
    where,
    include: { centre: true, coordinator: true, reasonNotJoining: true, createdByUser: true },
    orderBy: { dateOfInquiry: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leads");

  sheet.columns = [
    { header: "Date of Inquiry", key: "date", width: 14 },
    { header: "Name of Mother", key: "motherName", width: 22 },
    { header: "Contact Number", key: "contact", width: 16 },
    { header: "Centre", key: "centre", width: 18 },
    { header: "Location", key: "location", width: 18 },
    { header: "Inquiry Handled By", key: "coordinator", width: 16 },
    { header: "Status", key: "status", width: 16 },
    { header: "Date of Enrollment", key: "enrollmentDate", width: 18 },
    { header: "Reason (if not joining)", key: "reason", width: 28 },
    { header: "Notes / Remarks", key: "notes", width: 32 },
    { header: "Entered By", key: "enteredBy", width: 18 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const lead of leads) {
    sheet.addRow({
      date: format(lead.dateOfInquiry, "dd-MM-yyyy"),
      motherName: lead.motherName,
      contact: lead.contactNumber,
      centre: lead.centre.name,
      location: lead.motherLocation,
      coordinator: lead.coordinator.name,
      status: statusLabel(lead.status),
      enrollmentDate: lead.enrollmentDate ? format(lead.enrollmentDate, "dd-MM-yyyy") : "",
      reason: lead.reasonNotJoining?.label || "",
      notes: lead.notes || "",
      enteredBy: lead.createdByUser.name,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="sanskar-shakti-leads-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.xlsx"`,
    },
  });
}

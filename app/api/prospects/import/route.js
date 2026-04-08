// API route to import prospects from Vibe Prospecting CSV/JSON data
// Maps Vibe Prospecting fields to Kapturise lead format

export async function POST(request) {
  try {
    const { prospects } = await request.json();

    if (!Array.isArray(prospects) || prospects.length === 0) {
      return Response.json({
        success: false,
        error: "Invalid data: expected array of prospects",
        imported: []
      }, { status: 400 });
    }

    // Map industry to Kapturise service type
    const mapIndustryToService = (industry) => {
      if (!industry) return "";
      const lower = industry.toLowerCase();

      if (lower.includes("food") || lower.includes("restaurant") || lower.includes("cafe")) return "food-photo";
      if (lower.includes("real estate") || lower.includes("property")) return "real-estate";
      if (lower.includes("event")) return "event";
      if (lower.includes("corporate") || lower.includes("tech") || lower.includes("finance")) return "headshots";
      if (lower.includes("ecommerce") || lower.includes("retail") || lower.includes("shop")) return "product-photo";
      if (lower.includes("hotel") || lower.includes("hospitality") || lower.includes("resort")) return "retainer";

      return ""; // Let user select
    };

    const imported = prospects.map((p, idx) => ({
      id: Date.now() + idx + Math.floor(Math.random() * 9999),
      // Map Vibe Prospecting fields to Kapturise lead fields
      name: p.prospect_company_name || p.company || p.company_name || `Prospect ${idx + 1}`,
      contactName: p.prospect_full_name || p.full_name || p.contact_name || "",
      contactTitle: p.prospect_job_title || p.job_title || p.title || "",
      email: p.contact_professions_email || p.email || "",
      phone: p.contact_mobile_phone || p.phone || "",
      linkedin: p.prospect_linkedin || p.linkedin || "",
      website: p.prospect_company_website || p.website || "",
      ig: "", // Not typically in Vibe data
      ind: p.prospect_company_industry || p.industry || "General",
      val: 5000, // Default estimated value
      stage: "Research",
      assignedTo: "",
      serviceType: mapIndustryToService(p.prospect_company_industry || p.industry),
      notes: `Imported from Vibe Prospecting. LinkedIn: ${p.prospect_linkedin || "N/A"}`,
      approachedVia: {
        channel: "Vibe Import",
        handle: "",
        firstContact: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
      },
      src: "Vibe Prospecting",
      srcType: "vibe-import",
      logs: [
        {
          type: "note",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          msg: "Lead imported from Vibe Prospecting",
          summary: "Vibe import",
          transcript: `LinkedIn Category: ${p.linkedin_category || "N/A"}\nEstimated Company Size: ${p.company_size || "N/A"}`
        }
      ]
    }));

    return Response.json({
      success: true,
      message: `Successfully imported ${imported.length} prospects`,
      imported,
      count: imported.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error importing prospects:", error);
    return Response.json({
      success: false,
      error: error.message || "Failed to import prospects",
      imported: []
    }, { status: 500 });
  }
}

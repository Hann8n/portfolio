/** Shared preview for the admin app (imported directly) and the server-rendered campaign report. */
export interface PreviewAd {
  sponsor?: string; sponsored_label?: string; headline?: string; subline?: string | null;
  cta?: string; image_url?: string | null; logo_url?: string | null; tier?: string;
}

export function renderAdPreview(ad: PreviewAd): string {
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries({ ...ad, sponsored_label: ad.sponsored_label ?? "Sponsored" })) {
    fields[key] = String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  const urls: Record<string, string> = {};
  for (const key of ["image_url", "logo_url"] as const) {
    try { if (new URL(ad[key] || "").protocol === "https:") urls[key] = fields[key]; } catch { /* Invalid artwork is omitted. */ }
  }
  const logo = urls.logo_url, hero = urls.image_url, label = fields.sponsored_label;
  const tier = ad.tier === "feature" ? "feature" : ad.tier === "text" ? "text" : "banner";
  return `<article class="creative-preview creative-preview-${tier}" aria-label="Ad creative preview">
    <div class="creative-header">${logo ? `<img class="creative-logo" src="${logo}" alt="" onerror="this.hidden=true">` : ""}<span class="creative-sponsor">${fields.sponsor || ""}</span>${label ? `<span class="creative-label">${label}</span>` : ""}</div>
    ${tier !== "text" && hero ? `<div class="creative-image-wrap"><img class="creative-image" src="${hero}" alt="Campaign artwork" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="creative-image-missing" hidden>Artwork unavailable</span></div>` : ""}
    <div class="creative-copy"><h3>${fields.headline || ""}</h3>${ad.subline ? `<p>${fields.subline}</p>` : ""}<div class="creative-button">${fields.cta || ""} <span aria-hidden="true">↗</span></div></div>
  </article>`;
}

export const AD_PREVIEW_STYLES = `
  .creative-preview { --creative-line:var(--border,var(--line,#ddd)); width:100%; max-width:390px; border:1px solid var(--creative-line); background:var(--surface,var(--bg,#fff)); color:var(--text,#333); overflow:hidden; text-align:left; break-inside:avoid; }
  .creative-header { display:flex; align-items:center; gap:10px; padding:12px 14px; border-bottom:1px solid var(--creative-line); }
  .creative-logo { width:26px; height:26px; object-fit:contain; flex-shrink:0; }
  .creative-sponsor { flex:1; min-width:0; overflow-wrap:anywhere; font-size:12px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; line-height:1.3; }
  .creative-label { max-width:45%; font-size:11px; color:var(--muted,#767676); line-height:1.4; }
  .creative-image-wrap { height:140px; background:var(--creative-line); border-bottom:1px solid var(--creative-line); }
  .creative-preview-feature .creative-image-wrap { height:220px; }
  .creative-image { display:block; width:100%; height:100%; object-fit:cover; }
  .creative-image-missing { display:flex; height:100%; align-items:center; justify-content:center; color:var(--muted,#767676); font-size:12px; }
  .creative-preview [hidden] { display:none!important; }
  .creative-copy { padding:14px; }
  .creative-copy h3 { font-size:19px; font-weight:700; font-stretch:condensed; line-height:1.25; margin:0; overflow-wrap:anywhere; }
  .creative-copy p { font-size:13px; line-height:1.45; color:var(--muted,#767676); margin:6px 0 0; overflow-wrap:anywhere; }
  .creative-button { margin-top:12px; padding:10px; background:#861f4120; color:var(--ad-maroon,#861f41); font-size:13px; font-weight:600; line-height:1.4; text-align:center; overflow-wrap:anywhere; }
  .creative-button span { margin-left:4px; }
`;

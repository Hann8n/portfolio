import { AD_PREVIEW_STYLES, renderAdPreview, type PreviewAd } from "../../../src/ad-preview";

const styleId = "ad-preview-styles";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const style = Object.assign(document.createElement("style"), { id: styleId, textContent: AD_PREVIEW_STYLES });
  document.head.append(style);
}

/** The same renderer the app's sponsor report uses, so dashboard, editor, and report always match. Output is escaped. */
export function AdPreview({ ad, className }: { ad: PreviewAd; className?: string }) {
  return <div className={"ad-preview-host " + (className || "")} dangerouslySetInnerHTML={{ __html: renderAdPreview(ad) }} />;
}

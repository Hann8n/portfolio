import { CopyIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AdPreview } from "@/components/ad-preview";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDeleteCampaign, useSaveCampaign, type Campaign, type Tier } from "@/lib/api";

interface Form {
  id: string; creative_version: string; active: boolean; tier: Tier; sponsor: string; sponsored_label: string;
  headline: string; subline: string; cta: string; destination_url: string; image_url: string; logo_url: string; start_at: string; end_at: string;
}
const LABELS = [["Sponsored", "Sponsored"], ["Partner", "Partner"], ["Student Organization", "Student Organization"], ["none", "No label"]] as const;

/** ISO ↔ `<input type="datetime-local">` value, in the browser's time zone. */
const toLocalInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (value: string) => { if (!value) return undefined; const d = new Date(value); return Number.isNaN(d.getTime()) ? undefined : d.toISOString(); };

function toForm(c: Campaign | null): Form {
  return {
    id: c?.id || "", creative_version: c?.creative_version || "", active: c ? c.active : true, tier: c?.tier || "banner",
    sponsor: c?.sponsor || "", sponsored_label: c?.sponsored_label === "" ? "none" : c?.sponsored_label || "Sponsored",
    headline: c?.headline || "", subline: c?.subline || "", cta: c?.cta || "", destination_url: c?.destination_url || "",
    image_url: c?.image_url || "", logo_url: c?.logo_url || "", start_at: toLocalInput(c?.start_at), end_at: toLocalInput(c?.end_at),
  };
}

function toCampaign(f: Form): Campaign {
  return {
    id: f.id.trim(), active: f.active, tier: f.tier, sponsor: f.sponsor.trim(), sponsored_label: f.sponsored_label === "none" ? "" : f.sponsored_label,
    headline: f.headline.trim(), subline: f.subline.trim() || null, cta: f.cta.trim(), destination_url: f.destination_url.trim(),
    image_url: f.tier === "text" ? null : f.image_url.trim() || null, logo_url: f.logo_url.trim() || null,
    placement: "home_feed", creative_version: f.creative_version.trim(), start_at: fromLocalInput(f.start_at), end_at: fromLocalInput(f.end_at),
  };
}

const https = (s: string) => { try { return new URL(s.trim()).protocol === "https:"; } catch { return false; } };
/** Mirrors validateAdConfig in src/index.ts so errors appear next to the field before saving. */
function validate(f: Form, isNew: boolean, existing: string[]): Partial<Record<keyof Form, string>> {
  const e: Partial<Record<keyof Form, string>> = {};
  if (!f.id.trim()) e.id = "Required";
  else if (isNew && existing.includes(f.id.trim())) e.id = "A campaign with this ID already exists";
  if (!f.sponsor.trim()) e.sponsor = "Required";
  if (!f.headline.trim()) e.headline = "Required";
  if (!f.cta.trim()) e.cta = "Required";
  if (!https(f.destination_url)) e.destination_url = "Enter an https:// URL";
  if (f.tier !== "text" && !https(f.image_url)) e.image_url = "Banner and feature ads need an https:// image";
  if (f.logo_url.trim() && !https(f.logo_url)) e.logo_url = "Enter an https:// URL or leave empty";
  if (f.start_at && f.end_at && new Date(f.end_at) < new Date(f.start_at)) e.end_at = "Ends before it starts";
  return e;
}

function nextId(id: string) {
  const match = id.match(/-(\d+)$/);
  return match ? id.replace(/-(\d+)$/, "-" + (Number(match[1]) + 1)) : (id || "campaign") + "-copy";
}

export function CampaignEditor({ campaign, open, onOpenChange, existingIds, onSaved }: {
  campaign: Campaign | null; open: boolean; onOpenChange: (open: boolean) => void; existingIds: string[]; onSaved?: (c: Campaign) => void;
}) {
  const [form, setForm] = useState<Form>(() => toForm(campaign));
  const [initial, setInitial] = useState(form);
  const [isNew, setIsNew] = useState(!campaign);
  const [showErrors, setShowErrors] = useState(false);
  const save = useSaveCampaign();
  const remove = useDeleteCampaign();
  useEffect(() => { if (open) { const f = toForm(campaign); setForm(f); setInitial(f); setIsNew(!campaign); setShowErrors(false); } }, [open, campaign]);

  const errors = useMemo(() => validate(form, isNew, existingIds), [form, isNew, existingIds]);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm(f => ({ ...f, [key]: value }));
  const close = (next: boolean) => { if (!next && dirty && !confirm("Discard unsaved changes?")) return; onOpenChange(next); };

  const preset = (kind: "today" | "week" | "7d" | "30d") => {
    const now = new Date(), end = new Date(now);
    if (kind === "today") end.setHours(23, 59, 0, 0);
    if (kind === "week") { end.setDate(end.getDate() + (7 - now.getDay())); end.setHours(23, 59, 0, 0); }
    if (kind === "7d") end.setDate(end.getDate() + 7);
    if (kind === "30d") end.setDate(end.getDate() + 30);
    setForm(f => ({ ...f, start_at: toLocalInput(now.toISOString()), end_at: toLocalInput(end.toISOString()) }));
  };

  const submit = async () => {
    setShowErrors(true);
    if (Object.keys(errors).length) { toast.error("Fix the highlighted fields"); return; }
    try {
      const saved = await save.mutateAsync(toCampaign(form));
      toast.success(isNew ? "Campaign created" : "Campaign saved");
      setInitial(form); onOpenChange(false); onSaved?.(saved);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save"); }
  };
  const clone = () => {
    const start = new Date(); start.setMonth(start.getMonth() + 1);
    const end = new Date(start); end.setMonth(end.getMonth() + 1);
    setForm(f => ({ ...f, id: nextId(f.id), active: false, start_at: toLocalInput(start.toISOString()), end_at: toLocalInput(end.toISOString()) }));
    setIsNew(true);
    toast.info("Copied into a new, inactive campaign. Review it, then save.");
  };
  const destroy = async () => {
    try { await remove.mutateAsync(form.id); toast.success("Campaign deleted"); setInitial(form); onOpenChange(false); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete"); }
  };
  const err = (key: keyof Form) => (showErrors ? errors[key] : undefined);
  const preview = toCampaign(form);

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className="w-full gap-0 sm:max-w-3xl" aria-describedby="editorDescription">
        <SheetHeader className="border-b">
          <SheetTitle>{isNew ? "New campaign" : `Edit ${campaign?.sponsor || form.id}`}</SheetTitle>
          <SheetDescription id="editorDescription">{dirty ? "Unsaved changes" : "Changes go live when you save."}</SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 gap-6 overflow-y-auto p-4 md:grid-cols-[minmax(0,1fr)_280px]">
          <form id="campaignForm" className="space-y-6" onSubmit={e => { e.preventDefault(); submit(); }} noValidate>
            <fieldset className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div><Label htmlFor="active">Active</Label><p className="text-xs text-muted-foreground">Paused campaigns never show, even inside their dates.</p></div>
                <Switch id="active" checked={form.active} onCheckedChange={v => set("active", v)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
                <Field id="id" label="Campaign ID" error={err("id")}><Input id="id" value={form.id} disabled={!isNew} placeholder={form.sponsor ? form.sponsor.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + new Date().toISOString().slice(0, 7) : "sponsor-2026-10"} onChange={e => set("id", e.target.value)} className="font-mono" /></Field>
                <Field id="creative_version" label="Version"><Input id="creative_version" value={form.creative_version} placeholder="v1" onChange={e => set("creative_version", e.target.value)} className="font-mono" /></Field>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="mb-3 text-sm font-medium">Schedule</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="start_at" label="Starts"><Input id="start_at" type="datetime-local" value={form.start_at} onChange={e => set("start_at", e.target.value)} /></Field>
                <Field id="end_at" label="Ends" error={err("end_at")}><Input id="end_at" type="datetime-local" value={form.end_at} onChange={e => set("end_at", e.target.value)} /></Field>
              </div>
              <div className="flex flex-wrap gap-2">
                {([["today", "Today"], ["week", "This week"], ["7d", "Next 7 days"], ["30d", "Next 30 days"]] as const).map(([k, l]) => <Button key={k} type="button" size="sm" variant="outline" onClick={() => preset(k)}>{l}</Button>)}
                {(form.start_at || form.end_at) && <Button type="button" size="sm" variant="ghost" onClick={() => setForm(f => ({ ...f, start_at: "", end_at: "" }))}>Clear dates</Button>}
              </div>
              <p className="text-xs text-muted-foreground">Times use this device’s time zone. Leave both empty to run whenever the campaign is active.</p>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="mb-3 text-sm font-medium">Creative</legend>
              <div className="space-y-2">
                <Label>Format</Label>
                <ToggleGroup type="single" variant="outline" value={form.tier} onValueChange={v => v && set("tier", v as Tier)} className="w-full">
                  <ToggleGroupItem value="text" className="flex-1">Text</ToggleGroupItem>
                  <ToggleGroupItem value="banner" className="flex-1">Banner</ToggleGroupItem>
                  <ToggleGroupItem value="feature" className="flex-1">Feature</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="sponsor" label="Sponsor" error={err("sponsor")}><Input id="sponsor" value={form.sponsor} placeholder="Acme Corp" onChange={e => set("sponsor", e.target.value)} /></Field>
                <Field id="sponsored_label" label="Content label">
                  <Select value={form.sponsored_label} onValueChange={v => set("sponsored_label", v)}>
                    <SelectTrigger id="sponsored_label" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{LABELS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <Field id="headline" label="Headline" error={err("headline")}><Input id="headline" value={form.headline} placeholder="Your headline here" onChange={e => set("headline", e.target.value)} /></Field>
              <Field id="subline" label="Subline" optional><Input id="subline" value={form.subline} placeholder="123 Main St · Open 7am–10pm" onChange={e => set("subline", e.target.value)} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="cta" label="Link button text" error={err("cta")}><Input id="cta" value={form.cta} placeholder="Learn more" onChange={e => set("cta", e.target.value)} /></Field>
                <Field id="destination_url" label="Destination URL" error={err("destination_url")}><Input id="destination_url" type="url" inputMode="url" value={form.destination_url} placeholder="https://" onChange={e => set("destination_url", e.target.value)} /></Field>
              </div>
              {form.tier !== "text" && <Field id="image_url" label="Image URL" error={err("image_url")}><Input id="image_url" type="url" inputMode="url" value={form.image_url} placeholder="https://" onChange={e => set("image_url", e.target.value)} /></Field>}
              <Field id="logo_url" label="Logo URL" optional error={err("logo_url")}><Input id="logo_url" type="url" inputMode="url" value={form.logo_url} placeholder="https://" onChange={e => set("logo_url", e.target.value)} /></Field>
            </fieldset>
          </form>
          <aside className="space-y-2 md:sticky md:top-0 md:self-start">
            <p className="text-sm font-medium">Preview</p>
            <AdPreview ad={{ ...preview, sponsor: preview.sponsor || "Sponsor", headline: preview.headline || "Your headline here", cta: preview.cta || "Learn more" }} />
            <p className="text-xs text-muted-foreground">How the ad appears in the app’s home feed.</p>
          </aside>
        </div>
        <SheetFooter className="flex-row flex-wrap items-center justify-between gap-2 border-t">
          {!isNew ? (
            <AlertDialog>
              <AlertDialogTrigger asChild><Button type="button" variant="ghost" className="text-destructive hover:text-destructive"><Trash2Icon /> Delete</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Delete {form.sponsor || form.id}?</AlertDialogTitle><AlertDialogDescription>The campaign stops showing immediately. Its recorded analytics are kept, but reports need the campaign to exist.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={destroy} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : <span />}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={clone}><CopyIcon /> Clone</Button>
            <Button type="submit" form="campaignForm" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({ id, label, optional, error, children }: { id: string; label: string; optional?: boolean; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2" data-invalid={!!error || undefined}>
      <Label htmlFor={id}>{label}{optional && <span className="font-normal text-muted-foreground"> (optional)</span>}</Label>
      <div className="[&_input]:aria-invalid:border-destructive" aria-invalid={!!error || undefined}>{children}</div>
      {error && <p className="text-xs text-destructive" id={id + "-error"}>{error}</p>}
    </div>
  );
}

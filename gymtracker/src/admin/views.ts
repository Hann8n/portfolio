/**
 * Dashboard workspaces. To add one: add an entry here, a `<section id="{id}Panel">` in page.ts,
 * and `registerView('{id}', { onShow, onData })` in a client module.
 */
export const DASHBOARD_VIEWS = [
  { id: "overview", label: "Overview", description: "How people use Gym Tracker." },
  { id: "campaigns", label: "Campaigns", description: "Delivery, creative, schedule, and sponsor reports." },
  { id: "events", label: "Events", description: "Every tracked event, with CSV export." },
  { id: "data", label: "Data quality", description: "Coverage and internal test installs excluded from reports." },
] as const;

export function navMarkup(): string {
  return `<nav class="dashboard-nav" role="tablist" aria-label="Dashboard sections">` + DASHBOARD_VIEWS.map((view, i) =>
    `<button type="button" role="tab" id="tab${view.id[0].toUpperCase() + view.id.slice(1)}" aria-selected="${i === 0}" aria-controls="${view.id}Panel" data-view="${view.id}"${i ? ' tabindex="-1"' : ""}>${view.label}</button>`
  ).join("") + `</nav>`;
}

export const VIEWS_SCRIPT = `const DASHBOARD_VIEWS = ${JSON.stringify(DASHBOARD_VIEWS)};`;

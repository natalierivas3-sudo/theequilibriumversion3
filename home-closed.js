/*
 * Option B: Home opens with Guide me, Surprise me, and Calm me all closed.
 * Picking one opens it; tapping the open one again closes it.
 * Filters only show with Guide me or Surprise me, where they apply.
 * Shortcut links (#calm, #talk, #surprise) still open straight into their section.
 */
(function () {
    "use strict";
    const TABS = [["tabGuide", "guidePanel"], ["tabSurprise", "surprisePanel"], ["tabCalm", "calmPanel"]];
    const $ = id => document.getElementById(id);

    function syncFilters() {
        const prefs = $("prefsDetails");
        if (!prefs) return;
        const on = ["tabGuide", "tabSurprise"].some(id => $(id)?.classList.contains("active"));
        prefs.hidden = !on;
        const any = TABS.some(([t]) => $(t)?.classList.contains("active"));
        document.body.classList.toggle("home-closed", !any);
    }
    function closeAll() {
        TABS.forEach(([t, p]) => {
            const tab = $(t), panel = $(p);
            if (tab) { tab.classList.remove("active"); tab.setAttribute("aria-selected", "false"); }
            if (panel) panel.hidden = true;
        });
        syncFilters();
        document.body.classList.add("home-closed");
    }
    function setup() {
        const shortcut = ["calm", "talk", "surprise"].includes(location.hash.slice(1));
        if (!shortcut) closeAll(); else syncFilters();

        // Tapping the open button again closes it.
        document.addEventListener("click", e => {
            const tab = e.target.closest("#tabGuide, #tabSurprise, #tabCalm");
            if (tab && e.isTrusted && tab.classList.contains("active")) {
                e.stopImmediatePropagation(); e.preventDefault();
                closeAll();
            }
        }, true);
        TABS.forEach(([t]) => new MutationObserver(syncFilters).observe($(t), { attributes: true, attributeFilter: ["class"] }));
        // Coming back to Home from another page shows the closed state again.
        window.addEventListener("hashchange", () => { if (location.hash === "#home" || location.hash === "") closeAll(); });
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(setup, 30), { once: true });
    else setTimeout(setup, 30);
})();

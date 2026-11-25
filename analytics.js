/*
 * Anonymous usage counts for The Equilibrium (Google Analytics 4).
 * The Google tag in index.html labels every visit with its site_version.
 * This file adds:
 *   - section_view: which page someone opens (Home, Coping skills, Study spots, ...)
 *   - counts for features that the older code doesn't count yet.
 * Never sent: anything typed (search words, rants, good things), check-in levels, or 0-10 ratings.
 */
(function () {
    "use strict";
    const send = (name, params) => { try { if (typeof window.gtag === "function") window.gtag("event", name, params || {}); } catch (e) { /* ignore */ } };

    // Which page is open (the site uses #home, #skills, #study-section, ...).
    const SECTIONS = { "": "home", home: "home", skills: "coping_skills", "study-section": "study_spots", library: "resources",
        maps: "ut_maps", crisis: "crisis", about: "origin_story", calm: "calm_shortcut", talk: "talk_shortcut", surprise: "surprise_shortcut" };
    let lastSection = null;
    function sectionView() {
        const h = location.hash.slice(1);
        const section = SECTIONS[h];
        if (!section || section === lastSection) return;
        lastSection = section;
        send("section_view", { section });
    }
    window.addEventListener("hashchange", sectionView);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sectionView, { once: true }); else sectionView();

    // Feature counts, by delegated clicks.
    let currentTool = null, searchTimer = null, searched = false;
    document.addEventListener("click", e => {
        const t = e.target;
        const q = sel => t.closest(sel);
        let el;
        if ((el = q("[data-sk-state]"))) send("skill_state", { state: el.dataset.skState });
        else if ((el = q("[data-tip-tool]"))) { currentTool = el.dataset.tipTool; send("tip_open", { tool: currentTool }); }
        else if ((el = q("[data-open-tool]"))) { currentTool = el.dataset.openTool; send("skill_open", { tool: currentTool }); }
        else if (q("[data-sk-done]")) send("skill_done", { tool: currentTool || "" });
        else if ((el = q("[data-star]"))) send("kit_star", { tool: el.dataset.star });
        else if (q("#calmTailorStart")) send("checkin_start");
        else if (q("[data-calm-next]")) setTimeout(() => { if (document.querySelector("#calmSteps .calm-crisis")) send("checkin_crisis_shown"); }, 0);
        else if (q("[data-breath-toggle]")) send("breathing_toggle");
        else if (q("[data-calm-coping]")) send("checkin_more_ways");
        else if (q("[data-share-site]")) send("share_site");
        else if (q("[data-calm-video]")) send("calm_choice", { choice: "guided_video" });
        else if (q('#calmPanel .calm-choices a[href="#skills"]')) send("calm_choice", { choice: "coping_skills" });
        else if (q('#calmPanel .calm-choices [data-calm-swap="three-good"]')) send("calm_choice", { choice: "three_good_things" });
        else if (q("#spotLocate")) send("map_locate_tap");

        // Any call or text to a crisis or support line, wherever it is on the site (just the line, never who).
        const link = q('a[href^="tel:"], a[href^="sms:"]');
        if (link && !link.hasAttribute("data-crisis")) {
            const where = link.closest("#skills") ? "coping_skills" : link.closest("#calmPanel") ? "calm_me" : link.closest(".home-crisis") ? "home" : "other";
            send("crisis_contact", { line: link.getAttribute("href").replace(/^(tel|sms):/, "").slice(0, 12), method: link.getAttribute("href").startsWith("sms") ? "text" : "call", where });
        }
    }, true);

    // Search used (counts that someone searched; never the words).
    document.addEventListener("input", e => {
        if (e.target.id !== "searchInput") return;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => { if (!searched && e.target.value.trim()) { searched = true; send("search_used"); } }, 1200);
    });
})();

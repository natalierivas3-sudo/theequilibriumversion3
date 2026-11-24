/*
 * TEXT CLEANUP (prototype)
 * Runs after all data files and before the page renders.
 * - Sentence case for buttons, costs, and hours (proper names keep their capitals)
 * - One-sentence descriptions on cards (the full text stays available under "More")
 * - Hides vague hours like "Outdoor access" or "Check current access"
 */
(function () {
    "use strict";

    // Generic words that should be lowercase when they're not the first word.
    const LOWER = new Set(("Current Series Live Traffic Details Resources Map Maps Info Options Soccer Volleyball Courts Club " +
        "Game Your Visit Events Classes Craft Nights Upcoming Exploring Puzzle City Shops Groups Intramurals Schedule Trail " +
        "Cat Lounge Community Page Playlist Session Workout Arts World Meditation Coffee Location Building Buildings " +
        "Wellness Restroom Campus Volunteer Exhibits Ideas All Spots Late Nearby Free Paid Varies Students Dusk Fall").split(" "));
    // Names that contain one of those words and must stay as written.
    const KEEP_PHRASES = ["Bennu Coffee", "Epoch Coffee", "Creative Reuse", "Insight Timer", "Gregory Gym", "Zilker Park",
        "Barton Springs", "Art Garage", "Animal World", "Jester King", "Elisabet Ney", "Integral Care", "988 Lifeline"];

    function sentenceCase(str) {
        if (!str) return str;
        let out = str.split(" ").map((w, i) => (i > 0 && LOWER.has(w.replace(/[^A-Za-z]/g, "")) ? w.toLowerCase() : w)).join(" ");
        KEEP_PHRASES.forEach(p => { out = out.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), p); });
        return out;
    }

    const COST = {
        "Included for UT Students": "Included for UT students",
        "Free & Paid Options": "Free & paid options",
        "Price Varies": "Price varies"
    };

    // Hours that don't tell you anything get hidden.
    const VAGUE_HOURS = /access|^check|^building hours$|^varies$|^anytime$|^updated|^current schedule|schedule varies|^dates, times/i;
    function cleanHours(h) {
        if (!h || VAGUE_HOURS.test(h)) return "";
        return h.replace("Dawn to Dusk", "Dawn to dusk").replace("Reopened Fall 2026 — Check hours", "Reopened fall 2026");
    }

    // Ends at the first real sentence break; skips abbreviations like "St." or "Ave.".
    const ABBREV = /\b(St|Ave|Blvd|Dr|Rd|Ln|Mt|Ft|No|vs|etc|Jr|Sr|Mr|Ms|Mrs|U\.S|a\.m|p\.m)\.$/i;
    function firstSentence(text) {
        if (!text) return text;
        const re = /[.!?](?=\s+[A-Z0-9“"]|$)/g;
        let m;
        while ((m = re.exec(text))) {
            const head = text.slice(0, m.index + 1);
            if (!ABBREV.test(head)) return head;
        }
        return text;
    }

    if (typeof WELLNESS_RESOURCES !== "undefined") {
        WELLNESS_RESOURCES.forEach(r => {
            r.fullDescription = r.description;
            r.description = firstSentence(r.description);
            r.linkText = sentenceCase(r.linkText);
            if (COST[r.cost]) r.cost = COST[r.cost];
            r.hours = cleanHours(r.hours);
        });
    }
    if (typeof STUDY_SPOTS !== "undefined") {
        STUDY_SPOTS.forEach(s => { s.hours = cleanHours(s.hours); });
    }

    /* ---------- Price badges ----------
     * Levels: 0 = free, 1 = $ (under $10), 2 = $$ ($10–25), 3 = $$$ ($25+).
     * Paid levels are estimates of a typical visit for one student.
     */
    const PRICE_BY_COST = {
        "Free": [0, 0], "": [0, 0], "Included for UT students": [0, 0, "ut"], "Free & paid options": [0, 2],
        "Paid": [2, 2], "Price varies": [1, 2], "Regardless of ability to pay": [0, 1], "Check admission": [0, 1]
    };
    const PRICE_BY_ID = {
        "insight-timer": [0, 1], "texercise": [0, 1], "austin-creative-reuse": [0, 1], "do512-animals": [0, 3],
        "barton-springs-pool": [1, 1], "crowes-nest-farm": [1, 1], "natural-bridge-wildlife-ranch": [3, 3],
        "bennu-coffee": [1, 1], "epoch-coffee": [1, 1], "medici-guadalupe": [1, 1], "flightpath-coffee": [1, 1], "codependent-monkeynest": [1, 1],
        "os-cafe": [1, 1], "littlefield-cafe": [1, 1], "tower-burgers": [1, 1], "kinsolving-dining": [1, 1], "texas-expresso": [1, 1], "ufonda-truck": [1, 1],
        "sweatpals": [0, 2], "posh-austin": [1, 3]
    };
    const LEVEL_WORDS = ["Free", "under $10", "about $10–25", "$25+"];
    function priceOf(r) {
        const p = PRICE_BY_ID[r.id] || PRICE_BY_COST[r.cost] || [0, 0];
        return { min: p[0], max: p[1], ut: p[2] === "ut" };
    }
    function priceHtml(pr) {
        if (!pr) return "";
        const dollars = (n, faint) => "$".repeat(n).split("").map(() => `<b>$</b>`).join("") + "$".repeat(faint).split("").map(() => `<i>$</i>`).join("");
        let inner, label;
        if (pr.max === 0) {
            inner = pr.ut ? "Free <small>with UT ID</small>" : "Free";
            label = pr.ut ? "Free for UT students" : "Free";
            return `<span class="price price-free" title="${label}" aria-label="Price: ${label}">${inner}</span>`;
        }
        if (pr.min === 0) { inner = `<span class="price-word">Free</span><span class="price-dash">–</span>${dollars(pr.max, 3 - pr.max)}`; label = `Free to ${LEVEL_WORDS[pr.max]}`; }
        else if (pr.min === pr.max) { inner = dollars(pr.max, 3 - pr.max); label = LEVEL_WORDS[pr.max]; }
        else { inner = `${dollars(pr.min, 0)}<span class="price-dash">–</span>${dollars(pr.max, 3 - pr.max)}`; label = `${LEVEL_WORDS[pr.min]} to ${LEVEL_WORDS[pr.max]}`; }
        return `<span class="price" title="Price: ${label}" aria-label="Price: ${label}">${inner}</span>`;
    }
    if (typeof WELLNESS_RESOURCES !== "undefined") WELLNESS_RESOURCES.forEach(r => { r.price = priceOf(r); });
    if (typeof STUDY_SPOTS !== "undefined") STUDY_SPOTS.forEach(s => { s.price = s.campus || s.free || /library/i.test(s.name) ? { min: 0, max: 0 } : { min: 1, max: 1 }; });

    window.EQ_TEXT = { sentenceCase, firstSentence, cleanHours, priceHtml };
})();

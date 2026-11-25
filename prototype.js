/*
 * PROTOTYPE LAYER: runs after the original script.js.
 * Reads the original WELLNESS_RESOURCES and STUDY_SPOTS data; does not change it.
 */
(function () {
    "use strict";

    /* ---------- Analytics hook (no-op unless GA4 gtag is on the page) ---------- */
    function track(name, params) {
        try {
            if (typeof window.gtag === "function") window.gtag("event", name, params || {});
        } catch (e) { /* ignore */ }
    }

    /* ---------- Storage (safe) ---------- */
    const store = {
        get(key, fallback) {
            try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
            catch (e) { return fallback; }
        },
        set(key, value) {
            try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
        }
    };

    /* ---------- Build one list of items from both datasets ---------- */
    const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Who's around: solo = on your own, around = near people without needing to talk, connect = actually socialize.
    const SOCIAL = {
        solo: ["thrive-ut", "guided-mindfulness", "insight-timer", "yoga-30days", "beginner-yoga", "at-home-workouts",
            "bob-ross", "worldguessr", "openguessr", "minesweeper-lab", "barton-creek-greenbelt", "austin-trail-map",
            "austin-eco-counter", "austin-parks", "austin-parks-map", "zilker-park", "harry-ransom-center", "elisabet-ney-museum",
            "aac-volunteer", "austin-pets-alive", "austin-meditation-community"],
        around: ["recreational-sports-center", "gregory-gym", "texercise", "barton-springs-pool", "zilker-park",
            "barton-creek-greenbelt", "purrfecto-cat-lounge", "the-art-garage", "blanton-museum", "elisabet-ney-museum",
            "harry-ransom-center", "bennu-coffee", "epoch-coffee", "medici-guadalupe", "flightpath-coffee",
            "codependent-monkeynest", "visit-austin-arts", "rose-shine-yoga", "apl-yoga-meditation", "fitness-in-the-park"],
        connect: ["cmhc-groups", "intramural-sports", "campus-pickleball", "austin-sand-volleyball", "austin-soccer-fields",
            "ut-running-club", "coffee-run-tour", "morning-jos", "aac-volunteer", "austin-pets-alive",
            "austin-creative-reuse", "queer-craft-night", "austin-meditation-community", "city-austin-events",
            "cardhearth", "austin-pickleball-map", "rose-shine-yoga", "fitness-in-the-park", "apl-yoga-meditation"]
    };

    const NEWCOMER = ["zilker-park", "barton-springs-pool", "barton-creek-greenbelt", "blanton-museum", "city-austin-events",
        "recreational-sports-center", "cmhc", "intramural-sports", "visit-austin-arts", "harry-ransom-center"];
    const NEWCOMER_SPOTS = ["texas-union", "pcl-perry-casta-eda-library", "austin-central-library"];

    const STARTERS = ["zilker-park", "bob-ross", "intramural-sports", "purrfecto-cat-lounge", "blanton-museum", "aac-volunteer"];

    const EXTRAS = typeof CAMPUS_EXTRAS !== "undefined" ? CAMPUS_EXTRAS : [];
    const EXTRAS_SOCIAL = typeof CAMPUS_EXTRAS_SOCIAL !== "undefined" ? CAMPUS_EXTRAS_SOCIAL : {};
    const PHOTOS = typeof SPOT_PHOTOS !== "undefined" ? SPOT_PHOTOS : {};
    const resources = (typeof WELLNESS_RESOURCES !== "undefined" ? WELLNESS_RESOURCES : []).map(r => ({
        kind: "resource",
        id: r.id,
        title: r.title,
        description: r.description,
        url: r.url,
        linkText: r.linkText || "Open",
        category: r.category,
        section: r.section,
        tags: r.tags || [],
        cost: r.cost || "",
        hours: r.hours || "",
        lastVerified: r.lastVerified || "",
        stops: r.stops || null,
        tip: r.tip || "", quote: r.quote || "", safety: r.safety || "",
        fullDescription: r.fullDescription || r.description,
        price: r.price,
        raw: r
    }));

    const spots = (typeof STUDY_SPOTS !== "undefined" ? STUDY_SPOTS : []).map(s => {
        const tags = [s.type, s.vibe];
        if (s.openLate) tags.push("open late");
        if (s.outlets) tags.push("outlets");
        if (s.coffeeNearby) tags.push("coffee nearby");
        tags.push(s.campus ? "on campus" : "off campus");
        if (s.area === "West Campus") tags.push("west campus");
        if (s.nap) tags.push("nap");
        return {
            kind: "spot",
            id: "spot-" + slug(s.name),
            title: s.name,
            description: s.hours ? "Hours: " + s.hours : "",
            url: s.url,
            linkText: s.campus ? "Find on UT map" : "View location",
            category: "study",
            section: "Study Spot",
            tags,
            cost: s.campus ? "Free" : "",
            hours: "",
            lastVerified: s.lastVerified || "",
            tip: s.tip || "", quote: s.quote || "", safety: s.safety || "",
            price: s.price,
            raw: s
        };
    });

    // Avoid showing a café twice (it exists as both a resource and a study spot).
    const spotTitles = new Set(spots.map(s => s.title.toLowerCase()));
    const ALL = resources.filter(r => !(r.category === "study" && spotTitles.has(r.title.toLowerCase()))).concat(spots);
    const byId = new Map(ALL.map(i => [i.id, i]));

    /* ---------- Helpers ---------- */
    function whereOf(item) {
        const t = item.tags;
        if (t.includes("on campus")) return "campus";
        if (t.includes("west campus")) return "westcampus";
        if (t.includes("off campus")) return "austin";
        if (t.includes("virtual")) return "online";
        return "";
    }
    const WHERE_LABEL = { campus: "UT campus", westcampus: "West Campus", austin: "Austin", online: "Online" };

    function isFree(item) {
        return /^(free|included)/i.test(item.cost) || item.tags.includes("free") || item.tags.includes("included for students");
    }

    /*
     * Who's around.
     * - Just me: anything you can do by yourself. Only things that are mostly about being with others
     *   (team sports, run clubs, volunteering, craft nights) are left out.
     * - Around people: anything in a physical place (not online-only).
     * - Connect with people: things built around meeting or doing things with others.
     */
    function socialOf(item) {
        const listed = k => SOCIAL[k].includes(item.id);
        const extra = EXTRAS_SOCIAL[item.id];
        const out = new Set();
        const onlineOnly = item.tags.includes("virtual") && !item.tags.includes("on campus") && !item.tags.includes("off campus");

        if (extra) extra.forEach(k => out.add(k));                         // hand-set lists win
        if (item.kind === "spot") { out.add("solo"); out.add("around"); if (item.raw.vibe === "social") out.add("connect"); }
        if (!extra && item.kind !== "spot") {
            const mostlySocial = listed("connect") && !listed("solo") && !listed("around");
            if (!mostlySocial) out.add("solo");
            if (!onlineOnly) out.add("around");
            if (listed("connect") || item.tags.includes("community")) out.add("connect");
            if (listed("around")) out.add("around");
            if (listed("solo")) out.add("solo");
        }
        return Array.from(out);
    }

    const NEED = {
        support: { title: "Talk to someone", test: i => i.category === "support" },
        study: { title: "Find a study spot", test: i => i.category === "study" },
        move: { title: "Move my body", test: i => i.category === "move" || i.tags.some(t => ["sports", "yoga", "fitness"].includes(t)) && i.category !== "outdoors" },
        outdoors: { title: "Get outside", test: i => i.category === "outdoors" || i.section === "Walking Tour" || (i.tags.includes("outdoors") && i.kind === "resource") || (i.kind === "spot" && i.raw.type === "outdoor") },
        break: { title: "Take a break", test: i => i.category === "break" || i.tags.some(t => ["art", "pets", "nap", "food"].includes(t)) },
        explore: { title: "Explore Austin", test: i => i.category === "explore" || i.tags.includes("day trip") || i.section === "Walking Route" || i.category === "connect" || (i.tags.includes("events") && i.tags.includes("off campus")) || i.tags.includes("austin classic") },
        doomscroll: { title: "Instead of doomscrolling", test: i => i.category === "doomscroll" },
        saved: { title: "My saved", test: i => saved.has(i.id) },
        make: { title: "Make something small", test: i => i.tags.includes("art") },
        newcomer: { title: "New to Austin or UT? Start here", test: i => NEWCOMER.includes(i.id) || NEWCOMER_SPOTS.some(s => i.id.includes(s)) },
        start: { title: "Good places to start", test: i => STARTERS.includes(i.id) }
    };

    const SUB = {
        support: [["Counseling & groups", i => i.section === "Mental Health / Support"], ["Crisis", i => /crisis|988/i.test(i.title) || i.section === "Crisis Support"], ["Virtual", i => i.tags.includes("virtual")]],
        study: [["Nap spots", i => i.tags.includes("nap")], ["Quiet", i => i.tags.includes("quiet")], ["Good for groups", i => i.tags.includes("social")], ["Open late", i => i.tags.includes("open late")], ["Outlets", i => i.tags.includes("outlets")], ["Outdoor", i => i.tags.includes("outdoor")]],
        move: [["Team & pickup sports", i => /intramural|pickleball|volleyball|soccer|running|run/i.test(i.title)], ["Yoga", i => i.tags.includes("yoga")], ["Gym & fitness", i => i.tags.includes("fitness")], ["At home", i => i.tags.includes("virtual")]],
        outdoors: [["Nature", i => i.tags.includes("nature")], ["Swimming", i => i.tags.includes("water")], ["Get moving", i => i.tags.includes("outdoor movement") || i.tags.includes("sports")], ["Study outside", i => i.kind === "spot"], ["On campus", i => i.tags.includes("on campus")]],
        break: [["Cheap eats", i => i.tags.includes("food")], ["Nap spots", i => i.tags.includes("nap")], ["Animals", i => i.tags.includes("pets")], ["No car needed", i => !i.tags.includes("needs a car")], ["Art & making", i => i.tags.includes("art")], ["Calm my mind", i => i.tags.includes("mindfulness")]],
        explore: [["Campus walks & tours", i => i.section === "Walking Route" || i.section === "Walking Tour"], ["Events now", i => i.tags.includes("events")], ["Art & museums", i => i.tags.includes("art")], ["Austin classics", i => i.tags.includes("austin classic")], ["Day trips", i => i.tags.includes("day trip")]],
        doomscroll: [["Explore", i => i.tags.includes("doom-explore")], ["Puzzle", i => i.tags.includes("doom-puzzle")], ["Play", i => i.tags.includes("doom-play")]]
    };

    /* ---------- State ---------- */
    const prefs = Object.assign({ social: "any", where: "any", cost: "any" }, store.get("eq-prefs", {}));
    const saved = new Set(store.get("eq-saved", []));
    let need = "start";
    let sub = null;
    let showAll = false;
    const PAGE = Infinity; // show every match by default

    function passesPrefs(item, opts) {
        if (prefs.cost === "free" && !isFree(item)) return false;
        if (prefs.where !== "any" && whereOf(item) !== prefs.where &&
            !(prefs.where === "online" && item.tags.includes("virtual")) &&
            !(prefs.where === "austin" && whereOf(item) === "westcampus")) return false;   // West Campus is part of Austin
        // Support resources ignore the "who's around" setting.
        if (prefs.social !== "any" && item.category !== "support" && !(opts && opts.ignoreSocial)) {
            if (!socialOf(item).includes(prefs.social)) return false;
        }
        return true;
    }

    /* ---------- Rendering ---------- */
    const $ = s => document.querySelector(s);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    function prettyTag(t) {
        const map = { "on campus": "On campus", "off campus": "Off campus", "included for students": "Included for students",
            "open late": "Open late", "coffee nearby": "Coffee nearby", "doom-explore": "Explore", "doom-puzzle": "Puzzle",
            "doom-play": "Play", "outdoor movement": "Outdoor movement", "austin classic": "Austin classic",
            "no account": "No account", "phone-friendly": "Phone-friendly", "whats happening now": "Happening now",
            "local find": "Local find", "nap": "Nap spot", "food": "Food", "needs a car": "Needs a car", "day trip": "Day trip", "sports": "Movement", "pets": "Animals", "mindfulness": "Calm the nervous system" };
        return map[t] || t.charAt(0).toUpperCase() + t.slice(1);
    }

    function photoHtml(name, raw) {
        const src = PHOTOS[name];
        if (src) return `<div class="spot-photo"><img src="${esc(src)}" alt="${esc(name)}" loading="lazy"></div>`;
        const icon = raw && raw.type === "outdoor" ? "🌳" : "🏛️";
        return `<div class="spot-photo spot-photo-empty" aria-hidden="true"><span>${icon}</span><small>Photo needed</small></div>`;
    }

    // One note per card: a tip if there is one. Safety notes always show. (v58: student quotes removed.)
    function notesHtml(x) {
        let h = "";
        if (x.tip) h += `<p class="card-tip"><strong>Tip:</strong> ${esc(x.tip)}</p>`;
        if (x.safety) h += `<p class="card-safety">${esc(x.safety)}</p>`;
        return h;
    }
    // Everything else lives behind "More".
    function moreHtml(x) {
        const rest = x.fullDescription && x.fullDescription !== x.description ? x.fullDescription.slice(x.description.length).trim() : "";
        const tip = "";   // the tip now shows on the card itself
        const stops = x.stops ? `<ol class="route-stops">${x.stops.map(st => `<li>${esc(st)}</li>`).join("")}</ol>` : "";
        const hours = x.hours ? `<p><strong>${x.stops ? "Time" : "Hours"}:</strong> ${esc(x.hours)}</p>` : "";
        if (!rest && !tip && !stops && !hours) return "";
        return `<details class="card-more"><summary>More</summary>
            ${rest ? `<p>${esc(rest)}</p>` : ""}${stops}${tip ? `<p><strong>Tip:</strong> ${esc(tip)}</p>` : ""}${hours}
        </details>`;
    }

    function videoListHtml() {
        if (typeof LEISURE_ART_VIDEOS === "undefined") return "";
        return `<details class="video-list">
            <summary>See the ${LEISURE_ART_VIDEOS.length} videos</summary>
            <ol>${LEISURE_ART_VIDEOS.map(v => `
                <li>
                    <a href="${esc(leisureVideoUrl(v.id))}" target="_blank" rel="noopener noreferrer" data-video="${esc(v.id)}">${esc(v.title)}</a>${v.channel ? ` <span class="video-channel">· ${esc(v.channel)}</span>` : ""}
                    <small>${esc(v.needs)}</small>
                </li>`).join("")}
            </ol>
        </details>`;
    }

    // Directions + Website for real places. Spots use their exact map location when we have one.
    function placeActions(item) {
        const D = window.EQ_DIR;
        if (!D) return "";
        if (item.kind !== "spot") return D.actionsHtml(item);
        const g = typeof SPOT_GEO !== "undefined" ? SPOT_GEO[item.title] : null;
        if (g) return D.actionsHtml({ lat: g.lat, lng: g.lng, name: item.title, url: item.url });
        if (item.raw.campus) return "";
        const site = D.isMapsUrl(item.url) ? "" : `<a class="btn-site" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" data-open>Website</a>`;
        return `<span class="place-actions">${D.dirButton({ q: item.title + ", Austin, TX", walk: false, name: item.title })}${site}</span>`;
    }

    function cardHtml(item) {
        const where = whereOf(item);
        const hide = new Set(["on campus", "off campus", "west campus", "free", "included for students", "unlimited"]);
        const first = ["day trip", "needs a car"];
        if (where === "online") hide.add("virtual");   // "Online" already says it
        const tags = item.tags.filter(t => !hide.has(t))
            .sort((a, b) => first.includes(b) - first.includes(a)).slice(0, where ? 1 : 2);
        const isSaved = saved.has(item.id);
        const direct = /^(tel:|sms:|mailto:)/.test(item.url);
        return `
        <article class="res-card" data-id="${esc(item.id)}">
            ${item.kind === "spot" ? photoHtml(item.title, item.raw) : ""}
            <div>
                <div class="res-header-meta">
                    <span class="res-category">${esc(item.section || "")}</span>
                    ${window.EQ_TEXT ? window.EQ_TEXT.priceHtml(item.price) : ""}
                </div>
                <h3 class="res-title">${esc(item.title)}</h3>
                ${item.description ? `<p class="res-desc">${esc(item.description)}</p>` : ""}
                ${notesHtml(item)}
                ${moreHtml(item)}
                ${item.id === "bob-ross" ? videoListHtml() : ""}
            </div>
            <div>
                <div class="res-tags-list">
                    ${where ? `<span class="res-tag res-where-tag">${WHERE_LABEL[where]}</span>` : ""}
                    ${tags.map(t => `<span class="res-tag">${esc(prettyTag(t))}</span>`).join("")}
                </div>
                <div class="card-actions">
                    ${(window.EQ_CRISIS && window.EQ_CRISIS.crisisHtml(item)) || placeActions(item) || `<a href="${esc(item.url)}" ${direct ? "" : 'target="_blank" rel="noopener noreferrer"'} class="res-link" data-open>${esc(item.linkText)} &rarr;</a>`}
                    <span class="card-icons">
                        <button type="button" class="icon-btn" data-save aria-pressed="${isSaved}" aria-label="${isSaved ? "Remove from saved" : "Save"}: ${esc(item.title)}">${isSaved ? "♥ Saved" : "♡ Save"}</button>
                        <button type="button" class="icon-btn" data-share aria-label="Share ${esc(item.title)}">Share</button>
                    </span>
                </div>
            </div>
        </article>`;
    }

    function renderResults() {
        const def = NEED[need];
        const base = ALL.filter(def.test);
        let list = base.filter(i => passesPrefs(i, { ignoreSocial: need === "saved" }));
        if (need === "saved") list = base; // saved list ignores filters so nothing "disappears"
        if (sub && SUB[need]) {
            const fn = SUB[need].find(s => s[0] === sub);
            if (fn) list = list.filter(fn[1]);
        }
        if (need === "start") list.sort((a, b) => STARTERS.indexOf(a.id) - STARTERS.indexOf(b.id));
        // Hubs that collect many options go first in their category.
        const PIN_FIRST = { move: "sweatpals", explore: "posh-austin" };
        if (PIN_FIRST[need]) list.sort((a, b) => (b.id === PIN_FIRST[need]) - (a.id === PIN_FIRST[need]));
        if (need === "move") list.sort((a, b) => (a.id === "sweatpals" ? -2 : a.id === "reclub" ? -1 : 0) - (b.id === "sweatpals" ? -2 : b.id === "reclub" ? -1 : 0));
        if (need === "break" && sub === "Animals") {
            // Guide first, then places in town, then day trips.
            const rank = i => i.id === "do512-animals" ? 0 : i.tags.includes("day trip") ? 2 : 1;
            list.sort((a, b) => rank(a) - rank(b));
        }
        if (need === "make" || (need === "break" && sub === "Art & making")) list.sort((a, b) => (b.id === "bob-ross") - (a.id === "bob-ross"));

        $("#resultsTitle").textContent = def.title;
        const mj = $("#mapJump"); if (mj) mj.hidden = need !== "study";
        const extra = need === "doomscroll" ? swapsToShow().length : 0;
        const total = list.length + extra;
        $("#resultsCount").textContent = total ? `${total} idea${total === 1 ? "" : "s"}` : "";

        // Sub chips (optional narrowing)
        const subWrap = $("#subChips");
        subWrap.innerHTML = "";
        if (SUB[need]) {
            [["All", null]].concat(SUB[need]).forEach(([label]) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "filter-chip" + ((label === "All" ? sub === null : sub === label) ? " active" : "");
                b.textContent = label;
                b.addEventListener("click", () => {
                    sub = label === "All" ? null : label;
                    showAll = false;
                    track("sub_filter", { need, sub: label });
                    renderResults();
                });
                subWrap.appendChild(b);
            });
        }

        // If nothing matches every preference, show the closest matches instead of a dead end.
        let relaxedNote = "";
        if (!list.length && need !== "saved" && !swapsToShow().length) {
            const order = [["social", "who's around"], ["cost", "cost"]];   // never loosen "Where"
            const saved0 = Object.assign({}, prefs);
            const dropped = [];
            for (const [key, label] of order) {
                if (prefs[key] === "any") continue;
                prefs[key] = "any"; dropped.push(label);
                let l2 = base.filter(i => passesPrefs(i));
                if (sub && SUB[need]) { const fn = SUB[need].find(x => x[0] === sub); if (fn) l2 = l2.filter(fn[1]); }
                if (l2.length) { list = l2; break; }
            }
            Object.assign(prefs, saved0);
            if (list.length) {
                relaxedNote = `<div class="relaxed-note">Nothing matched every preference, so here are the closest matches, ignoring <strong>${dropped.join(" and ")}</strong>. <button type="button" class="link-btn" data-suggest>Suggest a spot we're missing →</button></div>`;
                track("relaxed_results", { need, dropped: dropped.join(",") });
            }
        }

        const grid = $("#resultsGrid");
        const empty = $("#resultsEmpty");
        const more = $("#showMoreBtn");
        const visible = showAll ? list : list.slice(0, PAGE);
        const promptHtml = showsPrompt() && ensurePrompt() ? promptCardHtml(currentPrompt, "Small art prompt") : "";
        const swaps = swapsToShow();
        const toolHtml = (showsTool() ? toolCardHtml() : "") + (swaps.length ? swapPanelHtml() : "") +
            (swaps.length && list.length ? `<h3 class="grid-divider">Or play something that has an ending</h3>` : "");
        grid.innerHTML = toolHtml + promptHtml + visible.map(cardHtml).join("");
        $("#relaxedNote").innerHTML = relaxedNote;
        more.hidden = list.length <= PAGE || showAll;
        more.textContent = `Show all ${list.length}`;

        if (!list.length && !swapsToShow().length) {
            empty.hidden = false;
            if (need === "saved") {
                empty.innerHTML = "Nothing saved yet. Tap <strong>♡ Save</strong> on anything you want to come back to.";
            } else {
                const whereWord = { online: "online or at home", campus: "on UT campus", westcampus: "in West Campus", austin: "around Austin" }[prefs.where];
                // Suggest categories that do have something for this "Where".
                const alts = ["break", "move", "doomscroll", "support", "outdoors", "explore", "study"]
                    .filter(k => k !== need && ALL.filter(NEED[k].test).some(i => passesPrefs(i)))
                    .slice(0, 3);
                const why = need === "outdoors" && prefs.where === "online" ? "Getting outside happens in person, so there's nothing to do online here." :
                    whereWord ? `Nothing in ${NEED[need].title.toLowerCase()} is ${whereWord} yet.` : "Nothing matches these preferences yet.";
                empty.innerHTML = `<p>${why}</p>${alts.length ? `<p class="empty-try">Try instead:</p><div class="empty-alts">${alts.map(k => `<button type="button" class="btn btn-ghost btn-sm" data-need-jump="${k}">${esc(NEED[k].title)}</button>`).join("")}</div>` : ""}
                    <button type="button" class="link-btn" data-reset-prefs>Reset preferences</button>`;
            }
        } else {
            empty.hidden = true;
            empty.innerHTML = "";
        }
    }

    /* ---------- Art + imagination prompts ---------- */
    const PROMPTS = typeof ART_PROMPTS !== "undefined" ? ART_PROMPTS : [];
    const PROMPT_BY_ID = new Map(PROMPTS.map(p => [p.id, p]));
    const KIND_LABEL = { imagine: "Imagine", draw: "Draw", photo: "Photo", write: "Write", make: "Make" };
    const WHO_LABEL = { solo: "On your own", together: "With friends", either: "Solo or with friends" };
    let promptQueue = [];
    let currentPrompt = null;
    const doneIds = new Set();
    const timer = { id: null, left: 0, running: false, handle: null };

    function promptFits(p) {
        if (prefs.social === "solo") return p.who !== "together";
        if (prefs.social === "connect") return p.who !== "solo";
        return true;
    }
    function nextPrompt() {
        if (!promptQueue.length) {
            promptQueue = PROMPTS.filter(promptFits).map(p => p.id).sort(() => Math.random() - 0.5);
            if (currentPrompt && promptQueue.length > 1 && promptQueue[0] === currentPrompt.id) promptQueue.push(promptQueue.shift());
        }
        const id = promptQueue.shift();
        currentPrompt = id ? PROMPT_BY_ID.get(id) : null;
        stopTimer();
        if (currentPrompt) track("prompt_show", { prompt_id: currentPrompt.id });
        return currentPrompt;
    }
    function ensurePrompt() {
        if (!currentPrompt || !promptFits(currentPrompt)) { promptQueue = []; nextPrompt(); }
        return currentPrompt;
    }
    function madeThisWeek() {
        const since = Date.now() - 7 * 864e5;
        return store.get("eq-made", []).filter(t => t > since).length;
    }
    const fmt = sec => Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");

    function timerLabel(p) {
        if (doneIds.has(p.id)) return "Give me another";
        if (timer.id !== p.id) return `Start ${p.minutes}-min timer`;
        if (timer.left <= 0) return "Time's up! Mark it done";
        return timer.running ? `${fmt(timer.left)} · Pause` : `${fmt(timer.left)} · Resume`;
    }

    function promptCardHtml(p, label) {
        const n = madeThisWeek();
        const done = doneIds.has(p.id);
        return `
        <article class="res-card prompt-card" data-prompt="${esc(p.id)}" data-label="${esc(label)}">
            <div>
                <div class="res-header-meta">
                    <span class="res-category">${esc(label)} · ${KIND_LABEL[p.kind] || ""}</span>
                    <span class="where-badge">Anywhere</span>
                </div>
                <p class="prompt-text">${esc(p.text)}</p>
            </div>
            <div>
                <div class="res-tags-list">
                    <span class="res-tag">About ${p.minutes} min</span>
                    <span class="res-tag">Needs: ${esc(p.needs)}</span>
                    <span class="res-tag">${WHO_LABEL[p.who] || ""}</span>
                </div>
                <div class="card-actions prompt-actions">
                    <button type="button" class="btn btn-primary btn-sm" data-timer>${timerLabel(p)}</button>
                    <span class="card-icons">
                        ${done ? "" : '<button type="button" class="icon-btn" data-prompt-done>I did it</button>'}
                        ${typeof PROMPT_VIDEOS !== "undefined" && PROMPT_VIDEOS[p.id] ? `<a class="icon-btn" href="${esc(leisureVideoUrl(PROMPT_VIDEOS[p.id]))}" target="_blank" rel="noopener noreferrer" data-video="${esc(PROMPT_VIDEOS[p.id])}">Watch how</a>` : ""}
                        <button type="button" class="icon-btn" data-prompt-next>Another</button>
                        <button type="button" class="icon-btn" data-prompt-share>Share</button>
                    </span>
                </div>
                <p class="prompt-streak">${done ? "Nice. That counts. " : ""}${n ? `You've made ${n} small thing${n === 1 ? "" : "s"} this week.` : "No pressure. It doesn't have to look good."}</p>
            </div>
        </article>`;
    }

    function refreshPromptCards() {
        document.querySelectorAll(".prompt-card").forEach(el => {
            if (currentPrompt) el.outerHTML = promptCardHtml(currentPrompt, el.dataset.label || "Small art prompt");
        });
    }
    function updateTimerButtons() {
        document.querySelectorAll(".prompt-card [data-timer]").forEach(b => { if (currentPrompt) b.textContent = timerLabel(currentPrompt); });
    }
    function stopTimer() {
        clearInterval(timer.handle);
        timer.id = null; timer.running = false; timer.handle = null;
    }
    function startOrToggleTimer(p) {
        if (doneIds.has(p.id)) { nextPrompt(); refreshPromptCards(); return; }
        if (timer.id === p.id && timer.left <= 0) { markDone(p); return; }
        if (timer.id !== p.id) {
            stopTimer();
            timer.id = p.id; timer.left = p.minutes * 60; timer.running = true;
            track("prompt_timer_start", { prompt_id: p.id });
        } else {
            timer.running = !timer.running;
        }
        clearInterval(timer.handle);
        if (timer.running) {
            timer.handle = setInterval(() => {
                timer.left -= 1;
                if (timer.left <= 0) { clearInterval(timer.handle); timer.running = false; toast("Time's up. How did it go?"); }
                updateTimerButtons();
            }, 1000);
        }
        updateTimerButtons();
    }
    function markDone(p) {
        if (doneIds.has(p.id)) return;
        doneIds.add(p.id);
        const made = store.get("eq-made", []);
        made.push(Date.now());
        store.set("eq-made", made.slice(-200));
        stopTimer();
        track("prompt_done", { prompt_id: p.id });
        toast("Nice. That counts.");
        refreshPromptCards();
    }
    function sharePrompt(p) {
        const text = `Try this with me (${p.minutes} min): ${p.text}\n(from The Equilibrium)`;
        track("prompt_share", { prompt_id: p.id });
        (async () => {
            try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
            try { await navigator.clipboard.writeText(text); toast("Prompt copied. Send it to a friend."); }
            catch (e) { toast("Couldn't copy. Long-press the prompt text to copy it."); }
        })();
    }
    function showsPrompt() {
        if (need === "make") return true;
        if (need === "break") return sub === null || sub === "Art & making" || sub === "Calm my mind";
        return false;
    }

    /* ---------- Research-backed swaps (doomscrolling tab) ----------
     * One featured idea at a time, the rest as quiet rows, research behind a tap.
     */
    const SWAPS = typeof SCROLL_SWAPS !== "undefined" ? SCROLL_SWAPS : [];
    const SETTINGS = typeof SCROLL_SETTINGS !== "undefined" ? SCROLL_SETTINGS : [];
    const SWAP_BY_ID = new Map(SWAPS.concat(SETTINGS).map(x => [x.id, x]));
    const EVIDENCE_LABEL = { strong: "Strong evidence", good: "Good evidence", early: "Early evidence" };
    let featuredSwap = SWAPS.length ? SWAPS[0].id : null;
    const swapTimer = { id: null, left: 0, running: false, handle: null, done: false };

    function swapTimerLabel(x) {
        if (swapTimer.id !== x.id) return `Start ${x.minutes}-min timer`;
        if (swapTimer.done) return "Done. Nice work";
        return swapTimer.running ? `${fmt(swapTimer.left)} · Pause` : `${fmt(swapTimer.left)} · Resume`;
    }
    function swapPrimaryHtml(x) {
        const a = x.action;
        if (a && a.copy) return `<button type="button" class="btn btn-primary" data-swap-copy="${esc(x.id)}">${esc(a.label)}</button>`;
        if (a && a.prompt) return `<button type="button" class="btn btn-primary" data-need-jump="make">${esc(a.label)}</button>`;
        if (a && a.need) return `<button type="button" class="btn btn-primary" data-need-jump="${esc(a.need)}" data-sub-jump="${esc(a.sub || "")}">${esc(a.label)}</button>`;
        return `<button type="button" class="btn btn-primary" data-swap-timer="${esc(x.id)}">${swapTimerLabel(x)}</button>`;
    }
    function whyHtml(x) {
        return `<details class="swap-why">
            <summary>Why this works <span class="evidence-badge evidence-${esc(x.evidence)}">${EVIDENCE_LABEL[x.evidence] || ""}</span></summary>
            <p>${esc(x.why)} <a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer" data-swap-source="${esc(x.id)}">${esc(x.source)}</a></p>
        </details>`;
    }
    /* ---------- Three good things: type, speak, or tap ---------- */
    const GOOD_CHIPS = ["Family", "Friends", "Health", "Pets", "Nature", "Good food", "Rest", "Music", "A win at school", "Kindness", "Laughter", "Nice weather"];
    const goodState = { items: ["", "", ""], saved: false };
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    let listening = null;

    function goodThingsHtml() {
        const used = new Set(goodState.items.map(v => v.trim().toLowerCase()));
        if (goodState.saved) {
            const days = goodDaysThisWeek();
            return `<div class="gt-done" aria-live="polite">
                <p class="gt-done-title">Saved. Nice.</p>
                <ol class="gt-done-list">${goodState.items.filter(Boolean).map(v => `<li>${esc(v)}</li>`).join("")}</ol>
                <p class="gt-note">${days > 1 ? `You've noted good things on ${days} days this week.` : "Come back tonight or tomorrow and add three more."}</p>
                <div class="swap-actions">
                    <button type="button" class="btn btn-ghost" data-gt-edit>Edit</button>
                    <button type="button" class="btn btn-ghost" data-swap-next>Another idea</button>
                </div>
            </div>`;
        }
        return `<div class="gt-journal">
            <div class="gt-chips" role="group" aria-label="Quick picks">
                ${GOOD_CHIPS.map(c => `<button type="button" class="gt-chip${used.has(c.toLowerCase()) ? " active" : ""}" data-gt-chip="${esc(c)}" aria-pressed="${used.has(c.toLowerCase())}">${esc(c)}</button>`).join("")}
            </div>
            <ol class="gt-list">
                ${goodState.items.map((v, i) => `
                <li>
                    <label class="sr-only" for="gt${i}">Good thing ${i + 1}</label>
                    <input type="text" id="gt${i}" class="gt-input" data-gt-input="${i}" value="${esc(v)}" maxlength="140" placeholder="${["Something good today", "Another one", "One more"][i]}" autocomplete="off">
                    ${SpeechRec ? `<button type="button" class="gt-mic${listening === i ? " on" : ""}" data-gt-mic="${i}" aria-label="${listening === i ? "Stop listening" : `Say good thing ${i + 1}`}" title="Speak">${listening === i ? "■" : "🎤"}</button>` : ""}
                </li>`).join("")}
            </ol>
            <p class="gt-msg" id="gtMsg" hidden></p>
            <div class="swap-actions">
                <button type="button" class="btn btn-primary" data-gt-save>Save my three</button>
                <button type="button" class="btn btn-ghost" data-swap-next>Another idea</button>
            </div>
            <p class="gt-note">Saved only on this device.${SpeechRec ? " Voice uses your browser's speech service." : ""} Your keyboard's mic works too.</p>
        </div>`;
    }
    function goodDaysThisWeek() {
        const since = Date.now() - 7 * 864e5;
        return new Set(store.get("eq-good", []).filter(e => e.t > since).map(e => new Date(e.t).toDateString())).size;
    }
    function gtRefresh(focusId) {
        const panel = document.querySelector(".swap-feature[data-swap='three-good'] .gt-journal, .swap-feature[data-swap='three-good'] .gt-done");
        if (!panel) return;
        panel.outerHTML = goodThingsHtml();
        if (focusId) document.getElementById(focusId)?.focus();
    }
    function gtMsg(t) { const m = document.getElementById("gtMsg"); if (m) { m.textContent = t; m.hidden = !t; } }
    function gtListen(i) {
        if (listening === i) { listening = null; try { gtListen.rec && gtListen.rec.stop(); } catch (e) { /* ignore */ } gtRefresh(); return; }
        try { gtListen.rec && gtListen.rec.abort(); } catch (e) { /* ignore */ }
        const rec = new SpeechRec();
        rec.lang = "en-US"; rec.interimResults = true; rec.maxAlternatives = 1;
        rec.onresult = ev => {
            const text = Array.from(ev.results).map(r => r[0].transcript).join(" ").trim();
            goodState.items[i] = text.charAt(0).toUpperCase() + text.slice(1);
            const input = document.getElementById("gt" + i); if (input) input.value = goodState.items[i];
        };
        rec.onerror = ev => {
            listening = null; gtRefresh();
            gtMsg(ev.error === "not-allowed" || ev.error === "service-not-allowed"
                ? "The microphone is blocked here. Allow it in your browser settings, or use your keyboard's mic."
                : ev.error === "no-speech" ? "Didn't catch that. Tap the mic and try again." : "Voice isn't working right now. You can type instead.");
        };
        rec.onend = () => { if (listening === i) { listening = null; gtRefresh(); } };
        gtListen.rec = rec; listening = i;
        try { rec.start(); gtRefresh(); gtMsg("Listening…"); track("good_things_voice"); }
        catch (e) { listening = null; gtMsg("Voice isn't available here. You can type instead."); }
    }
    document.addEventListener("input", e => {
        const el = e.target.closest("[data-gt-input]");
        if (el) goodState.items[+el.dataset.gtInput] = el.value;
    });
    document.addEventListener("click", e => {
        const chip = e.target.closest("[data-gt-chip]");
        if (chip) {
            const v = chip.dataset.gtChip;
            const at = goodState.items.findIndex(x => x.trim().toLowerCase() === v.toLowerCase());
            if (at >= 0) goodState.items[at] = "";                    // tap again to remove
            else {
                const empty = goodState.items.findIndex(x => !x.trim());
                if (empty >= 0) goodState.items[empty] = v;
                else { gtRefresh(); gtMsg("All three are filled. Clear one to swap it."); return; }
            }
            gtRefresh(); track("good_things_chip", { chip: v }); return;
        }
        const mic = e.target.closest("[data-gt-mic]");
        if (mic) { gtListen(+mic.dataset.gtMic); return; }
        if (e.target.closest("[data-gt-save]")) {
            const items = goodState.items.map(x => x.trim()).filter(Boolean);
            if (!items.length) { gtMsg("Add at least one good thing first."); return; }
            const log = store.get("eq-good", []); log.push({ t: Date.now(), items }); store.set("eq-good", log.slice(-60));
            goodState.saved = true; track("good_things_saved", { count: items.length }); gtRefresh(); return;
        }
        if (e.target.closest("[data-gt-edit]")) { goodState.saved = false; gtRefresh("gt0"); }
    });

    function swapPanelHtml() {
        const x = SWAP_BY_ID.get(featuredSwap) || SWAPS[0];
        if (!x) return "";
        const others = SWAPS.filter(o => o.id !== x.id);
        return `
        <section class="swap-panel" aria-label="Things to do instead of scrolling">
            <article class="swap-feature" data-swap="${esc(x.id)}">
                <p class="swap-eyebrow">Try this instead · ${x.minutes} min</p>
                <h3 class="swap-title"><span class="swap-icon" aria-hidden="true">${x.icon || ""}</span>${esc(x.title)}</h3>
                <p class="swap-how">${esc(x.how)}</p>
                ${x.id === "three-good" ? goodThingsHtml() : `
                <div class="swap-actions">
                    ${swapPrimaryHtml(x)}
                    <button type="button" class="btn btn-ghost" data-swap-next>Another idea</button>
                </div>`}
                ${whyHtml(x)}
            </article>

            <div class="swap-list">
                <p class="swap-list-label">More ways to put the phone down</p>
                ${others.map(o => `
                <button type="button" class="swap-row" data-swap-pick="${esc(o.id)}">
                    <span class="swap-icon" aria-hidden="true">${o.icon || ""}</span>
                    <span class="swap-row-title">${esc(o.title)}</span>
                    <span class="swap-row-time">${o.minutes} min</span>
                </button>`).join("")}
            </div>

            ${SETTINGS.length ? `
            <details class="swap-settings">
                <summary><span class="swap-icon" aria-hidden="true">📱</span>Make scrolling less sticky <span class="swap-row-time">${SETTINGS.length} phone settings</span></summary>
                ${SETTINGS.map(st => `
                <div class="swap-setting" data-swap="${esc(st.id)}">
                    <h4>${esc(st.title)}</h4>
                    <p>${esc(st.how)}</p>
                    ${whyHtml(st)}
                </div>`).join("")}
            </details>` : ""}
        </section>`;
    }
    function swapsToShow() {
        // The swap panel shows on "All" for this tab; the game filters show games only.
        return need === "doomscroll" && sub === null ? SWAPS.concat(SETTINGS) : [];
    }
    function refreshSwapPanel(focusSel) {
        const panel = document.querySelector(".swap-panel");
        if (!panel) return;
        panel.outerHTML = swapPanelHtml();
        if (focusSel) document.querySelector(focusSel)?.focus({ preventScroll: true });
    }
    function setFeatured(id) {
        featuredSwap = id;
        if (swapTimer.id && swapTimer.id !== id) { clearInterval(swapTimer.handle); swapTimer.id = null; }
        track("swap_show", { swap_id: id });
        refreshSwapPanel(".swap-feature .swap-title");
        const f = document.querySelector(".swap-feature");
        if (f && f.getBoundingClientRect().top < 70) f.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function toggleSwapTimer(x) {
        if (swapTimer.id === x.id && swapTimer.done) return;
        if (swapTimer.id !== x.id) {
            clearInterval(swapTimer.handle);
            Object.assign(swapTimer, { id: x.id, left: x.minutes * 60, running: true, done: false });
            track("swap_timer_start", { swap_id: x.id });
        } else swapTimer.running = !swapTimer.running;
        clearInterval(swapTimer.handle);
        const paint = () => document.querySelectorAll(`[data-swap-timer="${x.id}"]`).forEach(b => { b.textContent = swapTimerLabel(x); });
        if (swapTimer.running) {
            swapTimer.handle = setInterval(() => {
                swapTimer.left -= 1;
                if (swapTimer.left <= 0) {
                    clearInterval(swapTimer.handle); swapTimer.running = false; swapTimer.done = true;
                    track("swap_done", { swap_id: x.id }); toast("Done. That counts.");
                }
                paint();
            }, 1000);
        }
        paint();
    }

    /* ---------- Container exercise ---------- */
    const CE_OPTS = typeof CONTAINER_OPTIONS !== "undefined" ? CONTAINER_OPTIONS : null;
    let ceKind = store.get("eq-container", "submarine");
    let ceStep = -1;
    let ceBreathTimer = null;
    let ceReturnFocus = null;

    function toolCardHtml() {
        return `
        <article class="res-card tool-card">
            <div>
                <div class="res-header-meta">
                    <span class="res-category">Guided exercise · about 4 min</span>
                    <span class="where-badge">Anywhere</span>
                </div>
                <h3 class="res-title">Set it aside: the container exercise</h3>
                <p class="res-desc">For when you're overwhelmed but need to switch gears. Picture a strong container, put what you don't need right now inside, and send it away until you're ready to come back to it.</p>
            </div>
            <div>
                <div class="res-tags-list">
                    <span class="res-tag">Mindfulness</span>
                    <span class="res-tag">Trauma-informed</span>
                    <span class="res-tag">On your own</span>
                </div>
                <div class="card-actions">
                    <button type="button" class="btn btn-primary btn-sm" data-open-container>Start the exercise</button>
                </div>
            </div>
        </article>`;
    }
    function showsTool() {
        if (!CE_OPTS || prefs.social === "connect") return false;
        return need === "break" && (sub === null || sub === "Calm my mind");
    }

    /* ---------- Read aloud (the browser's built-in voice, runs on the device) ---------- */
    const TTS = "speechSynthesis" in window ? window.speechSynthesis : null;
    let autoRead = store.get("eq-ce-read", false);
    let calmVoice = null;
    function pickVoice() {
        if (!TTS) return null;
        const vs = TTS.getVoices().filter(v => /^en(-|_|$)/i.test(v.lang));
        // Prefer softer, natural-sounding voices when the device has them.
        const pref = [/samantha/i, /ava/i, /allison/i, /natural/i, /google us english/i, /serena/i, /karen/i, /moira/i];
        for (const re of pref) { const v = vs.find(x => re.test(x.name)); if (v) return v; }
        return vs.find(v => /en-US/i.test(v.lang)) || vs[0] || null;
    }
    if (TTS) { calmVoice = pickVoice(); TTS.onvoiceschanged = () => { calmVoice = pickVoice(); }; }
    function speak(text, onEnd) {
        if (!TTS) return;
        TTS.cancel();
        const u = new SpeechSynthesisUtterance(text);
        if (calmVoice) u.voice = calmVoice;
        u.rate = 0.88; u.pitch = 1; u.volume = 1;
        u.onend = () => { setSpeaking(false); if (onEnd) onEnd(); };
        u.onerror = () => setSpeaking(false);
        setSpeaking(true);
        TTS.speak(u);
    }
    function stopSpeaking() { if (TTS) TTS.cancel(); setSpeaking(false); }
    function setSpeaking(on) {
        const b = document.querySelector("[data-ce-listen]");
        if (b) { b.classList.toggle("on", on); b.textContent = on ? "■ Stop" : "🔊 Listen"; b.setAttribute("aria-pressed", String(on)); }
    }
    function currentStepText() {
        if (ceStep < 0) return "Set it aside for now. When you're overwhelmed but need to switch gears, picture a strong container and put what you don't need right now inside. This isn't about forgetting. You can come back to it later, on purpose, when you're ready.";
        const st = containerSteps(CE_OPTS[ceKind])[ceStep];
        return st.title + ". " + st.text;
    }
    function listenHtml() {
        if (!TTS) return "";
        return `<div class="ce-listen">
            <button type="button" class="ce-listen-btn" data-ce-listen aria-pressed="false">🔊 Listen</button>
            <label class="ce-autoread"><input type="checkbox" id="ceAutoRead" ${autoRead ? "checked" : ""}> Read each step to me</label>
        </div>`;
    }

    function ceRender() {
        const body = $("#ceBody");
        clearInterval(ceBreathTimer);
        if (ceStep < 0) {
            body.innerHTML = `
                <p class="ce-eyebrow">Guided exercise · about 4 minutes</p>
                ${window.EQ_SCENES ? window.EQ_SCENES.sceneHtml("dawn", "Soft dawn light over distant hills") : ""}
                <h2 id="ceTitle" tabindex="-1">Set it aside for now</h2>
                ${listenHtml()}
                <p class="ce-text">When you're overwhelmed but need to switch gears, picture a strong container and put what you don't need right now inside. This isn't about forgetting. You can come back to it later, on purpose, when you're ready.</p>
                <p class="ce-label">Choose your container</p>
                <div class="ce-options" role="radiogroup" aria-label="Choose your container">
                    ${Object.entries(CE_OPTS).map(([k, o]) => `
                        <button type="button" role="radio" class="ce-option${k === ceKind ? " active" : ""}" aria-checked="${k === ceKind}" data-ce-kind="${k}">
                            <strong>${esc(o.label)}</strong><span>${esc(o.note)}</span>
                        </button>`).join("")}
                </div>
                <div class="ce-nav"><button type="button" class="btn btn-primary" data-ce-next>Begin</button></div>
                <p class="ce-fine">A trauma-informed exercise. You can stop anytime. If what comes up feels like too much to set aside, <button type="button" class="link-btn" data-ce-support>talk to someone</button>.</p>`;
            return;
        }
        const steps = containerSteps(CE_OPTS[ceKind]);
        const st = steps[ceStep];
        body.innerHTML = `
            <p class="ce-eyebrow">Step ${ceStep + 1} of ${steps.length}</p>
            <div class="ce-dots" aria-hidden="true">${steps.map((_, i) => `<span class="${i <= ceStep ? "on" : ""}"></span>`).join("")}</div>
            ${window.EQ_SCENES && window.EQ_SCENES.STEP_SCENES[ceStep] ? window.EQ_SCENES.sceneHtml(...window.EQ_SCENES.STEP_SCENES[ceStep]) : ""}
            <h2 id="ceTitle" tabindex="-1">${esc(st.title)}</h2>
            ${listenHtml()}
            <p class="ce-text ce-step-text">${esc(st.text)}</p>
            ${st.breathe ? `<div class="ce-breath">
                <div class="ce-patterns" role="radiogroup" aria-label="Breathing pattern">
                    ${Object.entries(BREATH_PATTERNS).map(([k, b]) => `<button type="button" role="radio" class="ce-pattern${k === breathKind ? " active" : ""}" aria-checked="${k === breathKind}" data-breath="${k}">${esc(b.label)}</button>`).join("")}
                </div>
                <div class="ce-circle-wrap">
                    <div class="ce-circle" id="ceCircle"></div>
                    <span class="ce-count" id="ceCount" aria-hidden="true"></span>
                </div>
                <p class="ce-phase" id="ceBreathLabel" aria-live="polite">Get comfortable</p>
                <p class="ce-rounds" id="ceRounds"></p>
                <p class="ce-breath-note">${esc(BREATH_PATTERNS[breathKind].note)} If holding feels uncomfortable, choose “No holds” or just breathe normally.</p>
            </div>` : ""}
            ${st.last ? `
                <div class="ce-nav ce-nav-end">
                    <button type="button" class="btn btn-primary" data-ce-done>Back to my day</button>
                    <button type="button" class="btn btn-ghost" data-ce-goto="study">Find a study spot</button>
                    <button type="button" class="btn btn-ghost" data-ce-goto="break">Take a break</button>
                </div>` : `
                <div class="ce-nav">
                    <button type="button" class="btn btn-ghost" data-ce-back>Back</button>
                    <button type="button" class="btn btn-primary" data-ce-next>Next</button>
                </div>`}`;
        if (st.breathe) ceBreathe();
        if (TTS) { stopSpeaking(); if (autoRead) setTimeout(() => speak(currentStepText()), 250); }
        body.querySelector("h2").focus({ preventScroll: true });
        $("#ceOverlay").scrollTop = 0;
    }
    /*
     * Breathing patterns. Default "Gentle": a longer exhale (Balban et al., 2023) with short pauses.
     * Holds stay brief and optional, since long holds can cause air hunger for anxious or trauma-affected people.
     */
    const BREATH_PATTERNS = {
        gentle: { label: "Gentle (4-2-6-2)", note: "Breathe in 4, hold 2, breathe out 6, pause 2.", steps: [["in", 4], ["hold", 2], ["out", 6], ["rest", 2]] },
        box: { label: "Box (4-4-4-4)", note: "Breathe in 4, hold 4, breathe out 4, hold 4.", steps: [["in", 4], ["hold", 4], ["out", 4], ["rest", 4]] },
        noholds: { label: "No holds (4-6)", note: "Breathe in 4, breathe out 6.", steps: [["in", 4], ["out", 6]] }
    };
    let breathKind = store.get("eq-breath", "gentle");
    if (!BREATH_PATTERNS[breathKind]) breathKind = "gentle";
    const PHASE_WORDS = { in: "Breathe in", hold: "Hold", out: "Breathe out slowly", rest: "Pause" };
    const ROUNDS = 4;

    function ceBreathe() {
        const circle = $("#ceCircle"), label = $("#ceBreathLabel"), count = $("#ceCount"), roundsEl = $("#ceRounds");
        const steps = BREATH_PATTERNS[breathKind].steps;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let round = 0, si = 0, sec = 0;
        const startStep = () => {
            const [phase, len] = steps[si];
            label.textContent = PHASE_WORDS[phase];
            if (autoRead && TTS) { TTS.cancel(); const u = new SpeechSynthesisUtterance(PHASE_WORDS[phase]); if (calmVoice) u.voice = calmVoice; u.rate = 0.8; TTS.speak(u); }
            count.textContent = "1";
            roundsEl.textContent = `Breath ${round + 1} of ${ROUNDS}`;
            // Circle grows while breathing in, stays still while holding, shrinks while breathing out.
            circle.style.transitionDuration = reduce ? "0s" : (phase === "in" || phase === "out" ? len + "s" : "0s");
            if (phase === "in") circle.classList.remove("out");
            if (phase === "out") circle.classList.add("out");
            circle.dataset.phase = phase;
        };
        // Start small, then begin.
        circle.style.transitionDuration = "0s"; circle.classList.add("out");
        count.textContent = "";
        clearInterval(ceBreathTimer);
        setTimeout(() => {
            startStep();
            ceBreathTimer = setInterval(() => {
                sec += 1;
                const len = steps[si][1];
                if (sec < len) { count.textContent = String(sec + 1); return; }
                sec = 0; si += 1;
                if (si >= steps.length) { si = 0; round += 1; }
                if (round >= ROUNDS) {
                    clearInterval(ceBreathTimer);
                    label.textContent = "Nice. Continue when you're ready.";
                    count.textContent = "✓"; roundsEl.textContent = "";
                    circle.dataset.phase = "done";
                    return;
                }
                startStep();
            }, 1000);
        }, 600);
    }

    function ceOpen() {
        if (!CE_OPTS) return;
        ceReturnFocus = document.activeElement;
        ceStep = -1;
        $("#ceOverlay").hidden = false;
        document.documentElement.classList.add("ce-lock");
        ceRender();
        $("#ceTitle").focus({ preventScroll: true });
        track("container_open");
    }
    function ceClose(reason) {
        clearInterval(ceBreathTimer);
        if (typeof stopSpeaking === "function") stopSpeaking();
        $("#ceOverlay").hidden = true;
        document.documentElement.classList.remove("ce-lock");
        track("container_close", { step: ceStep + 1, reason });
        if (ceReturnFocus && ceReturnFocus.focus) ceReturnFocus.focus({ preventScroll: true });
    }
    function wireContainer() {
        if (!CE_OPTS) {
            document.querySelectorAll("[data-open-container]").forEach(b => { b.hidden = true; });
            return;
        }
        document.addEventListener("click", e => {
            if (e.target.closest("[data-open-container]")) { ceOpen(); return; }
            if (!e.target.closest("#ceOverlay")) return;
            const kind = e.target.closest("[data-ce-kind]");
            if (kind) { ceKind = kind.dataset.ceKind; store.set("eq-container", ceKind); ceRender(); return; }
            if (e.target.closest("[data-ce-next]")) { ceStep += 1; if (ceStep === 0) track("container_begin", { container: ceKind }); ceRender(); return; }
            if (e.target.closest("[data-ce-back]")) { ceStep -= 1; ceRender(); return; }
            if (e.target.closest("[data-ce-listen]")) {
                if (TTS && TTS.speaking) stopSpeaking(); else { speak(currentStepText()); track("container_listen", { step: ceStep + 1 }); }
                return;
            }
            const bp = e.target.closest("[data-breath]");
            if (bp) { breathKind = bp.dataset.breath; store.set("eq-breath", breathKind); track("breath_pattern", { pattern: breathKind }); ceRender(); return; }
            if (e.target.closest("[data-ce-done]")) { track("container_done", { container: ceKind }); ceClose("done"); toast("You set it aside. It's there when you're ready."); return; }
            const go = e.target.closest("[data-ce-goto]");
            if (go) { track("container_done", { container: ceKind }); ceClose("done"); setMode("guide"); selectNeed(go.dataset.ceGoto, { scroll: true }); return; }
            if (e.target.closest("[data-ce-support]")) { ceClose("support"); setMode("guide"); selectNeed("support", { scroll: true }); return; }
            if (e.target.closest("#ceClose")) { ceClose("stopped"); return; }
        });
        document.addEventListener("change", e => {
            if (e.target.id !== "ceAutoRead") return;
            autoRead = e.target.checked; store.set("eq-ce-read", autoRead);
            track("container_autoread", { on: autoRead });
            if (autoRead) speak(currentStepText()); else stopSpeaking();
        });
        document.addEventListener("keydown", e => {
            if ($("#ceOverlay").hidden) return;
            if (e.key === "Escape") ceClose("stopped");
            if (e.key === "Tab") {
                const f = Array.from($("#ceOverlay").querySelectorAll("button"));
                if (!f.length) return;
                const first = f[0], last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });
    }

    /* ---------- Surprise me ---------- */
    let queue = [];
    let current = null;
    function surprisePool() {
        return ALL.filter(i => i.category !== "support" && i.id !== "worried-someone" && passesPrefs(i));
    }
    function nextSurprise() {
        if (!queue.length) {
            queue = surprisePool().map(i => i.id).sort(() => Math.random() - 0.5);
            if (current && queue.length > 1 && queue[0] === current.id) queue.push(queue.shift());
            // Every third pick is a small art or imagination prompt.
            if (PROMPTS.length) for (let k = 2; k < queue.length + 1; k += 3) queue.splice(k, 0, "PROMPT");
        }
        const id = queue.shift();
        const box = $("#surpriseCard");
        if (id === "PROMPT") {
            nextPrompt();
            if (currentPrompt) {
                current = { prompt: true };
                box.innerHTML = promptCardHtml(currentPrompt, "Try this now");
                return;
            }
            return nextSurprise();
        }
        current = id ? byId.get(id) : null;
        if (!current) {
            box.innerHTML = `<div class="results-empty">Nothing matches these preferences. <br><button type="button" class="btn btn-ghost" data-reset-prefs>Reset preferences</button></div>`;
            return;
        }
        box.innerHTML = cardHtml(current);
        track("surprise_show", { item_id: current.id });
    }
    function needForItem(item) {
        for (const key of ["study", "doomscroll", "outdoors", "move", "break", "explore"]) if (NEED[key].test(item)) return key;
        return "start";
    }

    /* ---------- Saved + share ---------- */
    function updateSavedCounts() {
        document.querySelectorAll("[data-saved-count]").forEach(el => { el.textContent = saved.size; });
    }
    function toggleSave(id, btn) {
        const item = byId.get(id);
        if (saved.has(id)) { saved.delete(id); toast("Removed from saved"); }
        else { saved.add(id); toast("Saved. Find it under “My saved.”"); track("save_item", { item_id: id }); }
        store.set("eq-saved", Array.from(saved));
        updateSavedCounts();
        document.querySelectorAll(`.res-card[data-id="${CSS.escape(id)}"] [data-save]`).forEach(b => {
            const on = saved.has(id);
            b.setAttribute("aria-pressed", String(on));
            b.textContent = on ? "♥ Saved" : "♡ Save";
            b.setAttribute("aria-label", (on ? "Remove from saved: " : "Save: ") + (item ? item.title : ""));
        });
        if (need === "saved") renderResults();
    }
    async function share(id) {
        const item = byId.get(id);
        if (!item) return;
        const text = `${item.title}: ${item.url}\n(found on The Equilibrium, UT/Austin wellness hub)`;
        track("share_item", { item_id: id });
        try {
            if (navigator.share) { await navigator.share({ title: item.title, text, url: item.url }); return; }
        } catch (e) { if (e && e.name === "AbortError") return; }
        try {
            await navigator.clipboard.writeText(text);
            toast("Link copied. Paste it to a friend or group chat.");
        } catch (e) {
            toast(item.url);
        }
    }

    let toastTimer;
    function toast(msg) {
        const t = $("#toast");
        t.textContent = msg;
        t.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
    }

    /* ---------- Wiring ---------- */
    function setMode(mode) {
        const tabs = { guide: ["#tabGuide", "#guidePanel"], surprise: ["#tabSurprise", "#surprisePanel"], calm: ["#tabCalm", "#calmPanel"] };
        Object.entries(tabs).forEach(([k, [tab, panel]]) => {
            const on = k === mode, t = $(tab), pnl = $(panel);
            if (!t || !pnl) return;
            t.classList.toggle("active", on);
            t.setAttribute("aria-selected", String(on));
            pnl.hidden = !on;
        });
        if (mode === "surprise") { queue = []; nextSurprise(); }
        track("mode_select", { mode });
    }

    // Calm me: the research-backed swaps, as safe ways to steady yourself. Tap one to open it.
    function renderCalmMore() {
        const box = $("#calmMore");
        if (!box || typeof SWAPS === "undefined") return;
        box.innerHTML = SWAPS.filter(x => x.id !== "make-art").map(x => `
            <button type="button" class="swap-row" data-calm-swap="${esc(x.id)}">
                <span class="swap-icon" aria-hidden="true">${x.icon || ""}</span>
                <span class="swap-row-title">${esc(x.title)}</span>
                <span class="swap-row-time">${x.minutes} min</span>
            </button>`).join("");
    }
    document.addEventListener("click", e => {
        const b = e.target.closest("[data-calm-swap]");
        if (!b) return;
        track("calm_choice", { choice: b.dataset.calmSwap });
        setMode("guide");
        selectNeed("doomscroll");
        setFeatured(b.dataset.calmSwap);
        document.querySelector(".swap-feature")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Calm me: "Make something" shows a creative prompt right inside the panel.
    function showCalmPrompt() {
        const box = $("#calmPrompt"), btn = $("#calmMake");
        if (!box) return;
        if (!currentPrompt || !promptFits(currentPrompt)) nextPrompt();
        box.innerHTML = currentPrompt ? promptCardHtml(currentPrompt, "Try this now") : "";
        box.hidden = false;
        btn.classList.add("active"); btn.setAttribute("aria-expanded", "true");
        track("calm_choice", { choice: "make" });
    }

    function selectNeed(key, opts) {
        need = key; sub = null; showAll = false;
        document.querySelectorAll(".need-card, .link-btn[data-need]").forEach(c => c.classList.toggle("active", c.dataset.need === key));
        renderResults();
        track("need_select", { need: key });
        if (opts && opts.scroll) {
            const r = $("#results").getBoundingClientRect();
            if (r.top > window.innerHeight * 0.6 || r.top < 0) $("#results").scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function syncPrefChips() {
        const picked = [];
        document.querySelectorAll(".pref-chip").forEach(c => {
            const on = prefs[c.dataset.pref] === c.dataset.value;
            c.classList.toggle("active", on);
            c.setAttribute("aria-pressed", String(on));
            if (on && c.dataset.value !== "any") picked.push(c.textContent);
        });
        const sum = $("#prefsSummary");
        if (sum) sum.textContent = picked.length ? "· " + picked.join(", ") : "";
    }

    function init() {
        // Turn the original "browse" area on by default (shows all resources + all study spots).
        const allIdeas = document.querySelector("#library .filter-tags-row .filter-chip");
        if (allIdeas) allIdeas.click();
        const allSpots = document.querySelector('.study-filter-chip[data-study-filter="all"]');
        if (allSpots) allSpots.click();

        $("#tabGuide").addEventListener("click", () => setMode("guide"));
        $("#tabSurprise").addEventListener("click", () => setMode("surprise"));
        $("#tabCalm")?.addEventListener("click", () => setMode("calm"));
        $("#calmMake")?.addEventListener("click", showCalmPrompt);
        renderCalmMore();
        $("#surpriseNext").addEventListener("click", () => { track("surprise_next"); nextSurprise(); });
        $("#surpriseMore").addEventListener("click", () => {
            const key = current ? (current.prompt ? "make" : needForItem(current)) : "start";
            setMode("guide");
            selectNeed(key, { scroll: true });
        });

        document.querySelectorAll(".need-card, .link-btn[data-need]").forEach(card => {
            card.addEventListener("click", () => selectNeed(card.dataset.need, { scroll: true }));
        });
        document.querySelectorAll("[data-open-saved]").forEach(a => a.addEventListener("click", e => {
            e.preventDefault();
            setMode("guide");
            selectNeed("saved");
            $("#results").scrollIntoView({ behavior: "smooth", block: "start" });
        }));

        document.querySelectorAll(".pref-chip").forEach(chip => {
            chip.addEventListener("click", () => {
                prefs[chip.dataset.pref] = chip.dataset.value;
                store.set("eq-prefs", prefs);
                syncPrefChips();
                track("pref_change", { pref: chip.dataset.pref, value: chip.dataset.value });
                showAll = false;
                promptQueue = [];
                renderResults();
                if (!$("#surprisePanel").hidden) { queue = []; nextSurprise(); }
            });
        });

        $("#showMoreBtn").addEventListener("click", () => { showAll = true; renderResults(); });

        // Delegated card actions (works for results, surprise card)
        document.addEventListener("click", e => {
            const pc = e.target.closest(".prompt-card[data-prompt]");
            if (pc && currentPrompt) {
                if (e.target.closest("[data-timer]")) { startOrToggleTimer(currentPrompt); return; }
                if (e.target.closest("[data-prompt-done]")) { markDone(currentPrompt); return; }
                if (e.target.closest("[data-prompt-next]")) { nextPrompt(); refreshPromptCards(); return; }
                if (e.target.closest("[data-prompt-share]")) { sharePrompt(currentPrompt); return; }
            }
            const card = e.target.closest(".res-card[data-id]");
            if (e.target.closest("[data-reset-prefs]")) {
                prefs.social = "any"; prefs.where = "any"; prefs.cost = "any";
                store.set("eq-prefs", prefs); syncPrefChips(); renderResults();
                if (!$("#surprisePanel").hidden) { queue = []; nextSurprise(); }
                return;
            }
            if (!card) return;
            const id = card.dataset.id;
            if (e.target.closest("[data-save]")) { toggleSave(id, e.target); return; }
            if (e.target.closest("[data-share]")) { share(id); return; }
            if (e.target.closest("[data-open]")) track("resource_open", { item_id: id, need });
        });

        // Track opens in the original library and study grids too.
        ["#resourceGrid", "#studySpotsGrid"].forEach(sel => {
            const g = $(sel);
            if (g) g.addEventListener("click", e => {
                const a = e.target.closest("a.res-link");
                if (a) track("resource_open", { item_title: (a.closest(".res-card")?.querySelector(".res-title")?.textContent || "").trim(), from: sel.slice(1) });
            });
        });

        document.addEventListener("click", e => {
            if (e.target.closest("[data-suggest]")) window.open(SITE_CONFIG.websiteFeedbackUrl, "_blank", "noopener");
        });

        // Photos on the original Study Spot Directory cards.
        const studyGrid = $("#studySpotsGrid");
        if (studyGrid) {
            const addPhotos = () => {
                studyGrid.querySelectorAll(".res-card:not([data-photo])").forEach(card => {
                    card.dataset.photo = "1";
                    const name = (card.querySelector(".res-title")?.textContent || "").trim();
                    const raw = (typeof STUDY_SPOTS !== "undefined" ? STUDY_SPOTS : []).find(s => s.name === name);
                    card.insertAdjacentHTML("afterbegin", photoHtml(name, raw));
                    if (raw) {
                        const desc = card.querySelector(".res-desc");
                        const notes = notesHtml({ tip: raw.tip, quote: raw.quote, safety: raw.safety }) +
                            moreHtml({ description: "", fullDescription: "", tip: raw.tip, quote: raw.quote });
                        const anchor = desc || card.querySelector(".res-title");
                        if (anchor && notes) anchor.insertAdjacentHTML("afterend", notes);
                    }
                });
            };
            new MutationObserver(addPhotos).observe(studyGrid, { childList: true });
            addPhotos();
        }

        wireContainer();

        // About page: shown on its own when the address ends in #about.
        const aboutEl = $("#about");
        // Paste your LinkedIn profile link here; the button stays hidden while this is empty.
        const LINKEDIN_URL = "https://www.linkedin.com/in/natalie-rivas-4127a214b";
        const li = $("#aboutLinkedIn");
        if (li && LINKEDIN_URL) { li.href = LINKEDIN_URL; li.hidden = false; }
        function routeAbout() {
            const on = location.hash === "#about";
            if (!aboutEl) return;
            aboutEl.hidden = !on;
            document.body.classList.toggle("show-about", on);
            document.querySelectorAll("#primary-nav a").forEach(a => a.classList.toggle("active", on ? a.hash === "#about" : a.hash === "#home"));
            if (on) { window.scrollTo(0, 0); track("about_view"); }
        }
        window.addEventListener("hashchange", routeAbout);
        routeAbout();
        document.addEventListener("click", e => {
            const back = e.target.closest("[data-about-back]");
            if (back && location.hash === "#about") {
                // Leave the About page, then go where the link points.
                const target = back.getAttribute("href");
                e.preventDefault();
                history.pushState(null, "", target);
                routeAbout();
                document.querySelector(target)?.scrollIntoView({ behavior: "auto", block: "start" });
            }
        });
        document.addEventListener("click", e => {
            const jump = e.target.closest("[data-need-jump]");
            if (jump) {
                track("swap_action", { swap_id: jump.closest("[data-swap]")?.dataset.swap, to: jump.dataset.needJump });
                if ($("#guidePanel").hidden) setMode("guide");
                selectNeed(jump.dataset.needJump, { scroll: true });
                if (jump.dataset.subJump) { sub = jump.dataset.subJump; renderResults(); }
                return;
            }
            const pick = e.target.closest("[data-swap-pick]");
            if (pick) { setFeatured(pick.dataset.swapPick); return; }
            if (e.target.closest("[data-swap-next]")) {
                const i = SWAPS.findIndex(x => x.id === featuredSwap);
                setFeatured(SWAPS[(i + 1) % SWAPS.length].id);
                return;
            }
            const tm = e.target.closest("[data-swap-timer]");
            if (tm) { toggleSwapTimer(SWAP_BY_ID.get(tm.dataset.swapTimer)); return; }
            const cp = e.target.closest("[data-swap-copy]");
            if (cp) {
                const x = SWAP_BY_ID.get(cp.dataset.swapCopy);
                track("swap_action", { swap_id: x.id, to: "copy" });
                navigator.clipboard.writeText(x.action.copy)
                    .then(() => toast("Copied. Paste it into a text to someone."))
                    .catch(() => toast(x.action.copy));
                return;
            }
            const fb = e.target.closest("[data-feedback]");
            if (fb) track("feedback_open", { from: fb.dataset.feedback });
            const src = e.target.closest("[data-swap-source]");
            if (src) track("swap_source_open", { swap_id: src.dataset.swapSource });
        });
        document.addEventListener("click", e => {
            const v = e.target.closest("[data-video]");
            if (v) track("video_open", { video_id: v.dataset.video });
        });

        // Test strip
        $("#changesToggle")?.addEventListener("click", () => {
            const p = $("#changesPanel");
            p.hidden = !p.hidden;
            $("#changesToggle").setAttribute("aria-expanded", String(!p.hidden));
        });

        // On phones, start with preferences folded so the need buttons are on the first screen.
        const det = $("#prefsDetails");
        if (det && window.matchMedia("(max-width: 768px)").matches) det.open = false;

        syncPrefChips();
        updateSavedCounts();
        renderResults();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
    else init();
})();

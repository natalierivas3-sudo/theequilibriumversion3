/*
 * Draft v58: quicker paths to wellness help.
 * - Shortcut links: #calm opens Calm me, #talk opens Talk to someone, #surprise opens Surprise me.
 *   Handy for Instagram bios, stories, and group chats.
 * - "Share The Equilibrium" button.
 * - "See everything" in an empty search.
 */
(function () {
    "use strict";

    const SITE_URL = "https://natalierivas3-sudo.github.io/theequilibriumversion3/";

    function toast(msg) {
        const t = document.getElementById("toast");
        if (!t) return;
        t.textContent = msg;
        t.hidden = false;
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => { t.hidden = true; }, 2600);
    }

    function openShortcut() {
        const h = location.hash.slice(1);
        const go = {
            calm: () => document.getElementById("tabCalm")?.click(),
            talk: () => {
                document.getElementById("tabGuide")?.click();
                document.querySelector('.need-card[data-need="support"]')?.click();
            },
            surprise: () => document.getElementById("tabSurprise")?.click()
        }[h];
        if (!go) return;
        go();
        requestAnimationFrame(() => {
            const target = h === "talk" ? document.getElementById("results") : document.getElementById("modeSwitch");
            target?.scrollIntoView({ block: "start" });
        });
    }

    function setup() {
        window.addEventListener("hashchange", () => setTimeout(openShortcut, 0));
        setTimeout(openShortcut, 0);

        document.addEventListener("click", async e => {
            if (e.target.closest("[data-share-site]")) {
                const text = "The Equilibrium: free and low-cost ways to feel a little better around UT and Austin.";
                try {
                    if (navigator.share) { await navigator.share({ title: "The Equilibrium", text, url: SITE_URL }); return; }
                } catch (err) { if (err && err.name === "AbortError") return; }
                try {
                    await navigator.clipboard.writeText(text + " " + SITE_URL);
                    toast("Link copied. Paste it to a friend or group chat.");
                } catch (err) {
                    toast(SITE_URL);
                }
            }
            if (e.target.closest("[data-clear-search]")) {
                document.getElementById("clearFiltersBtn")?.click();
                document.getElementById("searchInput")?.focus();
            }
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup, { once: true });
    else setup();
})();

/*
 * Draft v58: study spots map in "Find a study spot", sorted by closest.
 * - Picking "Find a study spot" in Guide me shows the campus map right above the cards.
 * - "Show where I am" sorts the cards closest first and adds walking times.
 *   The location stays on the device: it is only used to sort, never saved or sent.
 */
(function () {
    "use strict";
    const WALK_M_PER_MIN = 80;   // about 3 mph, same as the map
    let here = null;
    let home = null;             // where the map normally lives (Study spots page)

    const geo = name => (window.EQ_SPOT_GEO || (typeof SPOT_GEO !== "undefined" ? SPOT_GEO : {}))[name] || null;
    function meters(a, b) {
        const R = 6371000, rad = x => x * Math.PI / 180;
        const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
        const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(h));
    }

    function sortByClosest(grid) {
        if (!here || !grid) return;
        const cards = Array.from(grid.querySelectorAll(":scope > .res-card"));
        if (!cards.length) return;
        const scored = cards.map((card, i) => {
            const name = (card.querySelector(".res-title")?.textContent || "").trim();
            const g = geo(name);
            const d = g ? Math.min(meters(here, g), ...(g.more || []).map(m => meters(here, m))) : Infinity;
            let badge = card.querySelector(".walk-time");
            if (g) {
                if (!badge) {
                    badge = document.createElement("span");
                    badge.className = "walk-time";
                    card.querySelector(".res-title")?.insertAdjacentElement("beforebegin", badge);
                }
                const mins = Math.max(1, Math.round(d / WALK_M_PER_MIN));
                badge.textContent = mins > 60 ? "Over an hour's walk" : `${mins} min walk`;
            }
            return { card, d, i };
        });
        const order = scored.slice().sort((a, b) => a.d - b.d || a.i - b.i);
        if (order.every((x, k) => x.card === cards[k])) return;   // already in order
        const anchor = cards[cards.length - 1].nextSibling;
        order.forEach(x => grid.insertBefore(x.card, anchor));
    }

    function setup() {
        const wrap = document.getElementById("spotMapWrap");
        const results = document.getElementById("results");
        const title = document.getElementById("resultsTitle");
        const grid = document.getElementById("resultsGrid");
        const studyGrid = document.getElementById("studySpotsGrid");
        if (!wrap || !results || !title || !grid) return;
        home = { parent: wrap.parentNode, next: wrap.nextSibling };

        const hint = document.createElement("p");
        hint.className = "closest-hint";
        hint.textContent = "Tap “Show where I am” to list the closest spots first.";

        const isStudy = () => title.textContent.trim() === "Find a study spot" &&
            !document.getElementById("guidePanel")?.hidden && !document.body.classList.contains("on-page");

        function place() {
            const inGuide = wrap.parentNode === results;
            if (isStudy() && !inGuide) {
                results.querySelector(".results-head").insertAdjacentElement("afterend", wrap);
                wrap.classList.add("in-guide");
                if (!here) wrap.querySelector(".spot-map-head")?.insertAdjacentElement("afterend", hint);
                document.getElementById("mapJump")?.setAttribute("hidden", "");
                setTimeout(() => window.EQ_STUDY_MAP && window.EQ_STUDY_MAP.refresh(), 50);
            } else if (!isStudy() && inGuide) {
                home.parent.insertBefore(wrap, home.next);
                wrap.classList.remove("in-guide");
                hint.remove();
                setTimeout(() => window.EQ_STUDY_MAP && window.EQ_STUDY_MAP.refresh(), 50);
            }
            if (isStudy()) sortByClosest(grid);
        }

        new MutationObserver(place).observe(title, { childList: true, characterData: true, subtree: true });
        new MutationObserver(() => { if (isStudy()) sortByClosest(grid); }).observe(grid, { childList: true });
        if (studyGrid) new MutationObserver(() => sortByClosest(studyGrid)).observe(studyGrid, { childList: true });
        window.addEventListener("hashchange", () => setTimeout(place, 0));
        document.getElementById("tabSurprise")?.addEventListener("click", () => setTimeout(place, 0));
        document.getElementById("tabCalm")?.addEventListener("click", () => setTimeout(place, 0));
        document.getElementById("tabGuide")?.addEventListener("click", () => setTimeout(place, 0));

        document.addEventListener("eq:located", e => {
            here = e.detail;
            hint.remove();
            sortByClosest(grid);
            sortByClosest(studyGrid);
        });
        place();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(setup, 0), { once: true });
    else setTimeout(setup, 0);
})();

/*
 * Draft v58: Calm me check-in.
 * Four main choices stay up front. "Not sure?" asks three short questions:
 *   1. How regulated do you feel? (a 1-5 scale you slide or tap)
 *   2. How much time do you have?   3. What sounds better?
 * At 5 ("Can't cope") it skips the rest: crisis support first, a 1-minute breathing guide,
 * and a button for other ways to cope.
 */
(function () {
    "use strict";
    const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const VIDEO_URL = "https://youtu.be/q1yfvkhmpIw?si=nUoWV-Luk8BvCY6u";
    const INSIGHT_URL = "https://insighttimer.com/";

    const LEVELS = [
        null,
        { key: "steady", label: "Steady", desc: "Mostly calm. I just want a reset." },
        { key: "off", label: "A little off", desc: "Some stress, but I'm handling it." },
        { key: "stressed", label: "Stressed", desc: "Hard to focus or settle down." },
        { key: "overwhelmed", label: "Overwhelmed", desc: "It all feels like too much." },
        { key: "crisis", label: "Can't cope", desc: "I'm not okay, or I might not be safe." }
    ];
    const QUESTIONS = [
        { key: "level", scale: true, q: "How regulated do you feel right now?" },
        { key: "time", q: "How much time do you have?", options: [
            ["4", "A couple of minutes"], ["6", "About 5 minutes"], ["99", "10 minutes or more"]] },
        { key: "style", q: "What sounds better right now?", options: [
            ["guided", "Be guided through it"], ["out", "Let it out"], ["move", "Move or get outside"], ["hands", "Keep my hands busy"]] }
    ];

    // What each option is good for. Points add up; the top three show.
    const SCORES = {
        container:        { stressed: 2, overwhelmed: 3, guided: 3 },
        rant:             { stressed: 1, overwhelmed: 1, out: 3 },
        "cyclic-sighing": { off: 1, stressed: 3, overwhelmed: 2, guided: 2 },
        video:            { off: 1, stressed: 2, overwhelmed: 2, guided: 3 },
        insight:          { steady: 1, off: 2, stressed: 1, guided: 2 },
        "three-good":     { steady: 2, off: 1, out: 1, hands: 2 },
        make:             { steady: 2, off: 2, hands: 3 },
        "move-10":        { steady: 2, off: 2, stressed: 1, move: 3 },
        "go-green":       { steady: 2, off: 2, stressed: 1, move: 3 },
        "reach-out":      { off: 1, overwhelmed: 2, out: 2 },
        "pet-animal":     { steady: 1, off: 1, move: 1 },
        "awe-walk":       { steady: 2, move: 2 }
    };
    const ORDER = Object.keys(SCORES);

    function firstSentence(t) {
        const one = (t.match(/^[^.!?]+[.!?]/) || [t])[0].trim();
        return one.length > 90 ? one.slice(0, 87).replace(/\s+\S*$/, "") + "…" : one;
    }
    function catalog() {
        const swaps = typeof SCROLL_SWAPS !== "undefined" ? SCROLL_SWAPS : [];
        const items = {
            container: { icon: "🌊", title: "Set it aside", sub: "A guided exercise to put what's heavy away for now", minutes: 4, time: "4 min" },
            rant: { icon: "💨", title: "Rant", sub: "Type it out, then let it go. Nothing is saved.", minutes: 2, time: "Private" },
            video: { icon: "▶️", title: "Guided video · 8 min", sub: "Trauma-informed", minutes: 8, time: "8 min" },
            insight: { icon: "🧘", title: "Insight Timer", sub: "Free meditation app: pick any length", minutes: 2, time: "Free app" },
            make: { icon: "✏️", title: "Make something", sub: "A small creative prompt", minutes: 3, time: "2–5 min" }
        };
        ["cyclic-sighing", "move-10", "go-green", "reach-out", "pet-animal", "three-good", "awe-walk"].forEach(id => {
            const x = swaps.find(y => y.id === id);
            if (x) items[id] = { icon: x.icon || "", title: x.title, sub: firstSentence(x.how || ""), minutes: x.minutes, time: `${x.minutes} min`, swap: true };
        });
        if (items["three-good"]) Object.assign(items["three-good"], { title: "3 good things", sub: "Write them down" });
        // A couple of rounds of breathing helps too, so it fits the shortest time.
        if (items["cyclic-sighing"]) Object.assign(items["cyclic-sighing"], { minutes: 2, time: "2–5 min" });
        return items;
    }
    function pick(feel, maxMin, style) {
        const items = catalog();
        return ORDER.filter(id => items[id] && items[id].minutes <= maxMin)
            .map(id => ({ id, score: (SCORES[id][feel] || 0) + (SCORES[id][style] || 0) }))
            .sort((a, b) => b.score - a.score || ORDER.indexOf(a.id) - ORDER.indexOf(b.id))
            .slice(0, 3)
            .map(x => Object.assign({ id: x.id }, items[x.id]));
    }
    function card(it, big) {
        let tag = "button", attrs = `type="button" data-calm-go="${esc(it.id)}"`;
        if (it.id === "video") { tag = "a"; attrs = `href="${VIDEO_URL}" target="_blank" rel="noopener noreferrer"`; }
        else if (it.id === "insight") { tag = "a"; attrs = `href="${INSIGHT_URL}" target="_blank" rel="noopener noreferrer"`; }
        else if (it.swap) attrs = `type="button" data-calm-swap="${esc(it.id)}"`;
        return `<${tag} class="calm-pick${big ? " calm-pick-first" : ""}" ${attrs}>
            <span class="calm-ic" aria-hidden="true">${it.icon}</span>
            <span class="calm-text"><strong>${esc(it.title)}</strong><small>${esc(it.sub)}</small></span>
            <span class="calm-time">${esc(it.time)}</span></${tag}>`;
    }
    function picksHtml(picks, heading) {
        const [first, ...rest] = picks;
        return `<h3 class="calm-step-q">${esc(heading)}</h3>
            ${first ? card(first, true) : ""}
            ${rest.length ? `<p class="calm-or">Or</p><div class="calm-pick-rest">${rest.map(it => card(it, false)).join("")}</div>` : ""}`;
    }

    // ---- 1-minute breathing guide: in 4, out 6, six rounds ----
    let breathTimer = null;
    function stopBreath(box) {
        clearTimeout(breathTimer); breathTimer = null;
        if (!box) return;
        box.classList.remove("breathing", "inhale", "exhale");
        box.querySelector(".breath-word").textContent = "Ready when you are";
        box.querySelector(".breath-count").textContent = "";
        const b = box.querySelector("[data-breath-toggle]"); if (b) b.textContent = "Start breathing";
    }
    function startBreath(box) {
        const word = box.querySelector(".breath-word"), count = box.querySelector(".breath-count");
        const btn = box.querySelector("[data-breath-toggle]");
        btn.textContent = "Stop";
        box.classList.add("breathing");
        let round = 0;
        const phase = (inhale, secs) => {
            box.classList.toggle("inhale", inhale); box.classList.toggle("exhale", !inhale);
            box.style.setProperty("--breath-secs", secs + "s");
            let left = secs;
            const tick = () => {
                word.textContent = inhale ? "Breathe in" : "Breathe out";
                count.textContent = String(left);
                left -= 1;
                if (left >= 0) { breathTimer = setTimeout(tick, 1000); return; }
                if (inhale) phase(false, 6);
                else if (++round < 6) phase(true, 4);
                else { stopBreath(box); word.textContent = "Nice. Go again anytime."; }
            };
            tick();
        };
        phase(true, 4);
    }
    const BREATH_HTML = `
        <div class="breath-box" data-breath>
            <div class="breath-circle" aria-hidden="true"></div>
            <div class="breath-text" aria-live="polite"><span class="breath-word">Ready when you are</span> <span class="breath-count"></span></div>
            <p class="breath-how">In for 4, out for 6. One minute.</p>
            <button type="button" class="btn btn-primary btn-sm" data-breath-toggle>Start breathing</button>
        </div>`;

    function setup() {
        const start = document.getElementById("calmTailorStart");
        const steps = document.getElementById("calmSteps");
        const all = document.getElementById("calmAll");
        if (!start || !steps) return;
        let answers = {}, step = 0;

        function scaleHtml(level) {
            const L = LEVELS[level];
            return `
                <div class="calm-scale" data-level="${level}">
                    <label class="sr-only" for="calmLevel">How regulated do you feel, from 1 (steady) to 5 (can't cope)</label>
                    <input type="range" id="calmLevel" min="1" max="5" step="1" value="${level}"
                        aria-valuetext="${esc(level + ": " + L.label)}">
                    <div class="calm-scale-ticks">${[1, 2, 3, 4, 5].map(n =>
                        `<button type="button" class="calm-tick${n === level ? " on" : ""}" data-level="${n}" aria-label="${n}: ${esc(LEVELS[n].label)}">${n}</button>`).join("")}</div>
                    <div class="calm-scale-ends"><span>Steady</span><span>Can't cope</span></div>
                    <div class="calm-scale-read"><strong class="calm-scale-label">${esc(L.label)}</strong><span class="calm-scale-desc">${esc(L.desc)}</span></div>
                </div>
                <button type="button" class="btn btn-primary calm-next" data-calm-next>Next →</button>`;
        }
        function setLevel(n) {
            const box = steps.querySelector(".calm-scale"); if (!box) return;
            const L = LEVELS[n];
            box.dataset.level = n;
            const r = box.querySelector("#calmLevel");
            r.value = n; r.setAttribute("aria-valuetext", `${n}: ${L.label}`);
            box.querySelector(".calm-scale-label").textContent = L.label;
            box.querySelector(".calm-scale-desc").textContent = L.desc;
            box.querySelectorAll(".calm-tick").forEach(t => t.classList.toggle("on", +t.dataset.level === n));
        }

        function renderQuestion() {
            stopBreath(steps.querySelector("[data-breath]"));
            const q = QUESTIONS[step];
            const body = q.scale
                ? scaleHtml(+answers.level || 2)
                : `<div class="calm-step-options">${q.options.map(([v, label]) =>
                    `<button type="button" class="calm-step-opt" data-answer="${esc(v)}">${esc(label)}</button>`).join("")}</div>`;
            steps.innerHTML = `
                <p class="calm-step-count">${step + 1} of ${QUESTIONS.length}</p>
                <h3 class="calm-step-q">${esc(q.q)}</h3>
                ${body}
                <div class="calm-step-links">
                    ${step > 0 ? `<button type="button" class="link-btn" data-calm-back>← Back</button>` : ""}
                    <button type="button" class="link-btn" data-calm-skip>Skip and see everything</button>
                </div>`;
            if (q.scale) {
                const r = steps.querySelector("#calmLevel");
                r.addEventListener("input", () => setLevel(+r.value));
            }
        }

        function renderCrisis() {
            steps.innerHTML = `
                <div class="calm-crisis">
                    <h3 class="calm-step-q">You don't have to handle this alone.</h3>
                    <p>Free, confidential support, any time:</p>
                    <div class="calm-crisis-btns">
                        <a class="calm-crisis-btn" href="tel:988">Call 988</a>
                        <a class="calm-crisis-btn" href="sms:988">Text 988</a>
                        <a class="calm-crisis-btn calm-crisis-wide" href="tel:5124712255">UT CMHC 24/7 crisis line: 512-471-2255</a>
                    </div>
                    <a class="calm-crisis-more" href="#crisis">More crisis options →</a>
                </div>
                <h3 class="calm-step-q calm-breathe-q">While you reach out, breathe with this</h3>
                ${BREATH_HTML}
                <button type="button" class="calm-tailor-start calm-more-ways" data-calm-coping>Show me other ways to cope</button>
                <div class="calm-coping" hidden></div>
                <div class="calm-step-links">
                    <button type="button" class="link-btn" data-calm-back>← Back</button>
                    <button type="button" class="link-btn" data-calm-restart>Start over</button>
                </div>`;
        }

        function renderResult() {
            const feel = LEVELS[+answers.level].key;
            const gentle = feel === "overwhelmed"
                ? `<p class="calm-gentle">If it gets to be too much, <button type="button" class="link-btn" data-need-jump="support">talk to someone</button> or call or text <a href="tel:988">988</a>.</p>` : "";
            steps.innerHTML = picksHtml(pick(feel, +answers.time, answers.style), "Try this first") + gentle + `
                <div class="calm-step-links">
                    <button type="button" class="link-btn" data-calm-restart>Start over</button>
                    <button type="button" class="link-btn" data-calm-skip>See everything</button>
                </div>`;
        }

        start.addEventListener("click", () => {
            answers = {}; step = 0;
            start.hidden = true; steps.hidden = false;
            renderQuestion();
        });

        steps.addEventListener("click", e => {
            const tick = e.target.closest(".calm-tick");
            if (tick) { setLevel(+tick.dataset.level); return; }
            if (e.target.closest("[data-calm-next]")) {
                answers.level = steps.querySelector("#calmLevel").value;
                if (+answers.level === 5) { renderCrisis(); return; }
                step = 1; renderQuestion(); return;
            }
            const opt = e.target.closest("[data-answer]");
            if (opt) {
                answers[QUESTIONS[step].key] = opt.dataset.answer;
                step += 1;
                if (step < QUESTIONS.length) renderQuestion(); else renderResult();
                return;
            }
            const breathBtn = e.target.closest("[data-breath-toggle]");
            if (breathBtn) {
                const box = breathBtn.closest("[data-breath]");
                if (breathTimer) stopBreath(box); else startBreath(box);
                return;
            }
            if (e.target.closest("[data-calm-coping]")) {
                const box = steps.querySelector(".calm-coping");
                box.innerHTML = picksHtml(pick("overwhelmed", 99, "guided"), "Other ways to cope");
                box.hidden = false;
                e.target.closest("[data-calm-coping]").hidden = true;
                return;
            }
            if (e.target.closest("[data-calm-back]")) { step = Math.max(0, step - 1); renderQuestion(); return; }
            if (e.target.closest("[data-calm-restart]")) { answers = {}; step = 0; renderQuestion(); return; }
            if (e.target.closest("[data-calm-skip]")) {
                if (all) { all.open = true; all.scrollIntoView({ behavior: "smooth", block: "start" }); }
                return;
            }
            const go = e.target.closest("[data-calm-go]");
            if (go) {
                const id = go.dataset.calmGo;
                if (id === "container") document.querySelector("#calmPanel [data-open-container]")?.click();
                if (id === "rant") { const b = document.getElementById("calmRantBtn"); if (b && b.getAttribute("aria-expanded") !== "true") b.click(); document.getElementById("calmRant")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
                if (id === "make") { document.getElementById("calmMake")?.click(); document.getElementById("calmPrompt")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
            }
        });
        // Leaving Calm me stops the breathing guide.
        ["tabGuide", "tabSurprise"].forEach(id => document.getElementById(id)?.addEventListener("click", () => stopBreath(steps.querySelector("[data-breath]"))));
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(setup, 0), { once: true });
    else setTimeout(setup, 0);
})();

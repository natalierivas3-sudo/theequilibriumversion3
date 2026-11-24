/*
 * Coping skills page (#skills), draft v58.
 * Adapted from DBT (Linehan), written in our own words.
 *
 * - "How are you right now?" three states, each showing a short set of tools.
 * - 10 tools, one skill each, ≤3 lines of text and one action.
 * - Exercises open in a focused panel with a 0-10 rating before and after.
 * - Star tools to build "My kit" (saved in this browser only).
 * - Ratings are never saved or sent.
 */
(function () {
    "use strict";
    const $ = s => document.querySelector(s);
    const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const store = {
        get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
    };
    const rand = arr => arr[Math.floor(Math.random() * arr.length)];

    const TOOLS = [
        { id: "pacer", icon: "🌬️", name: "Breathing pacer", dbt: "", exercise: true,
          lines: ["Breathe in as it grows. Out as it shrinks.", "Pick 1, 2, or 3 minutes."],
          why: "A longer out-breath than in-breath activates the body's calming (parasympathetic) system and slows your heart rate." },
        { id: "cold", icon: "🧊", name: "Cool down fast", dbt: "TIPP", exercise: true,
          lines: ["Cold water on your face or an ice pack on your neck.", "Hold for 30 seconds."],
          warn: "Check with a doctor first if you have a heart condition.",
          why: "Cold on your face triggers the dive reflex, which quickly slows your heart rate and takes the edge off intense emotion." },
        { id: "move", icon: "🏃", name: "Move it out", dbt: "TIPP", exercise: true,
          lines: ["Burn off the adrenaline.", "60 seconds, go."],
          why: "Short, intense movement uses up the stress energy your body has revved up, so it can settle afterward." },
        { id: "squeeze", icon: "✊", name: "Squeeze & release", dbt: "TIPP", exercise: true,
          lines: ["Tense one part of your body for 5 seconds.", "Then let it drop."],
          why: "Tensing then releasing a muscle makes it relax more than before, and you feel the difference. This is called paired muscle relaxation." },
        { id: "ground", icon: "🖐️", name: "5-4-3-2-1 grounding", dbt: "", exercise: true,
          lines: ["Find 5 things you see, 4 you can touch, 3 you hear,", "2 you smell, 1 you taste."],
          why: "Using your senses pulls your attention back to the present, which helps when you feel zoned out, numb, or far away." },
        { id: "stop", icon: "✋", name: "Pause button", dbt: "STOP", exercise: true,
          lines: ["Don't act yet.", "Just freeze for one breath."],
          why: "A short pause gives the thinking part of your brain time to catch up before you act on a strong urge." },
        { id: "shuffle", icon: "🔀", name: "Distraction shuffle", dbt: "", exercise: false,
          lines: ["Get one random 5-minute thing to do.", "Let the feeling pass while you do it."],
          why: "Shifting your attention for a few minutes can let an intense emotion peak and pass instead of building." },
        { id: "namer", icon: "🏷️", name: "Name the feeling", dbt: "", exercise: false,
          lines: ["Name it to tame it.", "Pick a face, then a word."],
          why: "Research on “affect labeling” shows that putting a feeling into words can turn down how intense it feels." },
        { id: "opposite", icon: "🔄", name: "Do the opposite", dbt: "Opposite action", exercise: false,
          lines: ["Flip the urge.", "Try the opposite, just a little."],
          why: "When an emotion isn't helping, acting a little opposite to its urge can change the emotion itself." },
        { id: "basics", icon: "🌙", name: "Daily basics check", dbt: "", exercise: false,
          lines: ["Ate, slept, moved, meds, substances.", "Your body sets your mood baseline."],
          why: "Hunger, poor sleep, no movement, missed medication, and alcohol or drugs all make emotions harder to manage." }
    ];
    const BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]));
    const STATES = {
        overwhelmed: { icon: "🔥", label: "Overwhelmed or panicking", note: "Body tools to bring you down.", tools: ["pacer", "cold", "move", "squeeze", "stop"] },
        numb: { icon: "🌫️", label: "Numb, zoned out, or shut down", note: "Wake-up tools to bring you back.", tools: ["ground", "move", "cold", "namer"] },
        stressed: { icon: "😣", label: "Stressed but okay", note: "Everyday tools to stay steady.", tools: ["basics", "pacer", "shuffle", "opposite", "namer"] }
    };

    const MOVES = ["20 jumping jacks", "10 wall push-ups", "A fast walk around the block", "Run in place", "Climb a flight of stairs", "Dance to one song", "15 squats"];
    const AREAS = [["fists", "Hands", "Clench your fists"], ["shoulders", "Shoulders", "Pull your shoulders up to your ears"], ["face", "Face", "Scrunch your whole face"], ["legs", "Legs", "Press your feet into the floor"], ["stomach", "Stomach", "Tighten your stomach"]];
    const DISTRACT = ["Text someone a meme.", "Reorganize one drawer.", "Make a playlist of 5 songs.", "Do a 5-minute stretch.", "Wash your face and put on lotion.",
        "Doodle whatever's in front of you.", "Make a cup of tea.", "Step outside and find three different birds or trees.", "Water a plant or tidy your desk.",
        "Look up a recipe you want to try.", "Watch one funny video, then stop.", "Write a postcard to future you."];
    const FEELINGS = [
        ["😠", "Angry", ["Irritated", "Frustrated", "Furious"], "Try Move it out to burn it off.", "move"],
        ["😰", "Anxious", ["Nervous", "Panicky", "On edge"], "Try the Breathing pacer.", "pacer"],
        ["😢", "Sad", ["Down", "Disappointed", "Grieving"], "Text someone, or try Do the opposite.", "opposite"],
        ["😳", "Ashamed", ["Embarrassed", "Guilty", "Exposed"], "Try the Pause button before you act.", "stop"],
        ["🥺", "Lonely", ["Left out", "Homesick", "Disconnected"], "Reach out to one person, even with a meme.", "shuffle"],
        ["😶", "Numb", ["Empty", "Flat", "Far away"], "Try 5-4-3-2-1 grounding.", "ground"],
        ["😵", "Overwhelmed", ["Swamped", "Scattered", "Stuck"], "Try Cool down fast.", "cold"],
        ["😕", "Unsure", ["Confused", "Mixed up", "Restless"], "Try the Daily basics check.", "basics"]
    ];
    const OPPOSITES = [
        ["Want to hide in bed all day.", "Get up and sit by a window for 10 minutes."],
        ["Want to snap at someone.", "Step away, then speak a little softer than you feel like."],
        ["Want to cancel plans.", "Go for just 20 minutes."],
        ["Want to avoid an email.", "Open it and write one line."],
        ["Want to isolate.", "Send one text to someone you like."]
    ];
    const BASICS = ["I've eaten something today", "I slept okay last night", "I moved my body today", "I took my meds (if prescribed)", "I went easy on alcohol or other substances"];
    const STOP_STEPS = [["Stop", "Freeze. Don't act yet. One breath."], ["Step back", "Take a step back from the situation, even in your head."],
        ["Observe", "What's happening? What are you feeling? What are others doing?"], ["Proceed", "Ask: what would help right now? Then do that."]];
    const GROUND = [[5, "see"], [4, "touch"], [3, "hear"], [2, "smell"], [1, "taste"]];

    let kit = store.get("eq_kit", []);
    let reduce = store.get("eq_reduce_motion", window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    let state = null, showKit = false;
    let timers = [];
    const clearTimers = () => { timers.forEach(t => clearTimeout(t)); timers = []; };
    const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

    // ---------- Cards ----------
    function title(t) { return `${esc(t.name)}${t.dbt ? ` <span class="sk-dbt">(${esc(t.dbt)})</span>` : ""}`; }
    function cardHtml(t) {
        const starred = kit.includes(t.id);
        return `<article class="sk-card" data-tool="${t.id}">
            <div class="sk-card-top">
                <span class="sk-icon" aria-hidden="true">${t.icon}</span>
                <h3 class="sk-name">${title(t)}</h3>
                <button type="button" class="sk-star${starred ? " on" : ""}" data-star="${t.id}" aria-pressed="${starred}" aria-label="${starred ? "Remove from" : "Add to"} my kit: ${esc(t.name)}">${starred ? "★" : "☆"}</button>
            </div>
            <p class="sk-lines">${t.lines.map(esc).join("<br>")}</p>
            ${t.warn ? `<p class="sk-warn">⚠️ ${esc(t.warn)}</p>` : ""}
            <button type="button" class="btn btn-primary btn-sm sk-go" data-open-tool="${t.id}">${t.exercise ? "Start" : "Open"}</button>
            <details class="sk-why"><summary>Why it works</summary><p>${esc(t.why)}</p></details>
        </article>`;
    }
    function render() {
        const wrap = $("#skTools"), head = $("#skToolsHead");
        if (!wrap) return;
        let ids = null, heading = "";
        if (showKit) { ids = kit.slice(); heading = kit.length ? "My kit" : ""; }
        else if (state === "all") { ids = TOOLS.map(t => t.id); heading = "All 10 tools"; }
        else if (state) { ids = STATES[state].tools; heading = STATES[state].note; }
        document.querySelectorAll("[data-sk-state]").forEach(b => b.classList.toggle("on", b.dataset.skState === state && !showKit));
        $("#skKitBtn")?.classList.toggle("on", showKit);
        const count = $("#skKitCount"); if (count) count.textContent = kit.length;
        if (!ids) { wrap.innerHTML = ""; head.hidden = true; $("#skNav").hidden = true; return; }
        head.hidden = false;
        head.textContent = heading;
        wrap.innerHTML = ids.length ? ids.map(id => cardHtml(BY_ID[id])).join("")
            : `<p class="sk-empty">Tap ☆ on any tool to add it to your kit. It's saved in this browser only.</p>`;
        $("#skNav").hidden = ids.length < 2;
        wrap.scrollLeft = 0;
    }

    // ---------- Focused panel with before/after rating ----------
    const overlay = () => $("#skOverlay");
    let before = null, current = null, lastFocus = null;
    function openTool(id) {
        const t = BY_ID[id]; if (!t) return;
        current = t; before = null; lastFocus = document.activeElement;
        $("#skPanelTitle").innerHTML = `${t.icon} ${title(t)}`;
        overlay().hidden = false;
        document.body.classList.add("sk-open");
        if (t.exercise) ratingStep("before"); else runTool(t);
        $("#skPanel").focus();
    }
    function closeTool() {
        clearTimers();
        overlay().hidden = true;
        document.body.classList.remove("sk-open");
        $("#skBody").innerHTML = "";
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function ratingStep(which) {
        const q = which === "before" ? "How intense is it right now?" : "And now?";
        const start = which === "before" ? 5 : before;
        $("#skBody").innerHTML = `
            <p class="sk-q">${q}</p>
            <div class="sk-rate">
                <input type="range" id="skRate" min="0" max="10" step="1" value="${start}" aria-label="${q} 0 is calm, 10 is the most intense">
                <div class="sk-rate-ends"><span>0 calm</span><output id="skRateOut">${start}</output><span>10 worst</span></div>
            </div>
            <button type="button" class="btn btn-primary" data-sk-rate="${which}">${which === "before" ? "Start" : "Done"}</button>
            ${which === "before" ? `<button type="button" class="link-btn sk-skip" data-sk-skiprate>Skip rating</button>` : ""}`;
        const r = $("#skRate");
        r.addEventListener("input", () => { $("#skRateOut").textContent = r.value; });
    }
    function finish(after) {
        let msg = "";
        if (before != null && after != null) {
            const d = before - after;
            msg = d > 0 ? `Down ${d} point${d === 1 ? "" : "s"}. That's your body settling.`
                : d === 0 ? "About the same. That's okay. Try another tool, or give it a few more minutes."
                : "A bit higher. That happens. Try a different tool, or reach out to someone.";
        }
        $("#skBody").innerHTML = `
            ${msg ? `<p class="sk-result">${esc(msg)}</p>` : `<p class="sk-result">Done. Nice work.</p>`}
            <button type="button" class="btn btn-ghost" data-open-tool="${current.id}">Do it again</button>
            <p class="sk-still">Tried these and still struggling? <a href="#talk" data-sk-close>Find someone to talk to</a> · <a href="#crisis" data-sk-close>Crisis support</a></p>`;
    }
    function doneButton() {
        return current.exercise ? `<button type="button" class="btn btn-primary sk-done" data-sk-done>I'm done</button>` : "";
    }

    // ---------- The tools ----------
    function runTool(t) {
        clearTimers();
        const body = $("#skBody");
        const R = {
            pacer() {
                body.innerHTML = `
                    <div class="sk-pick" role="group" aria-label="How long">${[1, 2, 3].map(m => `<button type="button" class="sk-chip${m === 1 ? " on" : ""}" data-mins="${m}">${m} min</button>`).join("")}</div>
                    <div class="sk-pacer${reduce ? " still" : ""}"><div class="sk-orb" aria-hidden="true"></div><div class="sk-bar" aria-hidden="true"><span></span></div></div>
                    <p class="sk-say" aria-live="polite">Tap start when ready</p>
                    <button type="button" class="btn btn-primary" data-pacer-go>Start</button>
                    ${doneButton()}`;
                let mins = 1;
                body.querySelectorAll("[data-mins]").forEach(b => b.addEventListener("click", () => {
                    mins = +b.dataset.mins; body.querySelectorAll("[data-mins]").forEach(x => x.classList.toggle("on", x === b));
                }));
                body.querySelector("[data-pacer-go]").addEventListener("click", e => {
                    clearTimers();
                    const box = body.querySelector(".sk-pacer"), say = body.querySelector(".sk-say");
                    e.target.textContent = "Restart";
                    const rounds = Math.round(mins * 60 / 10);
                    let r = 0;
                    const phase = (inhale) => {
                        const secs = inhale ? 4 : 6;
                        box.style.setProperty("--secs", secs + "s");
                        box.classList.toggle("in", inhale); box.classList.toggle("out", !inhale);
                        let left = secs;
                        const tick = () => {
                            say.textContent = `${inhale ? "Breathe in" : "Breathe out"} · ${left}`;
                            left -= 1;
                            if (left >= 0) return later(tick, 1000);
                            if (inhale) phase(false);
                            else if (++r < rounds) phase(true);
                            else { box.classList.remove("in", "out"); say.textContent = "Nice. You can stop here."; }
                        };
                        tick();
                    };
                    phase(true);
                });
            },
            cold() { countdown(30, "Cold on your face or neck. Hold it.", "30 seconds"); },
            move() {
                const pick = () => { const now = $("#skMoveWhat")?.textContent; let m; do { m = rand(MOVES); } while (m === now); return m; };
                body.innerHTML = `<p class="sk-big" id="skMoveWhat">${esc(pick())}</p>
                    <button type="button" class="link-btn" data-move-other>Give me a different one</button>`;
                body.querySelector("[data-move-other]").addEventListener("click", () => { $("#skMoveWhat").textContent = pick(); });
                countdown(60, "", "60 seconds, go", true);
            },
            squeeze() {
                body.innerHTML = `<p class="sk-q">Pick a body area</p>
                    <div class="sk-pick">${AREAS.map(([k, chip]) => `<button type="button" class="sk-chip" data-area="${k}">${esc(chip)}</button>`).join("")}</div>
                    <div class="sk-squeeze" aria-hidden="true"><div class="sk-sq-shape"></div></div>
                    <p class="sk-say" aria-live="polite">Pick an area to start</p>
                    ${doneButton()}`;
                body.querySelectorAll("[data-area]").forEach(b => b.addEventListener("click", () => {
                    clearTimers();
                    body.querySelectorAll("[data-area]").forEach(x => x.classList.toggle("on", x === b));
                    const [, , how] = AREAS.find(a => a[0] === b.dataset.area);
                    const shape = body.querySelector(".sk-squeeze"), say = body.querySelector(".sk-say");
                    let n = 5;
                    shape.classList.add("tense"); shape.classList.remove("loose");
                    const tense = () => {
                        say.textContent = `${how}… ${n}`;
                        if (--n >= 0) return later(tense, 1000);
                        shape.classList.remove("tense"); shape.classList.add("loose");
                        say.textContent = "Let go. Notice how it feels.";
                        later(() => { say.textContent = "Pick another area, or tap I'm done."; shape.classList.remove("loose"); }, 6000);
                    };
                    tense();
                }));
            },
            ground() {
                let i = 0, found = 0;
                const draw = () => {
                    const [n, sense] = GROUND[i];
                    body.innerHTML = `<p class="sk-step">${i + 1} of 5</p>
                        <p class="sk-big">Name ${n} thing${n > 1 ? "s" : ""} you can ${sense}.</p>
                        <p class="sk-hint">Tap a circle each time you find one.</p>
                        <div class="sk-dots">${Array.from({ length: n }, (_, k) => `<button type="button" class="sk-dot${k < found ? " on" : ""}" data-dot="${k}" aria-label="Found ${k + 1}"></button>`).join("")}</div>
                        ${i === 4 && found >= 1 ? doneButton() : ""}`;
                    body.querySelectorAll("[data-dot]").forEach(d => d.addEventListener("click", () => {
                        if (d.classList.contains("on")) return;
                        found += 1; d.classList.add("on");
                        if (found >= n) later(() => { if (i < 4) { i += 1; found = 0; draw(); } else draw(); }, 350);
                    }));
                };
                draw();
            },
            stop() {
                let i = 0;
                const draw = () => {
                    const [h, line] = STOP_STEPS[i];
                    body.innerHTML = `<p class="sk-step">${i + 1} of 4</p>
                        <p class="sk-stop-word">${esc(h)}</p><p class="sk-q">${esc(line)}</p>
                        ${i < 3 ? `<button type="button" class="btn btn-primary sk-bigbtn" data-stop-next>Next</button>` : doneButton()}`;
                    body.querySelector("[data-stop-next]")?.addEventListener("click", () => { i += 1; draw(); });
                };
                draw();
            },
            shuffle() {
                body.innerHTML = `<p class="sk-big" id="skShuf">Tap for a 5-minute idea.</p>
                    <button type="button" class="btn btn-primary" data-shuf>Give me one</button>`;
                body.querySelector("[data-shuf]").addEventListener("click", () => { $("#skShuf").textContent = rand(DISTRACT); });
            },
            namer() {
                body.innerHTML = `<p class="sk-q">Which face is closest?</p>
                    <div class="sk-faces">${FEELINGS.map((f, i) => `<button type="button" class="sk-face" data-face="${i}"><span aria-hidden="true">${f[0]}</span>${esc(f[1])}</button>`).join("")}</div>
                    <div id="skNamed"></div>`;
                body.querySelectorAll("[data-face]").forEach(b => b.addEventListener("click", () => {
                    body.querySelectorAll("[data-face]").forEach(x => x.classList.toggle("on", x === b));
                    const f = FEELINGS[+b.dataset.face];
                    $("#skNamed").innerHTML = `<p class="sk-q">More exactly?</p>
                        <div class="sk-pick">${f[2].map(w => `<button type="button" class="sk-chip" data-word="${esc(w)}">${esc(w)}</button>`).join("")}</div>
                        <div id="skNamedTip"></div>`;
                    $("#skNamed").querySelectorAll("[data-word]").forEach(w => w.addEventListener("click", () => {
                        $("#skNamed").querySelectorAll("[data-word]").forEach(x => x.classList.toggle("on", x === w));
                        $("#skNamedTip").innerHTML = `<p class="sk-result">“I feel ${esc(w.dataset.word.toLowerCase())}.” ${esc(f[3])}</p>
                            <button type="button" class="btn btn-ghost btn-sm" data-open-tool="${f[4]}">Open ${esc(BY_ID[f[4]].name)}</button>`;
                    }));
                }));
            },
            opposite() {
                let i = 0;
                const draw = () => {
                    const [urge, opp] = OPPOSITES[i];
                    body.innerHTML = `<button type="button" class="sk-flip" aria-live="polite" data-flip>
                            <span class="sk-flip-front"><small>The urge</small>${esc(urge)}<em>Tap to flip</em></span>
                            <span class="sk-flip-back"><small>The opposite, just a little</small>${esc(opp)}</span>
                        </button>
                        <button type="button" class="link-btn" data-flip-next>Next card →</button>`;
                    body.querySelector("[data-flip]").addEventListener("click", e => e.currentTarget.classList.toggle("flipped"));
                    body.querySelector("[data-flip-next]").addEventListener("click", () => { i = (i + 1) % OPPOSITES.length; draw(); });
                };
                draw();
            },
            basics() {
                body.innerHTML = `<div class="sk-basics">${BASICS.map((b, i) => `<label class="sk-toggle"><input type="checkbox" data-basic="${i}"><span>${esc(b)}</span></label>`).join("")}</div>
                    <p class="sk-result" id="skBasicsSum" aria-live="polite">Check what's true today.</p>`;
                const sum = () => {
                    const n = body.querySelectorAll("[data-basic]:checked").length;
                    $("#skBasicsSum").textContent = n === 5 ? "All 5. Your basics are covered."
                        : `${n} of 5. Pick one unchecked thing to do something about today, even a small snack or an early night.`;
                };
                body.querySelectorAll("[data-basic]").forEach(c => c.addEventListener("change", sum));
            }
        };
        function countdown(secs, line, label, append) {
            const html = `<p class="sk-say" aria-live="polite">${esc(line || label)}</p>
                <div class="sk-count" aria-hidden="true"><span id="skLeft">${secs}</span></div>
                <button type="button" class="btn btn-primary" data-count-go>Start ${esc(label)}</button>
                ${doneButton()}`;
            if (append) body.insertAdjacentHTML("beforeend", html); else body.innerHTML = html;
            body.querySelector("[data-count-go]").addEventListener("click", e => {
                clearTimers();
                let left = secs; e.target.textContent = "Restart";
                const tick = () => {
                    $("#skLeft").textContent = left;
                    if (left-- > 0) return later(tick, 1000);
                    body.querySelector(".sk-say").textContent = "Time. Nice job.";
                };
                tick();
            });
        }
        R[t.id]();
    }

    // ---------- Tip of the day (Home) ----------
    function tipOfDay() {
        const box = $("#skTip"); if (!box) return;
        const day = Math.floor(Date.now() / 86400000);
        const t = TOOLS[day % TOOLS.length];
        box.innerHTML = `<span class="sk-tip-label">Tip of the day</span> <a class="sk-tip-text" href="#skills" data-tip-tool="${t.id}" aria-label="Tip of the day: ${esc(t.lines[0])} Open ${esc(t.name)}">${esc(t.lines[0])}</a>`;
    }

    function setup() {
        if (!$("#skills")) return;
        render(); tipOfDay();
        const rm = $("#skReduce"); if (rm) { rm.checked = reduce; rm.addEventListener("change", () => { reduce = rm.checked; store.set("eq_reduce_motion", reduce); document.body.classList.toggle("sk-reduce", reduce); }); }
        document.body.classList.toggle("sk-reduce", reduce);

        document.addEventListener("click", e => {
            const st = e.target.closest("[data-sk-state]");
            if (st) { state = st.dataset.skState; showKit = false; render(); $("#skToolsHead")?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
            if (e.target.closest("#skKitBtn")) { showKit = !showKit; render(); return; }
            const star = e.target.closest("[data-star]");
            if (star) {
                const id = star.dataset.star;
                kit = kit.includes(id) ? kit.filter(x => x !== id) : kit.concat(id);
                store.set("eq_kit", kit); render(); return;
            }
            const tip = e.target.closest("[data-tip-tool]");
            if (tip) { e.preventDefault(); location.hash = "skills"; setTimeout(() => openTool(tip.dataset.tipTool), 60); return; }
            const open = e.target.closest("[data-open-tool]");
            if (open) { openTool(open.dataset.openTool); return; }
            const rate = e.target.closest("[data-sk-rate]");
            if (rate) {
                const v = +$("#skRate").value;
                if (rate.dataset.skRate === "before") { before = v; runTool(current); } else finish(v);
                return;
            }
            if (e.target.closest("[data-sk-skiprate]")) { before = null; runTool(current); return; }
            if (e.target.closest("[data-sk-done]")) { clearTimers(); if (before == null) finish(null); else ratingStep("after"); return; }
            if (e.target.closest("[data-sk-close]") || e.target.closest("#skClose") || e.target === overlay()) { closeTool(); return; }
            const nav = e.target.closest("[data-sk-nav]");
            if (nav) { const w = $("#skTools"); w.scrollBy({ left: (nav.dataset.skNav === "next" ? 1 : -1) * w.clientWidth, behavior: "smooth" }); }
        });
        document.addEventListener("keydown", e => { if (e.key === "Escape" && overlay() && !overlay().hidden) closeTool(); });
        window.addEventListener("hashchange", () => { if (overlay() && !overlay().hidden && location.hash !== "#skills") closeTool(); });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup, { once: true });
    else setup();
})();

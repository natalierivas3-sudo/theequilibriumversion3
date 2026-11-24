/*
 * RANT (under Calm me)
 * Type it or say it out loud, then let it go. Nothing is saved, sent, or tracked:
 * no storage, no network, and analytics only record that the tool was used.
 * A gentle, on-device check offers crisis support if the text mentions self-harm.
 */
(function () {
    "use strict";
    const $ = s => document.querySelector(s);
    const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const track = (n, p) => { try { if (typeof window.gtag === "function") window.gtag("event", n, p || {}); } catch (e) { /* ignore */ } };
    const CRISIS_WORDS = /\b(kill(ing)? my ?self|suicid\w*|end(ing)? (it all|my life)|want(ed)? to die|wanna die|don'?t want to (live|be here|exist)|hurt(ing)? my ?self|self[- ]?harm\w*|cut(ting)? my ?self|no reason to live|better off (dead|without me)|overdos\w*)\b/i;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    let mode = "type";           // "type" | "aloud"

    // How the words disappear. Only this preference is remembered, never the words.
    const STYLES = {
        away: { icon: "💨", label: "Blow away", button: "Let it go", done: "It's gone." },
        burn: { icon: "🔥", label: "Burn", button: "Burn it", done: "Burned. It's gone." },
        boom: { icon: "💥", label: "Blow up", button: "Blow it up", done: "Blown to bits. It's gone." },
        wash: { icon: "🌊", label: "Wash away", button: "Wash it away", done: "Washed away. It's gone." }
    };
    let style = (() => { try { return localStorage.getItem("eq-rant-style") || "away"; } catch (e) { return "away"; } })();
    if (!STYLES[style]) style = "away";
    let lastStyle = style;
    let rec = null, timer = null, seconds = 0;

    // Time limit, so venting doesn't turn into spiraling.
    const LIMITS = [[120, "2 min"], [300, "5 min"], [0, "No limit"]];
    let limit = (() => { try { const v = localStorage.getItem("eq-rant-limit"); return v === null ? 120 : +v; } catch (e) { return 120; } })();
    if (!LIMITS.some(([v]) => v === limit)) limit = 120;
    let total = 0, left = 0, extended = false, autoGo = null;
    const fmt = n => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
    function limitHtml() {
        return `<div class="rant-limit" role="radiogroup" aria-label="Time limit">
            <span class="rant-limit-label">Time limit</span>
            ${LIMITS.map(([v, l]) => `<button type="button" role="radio" class="rant-limit-btn${v === limit ? " active" : ""}" aria-checked="${v === limit}" data-rant-limit="${v}">${l}</button>`).join("")}
        </div>
        ${limit ? `<div class="rant-timer" id="rantTimer"><div class="rant-bar"><i id="rantBarFill"></i></div><span id="rantLeft">${fmt(limit)}</span></div>` : ""}`;
    }

    function goButtons() {
        return Object.entries(STYLES).map(([k, v]) =>
            `<button type="button" class="rant-style rant-go-${k}" data-rant-go="${k}"><span aria-hidden="true">${v.icon}</span> ${v.label}</button>`).join("");
    }

    function viewHtml() {
        return `
        <div class="rant" id="rantBox">
            <div class="rant-modes" role="tablist" aria-label="How do you want to rant?">
                <button type="button" role="tab" class="rant-mode${mode === "type" ? " active" : ""}" aria-selected="${mode === "type"}" data-rant-mode="type">Type it</button>
                <button type="button" role="tab" class="rant-mode${mode === "aloud" ? " active" : ""}" aria-selected="${mode === "aloud"}" data-rant-mode="aloud">Say it out loud</button>
            </div>
            ${limitHtml()}
            ${mode === "type" ? `
            <label class="sr-only" for="rantText">What's on your mind</label>
            <div class="rant-field" id="rantField">
                <textarea id="rantText" class="rant-text" rows="6" placeholder="Say whatever you need to. Nobody will ever see this." autocomplete="off" autocorrect="off" data-lpignore="true"></textarea>
            </div>
            <div class="rant-controls" id="rantControls">
                <p class="rant-limit-label">When you're ready, let it go</p>
                <div class="rant-styles" role="group" aria-label="Let it go">${goButtons()}</div>
            </div>
            <p class="rant-note">Nothing here is saved or sent.</p>` : `
            <div class="rant-aloud">
                <p class="rant-aloud-text">Say it out loud, to the room, to your car, to your pillow.</p>
                <p class="rant-clock" id="rantClock" aria-live="off">${limit ? fmt(limit) : "0:00"}</p>
                <div class="rant-actions">
                    <button type="button" class="btn btn-primary" data-rant-aloud-start>${timer ? "I'm done" : "Start"}</button>
                </div>
                <p class="rant-note">Nothing is recorded. This is just a little space${limit ? ` and ${LIMITS.find(([v]) => v === limit)[1]}` : " and a timer"}.</p>
            </div>`}
            <p class="rant-msg" id="rantMsg" hidden></p>
        </div>`;
    }
    function render() {
        const box = $("#calmRant");
        if (!box) return;
        stopMic(); stopTimer();
        box.innerHTML = viewHtml();
        if (mode === "type") $("#rantText")?.focus({ preventScroll: true });
    }
    function msg(t) { const m = $("#rantMsg"); if (m) { m.textContent = t; m.hidden = !t; } }

    // ---------- Let it go ----------
    let pendingStyle = null;
    function release(k, force) {
        if (k) style = k;
        try { localStorage.setItem("eq-rant-style", style); } catch (e) { /* ignore */ }
        const ta = $("#rantText"), field = $("#rantField");
        const text = (ta ? ta.value : "").trim();
        if (!ta || !field) return;
        if (!text) { msg("Write something first, even one word."); return; }
        if (CRISIS_WORDS.test(text) && !force) { pendingStyle = style; showCheckIn(); return; }
        stopMic(); stopTimer();
        $(".rant-timeup")?.remove(); $(".rant-checkin")?.remove(); msg("");
        lastStyle = style;

        // Lock the box's size so nothing on the page moves.
        const h = field.offsetHeight;
        field.style.height = h + "px"; field.dataset.h = h + "px";
        const cs = getComputedStyle(ta);
        ta.blur(); ta.style.visibility = "hidden";
        document.querySelectorAll("[data-rant-go], [data-rant-mic]").forEach(b => { b.disabled = true; });

        const words = text.split(/\s+/).slice(0, 160);
        const letters = style === "boom" && text.length <= 700;
        const inner = words.map((w, i) => {
            const d = style === "burn" ? 0.1 + Math.random() * 0.9
                : style === "boom" ? 0.05 + Math.random() * 0.15
                : style === "wash" ? 0.35 + ((words.length - i) / words.length) * 0.9
                : i * 0.035;
            if (letters) return `<span class="rw">${[...w].map(ch => `<span class="rl" style="--d:${d.toFixed(2)}s">${esc(ch)}</span>`).join("")}</span>`;
            return `<span class="rw" style="--d:${d.toFixed(2)}s;--x:${(Math.random() * 60 - 30).toFixed(0)}px">${esc(w)}</span>`;
        }).join(" ");
        const overlay = document.createElement("div");
        overlay.className = `rant-overlay rant-stage-${style}`;
        overlay.setAttribute("aria-hidden", "true");
        overlay.style.padding = cs.padding; overlay.style.fontSize = cs.fontSize; overlay.style.lineHeight = cs.lineHeight;
        overlay.innerHTML = `${style === "wash" ? `<div class="rant-water"><svg viewBox="0 0 400 40" preserveAspectRatio="none"><path d="M0 20 Q 50 5 100 20 T 200 20 T 300 20 T 400 20 V 40 H 0 Z"/></svg></div>` : ""}
            <div class="rant-float rant-${style}${letters ? " letters" : ""}">${inner}</div>`;
        field.appendChild(overlay);

        const fr = overlay.getBoundingClientRect();
        if (style === "boom") {
            // Every letter (or word) flies outward from the middle of the text.
            const pieces = overlay.querySelectorAll(letters ? ".rl" : ".rw");
            const fl = overlay.querySelector(".rant-float").getBoundingClientRect();
            const cx = fl.left + fl.width / 2, cy = fl.top + fl.height / 2;
            pieces.forEach(sp => {
                const q = sp.getBoundingClientRect();
                let dx = q.left + q.width / 2 - cx, dy = q.top + q.height / 2 - cy;
                const len = Math.hypot(dx, dy) || 1, dist = 60 + Math.random() * 110;
                dx = dx / len * dist + (Math.random() * 30 - 15); dy = dy / len * dist + (Math.random() * 30 - 15);
                sp.style.setProperty("--tx", dx.toFixed(0) + "px");
                sp.style.setProperty("--ty", dy.toFixed(0) + "px");
                sp.style.setProperty("--r", (Math.random() * 540 - 270).toFixed(0) + "deg");
            });
        }
        if (style === "burn") {
            // Embers rise from the words themselves, not from the box.
            const ws = [...overlay.querySelectorAll(".rw")];
            const embers = ws.sort(() => Math.random() - 0.5).slice(0, Math.min(28, ws.length * 2)).map(sp => {
                const q = sp.getBoundingClientRect();
                const x = q.left - fr.left + Math.random() * q.width, y = q.top - fr.top + q.height / 2;
                return `<i class="ember" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;--d:${(0.2 + Math.random() * 1.1).toFixed(2)}s;--x:${(Math.random() * 30 - 15).toFixed(0)}px;--s:${(2 + Math.random() * 3).toFixed(1)}px"></i>`;
            }).join("");
            overlay.insertAdjacentHTML("beforeend", embers);
        }
        ta.value = "";
        track("rant_released", { mode: "type", style });     // never the words
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const ms = reduce ? 400 : style === "boom" ? 1500 : style === "burn" ? 2400 : style === "wash" ? 3000 : Math.min(2600, 1400 + words.length * 35);
        setTimeout(() => done(), ms);
    }
    // A still lake at rest. Colors come from CSS so it's dawn in light mode and moonlight in dark mode.
    let sceneId = 0;
    function restScene() {
        const k = "rs" + (++sceneId);
        const stars = [[40,26],[92,14],[150,34],[210,18],[262,40],[318,22],[362,48],[120,58],[236,62],[30,70]]
            .map(([x, y], i) => `<circle class="rs-star" cx="${x}" cy="${y}" r="${i % 3 ? 1 : 1.4}" style="animation-delay:${-i * 0.7}s"/>`).join("");
        return `<figure class="rant-rest" role="img" aria-label="A still lake under a quiet sky">
            <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" focusable="false">
                <defs>
                    <linearGradient id="${k}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="rs-sky1"/><stop offset="1" class="rs-sky2"/></linearGradient>
                    <linearGradient id="${k}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="rs-water1"/><stop offset="1" class="rs-water2"/></linearGradient>
                    <radialGradient id="${k}g"><stop offset="0" class="rs-glow"/><stop offset="1" class="rs-glow" stop-opacity="0"/></radialGradient>
                </defs>
                <rect width="400" height="200" fill="url(#${k}s)"/>
                <g class="rs-stars">${stars}</g>
                <circle cx="290" cy="74" r="46" fill="url(#${k}g)"/>
                <circle class="rs-orb" cx="290" cy="74" r="17"/>
                <path class="rs-hill1" d="M0 118 Q 60 86 130 104 T 260 98 T 400 108 L400 130 L0 130 Z"/>
                <path class="rs-hill2" d="M0 124 Q 90 106 180 120 T 400 116 L400 132 L0 132 Z"/>
                <rect y="128" width="400" height="72" fill="url(#${k}w)"/>
                <g class="rs-shine"><rect x="270" y="136" width="40" height="2" rx="1"/><rect x="278" y="146" width="24" height="2" rx="1"/><rect x="284" y="156" width="12" height="1.6" rx="1"/><rect x="287" y="166" width="6" height="1.4" rx="1"/></g>
                <g class="rs-ripples" fill="none"><ellipse cx="120" cy="170" rx="18" ry="3.5"/><ellipse cx="120" cy="170" rx="18" ry="3.5" style="animation-delay:-3s"/></g>
            </svg>
        </figure>`;
    }
    function done(title) {
        const field = $("#rantField"), controls = $("#rantControls");
        const html = `
            <div class="rant-done" role="status">
                <p class="rant-done-title">${title || (STYLES[lastStyle] ? STYLES[lastStyle].done : "It's gone.")}</p>
                <p class="rant-note">It wasn't saved or sent anywhere. How about one slow breath before you move on?</p>
                <div class="rant-next">
                    <button type="button" class="btn btn-ghost btn-sm" data-calm-swap="cyclic-sighing">🌬️ Breathe</button>
                    <button type="button" class="btn btn-ghost btn-sm" data-open-container>🌊 Set it aside</button>
                    <button type="button" class="btn btn-ghost btn-sm" data-need-jump="support">💬 Talk to someone</button>
                    <button type="button" class="btn btn-ghost btn-sm" data-rant-again>Rant again</button>
                </div>
            </div>`;
        if (field) {
            // Show the message in the same spot and fill the rest with a calm scene,
            // keeping the same total height (box + buttons) so the page stays put.
            let h = parseFloat(field.dataset.h) || field.offsetHeight;
            if (controls) { h += controls.offsetHeight + (parseFloat(getComputedStyle(controls).marginTop) || 0); controls.hidden = true; }
            field.innerHTML = html + restScene(); field.style.height = ""; field.style.minHeight = h + "px";
            field.classList.add("rant-field-done");
        } else {
            const box = $(".rant-aloud"); if (box) box.outerHTML = `<div class="rant-field-done rant-aloud-done">${html}${restScene()}</div>`;
        }
    }
    function showCheckIn() {
        clearInterval(autoGo); autoGo = null; $(".rant-timeup")?.remove();
        const crisis = window.EQ_CRISIS;
        $(".rant-checkin")?.remove();
        $("#rantField").insertAdjacentHTML("afterend", `
            <div class="rant-checkin" role="alert">
                <p class="rant-checkin-title">It sounds like things might be really heavy right now.</p>
                <p>You don't have to carry this alone. Someone can talk or text with you any time, for free.</p>
                <div class="rant-checkin-actions">
                    ${crisis ? crisis.crisisHtml({ id: "lifeline-988" }) + crisis.crisisHtml({ id: "cmhc-247" }) : `<a class="btn-call" href="tel:988">Call 988</a><a class="btn-text" href="sms:988">Text 988</a>`}
                </div>
                <button type="button" class="link-btn" data-rant-anyway>Let it go anyway</button>
            </div>`);
        track("rant_checkin_shown");                         // no text is recorded
    }

    // ---------- Talk instead of typing (speech to text) ----------
    function toggleMic() {
        if (rec) { stopMic(); return; }
        try {
            rec = new SpeechRec();
            rec.lang = "en-US"; rec.interimResults = true; rec.continuous = true;
            const ta = $("#rantText"), base = ta.value ? ta.value.trim() + " " : "";
            rec.onresult = ev => { ta.value = base + Array.from(ev.results).map(r => r[0].transcript).join(" "); };
            rec.onerror = ev => { stopMic(); msg(ev.error === "not-allowed" || ev.error === "service-not-allowed" ? "The microphone is blocked here. Try your keyboard's mic, or switch to “Say it out loud.”" : "Couldn't hear that. Try again or type instead."); };
            rec.onend = () => { if (rec) stopMic(); };
            rec.start();
            setMicUi(true); msg("Listening… tap again when you're done.");
        } catch (e) { rec = null; msg("Talking isn't available here. Try your keyboard's mic, or switch to “Say it out loud.”"); }
    }
    function stopMic() { if (rec) { try { rec.stop(); } catch (e) { /* ignore */ } rec = null; } setMicUi(false); }
    function setMicUi(on) { const b = $("[data-rant-mic]"); if (b) { b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "■ Stop talking" : "🎤 Talk instead of typing"; } }

    // ---------- Say it out loud (nothing recorded) ----------
    function startClock() {
        if (timer) return;
        extended = false; total = left = limit; seconds = 0;
        timer = setInterval(tick, 1000);
        paintClock();
    }
    function tick() {
        seconds += 1;
        if (limit) {
            left -= 1;
            if (left === 30) msg("30 seconds left. Start wrapping up.");
            if (left <= 0) { left = 0; paintClock(); clearInterval(timer); timer = null; timeUp(); return; }
        }
        paintClock();
    }
    function paintClock() {
        const fill = $("#rantBarFill"), lab = $("#rantLeft"), clock = $("#rantClock");
        if (fill && total) fill.style.width = (left / total * 100).toFixed(1) + "%";
        if (lab) lab.textContent = limit ? fmt(left) : "";
        if (clock) clock.textContent = limit ? fmt(left) : fmt(seconds);
        $("#rantTimer")?.classList.toggle("low", limit && left <= 30);
    }
    function timeUp() {
        if (mode === "aloud") { track("rant_released", { mode: "aloud", timed: true }); lastStyle = "away"; done("Time's up. Let it go."); return; }
        const ta = $("#rantText");
        if (!ta || !ta.value.trim()) { msg("Time's up."); return; }
        ta.readOnly = true; stopMic(); msg("");
        $("#rantField").insertAdjacentHTML("afterend", `
            <div class="rant-timeup" role="alert">
                <p class="rant-timeup-title">Time's up. Ready to let it go?</p>
                <div class="rant-actions">
                    ${extended ? "" : `<button type="button" class="btn btn-ghost btn-sm" data-rant-more>1 more minute</button>`}
                </div>
                <p class="rant-note">Pick how to let it go below, or it will ${STYLES[style].label.toLowerCase()} on its own in <b id="rantAuto">15</b> seconds.</p>
            </div>`);
        let n = 15;
        autoGo = setInterval(() => {
            n -= 1; const a = $("#rantAuto"); if (a) a.textContent = n;
            if (n <= 0) { clearInterval(autoGo); autoGo = null; release(style); }
        }, 1000);
        track("rant_time_up");
    }
    function oneMoreMinute() {
        clearInterval(autoGo); autoGo = null;
        $(".rant-timeup")?.remove();
        const ta = $("#rantText"); if (ta) { ta.readOnly = false; ta.focus(); }
        extended = true; total = left = 60;
        timer = setInterval(tick, 1000); paintClock(); msg("");
    }
    function toggleAloud() {
        const btn = $("[data-rant-aloud-start]");
        if (timer) { stopTimer(); track("rant_released", { mode: "aloud" }); lastStyle = "away"; done(); return; }
        startClock();
        if (btn) btn.textContent = "I'm done";
    }
    function stopTimer() { clearInterval(timer); timer = null; clearInterval(autoGo); autoGo = null; }

    // ---------- Wiring ----------
    document.addEventListener("click", e => {
        if (e.target.closest("#calmRantBtn")) {
            const box = $("#calmRant"), btn = $("#calmRantBtn");
            const open = box.hidden;
            box.hidden = !open; btn.classList.toggle("active", open); btn.setAttribute("aria-expanded", String(open));
            if (open) { render(); track("calm_choice", { choice: "rant" }); } else { stopMic(); stopTimer(); box.innerHTML = ""; }
            return;
        }
        const m = e.target.closest("[data-rant-mode]");
        if (m) { mode = m.dataset.rantMode; render(); return; }
        const go = e.target.closest("[data-rant-go]");
        if (go) { e.preventDefault(); release(go.dataset.rantGo); return; }
        const lb = e.target.closest("[data-rant-limit]");
        if (lb) {
            limit = +lb.dataset.rantLimit;
            try { localStorage.setItem("eq-rant-limit", String(limit)); } catch (er) { /* ignore */ }
            const keep = $("#rantText") ? $("#rantText").value : "";
            render(); if (keep && $("#rantText")) $("#rantText").value = keep;
            return;
        }
        if (e.target.closest("[data-rant-more]")) { oneMoreMinute(); return; }
        if (e.target.closest("[data-rant-anyway]")) { release(pendingStyle || style, true); return; }
        if (e.target.closest("[data-rant-mic]")) { toggleMic(); return; }
        if (e.target.closest("[data-rant-aloud-start]")) { toggleAloud(); return; }
        if (e.target.closest("[data-rant-again]")) { render(); return; }
    });
    // The clock starts with the first keystroke.
    document.addEventListener("input", e => { if (e.target.id === "rantText" && limit && !timer && !autoGo && !e.target.readOnly) startClock(); });
    // Leaving the Calm me panel wipes whatever was typed.
    document.addEventListener("click", e => {
        if (e.target.closest("#tabGuide, #tabSurprise")) { const box = $("#calmRant"); if (box && !box.hidden) { stopMic(); stopTimer(); box.innerHTML = ""; box.hidden = true; $("#calmRantBtn")?.classList.remove("active"); } }
    });
})();

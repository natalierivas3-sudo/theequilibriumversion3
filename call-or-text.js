// "988" links that don't say Call or Text ask first: Call 988 / Text 988.
// Links already labeled "Call 988" (or any sms: link) still go straight through.
(function () {
    const isAmbiguous = a => a && a.matches('a[href="tel:988"]') && !/^\s*call\b/i.test(a.textContent);
    window.eqAsk988 = isAmbiguous; // analytics.js uses this so the first tap isn't counted as a call

    const css = `
    .ct-backdrop{position:fixed;inset:0;background:rgba(20,24,22,.45);z-index:2000;display:flex;align-items:flex-end;justify-content:center}
    @media (min-width:640px){.ct-backdrop{align-items:center}}
    .ct-sheet{background:var(--white,#fff);color:var(--charcoal,#2C3531);width:min(420px,100%);border-radius:18px 18px 0 0;padding:22px 20px calc(20px + env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(0,0,0,.18)}
    @media (min-width:640px){.ct-sheet{border-radius:18px}}
    .ct-sheet h2{font-size:1.15rem;margin:0 0 4px}
    .ct-sheet p{margin:0 0 16px;font-size:.95rem;opacity:.85}
    .ct-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .ct-btn{display:flex;align-items:center;justify-content:center;min-height:52px;border-radius:12px;font-weight:700;font-size:1.05rem;text-decoration:none;background:var(--burnt-orange,#A84C00);color:var(--white,#fff);border:2px solid var(--burnt-orange,#A84C00)}
    .ct-btn.ct-text{background:transparent;color:var(--burnt-orange,#A84C00)}
    .ct-btn:focus-visible,.ct-cancel:focus-visible{outline:3px solid var(--sage-green,#4A6B5D);outline-offset:2px}
    .ct-cancel{display:block;width:100%;margin-top:10px;min-height:44px;background:none;border:0;color:inherit;font:inherit;text-decoration:underline;cursor:pointer}`;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    let lastFocus = null, backdrop = null;

    function close() {
        if (!backdrop) return;
        backdrop.remove(); backdrop = null;
        document.removeEventListener("keydown", onKey, true);
        lastFocus?.focus?.();
    }
    function onKey(e) {
        if (e.key === "Escape") { e.preventDefault(); close(); return; }
        if (e.key === "Tab") {
            const f = [...backdrop.querySelectorAll("a,button")];
            const i = f.indexOf(document.activeElement);
            if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
            else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
        }
    }
    function open(from) {
        lastFocus = from;
        const where = from.closest("#skills") ? "coping_skills" : from.closest("#calmPanel") ? "calm_me" : from.closest(".home-crisis, #home") ? "home" : "other";
        backdrop = document.createElement("div");
        backdrop.className = "ct-backdrop";
        backdrop.innerHTML = `
            <div class="ct-sheet" role="dialog" aria-modal="true" aria-labelledby="ctTitle">
                <h2 id="ctTitle">Reach 988</h2>
                <p>Free and confidential, 24/7. Call or text, whichever feels easier.</p>
                <div class="ct-row">
                    <a class="ct-btn" href="tel:988" data-where="${where}">Call 988</a>
                    <a class="ct-btn ct-text" href="sms:988" data-where="${where}">Text 988</a>
                </div>
                <button type="button" class="ct-cancel">Not now</button>
            </div>`;
        backdrop.addEventListener("click", e => {
            if (e.target === backdrop || e.target.closest(".ct-cancel")) close();
            else if (e.target.closest(".ct-btn")) setTimeout(close, 300);
        });
        document.body.appendChild(backdrop);
        document.addEventListener("keydown", onKey, true);
        backdrop.querySelector(".ct-btn").focus();
    }

    document.addEventListener("click", e => {
        const a = e.target.closest && e.target.closest("a");
        if (!isAmbiguous(a) || a.closest(".ct-sheet")) return;
        e.preventDefault();
        open(a);
    });
})();

/*
 * DIRECTIONS (prototype)
 * "Directions" + "Website" buttons for anything with a real location.
 * First tap asks Apple Maps or Google Maps; the choice can be remembered and changed.
 */
(function () {
    "use strict";
    const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
    };
    const track = (n, p) => { try { if (typeof window.gtag === "function") window.gtag("event", n, p || {}); } catch (e) { /* ignore */ } };
    const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);

    // Places by resource id: what to search for in the maps app. Far-away places get full addresses.
    const PLACES = {
        "cmhc": "UT Counseling and Mental Health Center, 100 W Dean Keeton St, Austin, TX",
        "recreational-sports-center": "Recreational Sports Center, 2001 San Jacinto Blvd, Austin, TX",
        "gregory-gym": "Gregory Gymnasium, 2101 Speedway, Austin, TX",
        "blanton-museum": "Blanton Museum of Art, 200 E Martin Luther King Jr Blvd, Austin, TX",
        "harry-ransom-center": "Harry Ransom Center, 300 W 21st St, Austin, TX",
        "elisabet-ney-museum": "Elisabet Ney Museum, 304 E 44th St, Austin, TX",
        "barton-springs-pool": "Barton Springs Pool, Austin, TX",
        "barton-creek-greenbelt": "Barton Creek Greenbelt, Austin, TX",
        "zilker-park": "Zilker Metropolitan Park, Austin, TX",
        "rose-shine-yoga": "Zilker Botanical Garden, 2220 Barton Springs Rd, Austin, TX",
        "purrfecto-cat-lounge": "Purr-fecto Cat Lounge, 2300 S Lamar Blvd, Austin, TX",
        "sydneys-cat-lounge": "Sydney's Cat Lounge, Austin, TX",
        "aac-volunteer": "Austin Animal Center, 7201 Levander Loop, Austin, TX",
        "austin-pets-alive": "Austin Pets Alive!, Austin, TX",
        "the-art-garage": "The Art Garage, Austin, TX",
        "austin-creative-reuse": "Austin Creative Reuse, Austin, TX",
        "bennu-coffee": "Bennu Coffee Highland, Austin, TX",
        "epoch-coffee": "Epoch Coffee North Loop, Austin, TX",
        "medici-guadalupe": "Medici Roasting, 2222 Guadalupe St, Austin, TX",
        "flightpath-coffee": "Flightpath Coffeehouse, Austin, TX",
        "codependent-monkeynest": "Monkey Nest Coffee, Austin, TX",
        "austin-zoo": "Austin Zoo, 10808 Rawhide Trail, Austin, TX",
        "capital-of-texas-zoo": "Capital of Texas Zoo, 376 Jenkins Rd, Cedar Creek, TX",
        "crowes-nest-farm": "Crowe's Nest Farm, 10300 Taylor Ln, Manor, TX",
        "jester-king-goats": "Jester King Brewery, 13187 Fitzhugh Rd, Austin, TX",
        "animal-world-snake-farm": "Animal World & Snake Farm Zoo, 5640 N Interstate 35 Frontage Rd, New Braunfels, TX",
        "natural-bridge-wildlife-ranch": "Natural Bridge Wildlife Ranch, 26515 Natural Bridge Caverns Rd, San Antonio, TX",
        "integral-care-pes": "Integral Care Psychiatric Emergency Services, 1165 Airport Blvd, Austin, TX",
        "racial-history-tour": "Littlefield House, 302 W 24th St, Austin, TX",
        "turtle-pond": "Turtle Pond, University of Texas at Austin",
        "color-inside": "The Color Inside, William C. Powers Jr. Student Activity Center, Austin, TX",
        "texas-science-museum": "Texas Science and Natural History Museum, 2400 Trinity St, Austin, TX",
        "lbj-library": "LBJ Presidential Library, 2313 Red River St, Austin, TX",
        "vac-gallery": "Visual Arts Center, 2300 Trinity St, Austin, TX",
        "waller-creek-path": "Waller Creek, Gregory Gym, Austin, TX",
        "os-cafe": "O's Campus Cafe, University of Texas at Austin",
        "littlefield-cafe": "Littlefield Patio Cafe, University of Texas at Austin",
        "tower-burgers": "Texas Union, 2308 Whitis Ave, Austin, TX",
        "kinsolving-dining": "Kinsolving Dining, University of Texas at Austin",
        "texas-expresso": "Etter-Harbin Alumni Center, 2110 San Jacinto Blvd, Austin, TX",
        "ufonda-truck": "Jester Center, 201 E 21st St, Austin, TX",
        "pins-mechanical": "Pins Mechanical Co., 4323 S Congress Ave, Austin, TX"
    };
    const NEAR_CAMPUS = /University of Texas|Guadalupe|Dean Keeton|San Jacinto|Speedway|21st St|24th St|Whitis|Trinity|Red River|Martin Luther King/i;

    // A destination is { q } (search text) or { lat, lng }, plus walk: true for short trips.
    function destFor(item) {
        if (!item) return null;
        if (item.lat != null && item.lng != null) return { lat: item.lat, lng: item.lng, walk: true, name: item.name || item.title };
        const q = PLACES[item.id];
        return q ? { q, walk: NEAR_CAMPUS.test(q), name: item.title } : null;
    }
    function link(dest, app) {
        if (dest.route) {
            const enc = encodeURIComponent, st = dest.route;
            if (app === "apple") return `https://maps.apple.com/?daddr=${enc(st[0])}&dirflg=w`;   // Apple links can't hold a multi-stop loop
            return `https://www.google.com/maps/dir/?api=1&travelmode=walking&origin=${enc(st[0])}&destination=${enc(st[st.length - 1])}&waypoints=${st.slice(1, -1).map(enc).join("%7C")}`;
        }
        const target = dest.lat != null ? `${dest.lat},${dest.lng}` : dest.q;
        const t = encodeURIComponent(target);
        if (app === "apple") return `https://maps.apple.com/?daddr=${t}${dest.walk ? "&dirflg=w" : ""}`;
        return `https://www.google.com/maps/dir/?api=1&destination=${t}${dest.walk ? "&travelmode=walking" : ""}`;
    }
    const chosen = () => null;   // Always ask Apple or Google (no remembered choice).
    const isMapsUrl = u => /google\.com\/maps|maps\.apple\.com|experience\.arcgis\.com/i.test(u || "");

    function dirButton(dest, cls) {
        const app = chosen();
        const href = app ? link(dest, app) : "#";
        const data = dest.lat != null ? `data-dir-lat="${dest.lat}" data-dir-lng="${dest.lng}"` : `data-dir-q="${esc(dest.q)}"`;
        return `<a class="${cls || "btn-dir"}" href="${esc(href)}" ${app ? 'target="_blank" rel="noopener noreferrer"' : ""} data-dir ${data} data-dir-walk="${dest.walk ? 1 : 0}" data-dir-name="${esc(dest.name || "")}">Directions</a>`;
    }
    // Apps: send iPhones to the App Store and Android phones to Google Play; laptops see both.
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOSPhone = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    function appHtml(item) {
        const a = item.app, out = [];
        if (isIOSPhone && a.ios) out.push(`<a class="btn-dir btn-app" href="${esc(a.ios)}" target="_blank" rel="noopener noreferrer" data-open>Get the app</a>`);
        else if (isAndroid && a.android) out.push(`<a class="btn-dir btn-app" href="${esc(a.android)}" target="_blank" rel="noopener noreferrer" data-open>Get the app</a>`);
        else {
            if (a.ios) out.push(`<a class="btn-dir btn-app" href="${esc(a.ios)}" target="_blank" rel="noopener noreferrer" data-open>App Store</a>`);
            if (a.android) out.push(`<a class="btn-site btn-app" href="${esc(a.android)}" target="_blank" rel="noopener noreferrer" data-open>Google Play</a>`);
        }
        if (a.web && (isIOSPhone || isAndroid)) out.push(`<a class="btn-site" href="${esc(a.web)}" target="_blank" rel="noopener noreferrer" data-open>Website</a>`);
        return `<span class="place-actions">${out.join("")}</span>`;
    }
    function routeButton(stops, name) {
        return `<span class="place-actions"><a class="btn-dir" href="#" data-dir data-dir-route="${esc(JSON.stringify(stops))}" data-dir-walk="1" data-dir-name="${esc(name)}">Walking route</a></span>`;
    }
    // Directions + Website buttons. Website only when the link is a real website (not a maps search).
    function actionsHtml(item, opts) {
        if (item.id === "campus-green-walk" && typeof CAMPUS_WALK_STOPS !== "undefined") return routeButton(CAMPUS_WALK_STOPS, item.title);
        const appLinks = item.app || (item.raw && item.raw.app);
        if (appLinks) return appHtml({ app: appLinks });
        const dest = destFor(item);
        const url = item.url || "";
        const site = url && !isMapsUrl(url) && !/^tel:/.test(url);
        if (!dest) return "";
        return `<span class="place-actions">${dirButton(dest)}${site ? `<a class="btn-site" href="${esc(url)}" target="_blank" rel="noopener noreferrer" data-open>Website</a>` : ""}</span>`;
    }

    // ---------- Choose Apple or Google ----------
    let sheet = null, pending = null;
    function buildSheet() {
        sheet = document.createElement("div");
        sheet.className = "dir-sheet";
        sheet.hidden = true;
        sheet.setAttribute("role", "dialog");
        sheet.setAttribute("aria-modal", "true");
        sheet.setAttribute("aria-labelledby", "dirSheetTitle");
        sheet.innerHTML = `
            <div class="dir-sheet-backdrop" data-dir-close></div>
            <div class="dir-sheet-panel">
                <p class="dir-sheet-title" id="dirSheetTitle">Get directions with</p>
                <p class="dir-sheet-place" id="dirSheetPlace"></p>
                <div class="dir-sheet-choices">
                    <a class="dir-choice" id="dirApple" target="_blank" rel="noopener noreferrer" data-app="apple">Apple Maps</a>
                    <a class="dir-choice" id="dirGoogle" target="_blank" rel="noopener noreferrer" data-app="google">Google Maps</a>
                </div>
                <button type="button" class="dir-sheet-cancel" data-dir-close>Cancel</button>
            </div>`;
        document.body.appendChild(sheet);
        sheet.addEventListener("click", e => {
            if (e.target.closest("[data-dir-close]")) { close(); return; }
            const choice = e.target.closest(".dir-choice");
            if (choice) {
                // The link itself opens the maps app (a real link, so it isn't blocked).
                track("directions_open", { app: choice.dataset.app, place: pending && pending.name });
                setTimeout(close, 50);
            }
        });
        document.addEventListener("keydown", e => { if (e.key === "Escape" && !sheet.hidden) close(); });
    }
    function open(dest) {
        if (!sheet) buildSheet();
        pending = dest;
        sheet.querySelector("#dirSheetPlace").textContent = dest.name || "";
        const a = sheet.querySelector("#dirApple"), g = sheet.querySelector("#dirGoogle");
        a.href = link(dest, "apple"); g.href = link(dest, "google");
        a.innerHTML = dest.route ? `Apple Maps <small>walk to the start</small>` : "Apple Maps";
        g.innerHTML = dest.route ? `Google Maps <small>full loop</small>` : "Google Maps";
        // Put the likely app first.
        const wrap = sheet.querySelector(".dir-sheet-choices");
        if (isApple) wrap.prepend(a); else wrap.prepend(g);
        sheet.hidden = false;
        (isApple ? a : g).focus();
    }
    function close() { if (sheet) sheet.hidden = true; pending = null; }

    function destFromEl(el) {
        const d = el.dataset;
        if (d.dirRoute) return { route: JSON.parse(d.dirRoute), walk: true, name: d.dirName };
        return d.dirLat ? { lat: +d.dirLat, lng: +d.dirLng, walk: d.dirWalk === "1", name: d.dirName } : { q: d.dirQ, walk: d.dirWalk === "1", name: d.dirName };
    }
    function refreshAll() {
        const app = chosen();
        document.querySelectorAll("[data-dir]").forEach(el => {
            if (app) { el.href = link(destFromEl(el), app); el.target = "_blank"; el.rel = "noopener noreferrer"; }
            else { el.href = "#"; el.removeAttribute("target"); }
        });
    }

    document.addEventListener("click", e => {
        const el = e.target.closest("[data-dir]");
        if (!el) return;
        if (!chosen()) { e.preventDefault(); open(destFromEl(el)); }
        else track("directions_open", { app: chosen(), place: el.dataset.dirName });
    });

    // "Directions app" setting under Tailor it.
    function syncPref() {
        document.querySelectorAll("[data-maps-app]").forEach(b => {
            const on = (chosen() || "ask") === b.dataset.mapsApp;
            b.classList.toggle("active", on);
            b.setAttribute("aria-pressed", String(on));
        });
    }
    document.addEventListener("click", e => {
        const b = e.target.closest("[data-maps-app]");
        if (!b) return;
        store.set("eq-maps-app", b.dataset.mapsApp === "ask" ? null : b.dataset.mapsApp);
        syncPref(); refreshAll();
    });
    document.addEventListener("DOMContentLoaded", syncPref);

    window.EQ_DIR = { destFor, actionsHtml, dirButton, routeButton, link, refreshAll, isMapsUrl };

    /* ---------- Crisis lines: one tap to call or text ---------- */
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    // iPhone and Android use slightly different formats for a pre-filled text.
    const smsHref = (num, body) => body ? `sms:${num}${isIOSDevice ? "&" : "?"}body=${encodeURIComponent(body)}` : `sms:${num}`;
    const CRISIS = {
        "lifeline-988": { call: "988", text: "988", callLabel: "Call 988", textLabel: "Text 988" },
        "cmhc-247": { call: "5124712255", callLabel: "Call 512-471-2255" },
        "integral-care-helpline": { call: "5124724357", callLabel: "Call 512-472-4357" },
        "crisis-text-line": { text: "741741", body: "HOME", textLabel: "Text HOME to 741741" }
    };
    function crisisHtml(item) {
        const c = CRISIS[item.id];
        if (!c) return "";
        return `<span class="crisis-actions">${c.call ? `<a class="btn-call" href="tel:${c.call}" data-crisis="call" data-crisis-id="${esc(item.id)}">${esc(c.callLabel)}</a>` : ""}${c.text ? `<a class="btn-text" href="${esc(smsHref(c.text, c.body))}" data-crisis="text" data-crisis-id="${esc(item.id)}">${esc(c.textLabel)}</a>` : ""}</span>`;
    }
    // Fix up any static text links on the page (the crisis box) for this phone's format.
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("[data-sms]").forEach(a => { a.href = smsHref(a.dataset.sms, a.dataset.smsBody); });
    });
    document.addEventListener("click", e => {
        const a = e.target.closest("[data-crisis]");
        if (a) track("crisis_contact", { method: a.dataset.crisis, line: a.dataset.crisisId || "crisis-box" });   // no personal data
    });
    window.EQ_CRISIS = { crisisHtml, smsHref };
})();

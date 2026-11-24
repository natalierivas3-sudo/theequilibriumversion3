/*
 * CALM SCENES for the container exercise.
 * Soft, hand-drawn nature illustrations (inline SVG): pale skies, distant hills, calm water.
 * Trauma-informed: no people, no enclosed or dark spaces, no rough water, nothing sudden.
 * Motion is slow and stops for anyone with "reduce motion" turned on.
 */
(function () {
    "use strict";
    const W = 400, H = 200;
    let uid = 0;

    // Gentle wave line across the width.
    function wave(y, amp, len, phase) {
        let d = `M -40 ${y}`;
        for (let x = -40; x <= W + 80; x += len / 2) {
            const up = Math.round((x / (len / 2) + phase) % 2) === 0;
            d += ` Q ${x + len / 4} ${up ? y - amp : y + amp} ${x + len / 2} ${y}`;
        }
        return d + ` L ${W + 80} ${H} L -40 ${H} Z`;
    }
    function hills(y, amp, seed) {
        let d = `M 0 ${y}`;
        const pts = 6;
        for (let i = 1; i <= pts; i++) {
            const x = (W / pts) * i;
            const h = y - amp * (0.5 + 0.5 * Math.sin(i * 1.7 + seed));
            d += ` Q ${x - W / pts / 2} ${h} ${x} ${y - amp * 0.3 * Math.cos(i + seed)}`;
        }
        return d + ` L ${W} ${H} L 0 ${H} Z`;
    }
    function sky(id, top, bottom) {
        return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;
    }
    function clouds(n) {
        let out = "";
        for (let i = 0; i < n; i++) {
            const x = 40 + i * 120 + (i % 2) * 30, y = 30 + (i % 3) * 14;
            out += `<g class="cs-cloud" style="animation-delay:${-i * 9}s"><ellipse cx="${x}" cy="${y}" rx="34" ry="9" fill="#fff" opacity=".7"/><ellipse cx="${x + 18}" cy="${y - 5}" rx="20" ry="8" fill="#fff" opacity=".7"/></g>`;
        }
        return out;
    }

    const SCENES = {
        // Soft dawn over layered hills.
        dawn(k) {
            return `<defs>${sky(k + "s", "#DCEAF6", "#F6EEE8")}</defs>
                <rect width="${W}" height="${H}" fill="url(#${k}s)"/>
                <circle cx="300" cy="96" r="24" fill="#FFF4E2" opacity=".9"/>
                ${clouds(3)}
                <path d="${hills(140, 34, 1)}" fill="#C9DCEB"/>
                <path d="${hills(160, 26, 3)}" fill="#AFCADF"/>
                <path d="${hills(182, 18, 5)}" fill="#93B6D0"/>`;
        },
        // Calm open water under a pale sky.
        sea(k) {
            return `<defs>${sky(k + "s", "#D6E8F5", "#EEF5FA")}${sky(k + "w", "#A9CBE3", "#7FA9C9")}</defs>
                <rect width="${W}" height="${H}" fill="url(#${k}s)"/>
                ${clouds(3)}
                <rect y="112" width="${W}" height="88" fill="url(#${k}w)"/>
                <path class="cs-wave cs-w1" d="${wave(122, 3, 70, 0)}" fill="#B9D6EA" opacity=".85"/>
                <path class="cs-wave cs-w2" d="${wave(142, 4, 90, 1)}" fill="#9EC3DD" opacity=".8"/>
                <path class="cs-wave cs-w3" d="${wave(166, 5, 110, 0)}" fill="#86B1D1" opacity=".8"/>`;
        },
        // Quiet shoreline with soft sand.
        shore(k) {
            return `<defs>${sky(k + "s", "#DDEBF6", "#F4F1EA")}</defs>
                <rect width="${W}" height="${H}" fill="url(#${k}s)"/>
                ${clouds(2)}
                <rect y="104" width="${W}" height="60" fill="#A7C9E0"/>
                <path class="cs-wave cs-w1" d="${wave(112, 3, 80, 0)}" fill="#BCD8EA" opacity=".9"/>
                <path d="M0 150 Q 120 136 220 148 T 400 142 L 400 200 L 0 200 Z" fill="#EFE3D0"/>
                <path class="cs-foam" d="M0 150 Q 120 136 220 148 T 400 142" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>`;
        },
        // Still water with slow ripples (letting it go).
        ripples(k) {
            return `<defs>${sky(k + "s", "#DCEBF6", "#C5DDEE")}${sky(k + "w", "#B7D4E8", "#9CC1DB")}</defs>
                <rect width="${W}" height="${H}" fill="url(#${k}s)"/>
                <rect y="96" width="${W}" height="104" fill="url(#${k}w)"/>
                <g fill="none" stroke="#fff" stroke-width="1.5">
                    <ellipse class="cs-ripple" cx="200" cy="150" rx="20" ry="5" style="animation-delay:0s"/>
                    <ellipse class="cs-ripple" cx="200" cy="150" rx="20" ry="5" style="animation-delay:-2.5s"/>
                    <ellipse class="cs-ripple" cx="200" cy="150" rx="20" ry="5" style="animation-delay:-5s"/>
                </g>`;
        },
        // Gentle sunset over water.
        sunset(k) {
            return `<defs>${sky(k + "s", "#CFE0F1", "#F7D9C9")}${sky(k + "w", "#B9CFE3", "#8FB0CC")}</defs>
                <rect width="${W}" height="${H}" fill="url(#${k}s)"/>
                <circle class="cs-sun" cx="200" cy="118" r="30" fill="#FBE3C6"/>
                <rect y="118" width="${W}" height="82" fill="url(#${k}w)"/>
                <g fill="#FBE3C6" opacity=".7"><rect x="176" y="126" width="48" height="2.5" rx="1"/><rect x="186" y="136" width="28" height="2" rx="1"/><rect x="192" y="146" width="16" height="2" rx="1"/></g>
                <path class="cs-wave cs-w2" d="${wave(160, 3, 100, 0)}" fill="#86A9C6" opacity=".6"/>`;
        },
        // Open meadow and soft hills (coming back).
        meadow(k) {
            return `<defs>${sky(k + "s", "#D9EAF7", "#F2F6F2")}</defs>
                <rect width="${W}" height="${H}" fill="url(#${k}s)"/>
                <circle cx="90" cy="62" r="20" fill="#FFF6E6" opacity=".9"/>
                ${clouds(3)}
                <path d="${hills(140, 30, 2)}" fill="#BFD8E6"/>
                <path d="${hills(162, 24, 4)}" fill="#C7DDC9"/>
                <path d="${hills(184, 16, 6)}" fill="#AFCDB3"/>`;
        }
    };

    function sceneHtml(name, label) {
        const draw = SCENES[name] || SCENES.dawn;
        const k = "cs" + (++uid);
        return `<figure class="calm-scene" role="img" aria-label="${label || "A calm nature scene"}">
            <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" focusable="false">${draw(k)}</svg>
        </figure>`;
    }

    // Which scene goes with each step of the container exercise.
    const STEP_SCENES = [
        ["dawn", "Soft dawn light over distant hills"],          // Settle in
        ["sea", "Calm open water under a pale sky"],             // Bring it to mind
        ["shore", "A quiet shoreline with gentle waves"],        // Notice what's around it
        ["sea", "Calm open water under a pale sky"],             // Open it
        ["sea", "Calm open water under a pale sky"],             // Put things inside
        ["shore", "A quiet shoreline with gentle waves"],        // Close it
        ["ripples", "Slow ripples spreading across still water"],// Let it go
        ["sunset", "A gentle sunset over the water"],            // Look around
        null,                                                    // Breathe (the breathing circle is the visual)
        ["meadow", "An open meadow under a soft sky"]            // Come back
    ];

    window.EQ_SCENES = { sceneHtml, STEP_SCENES };
})();

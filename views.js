/*
 * Draft B: page views.
 * Home shows the question, the three buttons and the six choices.
 * Study spots, All resources, UT maps and Crisis support each show on their own page.
 */
(function () {
    "use strict";

    function setup() {
        const body = document.body;
        const pages = Array.from(document.querySelectorAll("main > section.page-view"));
        const navLinks = Array.from(document.querySelectorAll("#primary-nav a"));

        function route() {
            const h = decodeURIComponent(location.hash.slice(1));
            if (h === "about") {
                pages.forEach(p => p.classList.remove("is-current"));
                body.classList.remove("on-page");
                return;
            }
            const el = h ? document.getElementById(h) : null;
            const page = el ? el.closest("main > section.page-view") : null;
            pages.forEach(p => p.classList.toggle("is-current", p === page));
            body.classList.toggle("on-page", !!page);
            const key = page ? "#" + page.id : "#home";
            navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === key));
            if (page) {
                if (el === page) window.scrollTo(0, 0);
                else requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
            } else if (!h || h === "home") {
                window.scrollTo(0, 0);
            }
        }

        window.addEventListener("hashchange", route);
        window.addEventListener("popstate", route);
        // Links that leave the About page change the address without a hashchange.
        document.addEventListener("click", e => {
            if (e.target.closest("[data-about-back]")) setTimeout(route, 0);
        });
        route();
        // Static route links (UT maps) pick up the saved Apple/Google Maps choice.
        if (window.EQ_DIR && window.EQ_DIR.refreshAll) window.EQ_DIR.refreshAll();

        // Results stay hidden until someone picks something.
        const title = document.getElementById("resultsTitle");
        const sync = () => body.classList.toggle("need-picked", !!title && title.textContent.trim() !== "Good places to start");
        if (title) new MutationObserver(sync).observe(title, { childList: true, characterData: true, subtree: true });
        sync();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup, { once: true });
    else setup();
})();

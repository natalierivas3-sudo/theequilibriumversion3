/*
 * RESEARCH-BACKED SWAPS for "Instead of doomscrolling"
 * evidence: "strong" (many trials pooled), "good" (randomized trial or several experiments),
 *           "early" (small study, no control group, or survey data). Keep it honest.
 * icon: one emoji shown beside the title, matching the site's category tiles.
 * action (optional): { need, sub } jumps to a list on the site; { prompt: true } opens an art prompt;
 *                    { copy: "text" } copies a ready-to-send message.
 */
const SCROLL_SWAPS = [
    {
        id: "cyclic-sighing", icon: "🌬️", kind: "swap", minutes: 5, evidence: "good",
        title: "Breathe with a long exhale",
        how: "Breathe in through your nose, then take a second short sip of air to fill your lungs. Breathe out slowly through your mouth until empty. Repeat for 5 minutes.",
        why: "In a month-long randomized study at Stanford, 5 minutes a day of this “cyclic sighing” improved mood more than the same time spent on mindfulness meditation.",
        source: "Balban et al., 2023, Cell Reports Medicine", url: "https://pubmed.ncbi.nlm.nih.gov/36630953/"
    },
    {
        id: "move-10", icon: "🚶", kind: "swap", minutes: 10, evidence: "strong",
        title: "Move for 10 minutes",
        how: "Walk a lap, stretch, dance to two songs, or do stairs. Any kind counts.",
        why: "A review of over 1,000 trials found physical activity eases depression and anxiety about as much as therapy or medication, and shorter sessions worked well.",
        source: "Singh et al., 2023, British Journal of Sports Medicine", url: "https://bjsm.bmj.com/content/bjsports/early/2023/07/11/bjsports-2022-106195.full.pdf",
        action: { need: "move", label: "Find a way to move →" }
    },
    {
        id: "go-green", icon: "🌳", kind: "swap", minutes: 15, evidence: "good",
        title: "Step outside somewhere green",
        how: "Go to the nearest tree, lawn, or water. Leave your phone in your pocket.",
        why: "A walk in nature reduced rumination (getting stuck on negative thoughts) compared with a city walk. People who spend 2+ hours a week in nature report better health and wellbeing, and it can be split into short visits.",
        source: "Bratman et al., 2015, PNAS; White et al., 2019, Scientific Reports", url: "https://pubmed.ncbi.nlm.nih.gov/26124129",
        action: { need: "outdoors", sub: "On campus", label: "Find a green spot on campus →" }
    },
    {
        id: "reach-out", icon: "💬", kind: "swap", minutes: 2, evidence: "good",
        title: "Text someone you haven't talked to in a while",
        how: "Pick one person who crossed your mind recently and send a short message. No reason needed.",
        why: "Across 13 experiments with 5,900+ people, those who reached out underestimated how much the other person appreciated it, especially when the message was a surprise.",
        source: "Liu et al., 2022, Journal of Personality and Social Psychology", url: "https://pubmed.ncbi.nlm.nih.gov/35816566/",
        action: { copy: "Hey! You popped into my head today and I wanted to say hi. How are you doing?", label: "Copy a starter text" }
    },
    {
        id: "pet-animal", icon: "🐾", kind: "swap", minutes: 10, evidence: "good",
        title: "Pet an animal",
        how: "A roommate's dog, a cat lounge, or a shelter visit.",
        why: "In a randomized study of 249 college students, 10 minutes of petting cats and dogs lowered cortisol, a stress hormone, compared with just watching or looking at photos.",
        source: "Pendry & Vandagriff, 2019, AERA Open", url: "https://news.wsu.edu/press-release/2019/07/15/study-demonstrates-stress-reduction-benefits-petting-dogs-cats/",
        action: { need: "break", sub: "Animals", label: "Find animals near you →" }
    },
    {
        id: "three-good", icon: "✍️", kind: "swap", minutes: 3, evidence: "good",
        title: "Write down three good things",
        how: "What went well today? Tiny counts. Type, speak, or tap a few below.",
        why: "In a randomized trial, doing this nightly for a week raised happiness and lowered depressive symptoms for up to six months. Later studies found smaller but still positive effects.",
        source: "Seligman et al., 2005, American Psychologist", url: "https://pubmed.ncbi.nlm.nih.gov/16045394/"
    },
    {
        id: "make-art", icon: "🎨", kind: "swap", minutes: 5, evidence: "early",
        title: "Make something",
        how: "Doodle, color, or build something tiny. Skill doesn't matter.",
        why: "In a small study, 45 minutes of art making lowered cortisol in about 3 out of 4 adults, whether or not they had art experience. The study had no comparison group.",
        source: "Kaimal et al., 2016, Art Therapy", url: "https://drexel.edu/news/archive/2016/june/art_hormone_levels_lower",
        action: { prompt: true, label: "Give me a prompt →" }
    },
    {
        id: "awe-walk", icon: "✨", kind: "swap", minutes: 15, evidence: "early",
        title: "Take an awe walk",
        how: "Walk for 15 minutes and look for things that surprise you: the Tower at sunset, a huge oak, the sky. Notice small details like you're seeing them for the first time.",
        why: "In an 8-week randomized study, people who took weekly awe walks felt more joy and gratitude and less daily distress than people on regular walks. The study was small and in older adults.",
        source: "Sturm et al., 2020, Emotion", url: "https://www.ucsf.edu/news/2020/09/418551/awe-walks-boost-emotional-well-being",
        action: { need: "outdoors", sub: "On campus", label: "Try the Campus Reset Walk →" }
    }
];

// Settings that make scrolling less sticky.
const SCROLL_SETTINGS = [
    {
        id: "grayscale", icon: "⚫", kind: "setting", minutes: 1, evidence: "early",
        title: "Turn your phone gray",
        how: "iPhone: Settings → Accessibility → Display & Text Size → Color Filters → Grayscale. Android: search Settings for “grayscale.” Tip: on iPhone, set Accessibility Shortcut to Color Filters so a triple-click toggles it.",
        why: "College students who switched to grayscale for about a week used their phones roughly 38 minutes less a day, mostly less social media and browsing.",
        source: "Holte & Ferraro, 2020, The Social Science Journal", url: "https://edition-prod-cf.sitemirror.cnn.com/2020/06/11/health/smartphone-hack-reduce-screen-time-wellness/index.html"
    },
    {
        id: "app-limits", icon: "⏱️", kind: "setting", minutes: 2, evidence: "good",
        title: "Cap social apps at about 30 minutes a day",
        how: "iPhone: Settings → Screen Time → App Limits. Android: Settings → Digital Wellbeing → Dashboard → set a timer per app.",
        why: "Undergrads who limited Facebook, Instagram, and Snapchat to 10 minutes each per day for three weeks felt significantly less lonely and depressed. You don't have to quit.",
        source: "Hunt et al., 2018, Journal of Social and Clinical Psychology", url: "https://techcrunch.com/2018/11/09/limiting-social-media-use-reduced-loneliness-and-depression-in-new-experiment"
    }
];

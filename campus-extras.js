/*
 * CAMPUS EXTRAS (prototype only)
 * New on-campus outdoor options, the walking route, and study-spot photos.
 */

// Paste the tour link here when you have it. The card stays hidden while this is empty.
const RACIAL_HISTORY_TOUR_URL = "https://racialgeographytour.org/";

// Walking route: opens Google Maps walking directions. Stops are in walking order.
const CAMPUS_WALK_STOPS = [
    "UT Tower, Austin, TX",
    "Turtle Pond, University of Texas at Austin",
    "Blanton Museum of Art, Austin, TX",
    "Littlefield Fountain, Austin, TX",
    "UT Tower, Austin, TX"
];

function googleWalkUrl(stops) {
    const enc = s => encodeURIComponent(s);
    const waypoints = stops.slice(1, -1).map(enc).join("%7C");
    return "https://www.google.com/maps/dir/?api=1&travelmode=walking" +
        "&origin=" + enc(stops[0]) +
        "&destination=" + enc(stops[stops.length - 1]) +
        (waypoints ? "&waypoints=" + waypoints : "");
}

const CAMPUS_EXTRAS = [
    {
        id: "campus-green-walk",
        title: "Campus Reset Walk",
        category: "outdoors",
        resourceType: "Student Pick",
        section: "Walking Route",
        description: "A 30-minute campus loop to clear your head. Go solo or send it to a friend.",
        stops: ["UT Tower", "Turtle Pond", "Blanton Museum", "Littlefield Fountain", "South Mall back to the Tower"],
        url: googleWalkUrl(CAMPUS_WALK_STOPS),
        linkText: "Open walking route in Google Maps",
        tags: ["outdoors", "on campus", "free", "nature", "outdoor movement"],
        cost: "Free",
        hours: "About 25–35 min · roughly 1.5 miles",
        lastVerified: "",
        source: "Student recommendation"
    },
    {
        id: "turtle-pond",
        title: "Turtle Pond",
        category: "outdoors",
        resourceType: "UT Spot",
        section: "Sit Outside",
        description: "A shady pond north of the Tower where turtles sun themselves on the rocks. A good five-minute sit between classes.",
        url: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Turtle Pond, University of Texas at Austin"),
        linkText: "Find on Google Maps",
        tags: ["outdoors", "on campus", "free", "nature"],
        cost: "Free",
        hours: "Outdoor access",
        lastVerified: "",
        source: "Student recommendation"
    },
    {
        id: "nature-rx-maps",
        title: "UT Nature Rx & Nap Maps",
        category: "outdoors",
        resourceType: "UT Resource",
        section: "Sit Outside",
        description: "Official UT maps of the best green spaces on campus for a calm break, plus student-rated nap spots.",
        url: "https://www.healthyhorns.utexas.edu/lwc/wellness-resource-maps.html",
        linkText: "View the maps",
        tags: ["outdoors", "on campus", "free", "included for students", "nature", "mindfulness"],
        cost: "Free",
        hours: "",
        lastVerified: "2026-09-09",
        source: "Official UT"
    },
    {
        id: "racial-history-tour",
        title: "Racial Geography Tour of UT Austin",
        category: "explore",
        resourceType: "UT Resource",
        section: "Walking Tour",
        description: "A self-guided walking tour of UT's racial geography and public history, with a 360° video and transcript at each stop. It starts at the Littlefield House (302 W 24th St), across from the original 40 acres. Go on your own or bring friends.",
        url: RACIAL_HISTORY_TOUR_URL,
        linkText: "Start the tour",
        tags: ["outdoors", "on campus", "free", "outdoor movement", "events"],
        cost: "Free",
        hours: "Self-guided · start anytime",
        lastVerified: "",
        source: "Official UT"
    },
    {
        id: "do512-animals",
        title: "Where to See Animals in Austin",
        category: "break",
        resourceType: "Community Guide",
        section: "Pets & Animals",
        description: "Do512's guide to zoos, farms, cat lounges, and shelters in and around Austin, from the all-rescue Austin Zoo to a drive-through safari. The picks are also listed one by one below.",
        url: "https://do512.com/p/where-to-see-animals-in-austin",
        linkText: "Browse the animal guide",
        tags: ["off campus", "pets", "local find"],
        cost: "Free & Paid Options",
        hours: "",
        lastVerified: "",
        source: "Do512"
    },
    // From Do512's "Where to See Animals in Austin". In town first, then day trips.
    {
        id: "austin-zoo", title: "Austin Zoo", category: "break", resourceType: "Community Resource", section: "Pets & Animals",
        description: "An all-rescue zoo in southwest Austin (10808 Rawhide Trail). Monkeys, big cats, and a shady walk. Buy tickets at the entrance.",
        url: "https://austinzoo.org/about/", linkText: "Visit Austin Zoo",
        tags: ["off campus", "pets", "outdoors", "needs a car"], cost: "Paid", hours: "", lastVerified: "", source: "Do512"
    },
    {
        id: "sydneys-cat-lounge", title: "Sydney's Cat Lounge", category: "break", resourceType: "Community Resource", section: "Pets & Animals",
        description: "Another Austin cat lounge for a cozy hour with adoptable cats.",
        url: "https://www.sydneyscatlounge.com/home", linkText: "Visit Sydney's",
        tags: ["off campus", "pets"], cost: "Paid", hours: "", lastVerified: "", source: "Do512"
    },
    {
        id: "capital-of-texas-zoo", title: "Capital of Texas Zoo", category: "break", resourceType: "Community Resource", section: "Pets & Animals",
        description: "A small wildlife park about 20 minutes east of downtown (376 Jenkins Rd) with over 500 animals, from lemurs to tigers to birds of prey.",
        url: "https://capitaloftexaszoo.org/", linkText: "Visit the zoo",
        tags: ["off campus", "pets", "outdoors", "needs a car"], cost: "Paid", hours: "", lastVerified: "", source: "Do512"
    },
    {
        id: "crowes-nest-farm", title: "Crowe's Nest Farm", category: "break", resourceType: "Community Resource", section: "Pets & Animals",
        description: "A 100-acre working farm and animal sanctuary near Manor (10300 Taylor Ln) with bison, llamas, donkeys, goats, pigs, and more. Open Tuesday to Saturday mornings, no reservation needed.",
        url: "https://www.crowesnestfarm.org/", linkText: "Visit the farm",
        tags: ["off campus", "pets", "outdoors", "needs a car", "day trip"], cost: "Paid", hours: "Tue–Sat 10 AM–2 PM (check before going)", lastVerified: "", source: "Do512"
    },
    {
        id: "jester-king-goats", title: "Jester King Brewery Goats", category: "break", resourceType: "Community Resource", section: "Pets & Animals",
        description: "A farmhouse brewery out past Dripping Springs (13187 Fitzhugh Rd) with resident goats. Catch them at the right time and you might see babies.",
        url: "https://jesterkingbrewery.com/", linkText: "Visit Jester King",
        tags: ["off campus", "pets", "outdoors", "needs a car", "day trip"], cost: "Free & Paid Options", hours: "", lastVerified: "", source: "Do512"
    },
    {
        id: "animal-world-snake-farm", title: "Animal World & Snake Farm Zoo", category: "break", resourceType: "Community Resource", section: "Pets & Animals",
        description: "A hands-on zoo in New Braunfels with gators, pythons, fennec foxes, and bookable animal encounters. Arrive in time for the carnivore feeding if you're not squeamish.",
        url: "https://www.awsfzoo.com", linkText: "Visit Animal World",
        tags: ["off campus", "pets", "needs a car", "day trip"], cost: "Paid", hours: "", lastVerified: "", source: "Do512"
    },
    {
        id: "natural-bridge-wildlife-ranch", title: "Natural Bridge Wildlife Ranch", category: "break", resourceType: "Community Resource", section: "Pets & Animals",
        description: "A drive-through safari on 450 acres outside San Antonio. Feed zebras, camels, and ostriches from your car. One bag of feed comes with admission.",
        url: "https://www.wildliferanchtexas.com/", linkText: "Visit the ranch",
        tags: ["off campus", "pets", "outdoors", "needs a car", "day trip"], cost: "Paid", hours: "", lastVerified: "", source: "Do512"
    },
    // Event and fitness finders
    {
        id: "sweatpals", title: "SweatPals", category: "move", resourceType: "Community Platform", section: "Movement",
        description: "One place to find fitness and wellness events around Austin: run clubs, dance and Zumba classes, sunrise parties, and group workouts where you can meet people. Set your location to Austin.",
        url: "https://www.sweatpals.com/discover", linkText: "Find a workout near you",
        tags: ["off campus", "sports", "fitness", "events", "community"], cost: "Price Varies", hours: "", lastVerified: "2026-11-20", source: "SweatPals"
    },
    {
        id: "posh-austin", title: "POSH Events", category: "explore", resourceType: "Community Platform", section: "Things to Do",
        description: "Flyers and tickets for local events around Austin: parties, pop-ups, markets, and community nights. Check each event's price and age limit.",
        url: "https://posh.vip/explore?location=custom&place=Austin,+TX&lat=30.267153&lng=-97.7430608", linkText: "Browse Austin events",
        tags: ["off campus", "events", "whats happening now", "community"], cost: "Price Varies", hours: "", lastVerified: "", source: "POSH"
    },
    // Integral Care: Travis County's public mental health center
    {
        id: "integral-care-helpline", title: "Integral Care 24/7 Crisis Helpline", category: "support", resourceType: "Community Resource", section: "Crisis Support",
        description: "Call 512-472-HELP (4357) any time for immediate emotional support, for yourself or someone you're worried about. Press 1 for English, then 1. For anyone in Austin and Travis County, regardless of ability to pay, in many languages.",
        url: "tel:5124724357", linkText: "Call 512-472-4357",
        tags: ["off campus", "free", "community"], cost: "Free", hours: "24/7", lastVerified: "2026-11-20", source: "Integral Care"
    },
    {
        id: "integral-care-pes", title: "Integral Care Walk-In Mental Health Urgent Care", category: "support", resourceType: "Community Resource", section: "Crisis Support",
        description: "Psychiatric Emergency Services: walk-in mental health urgent care for adults and children. No appointment needed. 1165 Airport Blvd, 2nd floor, Austin 78702. Hours have changed recently, so check before you go or call 512-472-4357.",
        url: "https://integralcare.org/program/psychiatric-emergency-services-pes/", linkText: "Check hours & directions",
        tags: ["off campus", "community"], cost: "Regardless of ability to pay", hours: "", lastVerified: "2026-11-20", source: "Integral Care"
    },
    {
        id: "integral-care", title: "Integral Care Mental Health Services", category: "support", resourceType: "Community Resource", section: "Mental Health / Support",
        description: "Travis County's public mental health center: counseling, psychiatric care, and support for substance use and developmental disabilities. A good option if you're not a UT student or want care off campus.",
        url: "https://integralcare.org/", linkText: "Visit Integral Care",
        tags: ["off campus", "community"], cost: "Regardless of ability to pay", hours: "", lastVerified: "2026-11-20", source: "Integral Care"
    }
].filter(r => r.url);

// Add the extras to the main list so they also appear in "All Resources" and search.
if (typeof WELLNESS_RESOURCES !== "undefined") WELLNESS_RESOURCES.push(...CAMPUS_EXTRAS);

// Who's around, for the extras.
const CAMPUS_EXTRAS_SOCIAL = {
    "campus-green-walk": ["solo", "around", "connect"],
    "turtle-pond": ["solo", "around"],
    "nature-rx-maps": ["solo", "around"],
    "racial-history-tour": ["solo", "connect"],
    "do512-animals": ["solo", "around", "connect"],
    "austin-zoo": ["solo", "around", "connect"],
    "sydneys-cat-lounge": ["solo", "around"],
    "capital-of-texas-zoo": ["solo", "around", "connect"],
    "crowes-nest-farm": ["solo", "around", "connect"],
    "jester-king-goats": ["solo", "around", "connect"],
    "animal-world-snake-farm": ["solo", "around", "connect"],
    "natural-bridge-wildlife-ranch": ["solo", "connect"],
    "sweatpals": ["around", "connect"],
    "posh-austin": ["around", "connect"]
};

/*
 * STUDY SPOT PHOTOS
 * Put photo files in prototype/photos/ and map the spot name to the file.
 * Example:  "Texas Union": "photos/texas-union.jpg",
 * Spots without a photo show a "photo needed" placeholder in this test version.
 */
const SPOT_PHOTOS = {
};

/*
 * STUDENT-RECOMMENDED SPOTS (from r/UTAustin threads, Nov 2026 review)
 * quote: a short line from a UT student. tip: practical advice. nap: good for napping.
 * safety: shown as a gentle note on the card.
 */
const mapsSearch = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q + ", University of Texas at Austin");

const NEW_STUDY_SPOTS = [
    { name: "WCP 3rd-floor sky terrace", type: "outdoor", vibe: "quiet", hours: "Building hours", openLate: false, outlets: false, coffeeNearby: true, campus: true,
      url: mapsSearch("William C. Powers Jr. Student Activity Center"), tip: "Take the elevator to the 3rd floor. Small, quiet, and good for lunch.", quote: "It's small and quiet. I used to have lunch up there." },
    { name: "RLP–WCP 4th-floor skybridge", type: "indoor", vibe: "quiet", hours: "Building hours", openLate: false, outlets: false, coffeeNearby: true, campus: true,
      url: mapsSearch("William C. Powers Jr. Student Activity Center"), tip: "Easier to find from the WCP end.", quote: "I've never had an issue finding seating." },
    { name: "Welch Hall patios", type: "outdoor", vibe: "quiet", hours: "Outdoor access", openLate: false, outlets: false, coffeeNearby: false, campus: true,
      url: mapsSearch("Welch Hall"), tip: "Take the outdoor staircase between the old and new parts of Welch, or the elevator to the 3rd floor.", quote: "There's like 4 super pretty patios around Welch." },
    { name: "Law School courtyard", type: "outdoor", vibe: "quiet", hours: "Outdoor access", openLate: false, outlets: false, coffeeNearby: false, campus: true,
      url: mapsSearch("Townes Hall UT Law"), tip: "A bit of a walk to the east side of campus, and worth it.", quote: "Giant fans outside, lots of greenery, and cute, clean tables." },
    { name: "Moody College (DMC) upper floors", type: "indoor", vibe: "quiet", hours: "Building hours", openLate: false, outlets: false, coffeeNearby: false, campus: true,
      url: mapsSearch("Dealey Center for New Media"), tip: "Go above the 2nd floor for seats with views of the Tower and the skybridge.", quote: "Nice small study spots and hidden doors." },
    { name: "Walter Geology Library (Jackson Geosciences)", type: "indoor", vibe: "quiet", hours: "Check library hours", openLate: false, outlets: true, coffeeNearby: false, campus: true,
      url: mapsSearch("Jackson Geological Sciences Building"), nap: true, tip: "There's a big gem collection right next to the library.", quote: "Has couches that are actually really comfortable." },
    { name: "Engineering Education & Research Center (EER)", type: "indoor", vibe: "social", hours: "Building hours", openLate: false, outlets: true, coffeeNearby: false, campus: true,
      url: mapsSearch("Engineering Education and Research Center"), tip: "Quieter before 11 AM or after 5 PM. Has study rooms and top-floor seating." },
    { name: "Physics, Math & Astronomy Library (RLM, 2nd floor)", type: "indoor", vibe: "quiet", hours: "Check library hours", openLate: false, outlets: true, coffeeNearby: false, campus: true,
      url: mapsSearch("Robert Lee Moore Hall"), quote: "Quiet... very cozy." },
    { name: "Texas Exes Alumni Center back patio", type: "outdoor", vibe: "quiet", hours: "Outdoor access", openLate: false, outlets: false, coffeeNearby: true, campus: true,
      url: mapsSearch("Etter-Harbin Alumni Center"), tip: "Texas Expresso inside has good snacks.", quote: "Best place to do homework outside.", safety: "Near the Waller Creek path. Best in daylight or with a friend." },
    { name: "San Jacinto amphitheater", type: "outdoor", vibe: "social", hours: "Outdoor access", openLate: false, outlets: false, coffeeNearby: false, campus: true,
      url: mapsSearch("San Jacinto Residence Hall"), tip: "A good spot to eat lunch outside with friends." },
    { name: "Anna Hiss courtyard", type: "outdoor", vibe: "quiet", hours: "Outdoor access", openLate: false, outlets: false, coffeeNearby: false, campus: true,
      url: mapsSearch("Anna Hiss Gymnasium"), tip: "Behind the building. Explore the plazas around it too." }
];
if (typeof STUDY_SPOTS !== "undefined") STUDY_SPOTS.push(...NEW_STUDY_SPOTS.map(s => Object.assign({ lastVerified: "" }, s)));

// Notes for spots already on the site, matched by name.
const SPOT_NOTES = {
    "Life Science Library": { quote: "Most cozy, quiet, private place on campus." },
    "School of Architecture courtyard": { quote: "One of the prettiest places on campus." },
    "Battle Hall Library": { tip: "Open to the public. Walk in the front doors on the West Mall." },
    "Texas Union": { nap: true, tip: "The 3rd floor is good for naps, and there are tiny study cubicles upstairs.", quote: "3rd floor of the union for naps." },
    "UT Law Library (Tarlton)": { nap: true, quote: "Best sleeping is on the orange couches in the law library." },
    "LBJ outdoor seating & Holland Family Center": { nap: true, tip: "Look for the grove of trees with benches across from the LBJ Library, overlooking the fountain.", quote: "For napping, reading, getting a breath of fresh air." },
    "PCL (Perry-Castañeda Library)": { tip: "Ask about the Map Room. Most students don't know it exists." },
    "McCombs 5th floor & Rowling Hall terrace": { tip: "Anyone can study quietly in Rowling Hall, but only business grad students can reserve its study rooms." },
    "4th floor WCP": { tip: "Connects to RLP by a skybridge on the 4th floor." }
};
if (typeof STUDY_SPOTS !== "undefined") STUDY_SPOTS.forEach(s => { if (SPOT_NOTES[s.name]) Object.assign(s, SPOT_NOTES[s.name]); });

// Places to take a break, explore, or cool off.
const STUDENT_PICKS = [
    { id: "color-inside", title: "The Color Inside (skyspace on the WCP roof)", category: "outdoors", resourceType: "UT Spot", section: "Sit Outside",
      description: "A James Turrell skyspace on top of the student activity center, where the sky is framed by changing light.", tip: "Go right before sunset. Sunset viewings may need a free reservation, so check first.",
      quote: "Skyspace on top of the SAC (go right before sunset).", url: mapsSearch("The Color Inside James Turrell Skyspace"), linkText: "Find it",
      tags: ["outdoors", "on campus", "free", "art", "mindfulness"], cost: "Free", hours: "" },
    { id: "texas-science-museum", title: "Texas Science & Natural History Museum", category: "break", resourceType: "UT Spot", section: "Cool Off Inside",
      description: "UT's natural history museum, with a giant back patio and tables under the trees. Open in summer.", tip: "Great AC on hot days.",
      quote: "The AC here is SO good when the weather is hot out.", url: mapsSearch("Texas Science and Natural History Museum"), linkText: "Find it",
      tags: ["on campus", "art", "austin classic"], cost: "Check admission", hours: "" },
    { id: "lbj-library", title: "LBJ Presidential Library", category: "break", resourceType: "UT Spot", section: "Cool Off Inside",
      description: "A presidential library and museum on the east side of campus that few students visit. The grove of benches across from it is a calm spot to sit.",
      quote: "The library itself is fantastic and not many people seem to go there!", url: mapsSearch("LBJ Presidential Library"), linkText: "Find it",
      tags: ["on campus", "art"], cost: "Check admission", hours: "" },
    { id: "vac-gallery", title: "Visual Arts Center gallery", category: "break", resourceType: "UT Spot", section: "Art & Creativity",
      description: "Free rotating art exhibitions in the Art Building.", url: mapsSearch("Visual Arts Center UT Austin"), linkText: "Find it",
      tags: ["on campus", "free", "art"], cost: "Free", hours: "" },
    { id: "waller-creek-path", title: "Waller Creek path & COLA boardwalk", category: "outdoors", resourceType: "UT Spot", section: "Walking Route",
      description: "A shaded footpath from the boardwalk behind the COLA building, behind Gregory Gym, to an alcove behind Moore-Hill. Students also like sitting on the rocks by the creek near the Alumni Center.",
      quote: "Down by the rocks at Waller Creek right outside the alumni center: nice spot to chill, read a book, cool down.",
      safety: "Students say it feels isolated. Go in daylight or with a friend.", url: mapsSearch("Waller Creek Gregory Gym"), linkText: "Find it",
      tags: ["outdoors", "on campus", "free", "nature"], cost: "Free", hours: "Daylight recommended" },
    { id: "pma-observatory", title: "Rooftop telescope public viewings", category: "explore", resourceType: "UT Resource", section: "Things to Do",
      description: "UT Astronomy opens campus rooftop telescopes to the public on some nights. One of the most unique views of the city and campus.",
      quote: "One of the most unique views of the city & campus you can get!", url: "https://www.google.com/search?q=" + encodeURIComponent("UT Austin astronomy public star party telescope viewing"), linkText: "Find viewing nights",
      tags: ["on campus", "free", "events", "outdoors"], cost: "Free", hours: "Select evenings" },

    // Cheap eats on campus
    { id: "os-cafe", title: "O's Campus Café", category: "break", resourceType: "Student Pick", section: "Cheap Eats",
      description: "Several locations around campus (POB, McCombs, and more). Students rave about the green sauce and breakfast tacos.", tip: "Chicken enchiladas every Thursday.",
      quote: "The green sauce at O's Cafe is beyond great.", url: mapsSearch("O's Campus Cafe"), linkText: "Find a location", tags: ["on campus", "food"], cost: "Paid", hours: "" },
    { id: "littlefield-cafe", title: "Littlefield Café", category: "break", resourceType: "Student Pick", section: "Cheap Eats",
      description: "Sandwiches, burgers, and surprisingly good pizza for about $7–8.", quote: "A nice view of the creek and cats.",
      url: mapsSearch("Littlefield Cafe"), linkText: "Find it", tags: ["on campus", "food"], cost: "Paid", hours: "" },
    { id: "tower-burgers", title: "Tower Burgers (Texas Union)", category: "break", resourceType: "Student Pick", section: "Cheap Eats",
      description: "Quality burgers that fewer people know about.", tip: "Closes at 3 PM.", quote: "They genuinely have quality burgers. They are so good.",
      url: mapsSearch("Texas Union"), linkText: "Find it", tags: ["on campus", "food"], cost: "Paid", hours: "Closes at 3 PM" },
    { id: "kinsolving-dining", title: "Kinsolving Dining Hall", category: "break", resourceType: "Student Pick", section: "Cheap Eats",
      description: "A dining hall students miss after moving out of the dorms.", tip: "Fried chicken on Tuesdays, Texas toast grilled cheese on Thursdays.",
      url: mapsSearch("Kinsolving Dining"), linkText: "Find it", tags: ["on campus", "food"], cost: "Paid", hours: "" },
    { id: "texas-expresso", title: "Texas Expresso (Alumni Center)", category: "break", resourceType: "Student Pick", section: "Cheap Eats",
      description: "Coffee, good food, and snacks. Pairs well with studying on the Alumni Center back patio.", quote: "The banana chia parfait thing is my favorite thing to eat on campus.",
      url: mapsSearch("Etter-Harbin Alumni Center"), linkText: "Find it", tags: ["on campus", "food"], cost: "Paid", hours: "" },
    { id: "ufonda-truck", title: "Ufonda food truck (by Jester)", category: "break", resourceType: "Student Pick", section: "Cheap Eats",
      description: "Reasonably priced Mexican food in front of Jester.", quote: "Their chipotle sauce is amazing.",
      url: mapsSearch("Jester Center"), linkText: "Find it", tags: ["on campus", "food"], cost: "Paid", hours: "" }
];
if (typeof WELLNESS_RESOURCES !== "undefined") WELLNESS_RESOURCES.push(...STUDENT_PICKS.map(r => Object.assign({ lastVerified: "", source: "UT students on r/UTAustin" }, r)));
if (typeof CAMPUS_EXTRAS_SOCIAL !== "undefined") Object.assign(CAMPUS_EXTRAS_SOCIAL, {
    "color-inside": ["solo", "around"], "texas-science-museum": ["solo", "around"], "lbj-library": ["solo", "around"],
    "vac-gallery": ["solo", "around"], "waller-creek-path": ["solo", "connect"], "pma-observatory": ["around", "connect"],
    "os-cafe": ["solo", "around", "connect"], "littlefield-cafe": ["solo", "around", "connect"], "tower-burgers": ["solo", "around", "connect"],
    "kinsolving-dining": ["around", "connect"], "texas-expresso": ["solo", "around"], "ufonda-truck": ["solo", "around", "connect"]
});

/*
 * WEST CAMPUS (Guadalupe to Lamar, MLK to 29th St): walkable spots for students who live there.
 * Locations and hours from OpenStreetMap; picks from student guides and the Daily Texan.
 */
const WEST_CAMPUS_SPOTS = [
    { name: "Lucky Lab Coffee", type: "indoor", vibe: "social", hours: "Mon–Fri 6:30 AM–5 PM; Sat–Sun 7 AM–5 PM", openLate: false, outlets: false, coffeeNearby: true,
      area: "West Campus", url: "https://www.luckylabcoffee.com/", tip: "A big space where lots of students work. 2421 San Antonio St." },
    { name: "Medici Roasting — Guadalupe", type: "indoor", vibe: "social", hours: "Daily 7 AM–7 PM", openLate: false, outlets: false, coffeeNearby: true,
      area: "West Campus", url: "https://mediciroasting.com/pages/guadalupe", tip: "Right on the Drag at 2222 Guadalupe, the easiest stop from West Campus." },
    { name: "Haraz Coffee House", type: "indoor", vibe: "quiet", hours: "", openLate: false, outlets: false, coffeeNearby: true,
      area: "West Campus", url: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Haraz Coffee House, 500 W Martin Luther King Jr Blvd, Austin, TX"),
      tip: "Plenty of study space at 500 W MLK.", quote: "Their cakes are soooooo good." },
    { name: "Jo's Coffee — West Campus", type: "indoor", vibe: "social", hours: "", openLate: false, outlets: false, coffeeNearby: true,
      area: "West Campus", url: "https://www.joscoffee.com/west-campus", tip: "Opened in fall 2025 at 701 W 24th St." },
    { name: "Les Bobos Crepes", type: "indoor", vibe: "social", hours: "", openLate: false, outlets: false, coffeeNearby: true,
      area: "West Campus", url: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Les Bobos Crepes, 2707 Rio Grande St, Austin, TX"),
      tip: "Crepes and strong coffee at 2707 Rio Grande St. Hours can vary, so check before you go." },
    { name: "Pease District Park", type: "outdoor", vibe: "quiet", hours: "", openLate: false, outlets: false, coffeeNearby: false, free: true, nap: true,
      area: "West Campus", url: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Pease District Park, Austin, TX"),
      tip: "Shady picnic tables near the playground. It's quieter toward the north end." },
    { name: "Shoal Creek Trail", type: "outdoor", vibe: "quiet", hours: "", openLate: false, outlets: false, coffeeNearby: false, free: true,
      area: "West Campus", url: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Shoal Creek Trail, Pease Park, Austin, TX"),
      tip: "A shaded creekside trail along the west edge of West Campus." }
];
if (typeof STUDY_SPOTS !== "undefined") STUDY_SPOTS.push(...WEST_CAMPUS_SPOTS.map(s => Object.assign({ campus: false, lastVerified: "" }, s)));

// In-person "instead of doomscrolling" pick. Details from pinsbar.com/austin-faqs (Nov 2026).
const PINS_MECHANICAL = {
    id: "pins-mechanical", title: "Pins Mechanical Co. free arcade", category: "doomscroll", resourceType: "Community Resource", section: "Instead of Doomscrolling — Play",
    description: "Free classic arcade games like Pac-Man and Galaga. Duckpin bowling ($7–9), pinball ($1), foosball, and ping pong cost extra.",
    tip: "All ages until 8 PM Monday–Saturday, then 21+. No age limit on Sundays.",
    url: "https://www.pinsbar.com/austin", linkText: "See games & hours",
    tags: ["off campus", "free", "doom-play", "community"], cost: "Free",
    hours: "Mon–Thu 4 PM–12 AM; Fri 12 PM–2 AM; Sat 11 AM–2 AM; Sun 11 AM–12 AM",
    lastVerified: "2026-11-20", source: "Pins Mechanical Co."
};
if (typeof WELLNESS_RESOURCES !== "undefined") WELLNESS_RESOURCES.push(PINS_MECHANICAL);
if (typeof CAMPUS_EXTRAS_SOCIAL !== "undefined") CAMPUS_EXTRAS_SOCIAL["pins-mechanical"] = ["solo", "around", "connect"];

// Crisis Text Line: listed in the crisis box, now also a card under Talk to someone (placed right after 988).
const CRISIS_TEXT_LINE = {
    id: "crisis-text-line", title: "Crisis Text Line", category: "support", resourceType: "National Resource", section: "Crisis Support",
    description: "Text HOME to 741741 any time to reach a trained volunteer crisis counselor. Free and confidential.",
    url: "https://www.crisistextline.org/", linkText: "Text HOME to 741741",
    tags: ["virtual", "free"], cost: "Free", hours: "24/7", lastVerified: "2026-11-20", source: "Crisis Text Line"
};
if (typeof WELLNESS_RESOURCES !== "undefined") {
    const at = WELLNESS_RESOURCES.findIndex(r => r.id === "lifeline-988");
    WELLNESS_RESOURCES.splice(at >= 0 ? at + 1 : WELLNESS_RESOURCES.length, 0, CRISIS_TEXT_LINE);
}

// Reclub: free app for finding local pickup games and clubs (59 sports). Researched Nov 2026.
const RECLUB = {
    id: "reclub", title: "Reclub", category: "move", resourceType: "App", section: "Movement",
    description: "A free app for finding pickup games and clubs near you, like pickleball, badminton, and tennis. RSVP in a tap and get matched by skill.",
    tip: "Search “Austin” in the app to see local groups. Free, with an optional paid tier that removes ads.",
    url: "https://pickleball.reclub.co/for-players", linkText: "Get the app",
    app: { ios: "https://apps.apple.com/app/id1323924315", android: "https://play.google.com/store/apps/details?id=co.reclub", web: "https://pickleball.reclub.co/for-players" },
    tags: ["off campus", "sports", "community"], cost: "Free", hours: "", lastVerified: "2026-11-20", source: "Reclub"
};
if (typeof WELLNESS_RESOURCES !== "undefined") WELLNESS_RESOURCES.push(RECLUB);
if (typeof CAMPUS_EXTRAS_SOCIAL !== "undefined") CAMPUS_EXTRAS_SOCIAL["reclub"] = ["around", "connect"];

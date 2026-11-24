/*
 * SMALL ART + IMAGINATION PROMPTS
 * Edit freely. Each prompt:
 *   text     what to do, in one or two short sentences
 *   minutes  roughly how long it takes
 *   needs    "nothing" | "pen & paper" | "phone" | "whatever's around"
 *   who      "solo" | "together" | "either"
 *   kind     "imagine" | "draw" | "photo" | "write" | "make"
 */
const ART_PROMPTS = [
    // Imagine: no materials, works anywhere (bus, line, bed, between classes)
    { id: "calm-place", kind: "imagine", minutes: 2, needs: "nothing", who: "solo",
      text: "Close your eyes and picture a place where you felt calm. Name three colors, two sounds, and one temperature you notice there." },
    { id: "paint-the-view", kind: "imagine", minutes: 2, needs: "nothing", who: "either",
      text: "Look at whatever is in front of you. If you could paint it with only three colors, which would you pick?" },
    { id: "door", kind: "imagine", minutes: 3, needs: "nothing", who: "either",
      text: "Imagine a door in front of you. What color is it? Open it slowly. What's on the other side?" },
    { id: "mood-weather", kind: "imagine", minutes: 1, needs: "nothing", who: "either",
      text: "If your mood right now were weather, what would it be? Now picture it shifting one step lighter." },
    { id: "clouds", kind: "imagine", minutes: 3, needs: "nothing", who: "either",
      text: "Find a window or step outside. Pick one cloud, tree, or shadow and decide what creature it looks like." },
    { id: "slow-color", kind: "imagine", minutes: 2, needs: "nothing", who: "solo",
      text: "Pick a color. Find five things around you in that color, one at a time, slowly." },

    // Draw: pen & paper (a napkin or the back of notes is fine)
    { id: "blind-contour", kind: "draw", minutes: 3, needs: "pen & paper", who: "either",
      text: "Draw your hand without looking at the paper. Don't lift the pen. It's supposed to look weird." },
    { id: "non-dominant", kind: "draw", minutes: 3, needs: "pen & paper", who: "either",
      text: "Draw your cup, water bottle, or phone using your non-dominant hand." },
    { id: "circles", kind: "draw", minutes: 5, needs: "pen & paper", who: "solo",
      text: "Fill a small square with tiny circles. No plan, no erasing. Just keep going until the timer ends." },
    { id: "breathing-square", kind: "draw", minutes: 2, needs: "pen & paper", who: "solo",
      text: "Draw a square slowly: breathe in for one side, hold for the next, breathe out, hold. Go around four times." },
    { id: "song-doodle", kind: "draw", minutes: 4, needs: "pen & paper", who: "solo",
      text: "Put on one song and let your pen move with it. Stop when the song ends." },
    { id: "memory-map", kind: "draw", minutes: 5, needs: "pen & paper", who: "either",
      text: "From memory, draw a map of your favorite spot on campus or in Austin. Add one thing you love about it." },

    // Photo: just a phone camera
    { id: "color-walk", kind: "photo", minutes: 5, needs: "phone", who: "either",
      text: "Take a short walk and photograph five things that are the same color." },
    { id: "shadows", kind: "photo", minutes: 3, needs: "phone", who: "solo",
      text: "Take three photos of interesting shadows. Bonus points for a shadow that looks like something else." },
    { id: "tiny-world", kind: "photo", minutes: 4, needs: "phone", who: "either",
      text: "Get very close to something small, like a leaf, a brick, or a fabric. Take a photo that makes it look like a landscape." },

    // Write
    { id: "six-words", kind: "write", minutes: 2, needs: "pen & paper", who: "either",
      text: "Write a six-word story about today." },
    { id: "three-good", kind: "write", minutes: 3, needs: "pen & paper", who: "solo",
      text: "Write down three tiny good things from today. Tiny counts: a good coffee, a green light, a text." },

    // Make: whatever is around
    { id: "desk-sculpture", kind: "make", minutes: 4, needs: "whatever's around", who: "either",
      text: "Build a tiny sculpture out of things on your desk or in your bag. Give it a title and take a photo." },
    { id: "rubbing", kind: "make", minutes: 4, needs: "pen & paper", who: "either",
      text: "Find three textures (a coin, a leaf, a grate). Put paper over each and rub with a pencil." },
    { id: "pocket-collage", kind: "make", minutes: 5, needs: "whatever's around", who: "solo",
      text: "Make a tiny collage from receipts, wrappers, or sticky notes you already have." },

    // Together: with friends, roommates, or a study group
    { id: "exquisite-corpse", kind: "draw", minutes: 5, needs: "pen & paper", who: "together",
      text: "Fold a paper in three. One person draws a head, folds it over, the next draws a body, the last draws legs. Unfold and reveal." },
    { id: "sixty-seconds", kind: "draw", minutes: 3, needs: "pen & paper", who: "together",
      text: "Everyone draws the same object in 60 seconds. Compare. Repeat with 30 seconds." },
    { id: "back-to-back", kind: "draw", minutes: 5, needs: "pen & paper", who: "together",
      text: "Sit back to back. One person describes a picture on their phone and the other draws it without seeing it." },
    { id: "portrait-swap", kind: "draw", minutes: 4, needs: "pen & paper", who: "together",
      text: "Draw each other in two minutes without looking at your paper. Trade drawings." },
    { id: "story-chain", kind: "write", minutes: 4, needs: "nothing", who: "together",
      text: "Tell a story one sentence at a time, going around the group. Each sentence has to start with the last word of the one before." }
];

/*
 * LEISURE ART PROJECTS: video picks, ordered from "just press play" to "grab a friend".
 * Only the YouTube video id is needed (the part after watch?v=).
 */
const LEISURE_ART_DESCRIPTION = "Watch Bob Ross, doodle for five minutes, try a little watercolor, or make a ridiculous drawing with a friend. Start wherever you have the time, energy, and supplies.";

const LEISURE_ART_VIDEOS = [
    { id: "lMvxiITGzLY", title: "Safe Place Visualisation: 5-Minute Guided Meditation", channel: "Integrative Therapy NQ",
      needs: "Nothing. Listen along and picture a quiet place." },
    { id: "wdr4t7cQW2U", title: "Mystic Mountain: Bob Ross Full Episode", channel: "Bob Ross",
      needs: "Nothing if you're watching. A full Joy of Painting episode for a longer break." },
    { id: "gJ1Np406A1c", title: "Very Easy Zentangle in 5 Minutes", channel: "Hu Art Drawing",
      needs: "A pen and paper. Fill a small space with repeating patterns." },
    { id: "A99nMgNGKYQ", title: "Calm Your Nervous System in 5 Minutes (Simple Drawing for Anxiety & Stress)", channel: "Art Therapy with Sana",
      needs: "Paper and a pen or colored pencil. Follow along with simple spirals and looping lines." },
    { id: "INvT12DECPA", title: "5-Minute Creativity Boost: Blind Contour Drawing Challenge", channel: "Art Journal Life w/Stacy",
      needs: "Paper, a pen, and something nearby to draw. Keep your eyes on the subject as you sketch." },
    { id: "aDsHbPGiQqc", title: "Super-Easy Watercolor Style You Can Learn in Five Minutes", channel: "Diane Antone Studio",
      needs: "Watercolors, a brush, water, and paper. Try loose brushstrokes with a few colors and let them blend." },
    { id: "bauTo2C7M3Q", title: "Exquisite Corpse", channel: "The Art Assignment",
      needs: "A friend, paper, and a pen. Take turns drawing a section, fold it out of sight, then unfold it together." }
];

const leisureVideoUrl = id => "https://www.youtube.com/watch?v=" + id;
// Plays every video above in order as a temporary playlist (no YouTube account needed).
const LEISURE_ART_PLAY_ALL_URL = "https://www.youtube.com/watch_videos?video_ids=" + LEISURE_ART_VIDEOS.map(v => v.id).join(",");

// Prompts that have a matching "watch how" video.
const PROMPT_VIDEOS = {
    "calm-place": "lMvxiITGzLY",
    "circles": "gJ1Np406A1c",
    "song-doodle": "A99nMgNGKYQ",
    "blind-contour": "INvT12DECPA",
    "exquisite-corpse": "bauTo2C7M3Q"
};

// Point the Leisure Art Projects card at the new list.
if (typeof WELLNESS_RESOURCES !== "undefined") {
    const leisure = WELLNESS_RESOURCES.find(r => r.id === "bob-ross");
    if (leisure) {
        leisure.description = LEISURE_ART_DESCRIPTION;
        leisure.url = LEISURE_ART_PLAY_ALL_URL;
        leisure.linkText = "Play all 7 videos";
    }
}

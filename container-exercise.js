/*
 * CONTAINER EXERCISE (prototype)
 * A guided, self-paced, trauma-informed container exercise.
 * Edit the wording freely. {c} is replaced with the container's name.
 */
const CONTAINER_OPTIONS = {
    submarine: {
        label: "A submarine",
        note: "Our founder's container",
        name: "the submarine",
        arrive: "Picture a submarine rising slowly from the depths of the ocean. Watch the water stream off its hull. Notice its color, its size, the rivets, the scratches. Take your time with the details.",
        senses: "Hear the waves slapping against the hull and the gulls overhead. Smell the salt in the air. Feel the sun and the breeze on your skin.",
        open: "Hear the latch release. Watch the heavy hatch swing open. Notice how strong and solid it is.",
        close: "Swing the hatch closed. Feel the weight of the door as it moves. Hear the latch lock into place. It's sealed, and only you can open it.",
        away: "Watch the submarine drift away from you across the water. Slowly, it submerges, sinking deeper and deeper until you can't see it anymore. Everything inside is safe down there until you choose to come back for it.",
        after: "Now look out at the horizon and watch the sun set over the water. Notice the colors changing: orange, pink, purple."
    },
    vault: {
        label: "A vault",
        note: "Thick steel, a heavy door",
        name: "the vault",
        arrive: "Picture a vault. Notice how thick its walls are, the color of the steel, the size of the door, the big dial or wheel on the front. Take your time with the details.",
        senses: "Notice where the vault is. Is it cool and quiet? What does the air smell like? What does the floor feel like under your feet?",
        open: "Turn the wheel and hear the bolts slide back. Pull the heavy door open. Notice how solid it is.",
        close: "Push the door shut. Feel its weight. Spin the wheel and hear the bolts slide into place. It's locked, and only you know the combination.",
        away: "Picture the vault somewhere safe and far away from where you are now. Everything inside will stay there until you choose to come back for it.",
        after: "Now turn your attention to something pleasant around you, or picture a place where you feel calm."
    },
    box: {
        label: "A box or jar",
        note: "Small enough to hold",
        name: "the box",
        arrive: "Picture a box or jar. Notice what it's made of, its color, its weight, the texture of the lid. Make it as plain or as beautiful as you like.",
        senses: "Hold it in your hands. Is it smooth or rough, warm or cool? Is there a smell, like wood, glass, or paper?",
        open: "Lift the lid and set it beside you.",
        close: "Put the lid back on and press it down. Feel it click or seal. Tie it, tape it, or lock it if you want to.",
        away: "Place it on a high shelf, in a closet, or somewhere far away. Everything inside will stay there until you choose to come back for it.",
        after: "Now turn your attention to something pleasant around you, or picture a place where you feel calm."
    },
    own: {
        label: "My own",
        note: "Anything that feels strong and safe",
        name: "your container",
        arrive: "Picture a container of your own. It could be anything strong enough to hold what you need it to. Notice its shape, size, color, and what it's made of. Take your time with the details.",
        senses: "Notice where it is. What can you hear, smell, and feel around it?",
        open: "Open it. Notice how it opens and how solid it is.",
        close: "Close it. Feel the weight of it closing and hear it seal. Only you can open it.",
        away: "Picture it moving somewhere safe and away from you. Everything inside will stay there until you choose to come back for it.",
        after: "Now turn your attention to something pleasant around you, or picture a place where you feel calm."
    }
};

function containerSteps(c) {
    return [
        { title: "Settle in", text: "Sit or stand somewhere comfortable. Let your feet rest on the floor. You can close your eyes or keep a soft gaze. Take one slow breath." },
        { title: "Bring it to mind", text: c.arrive },
        { title: "Notice what's around it", text: c.senses },
        { title: "Open it", text: c.open },
        { title: "Put things inside", text: "One at a time, put in what you don't need to carry right now: thoughts, feelings, worries, a person, a place, a to-do list. You don't have to name them out loud. Everything fits. Take as long as you need." },
        { title: "Close it", text: c.close },
        { title: "Let it go", text: c.away },
        { title: "Look around", text: c.after },
        { title: "Breathe", breathe: true, text: "Follow the circle and the count for four slow breaths." },
        { title: "Come back", text: "Notice the room around you. Name three things you can see. When you're ready, move on to what's next.", last: true }
    ];
}

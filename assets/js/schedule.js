/* ---------------------------------------------------------------------------
 * Cabin F · Camp schedule data
 * Source: official C.T.C.C. weekday grid (ctccamp.org). Sunday (arrival) and
 * Saturday (checkout) times are estimates and are editable in the app.
 * ------------------------------------------------------------------------- */

export const STORAGE_KEY = "ctcc_times_v3";

export const DEFAULTS = {
  weekday: {
    rise: "07:00", devo: "07:30", breakfast: "08:00", sports: "09:00",
    report: "10:30", bible: "11:00", lunch: "12:00", rest: "13:00",
    reflection: "14:00", swim: "15:00", cabindevo: "16:15", getready: "17:00",
    supper: "18:00", worship: "19:30", porch: "21:30", backtocabins: "22:00",
    lights: "22:30",
  },
  sunday: {
    reg: "15:00", supper: "18:00", welcome: "19:30", goodnight: "21:30",
    backtocabins: "22:00", lights: "22:30",
  },
  saturday: { wake: "07:00", breakfast: "08:00", clean: "09:00", depart: "10:00" },
};

export const WEEKDAY_ORDER = [
  "rise", "devo", "breakfast", "sports", "report", "bible", "lunch", "rest",
  "reflection", "swim", "cabindevo", "getready", "supper", "worship", "porch",
  "backtocabins", "lights",
];

/* Generic weekday labels */
export const GEN = {
  rise: "Rise & Shine \u2014 cabin clean-up, trash out",
  devo: "Morning devotional (back porch)",
  breakfast: "Breakfast",
  sports: "Organized sports \u2014 rotate every 40 min",
  report: "Cabin report & snacks",
  bible: "Bible classes",
  lunch: "Lunch",
  rest: "Rest time",
  reflection: "Reflection time \u2014 counselors' group",
  swim: "Boys swim / girls cabin devo",
  cabindevo: "Boys cabin devo / girls swim",
  getready: "Get ready for supper",
  supper: "Supper",
  worship: "Worship & evening activity",
  porch: "Back & front porch devotional + late-night snack",
  backtocabins: "Back to cabins",
  lights: "Lights out",
};

/* Recurring counselor duties applied to every weekday */
export const RECUR = {
  rise: { mine: true, detail: "Get your cabin up, cleaned, trash bagged & out front." },
  reflection: { mine: true, detail: "All counselors must be in a reflections group." },
  cabindevo: {
    mine: true, label: "Boys cabin devo \u2014 you lead",
    detail: "Lead Cabin F's devotional. (Your boys: swim 3:00 \u2192 devo 4:15.)",
  },
  swim: { detail: "Your Cabin F boys swim now." },
};

export const DAY = {
  0: {
    name: "Sunday", theme: "Arrival day", special: "sunday",
    order: ["reg", "supper", "welcome", "goodnight", "backtocabins", "lights"],
    items: {
      reg: { label: "Registration & arrival", detail: "Receive and settle your Cabin F campers.", mine: true },
      supper: { label: "Supper" },
      welcome: { label: "Worship & camp kickoff", detail: "Joe Squiers welcome \u00b7 Britt theme \u00b7 Joe rules & staff \u00b7 Tim sports teams \u00b7 Chance & Lori GTGTKY game \u00b7 counselors set team names (you) \u00b7 Katie team flags.", mine: true },
      goodnight: { label: "Back porch \u2014 sing & goodnight", detail: "Then split to meet with Lori & Chance." },
      backtocabins: { label: "Back to cabins" },
      lights: { label: "Lights out" },
    },
  },
  1: {
    name: "Monday", theme: "Old camp t-shirt",
    items: {
      devo: { detail: "Cabin C leads." },
      rise: { detail: "Cabin clean-up & trash out. Bathhouse crew: Cabin E." },
      breakfast: { detail: "Kitchen help: Cabins C, 6." },
      lunch: { detail: "Kitchen help: Cabins E, 2." },
      supper: { detail: "Kitchen help: Cabins A, 3." },
      worship: { label: "Worship & Song Fest (Mess Hall)", detail: "Harrison, Blan, Joe, Joe Braden & Morgan. Counselors set tables & chairs after dinner." },
      porch: { detail: "Back: Jake Agin \u00b7 Front: Kyle Lane. Snack: Coke + Chex Mix." },
    },
    note: "Off the kitchen/bathhouse rotation today. Hand out & collect talent-night slips.",
  },
  2: {
    name: "Tuesday", theme: "Neon day",
    items: {
      devo: { detail: "Cabin E leads." },
      rise: { detail: "Cabin clean-up + bathhouse crew (Cabin F \u2014 that's you).", mine: true },
      breakfast: { detail: "Kitchen help: Cabins 7, 5." },
      lunch: { detail: "Kitchen help: Cabins C, 6." },
      supper: { detail: "Kitchen help: Cabins F, 7 \u2014 that's you.", mine: true },
      worship: { label: "Worship & Staff Skits", detail: "Britt intro \u00b7 Blan singing \u00b7 Matt Parker \u201cWhen Jesus Catches a Fisherman\u201d \u00b7 Skit DJs: Matt, Daniel, Korey, Katie." },
      porch: { detail: "Back: Jake Petty \u00b7 Front: Jackson Melching. Snack: Coke + Goldfish & cheese crackers." },
    },
    note: "Camper talent list due to Chance & Lori by supper.",
  },
  3: {
    name: "Wednesday", theme: "Hawaiian",
    items: {
      devo: { label: "Morning devotional \u2014 you lead", detail: "Cabin F leads the back-porch devo today.", mine: true },
      rise: { detail: "Cabin clean-up & trash out. Bathhouse crew: Cabin C." },
      breakfast: { detail: "Kitchen help: Cabins A, 3." },
      lunch: { detail: "Kitchen help: Cabins G, 4." },
      supper: { detail: "Kitchen help: Cabins E, 2." },
      worship: { label: "Worship & Talent Show", detail: "Joe intro \u00b7 talents: Breyson, Joe Braden, Emilee, Addie \u00b7 Britt/Blan (Hey Radio & I AM)." },
      porch: { detail: "Back: Morgan Craig \u00b7 Front: Adam Payne. Snack: Coke + granola bar." },
    },
    note: "Ops crew runs cable & stacks bonfire wood today.",
  },
  4: {
    name: "Thursday", theme: "Patriotic day",
    items: {
      devo: { detail: "Cabin A leads." },
      rise: { detail: "Cabin clean-up & trash out. Bathhouse crew: Cabin E." },
      breakfast: { detail: "Kitchen help: Cabins F, 7 \u2014 that's you.", mine: true },
      lunch: { detail: "Kitchen help: Cabins A, 3." },
      supper: { detail: "Kitchen help: Cabins G, 4." },
      worship: { label: "Worship & Whiffle Ball", detail: "Britt intro \u00b7 Harrison song-leading \u00b7 Daniel Odiorne \u201cFish Out of Water\u201d \u00b7 all umps & coaches. Honor Camper: campers drop names in the box." },
      porch: { label: "Porch devotional \u2014 you speak", detail: "You have the Back Porch devo. Front: Brady Vann. Snack: Coke + Pop Ice.", mine: true },
    },
    note: "Mr. & Miss Hensel nominations from your cabin due tonight.",
  },
  5: {
    name: "Friday", theme: "School colors day",
    items: {
      devo: { detail: "Korbin leads." },
      rise: { detail: "Cabin clean-up + bathhouse crew (Cabin F \u2014 that's you).", mine: true },
      breakfast: { detail: "Kitchen help: Cabins C, E." },
      lunch: { detail: "Kitchen help: Cabins G, 4. Mr. & Miss Hensel vote ~noon. Counselor meeting at lunch (Honor Camper).", mine: true },
      supper: { detail: "Kitchen help: Cabins C, 6." },
      worship: { label: "Worship, Awards & Bonfire", detail: "Awards & slide show \u00b7 Honor Camper (Britt & Blan) \u00b7 Mr. & Miss Hensel (Lori & Chance) \u00b7 Overall Sports (Tim) \u00b7 Joe singing \u00b7 Bonfire \u2014 Tim Farmer \u201cYou Only Have to Cast the Net.\u201d" },
      porch: { detail: "Back/front porch \u2014 Squiers. Snack: Coke + remaining food." },
    },
    note: "Tear-down begins: swim gear pulled, kitchen & porches packed.",
  },
  6: {
    name: "Saturday", theme: "Whatever clean you have left", special: "saturday",
    order: ["wake", "breakfast", "clean", "depart"],
    items: {
      wake: { label: "Pack & clean cabin", detail: "Before 8:00 breakfast. Don't release anyone until your cabin is checked off by Chance or Lori.", mine: true },
      breakfast: { label: "Breakfast", detail: "After your cabin's cleared. Kitchen help: Cabins E, 2, 5." },
      clean: { label: "Final clean & load cars", detail: "Cabins & bathhouse done; kitchen & dining finish before campers are released.", mine: true },
      depart: { label: "Camper departures", detail: "You leave only after your campers go and the head counselor releases you.", mine: true },
    },
  },
};

/* Edit-panel grouping */
export const GROUPS = [
  {
    key: "weekday", title: "Weekday rhythm (Mon\u2013Fri)", ids: WEEKDAY_ORDER,
    labels: {
      rise: "Rise & Shine", devo: "Morning devo", breakfast: "Breakfast",
      sports: "Sports", report: "Cabin report", bible: "Bible classes",
      lunch: "Lunch", rest: "Rest", reflection: "Reflection",
      swim: "Swim / devo", cabindevo: "Cabin devo / swim", getready: "Get ready",
      supper: "Supper", worship: "Worship & activity", porch: "Porch devo + snack",
      backtocabins: "Back to cabins", lights: "Lights out",
    },
  },
  {
    key: "sunday", title: "Sunday \u2014 arrival",
    ids: ["reg", "supper", "welcome", "goodnight", "backtocabins", "lights"],
    labels: {
      reg: "Registration", supper: "Supper", welcome: "Kickoff",
      goodnight: "Porch goodnight", backtocabins: "Back to cabins", lights: "Lights out",
    },
  },
  {
    key: "saturday", title: "Saturday \u2014 checkout",
    ids: ["wake", "breakfast", "clean", "depart"],
    labels: { wake: "Pack & clean", breakfast: "Breakfast", clean: "Final clean", depart: "Departures" },
  },
];

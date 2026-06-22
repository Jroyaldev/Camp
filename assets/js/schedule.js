/* ---------------------------------------------------------------------------
 * C.T.C.C. camp schedule data
 * Source: official C.T.C.C. daily schedule (ctccamp.org). Sunday, Mon\u2013Thu and
 * Friday times are published; Friday runs later (report/Bible/lunch) and ends with
 * Awards + Bonfire instead of worship. Saturday (checkout) times after breakfast
 * are estimates. All weekday times are editable in the app.
 *
 * Personalization is data-driven: each weekday carries an `assign` map of which
 * cabins are on kitchen / bathhouse / devo duty, and items can flag a generic
 * `counselor` duty. The app marks a block as "yours" by matching these against
 * the counselor's saved settings (cabin / section / grade) — nothing is
 * hard-coded to a single cabin.
 * ------------------------------------------------------------------------- */

export const STORAGE_KEY = "ctcc_times_v5";
export const SETTINGS_KEY = "ctcc_settings_v1";

/* Selectable in the setup card */
export const CABINS = ["A", "B", "C", "D", "E", "F", "G", "1", "2", "3", "4", "5", "6", "7"];
export const GRADES = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export const DEFAULTS = {
  weekday: {
    rise: "07:00", devo: "07:30", breakfast: "08:00", sports: "09:00",
    report: "10:30", bible: "11:00", lunch: "12:00", rest: "13:00",
    reflection: "14:00", swim: "15:00", cabindevo: "16:15", getready: "17:00",
    supper: "18:00", worship: "19:30", porch: "21:30", backtocabins: "22:00",
    lights: "22:30",
  },
  sunday: {
    church: "10:00", lunch: "11:45", meeting: "13:00", checkin: "16:00",
    dinner: "18:30", activity: "20:00", backtocabins: "22:00",
  },
  saturday: { wake: "07:00", breakfast: "08:00", clean: "09:00", depart: "10:00" },
};

export const WEEKDAY_ORDER = [
  "rise", "devo", "breakfast", "sports", "report", "bible", "lunch", "rest",
  "reflection", "swim", "cabindevo", "getready", "supper", "worship", "porch",
  "backtocabins", "lights",
];

/* Generic weekday labels (the app personalizes swim/cabindevo by section) */
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
  swim: "Swim \u00b7 boys swim / girls cabin devo",
  cabindevo: "Cabin devo \u00b7 boys cabin devo / girls swim",
  getready: "Get ready for supper",
  supper: "Supper",
  worship: "Worship & evening activity",
  porch: "Back & front porch devotional + late-night snack",
  backtocabins: "Back to cabins",
  lights: "Lights out",
};

/* Recurring counselor duties applied to every weekday (not cabin-specific) */
export const RECUR = {
  rise: { counselor: true, reason: "Cabin clean-up", detail: "Get your cabin up, cleaned, trash bagged & out front." },
  reflection: { counselor: true, reason: "Reflection group", detail: "All counselors must be in a reflections group." },
};

export const DAY = {
  0: {
    name: "Sunday", theme: "Arrival day", special: "sunday",
    order: ["church", "lunch", "meeting", "checkin", "dinner", "activity", "backtocabins"],
    items: {
      church: { label: "Sunday morning worship", detail: "Travis Peak Church of Christ, 10am. You do not have to dress up." },
      lunch: { label: "Lunch", detail: "Mess Hall. Staff & kids pay $5 for lunch plus a $10/night overnight fee per person." },
      meeting: { label: "Camp meeting", detail: "Led by Joe Squiers, right after lunch.", counselor: true, reason: "Camp meeting" },
      checkin: { label: "Camper check-in", detail: "Counselors: be in your cabin. Non-counseling staff: help with check-in at the mess hall.", counselor: true, reason: "Receive campers" },
      dinner: { label: "Dinner", detail: "Mess Hall." },
      activity: { label: "Worship & evening activity", detail: "GTGYKY game \u2014 activity leaders are the non-counseling staff." },
      backtocabins: { label: "Back to cabins", detail: "After the activity: Sr. girls \u2192 quad breezeway (Lori); Sr. boys \u2192 back porch (Scott)." },
    },
  },
  1: {
    name: "Monday", theme: "Old camp t-shirt",
    assign: { devoLead: "C", bathhouse: "E", breakfast: ["C", "6"], lunch: ["E", "2"], supper: ["A", "3"] },
    items: {
      devo: { detail: "Cabin C leads." },
      rise: { detail: "Cabin clean-up & trash out. Bathhouse crew: Cabin E." },
      breakfast: { detail: "Kitchen help: Cabins C, 6." },
      lunch: { detail: "Kitchen help: Cabins E, 2." },
      supper: { detail: "Kitchen help: Cabins A, 3." },
      worship: { label: "Worship & Song Fest (Mess Hall)", detail: "Harrison, Blan, Joe, Joe Braden & Morgan. Counselors set tables & chairs after dinner." },
      porch: { detail: "Back: Jake Agin \u00b7 Front: Kyle Lane. Snack: Coke + Chex Mix." },
    },
    note: "Hand out & collect talent-night slips.",
  },
  2: {
    name: "Tuesday", theme: "Neon day",
    assign: { devoLead: "E", bathhouse: "F", breakfast: ["7", "5"], lunch: ["C", "6"], supper: ["F", "7"] },
    items: {
      devo: { detail: "Cabin E leads." },
      rise: { detail: "Cabin clean-up & trash out. Bathhouse crew: Cabin F." },
      breakfast: { detail: "Kitchen help: Cabins 7, 5." },
      lunch: { detail: "Kitchen help: Cabins C, 6." },
      supper: { detail: "Kitchen help: Cabins F, 7." },
      worship: { label: "Worship & Staff Skits", detail: "Britt intro \u00b7 Blan singing \u00b7 Matt Parker \u201cWhen Jesus Catches a Fisherman\u201d \u00b7 Skit DJs: Matt, Daniel, Korey, Katie." },
      porch: { detail: "Back: Jake Petty \u00b7 Front: Jackson Melching. Snack: Coke + Goldfish & cheese crackers." },
    },
    note: "Camper talent list due to Chance & Lori by supper.",
  },
  3: {
    name: "Wednesday", theme: "Hawaiian",
    assign: { devoLead: "F", bathhouse: "C", breakfast: ["A", "3"], lunch: ["G", "4"], supper: ["E", "2"] },
    items: {
      devo: { label: "Morning devotional (back porch)", detail: "Cabin F leads the back-porch devo today." },
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
    assign: { devoLead: "A", bathhouse: "E", breakfast: ["F", "7"], lunch: ["A", "3"], supper: ["G", "4"] },
    items: {
      devo: { detail: "Cabin A leads." },
      rise: { detail: "Cabin clean-up & trash out. Bathhouse crew: Cabin E." },
      breakfast: { detail: "Kitchen help: Cabins F, 7." },
      lunch: { detail: "Kitchen help: Cabins A, 3." },
      supper: { detail: "Kitchen help: Cabins G, 4." },
      worship: { label: "Worship & Whiffle Ball", detail: "Britt intro \u00b7 Harrison song-leading \u00b7 Daniel Odiorne \u201cFish Out of Water\u201d \u00b7 all umps & coaches. Honor Camper: counselors drop names in the box." },
      porch: { detail: "Back: Jonny Royal \u00b7 Front: Brady Vann. Snack: Coke + Pop Ice." },
    },
    note: "Mr. & Miss Hensel nominations from each cabin due to Chance & Lori before supper tonight.",
  },
  5: {
    name: "Friday", theme: "School colors day",
    /* Friday runs on its own published times (report/Bible/lunch are later
     * than Mon\u2013Thu) and the evening is Awards + Bonfire, not worship. */
    order: [
      "rise", "devo", "breakfast", "sports", "report", "bible", "lunch", "rest",
      "reflection", "swim", "cabindevo", "getready", "supper", "awards", "bonfire",
      "porch", "lights",
    ],
    times: { report: "11:00", bible: "11:30", lunch: "12:15", awards: "19:30", bonfire: "20:30" },
    assign: { devoLead: null, bathhouse: "F", breakfast: ["C", "E"], lunch: ["G", "4"], supper: ["C", "6"] },
    items: {
      devo: { detail: "Korbin leads." },
      rise: { detail: "Cabin clean-up & trash out. Bathhouse crew: Cabin F." },
      breakfast: { detail: "Kitchen help: Cabins C, E." },
      lunch: { detail: "Kitchen help: Cabins G, 4. Mr. & Miss Hensel vote ~noon. Counselor meeting at lunch (Honor Camper).", counselor: true, reason: "Counselor meeting" },
      supper: { detail: "Kitchen help: Cabins C, 6." },
      awards: { label: "Awards Ceremony & Slide Show", detail: "Honor Camper (Britt & Blan) \u00b7 Mr. & Miss Hensel (Lori & Chance) \u00b7 Overall Sports (Tim Farmer) \u00b7 slide show \u00b7 Joe Squiers singing." },
      bonfire: { label: "Bonfire", detail: "Tim Farmer \u2014 \u201cYou Only Have to Cast the Net.\u201d Bonfire crew runs it; fire out & area cleaned after." },
      porch: { detail: "Back/front porch \u2014 Squiers. Snack: Coke + remaining food." },
      lights: { detail: "Lights out \u2014 pack the trailers with all kitchen/cafeteria items at this time." },
    },
    note: "Tear-down begins: swim gear pulled, kitchen & porches packed.",
  },
  6: {
    name: "Saturday", theme: "Whatever clean you have left", special: "saturday",
    order: ["wake", "breakfast", "clean", "depart"],
    assign: { bathhouse: "C", breakfast: ["E", "2", "5"] },
    items: {
      wake: { label: "Pack & clean cabin", detail: "Before 8:00 breakfast. Don't release anyone until your cabin is checked off by Chance or Lori.", counselor: true, reason: "Pack & clean" },
      breakfast: { label: "Breakfast", detail: "After your cabin's cleared. Kitchen help: Cabins E, 2, 5." },
      clean: { label: "Final clean & load cars", detail: "Cabins & bathhouse done; kitchen & dining finish before campers are released.", counselor: true, reason: "Final clean" },
      depart: { label: "Camper departures", detail: "You leave only after your campers go and the head counselor releases you.", counselor: true, reason: "Departures" },
    },
  },
};

/* Bible-class assignments (from the C.T.C.C. class sheets). Grades go to the
 * same location every day; teachers rotate. */
export const CLASSES = {
  note: "Each grade goes to the same location every day for Bible class \u2014 teachers rotate daily. All counseling staff attend class; divide up so each group has adequate staff.",
  junior: { title: "Junior class (3rd\u20137th)", locations: { "3": "Back Porch", "4": "Back Porch", "5": "Front Porch", "6": "Cabin G", "7": "Cafeteria" } },
  senior: { title: "Senior class (8th\u201312th)", locations: { "8": "Whataburger A (by the girls quad cabin)", "9": "Whataburger B (closer to the creek)", "10": "Cabin 5", "11": "Quad Breezeway", "12": "Quad Breezeway" } },
  juniorRotation: ["Back Porch", "Front Porch", "Cabin G", "Cafeteria"],
  seniorRotation: ["Whataburger A", "Whataburger B", "Cabin 5", "Quad Breezeway"],
  juniorTeachers: [
    { name: "Joe Braden Squiers", start: "Back Porch", lesson: "Called Before Changed", text: "Mark 1:16-20" },
    { name: "Breyson Farmer", start: "Front Porch", lesson: "God Works While We Wait", text: "Mark 4:26-29" },
    { name: "Collin Smitherman", start: "Cabin G", lesson: "Jesus Touches the Untouchable", text: "Mark 1:40-45" },
    { name: "Doug Tibbits", start: "Cafeteria", lesson: "Stop Comparing Journeys", text: "John 21:15-22" },
  ],
  seniorTeachers: [
    { name: "Blan Chrane", start: "Whataburger A", lesson: "Stop Comparing Journeys", text: "John 21:15-22" },
    { name: "Morgan Craig", start: "Whataburger B", lesson: "Jesus Touches the Untouchable", text: "Mark 1:40-45" },
    { name: "Matt Parker & Daniel Odiorne", start: "Cabin 5", lesson: "Called Before Changed", text: "Mark 1:16-20" },
    { name: "Jake Petty", start: "Quad Breezeway", lesson: "God Works While We Wait", text: "Mark 4:26-29" },
  ],
  juniorFriday: "All junior classes combine at the amphitheater. Teacher: Harrison Armstrong \u2014 \u201cDrop The Nets\u201d (Luke 5:1-11).",
  seniorFriday: "Senior boys meet on the back porch (Jake Agin); senior girls meet in the quad (Ashlyn Montgomery). \u201cDrop The Nets\u201d (Luke 5:1-11).",
};

/* General reference shown on the Info tab */
export const INFO = {
  arrivalFee: "On arrival (Sunday): staff & kids pay $5 for lunch plus a $10/night overnight fee per person. Bringing a camper trailer/RV is $15/night and must be pre-approved.",
  honorCamper: {
    title: "Honor Camper",
    points: [
      "Nominated and voted on by counselors.",
      "Campers who exemplify Christianity.",
      "Discussed in the counselor meeting at Friday lunch.",
      "Recipients receive a Bible at the Friday awards presentation.",
    ],
  },
  hensel: {
    title: "Mr. & Miss Hensel",
    points: [
      "One guy and one girl \u2014 junior or senior camper.",
      "Nominated and voted on by campers; each cabin makes nominations.",
      "Voting held Friday at the announced time (usually noon).",
      "Nominations taken by Thursday evening activity.",
      "Recipients receive a plaque at the Friday awards presentation.",
    ],
  },
  themes: [
    { day: "Sunday", theme: "Arrival day" },
    { day: "Monday", theme: "Old camp t-shirt" },
    { day: "Tuesday", theme: "Neon day" },
    { day: "Wednesday", theme: "Hawaiian" },
    { day: "Thursday", theme: "Patriotic day" },
    { day: "Friday", theme: "School colors day" },
    { day: "Saturday", theme: "Whatever clean you have left" },
  ],
};

/* Edit-panel grouping */
export const GROUPS = [
  {
    key: "weekday", title: "Weekday times", note: "Friday\u2019s Bible-block & evening times are fixed and shown on the schedule.", ids: WEEKDAY_ORDER,
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
    ids: ["church", "lunch", "meeting", "checkin", "dinner", "activity", "backtocabins"],
    labels: {
      church: "Morning worship", lunch: "Lunch", meeting: "Camp meeting",
      checkin: "Camper check-in", dinner: "Dinner", activity: "Evening activity",
      backtocabins: "Back to cabins",
    },
  },
  {
    key: "saturday", title: "Saturday \u2014 checkout",
    ids: ["wake", "breakfast", "clean", "depart"],
    labels: { wake: "Pack & clean", breakfast: "Breakfast", clean: "Final clean", depart: "Departures" },
  },
];

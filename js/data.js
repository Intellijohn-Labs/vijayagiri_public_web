/*
 * Everything an editor needs to change lives in this file: contact numbers, hours, stock, photos and brochures.
 * Nothing here is fetched from a server, so the site works on any static host.
 */

window.VY_CONFIG = {
  brand: "Vijayagiri Auto Agencies",
  legalName: "Vijayagiri Auto Agencies Pvt. Ltd.",
  tagline: "Authorized Yamaha Dealer Network",
  sinceYear: 1991,

  /** Where the discreet "Employee / Ops Login" link goes. */
  loginUrl: "/login",

  /** Central customer support line (click-to-call and the fallback for any showroom without its own number). Digits only, with country code. */
  hotline: "919961774455",
  hotlineDisplay: "xxxxxxxx",

  /** The 24/7 WhatsApp bot behind the floating chat button. Kept separate from showroom numbers so adding a branch line never reroutes bot chats. */
  botWhatsapp: "919961774455",

  /** Central support email. Left blank until the dealership confirms one; the footer line is hidden while it is empty. */
  supportEmail: "",

  /** Working days, shown in the footer (e.g. "Mon – Sat"). Left blank until confirmed; hidden while empty. */
  workingDays: "",

  /** Show the "From ₹x L*" tag on cards. Prices below are indicative figures from the dealership's internal catalogue: check them, or set this to false. */
  showPrices: true,
  priceNote: "*Indicative ex-showroom price. On-road price varies by showroom, variant and colour; please confirm with your showroom.",

  /** Showroom open/closed badges are computed in this time zone, not the visitor's. */
  timeZone: "Asia/Kolkata",
};

/*
 * Showrooms. `phone` and `whatsapp` are digits with country code (e.g. "919847012345").
 * Leave one as null and the site falls back to the central hotline and says so on the card.
 * `open` / `close` are 24-hour "HH:MM". Add `days: [1,2,3,4,5,6]` (0 = Sunday) if a branch closes on some days.
 */
window.VY_BRANCHES = [
  {
    id: "hq",
    name: "Ambalamugal Head Office & Central Yard",
    chip: "Ambalamugal HQ",
    city: "Ambalamugal",
    address: "16/386, Group Mukkadan, Opp. CRL Main Entrance, Ambalamugal, Ernakulam - 682302",
    phone: "919961774455",
    whatsapp: "919961774455",
    open: "09:00",
    close: "19:00",
  },
  {
    id: "perumbavoor",
    name: "Vijay Autos - Perumbavoor",
    chip: "Perumbavoor",
    city: "Perumbavoor",
    address: "Ground Floor & Under Ground, XI / 307B, 307C, A M Road, Perumbavoor, Ernakulam - 683542",
    phone: null,
    whatsapp: null,
    open: "09:00",
    close: "19:00",
  },
  {
    id: "kothamangalam",
    name: "Vijay Yamaha - Kothamangalam",
    chip: "Kothamangalam",
    city: "Kothamangalam",
    address: "30/347-A1, 30/347-A2, Nadukudiyil Arcade, Thangalam Vimalagiri Bypass Road, Kothamangalam - 686691",
    phone: null,
    whatsapp: null,
    open: "09:00",
    close: "19:00",
  },
  {
    id: "allapra",
    name: "Springz Motors - Allapra",
    chip: "Allapra",
    city: "Allapra",
    address: "Door No. X-19/B, Bike Valley, Allapra, Perumbavoor, Ernakulam - 683556",
    phone: null,
    whatsapp: null,
    open: "09:00",
    close: "19:00",
  },
  {
    id: "angamaly",
    name: "Speed Motors - Angamaly",
    chip: "Angamaly",
    city: "Angamaly",
    address: "Ground Floor, XXVII/464, Railway Station Junction, Angamaly N H, Angamaly - 683572",
    phone: null,
    whatsapp: null,
    open: "09:00",
    close: "19:00",
  },
  {
    id: "kalady",
    name: "Vijay Motors - Mattoor / Kalady",
    chip: "Mattoor / Kalady",
    city: "Mattoor / Kalady",
    address: "Ground Floor & Under Ground, 17-297/A,B,C,D, Mattoor Signal Junction, Near Indian Coffee House, Kalady - 683574",
    phone: null,
    whatsapp: null,
    open: "09:00",
    close: "19:00",
  },
];

/** Category pills, in display order. `nav` is the label used in the header's Models menu. */
window.VY_CATEGORIES = [
  { id: "all", label: "All Models" },
  { id: "supersport", label: "Supersport (R15)", nav: "R-World" },
  { id: "naked", label: "Hyper Naked (MT-15)", nav: "MT Series" },
  { id: "street", label: "Street (FZ Series)", nav: "FZ" },
  { id: "scooter", label: "Smart Scooters (Aerox / RayZR / Fascino)", nav: "Scooters" },
];

/** Swatch colours for the selector dots and the illustration shown when there is no photo. */
window.VY_COLOUR_HEX = {
  "Cyan Storm": "#2aa3c7", "Ice Fluo-Vermillion": "#ff5a3c", "Racing Blue": "#1f4fa3", "Metallic Black": "#1b1d21",
  "Metallic Red": "#c4202e", "Dark Knight": "#2b2f36", "Metallic Silver": "#b5bac2", "Matte Black": "#202226",
  "Grey Vermillion": "#8a8d93", "Cyan Blue": "#2f8fc0", "Matte Copper": "#a86a46", "Matte Green": "#4a6b52",
  "Metallic Blue": "#2f4fa8", "Matte Red": "#a8242f", "Ice Silver": "#c3c7cd", "Vivid Red": "#c8283a",
  "Metallic White": "#e8eaee", "Dark Matte Blue": "#223a63", "Sparkle Green": "#2f7d57",
};

/*
 * Models.
 *  - `photos`: { "<colour name>": "images/bikes/file.webp", "*": "photo used for any colour without its own" }.
 *    Empty = the colour-tinted illustration is shown. See README.md.
 *  - `brochure`: path or URL of the official PDF. Null hides the download button.
 *  - `inShowroom`: branch ids that hold this model on the showroom floor right now. Those branches show
 *    "Available at Showroom"; everywhere else shows "Fast Yard Delivery" from the central yard.
 *  - `exShowroom`: indicative starting price in rupees (null hides the price tag for that model).
 *  - `spin`: optional 360° view, e.g. { frames: 36, src: "images/360/r15/{colour}/{n}.webp" } where {colour} is the colour name in
 *    lower-case-with-dashes ("racing-blue") and {n} runs 1..frames. Without it the "360° View" tab is hidden.
 *  - Specs are indicative figures carried over from the dealership's internal catalogue; check them against the official brochure.
 */
window.VY_MODELS = [
  {
    id: "r15", name: "YZF-R15 V4 / R15M", series: "R-World", category: "supersport", type: "motorcycle",
    tagline: "Born on the track. Built for the street.",
    specs: { engine: "155 cc", mileage: "45 kmpl", power: "18.4 PS @ 10,000 rpm", braking: "Dual-channel ABS", torque: "14.2 Nm @ 7,500 rpm", weight: "142 kg", seatHeight: "815 mm" },
    colours: ["Racing Blue", "Metallic Red", "Dark Knight", "Metallic Silver", "Matte Black"],
    features: ["Quick Shifter (R15M)", "Traction Control System", "Variable Valve Actuation (VVA)", "Assist & Slipper Clutch", "Y-Connect Bluetooth", "Upside-down front forks"],
    exShowroom: 182000, spin: null,
    photos: {}, brochure: null, inShowroom: [],
  },
  {
    id: "mt15-v2", name: "MT-15 V2", series: "MT Hyper Naked", category: "naked", type: "motorcycle",
    tagline: "The dark side of Japan. Hyper naked attitude.",
    specs: { engine: "155 cc", mileage: "56 kmpl", power: "18.1 PS @ 10,000 rpm", braking: "Dual-channel ABS", torque: "14.1 Nm @ 7,500 rpm", weight: "141 kg", seatHeight: "810 mm" },
    colours: ["Cyan Storm", "Ice Fluo-Vermillion", "Racing Blue", "Metallic Black"],
    features: ["Traction Control System", "Variable Valve Actuation (VVA)", "Assist & Slipper Clutch", "Y-Connect Bluetooth", "Full LED headlamp", "Upside-down front forks"],
    exShowroom: 168000, spin: null,
    photos: {}, brochure: null, inShowroom: [],
  },
  {
    id: "fzs-fi-v4", name: "FZS-FI V4", series: "FZ Series", category: "street", type: "motorcycle",
    tagline: "Street style, everyday confidence.",
    specs: { engine: "149 cc", mileage: "49 kmpl", power: "12.4 PS @ 7,250 rpm", braking: "Single-channel ABS", torque: "13.3 Nm @ 5,500 rpm", weight: "138 kg", seatHeight: "790 mm" },
    colours: ["Matte Black", "Cyan Blue", "Metallic Red", "Racing Blue"],
    features: ["Fuel-injected engine", "Full LED headlamp", "Bluetooth connectivity (Deluxe)", "Muscular fuel tank design", "Single-channel ABS"],
    exShowroom: 121000, spin: null,
    photos: {}, brochure: null, inShowroom: [],
  },
  {
    id: "fz-x", name: "FZ-X", series: "FZ Series", category: "street", type: "motorcycle",
    tagline: "Neo-retro street with a modern heart.",
    specs: { engine: "149 cc", mileage: "50 kmpl", power: "12.4 PS @ 7,250 rpm", braking: "Single-channel ABS", torque: "13.3 Nm @ 5,500 rpm", weight: "139 kg", seatHeight: "810 mm" },
    colours: ["Matte Copper", "Matte Black", "Matte Green", "Metallic Blue"],
    features: ["Neo-retro round LED headlamp", "Y-Connect Bluetooth", "Fuel-injected engine", "Block-pattern tyres", "Single-channel ABS"],
    exShowroom: 138000, spin: null,
    photos: {}, brochure: null, inShowroom: [],
  },
  {
    id: "aerox-155", name: "Aerox 155", series: "Maxi Sports Scooter", category: "scooter", type: "scooter",
    tagline: "Maxi-sports scooter with real performance.",
    specs: { engine: "155 cc", mileage: "48 kmpl", power: "15.0 PS @ 8,000 rpm", braking: "Single-channel ABS", torque: "13.9 Nm @ 6,500 rpm", weight: "126 kg", seatHeight: "790 mm" },
    colours: ["Racing Blue", "Metallic Black", "Grey Vermillion", "Metallic Silver"],
    features: ["Variable Valve Actuation (VVA)", "Traction Control System", "Y-Connect Bluetooth", "Smart Key", "Full digital LCD cluster", "Large under-seat storage"],
    exShowroom: 151000, spin: null,
    photos: {}, brochure: null, inShowroom: [],
  },
  {
    id: "rayzr-125", name: "RayZR 125 Fi Hybrid", series: "Hybrid Scooter", category: "scooter", type: "scooter",
    tagline: "Hybrid power. Street-rally spirit.",
    specs: { engine: "125 cc", mileage: "66 kmpl", power: "8.2 PS @ 6,500 rpm", braking: "Drum / Disc (variant)", torque: "10.3 Nm @ 5,000 rpm", weight: "99 kg", seatHeight: "785 mm" },
    colours: ["Metallic Black", "Cyan Blue", "Matte Red", "Ice Silver", "Racing Blue"],
    features: ["Hybrid assist (Smart Motor Generator)", "Idle Stop-Start system", "Y-Connect Bluetooth (select variants)", "LED headlamp", "Side-stand engine cut-off"],
    exShowroom: 82000, spin: null,
    photos: {}, brochure: null, inShowroom: [],
  },
  {
    id: "fascino-125", name: "Fascino 125 Fi Hybrid", series: "Hybrid Scooter", category: "scooter", type: "scooter",
    tagline: "Stylish, light and fuel smart.",
    specs: { engine: "125 cc", mileage: "68 kmpl", power: "8.2 PS @ 6,500 rpm", braking: "Drum / Disc (variant)", torque: "10.3 Nm @ 5,000 rpm", weight: "99 kg", seatHeight: "780 mm" },
    colours: ["Vivid Red", "Metallic White", "Dark Matte Blue", "Sparkle Green", "Metallic Black"],
    features: ["Hybrid assist (Smart Motor Generator)", "Idle Stop-Start system", "LED headlamp", "Large under-seat storage", "Side-stand engine cut-off"],
    exShowroom: 80000, spin: null,
    photos: {}, brochure: null, inShowroom: [],
  },
];

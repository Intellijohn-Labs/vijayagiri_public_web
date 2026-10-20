/*
 * All editable content lives here: contact numbers, showrooms, models, routes and accessories.
 * Nothing is fetched from a server, so the site works on any host.
 */

export const SITE = {
  brand: "Vijayagiri Auto Agencies",
  legalName: "Vijayagiri Auto Agencies Pvt. Ltd.",
  tagline: "Authorized Yamaha Dealer Network",
  sinceYear: 1991,
  /** Where the discreet "Staff Login" link goes (the separate employee / ops app). */
  loginUrl: "/login",
  /** Central support line, digits with country code. Used for click-to-call and as the fallback for showrooms without their own number. */
  hotline: "919961774455",
  /** Text shown for the hotline. The dial / WhatsApp links still use `hotline`. */
  hotlineDisplay: "xxxxxxxx",
  /** The 24/7 WhatsApp bot behind the floating chat button. Kept apart from showroom numbers so adding a branch line never reroutes bot chats. */
  botWhatsapp: "919961774455",
  /** Left blank until confirmed; the footer line is hidden while empty. */
  supportEmail: "",
  workingDays: "",
  /** Open / closed badges are computed in this time zone, not the visitor's. */
  timeZone: "Asia/Kolkata",
} as const;

/* ───────────── showrooms ───────────── */

export interface Branch {
  id: string;
  name: string;
  chip: string;
  city: string;
  address: string;
  /** Digits with country code, or null to fall back to the central hotline (and say so on the card). */
  phone: string | null;
  whatsapp: string | null;
  /** 24-hour "HH:MM" */
  open: string;
  close: string;
  /** Optional working weekdays (0 = Sunday). Omitted = every day. */
  days?: number[];
}

export const BRANCHES: Branch[] = [
  { id: "hq", name: "Ambalamugal Head Office & Central Yard", chip: "Ambalamugal HQ", city: "Ambalamugal", address: "16/386, Group Mukkadan, Opp. CRL Main Entrance, Ambalamugal, Ernakulam - 682302", phone: "919961774455", whatsapp: "919961774455", open: "09:00", close: "19:00" },
  { id: "perumbavoor", name: "Vijay Autos - Perumbavoor", chip: "Perumbavoor", city: "Perumbavoor", address: "Ground Floor & Under Ground, XI / 307B, 307C, A M Road, Perumbavoor, Ernakulam - 683542", phone: null, whatsapp: null, open: "09:00", close: "19:00" },
  { id: "kothamangalam", name: "Vijay Yamaha - Kothamangalam", chip: "Kothamangalam", city: "Kothamangalam", address: "30/347-A1, 30/347-A2, Nadukudiyil Arcade, Thangalam Vimalagiri Bypass Road, Kothamangalam - 686691", phone: null, whatsapp: null, open: "09:00", close: "19:00" },
  { id: "allapra", name: "Springz Motors - Allapra", chip: "Allapra", city: "Allapra", address: "Door No. X-19/B, Bike Valley, Allapra, Perumbavoor, Ernakulam - 683556", phone: null, whatsapp: null, open: "09:00", close: "19:00" },
  { id: "angamaly", name: "Speed Motors - Angamaly", chip: "Angamaly", city: "Angamaly", address: "Ground Floor, XXVII/464, Railway Station Junction, Angamaly N H, Angamaly - 683572", phone: null, whatsapp: null, open: "09:00", close: "19:00" },
  { id: "kalady", name: "Vijay Motors - Mattoor / Kalady", chip: "Mattoor / Kalady", city: "Mattoor / Kalady", address: "Ground Floor & Under Ground, 17-297/A,B,C,D, Mattoor Signal Junction, Near Indian Coffee House, Kalady - 683574", phone: null, whatsapp: null, open: "09:00", close: "19:00" },
];

/* ───────────── models ───────────── */

export const COLOUR_HEX: Record<string, string> = {
  "Cyan Storm": "#2aa3c7", "Ice Fluo-Vermillion": "#ff5a3c", "Racing Blue": "#1f4fa3", "Metallic Black": "#1b1d21",
  "Metallic Red": "#c4202e", "Dark Knight": "#2b2f36", "Metallic Silver": "#b5bac2", "Matte Black": "#202226",
  "Grey Vermillion": "#8a8d93", "Cyan Blue": "#2f8fc0", "Matte Copper": "#a86a46", "Matte Green": "#4a6b52",
  "Metallic Blue": "#2f4fa8", "Matte Red": "#a8242f", "Ice Silver": "#c3c7cd", "Vivid Red": "#c8283a",
  "Metallic White": "#e8eaee", "Dark Matte Blue": "#223a63", "Sparkle Green": "#2f7d57",
};

export type BikeKind = "r15" | "mt15" | "aerox";

export interface Model {
  id: string;
  name: string;
  short: string;
  series: string;
  tagline: string;
  /** Numeric values drive the count-up and the comparison bars; the strings are shown as-is. */
  specs: {
    engine: string; mileage: string; power: string; torque: string; weight: string; seatHeight: string; braking: string; transmission: string;
    powerPS: number; torqueNm: number; weightKg: number; mileageKmpl: number;
  };
  colours: string[];
  features: string[];
}

/** Specs are indicative figures from the dealership's internal catalogue: check them against the official brochures. */
export const MODELS: Model[] = [
  { id: "r15", name: "YZF-R15 V4 / R15M", short: "R15M", series: "R-World", tagline: "Born on the track. Built for the street.", specs: { engine: "155 cc", mileage: "45 kmpl", power: "18.4 PS @ 10,000 rpm", torque: "14.2 Nm @ 7,500 rpm", weight: "142 kg", seatHeight: "815 mm", braking: "Dual-channel ABS", transmission: "6-speed", powerPS: 18.4, torqueNm: 14.2, weightKg: 142, mileageKmpl: 45 }, colours: ["Racing Blue", "Metallic Red", "Dark Knight", "Metallic Silver", "Matte Black"], features: ["Quick Shifter (R15M)", "Traction Control System", "Variable Valve Actuation (VVA)", "Assist & Slipper Clutch", "Y-Connect Bluetooth", "Upside-down front forks"] },
  { id: "mt15-v2", name: "MT-15 V2", short: "MT-15", series: "MT Hyper Naked", tagline: "The dark side of Japan. Hyper naked attitude.", specs: { engine: "155 cc", mileage: "56 kmpl", power: "18.1 PS @ 10,000 rpm", torque: "14.1 Nm @ 7,500 rpm", weight: "141 kg", seatHeight: "810 mm", braking: "Dual-channel ABS", transmission: "6-speed", powerPS: 18.1, torqueNm: 14.1, weightKg: 141, mileageKmpl: 56 }, colours: ["Cyan Storm", "Ice Fluo-Vermillion", "Racing Blue", "Metallic Black"], features: ["Traction Control System", "Variable Valve Actuation (VVA)", "Assist & Slipper Clutch", "Y-Connect Bluetooth", "Full LED headlamp", "Upside-down front forks"] },
  { id: "aerox-155", name: "Aerox 155", short: "Aerox", series: "Maxi Sports Scooter", tagline: "Maxi-sports scooter with real performance.", specs: { engine: "155 cc", mileage: "48 kmpl", power: "15.0 PS @ 8,000 rpm", torque: "13.9 Nm @ 6,500 rpm", weight: "126 kg", seatHeight: "790 mm", braking: "Single-channel ABS", transmission: "CVT automatic", powerPS: 15, torqueNm: 13.9, weightKg: 126, mileageKmpl: 48 }, colours: ["Racing Blue", "Metallic Black", "Grey Vermillion", "Metallic Silver"], features: ["Variable Valve Actuation (VVA)", "Traction Control System", "Y-Connect Bluetooth", "Smart Key", "Full digital LCD cluster", "Large under-seat storage"] },
  { id: "fzs-fi-v4", name: "FZS-FI V4", short: "FZS-FI", series: "FZ Series", tagline: "Street style, everyday confidence.", specs: { engine: "149 cc", mileage: "49 kmpl", power: "12.4 PS @ 7,250 rpm", torque: "13.3 Nm @ 5,500 rpm", weight: "138 kg", seatHeight: "790 mm", braking: "Single-channel ABS", transmission: "5-speed", powerPS: 12.4, torqueNm: 13.3, weightKg: 138, mileageKmpl: 49 }, colours: ["Matte Black", "Cyan Blue", "Metallic Red", "Racing Blue"], features: ["Fuel-injected engine", "Full LED headlamp", "Bluetooth connectivity (Deluxe)", "Muscular fuel tank design", "Single-channel ABS"] },
  { id: "fz-x", name: "FZ-X", short: "FZ-X", series: "FZ Series", tagline: "Neo-retro street with a modern heart.", specs: { engine: "149 cc", mileage: "50 kmpl", power: "12.4 PS @ 7,250 rpm", torque: "13.3 Nm @ 5,500 rpm", weight: "139 kg", seatHeight: "810 mm", braking: "Single-channel ABS", transmission: "5-speed", powerPS: 12.4, torqueNm: 13.3, weightKg: 139, mileageKmpl: 50 }, colours: ["Matte Copper", "Matte Black", "Matte Green", "Metallic Blue"], features: ["Neo-retro round LED headlamp", "Y-Connect Bluetooth", "Fuel-injected engine", "Block-pattern tyres", "Single-channel ABS"] },
  { id: "rayzr-125", name: "RayZR 125 Fi Hybrid", short: "RayZR", series: "Hybrid Scooter", tagline: "Hybrid power. Street-rally spirit.", specs: { engine: "125 cc", mileage: "66 kmpl", power: "8.2 PS @ 6,500 rpm", torque: "10.3 Nm @ 5,000 rpm", weight: "99 kg", seatHeight: "785 mm", braking: "Drum / Disc", transmission: "CVT automatic", powerPS: 8.2, torqueNm: 10.3, weightKg: 99, mileageKmpl: 66 }, colours: ["Metallic Black", "Cyan Blue", "Matte Red", "Ice Silver", "Racing Blue"], features: ["Hybrid assist (Smart Motor Generator)", "Idle Stop-Start system", "Y-Connect Bluetooth (select variants)", "LED headlamp", "Side-stand engine cut-off"] },
  { id: "fascino-125", name: "Fascino 125 Fi Hybrid", short: "Fascino", series: "Hybrid Scooter", tagline: "Stylish, light and fuel smart.", specs: { engine: "125 cc", mileage: "68 kmpl", power: "8.2 PS @ 6,500 rpm", torque: "10.3 Nm @ 5,000 rpm", weight: "99 kg", seatHeight: "780 mm", braking: "Drum / Disc", transmission: "CVT automatic", powerPS: 8.2, torqueNm: 10.3, weightKg: 99, mileageKmpl: 68 }, colours: ["Vivid Red", "Metallic White", "Dark Matte Blue", "Sparkle Green", "Metallic Black"], features: ["Hybrid assist (Smart Motor Generator)", "Idle Stop-Start system", "LED headlamp", "Large under-seat storage", "Side-stand engine cut-off"] },
];

export const modelById = (id: string) => MODELS.find((m) => m.id === id);

/**
 * The three flagships on the turntable. Colours come from the catalogue (the brief's "Dark Matte Blue" and "Metallic Grey" are not
 * MT-15 / R15 colours in it, so the nearest catalogue colours are used). Only the R15M has a quick-shifter.
 */
/**
 * A real photo (transparent cut-out) for a model. `headlight` is where the lamp sits as fractions of the image and `facing`
 * is which way the bike points, so the hero beam and glow stay locked to it if the file is replaced.
 * Photos are only offered in the colour they show.
 */
export interface BikePhoto {
  src: string;
  width: number;
  height: number;
  colour: string;
  alt: string;
  facing: "left" | "right";
  headlight: { x: number; y: number };
  /** A cloth cover shaped to this bike (see the hero). `pad` is how far it extends past the photo on each side, in photo pixels. */
  cover?: { src: string; width: number; height: number; pad: number };
}
export const BIKE_PHOTOS: Record<string, BikePhoto> = {
  aerox: { src: "/images/bikes/aerox.png", width: 640, height: 524, colour: "Metallic Black", alt: "Yamaha Aerox 155 in Metallic Black, three-quarter front view", facing: "right", headlight: { x: 0.789, y: 0.41 } },
  mt15: { src: "/images/bikes/mt15.png", width: 878, height: 751, colour: "Cyan Storm", alt: "Yamaha MT-15 in Cyan Storm, three-quarter front view", facing: "right", headlight: { x: 0.74, y: 0.331 } },
  r15: { src: "/images/bikes/r15m.png", width: 1064, height: 685, colour: "Metallic Silver", alt: "Yamaha R15M in Metallic Silver, side view", facing: "right", headlight: { x: 0.895, y: 0.31 }, cover: { src: "/images/bikes/r15m-cover.webp", width: 1160, height: 781, pad: 48 } },
};

export interface Flagship {
  modelId: string;
  kind: BikeKind;
  label: string;
  outline: string;
  colours: string[];
  quickshifter: boolean;
  /** When set, the photo replaces the illustration for this model. */
  photo?: BikePhoto;
}
export const FLAGSHIPS: Flagship[] = [
  { modelId: "r15", kind: "r15", label: "Yamaha R15M", outline: "R 15 M", colours: ["Racing Blue", "Metallic Silver"], quickshifter: true, photo: BIKE_PHOTOS.r15 },
  { modelId: "mt15-v2", kind: "mt15", label: "Yamaha MT-15 V2", outline: "M T - 15", colours: ["Cyan Storm", "Racing Blue"], quickshifter: false, photo: BIKE_PHOTOS.mt15 },
  { modelId: "aerox-155", kind: "aerox", label: "Yamaha Aerox 155", outline: "A E R O X", colours: ["Racing Blue", "Metallic Black"], quickshifter: false, photo: BIKE_PHOTOS.aerox },
];

/* ───────────── gear story ───────────── */

export const GEARS = [
  { label: "N", name: "Neutral", subtitle: "Neutral: The Silence Before" },
  { label: "1", name: "First", subtitle: "First Gear: Wake the Machine" },
  { label: "2", name: "Second", subtitle: "Second Gear: Carve the Apex" },
  { label: "3", name: "Third", subtitle: "Third Gear: Pure Acceleration" },
  { label: "4", name: "Fourth", subtitle: "Fourth Gear: Open Roads" },
  { label: "5", name: "Fifth", subtitle: "Fifth Gear: Racing DNA" },
  { label: "6", name: "Sixth", subtitle: "Sixth Gear: The Summit" },
] as const;

/* ───────────── editorial: routes and gear ───────────── */

/**
 * Editorial copy about public roads. Descriptions are deliberately general (no distances or times); please have a rider who
 * knows each road review them before launch.
 */
export interface Route {
  id: string;
  name: string;
  area: string;
  blurb: string;
  character: string[];
  bestWith: string;
  nearestBranch: string;
  tip: string;
  /** SVG path drawn in a 0 0 300 120 box, animated as the card scrolls in */
  line: string;
}
export const ROUTES: Route[] = [
  { id: "munnar-gap", name: "Munnar Gap Road", area: "Idukki · High Range", blurb: "Climb out of the Ernakulam plains into tea country, then ride the long, sweeping Gap Road with the Western Ghats falling away beside you.", character: ["Tea estates", "Fast sweepers", "Cool, misty air"], bestWith: "mt15-v2", nearestBranch: "kothamangalam", tip: "Start early: the road is at its best before the weekend traffic and the afternoon mist.", line: "M5 100 C 40 20, 70 110, 110 60 S 180 10, 215 55 S 270 100, 295 30" },
  { id: "athirappilly-valparai", name: "Athirappilly – Valparai Trail", area: "Thrissur · Anamalai Hills", blurb: "Waterfalls, rainforest canopy and a ladder of hairpins on the way up to Valparai. Technical, shaded and unforgettable.", character: ["Hairpin bends", "Forest canopy", "Waterfalls"], bestWith: "aerox-155", nearestBranch: "kalady", tip: "Parts of this road run through forest areas: follow local rules and timings, expect wildlife, and avoid riding it at night.", line: "M5 20 C 60 10, 40 60, 90 55 S 120 110, 170 90 S 230 20, 255 70 S 285 100, 295 90" },
  { id: "vagamon", name: "Vagamon Hills", area: "Idukki – Kottayam border · Kerala Highlands", blurb: "Rolling grasslands, pine forests and cool air. Scenic, relaxed riding where the destination is as good as the road.", character: ["Open meadows", "Pine forests", "Easy gradients"], bestWith: "r15", nearestBranch: "perumbavoor", tip: "Fuel up before you leave the main road and ride at an easy pace: this one is about the views.", line: "M5 70 C 50 100, 80 20, 130 50 S 190 110, 225 60 S 280 20, 295 55" },
];

export interface GearItem {
  id: string;
  name: string;
  blurb: string;
  tag: string;
}
export const GEAR_ITEMS: GearItem[] = [
  { id: "jacket", name: "Riding Jacket", blurb: "Armoured, ventilated and cut for the riding position.", tag: "Protection" },
  { id: "helmet", name: "Racing Helmet", blurb: "Full-face, certified, with a shell that stays calm at speed.", tag: "Head" },
  { id: "gloves", name: "Riding Gloves", blurb: "Knuckle protection and a feel for the lever.", tag: "Hands" },
  { id: "bag", name: "Tail Bag", blurb: "Weekend kit that clips onto the pillion seat.", tag: "Carry" },
];

/* ───────────── helpers ───────────── */

export const dialOf = (b: Branch) => b.phone ?? SITE.hotline;
export const waOf = (b: Branch) => b.whatsapp ?? b.phone ?? SITE.hotline;
export const hasOwnLine = (b: Branch) => Boolean(b.phone);
export const branchById = (id: string) => BRANCHES.find((b) => b.id === id) ?? BRANCHES[0];
export const prettyPhone = (d: string) => {
  const m = /^91(\d{5})(\d{5})$/.exec(d);
  return m ? `+91 ${m[1]} ${m[2]}` : `+${d}`;
};

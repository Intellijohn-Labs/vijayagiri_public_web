# Vijayagiri Auto Agencies – public website

Static, dependency-free customer site (HTML/CSS/JS). No build step, no login, no backend.

    python3 -m http.server 8000     # then open http://localhost:8000

Deploy by uploading the folder to any static host (Vercel, Netlify, S3, nginx).

## Editing content – everything is in `js/data.js`

| What | Where |
| --- | --- |
| Hotline, support email, working days, "Employee / Ops Login" URL | `VY_CONFIG` |
| Showroom phone / WhatsApp / hours / days | `VY_BRANCHES` (a `null` number falls back to the central hotline and the card says so) |
| Specs, colours, tagline | `VY_MODELS` |
| Studio photos | `photos: { "Racing Blue": "images/bikes/r15-racing-blue.webp", "*": "images/bikes/r15.webp" }` – until a photo exists, a colour-tinted illustration is shown |
| Brochure PDF | `brochure: "brochures/r15.pdf"` – the button only appears when set |
| "Available at Showroom" badge | `inShowroom: ["hq", "perumbavoor"]` – all other branches show "Fast Yard Delivery" |

Open/Closed badges use the `timeZone` in `VY_CONFIG` (Asia/Kolkata), not the visitor's clock.

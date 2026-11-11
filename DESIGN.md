---
name: new to nova
description: A community pinboard of Northern Virginia groups that welcome new people.
colors:
  ink: "#1D2A2F"
  muted: "#3D4E55"
  fabric: "#CFE2EA"
  fabric-deep: "#B4D0DC"
  paper: "#FFFFFF"
  link-underline: "#B5B0A6"
  sign-green: "#0B6B3A"
  route-beltway: "#FF8E72"
  route-i66: "#F6D44A"
  route-dulles: "#93D26C"
  route-i95: "#F7A9CB"
  route-anywhere: "#D7B6F4"
  pin-red: "#E2402F"
  pin-blue: "#1F6FD1"
  pin-green: "#1E9E57"
  pin-yellow: "#F2B705"
  pin-violet: "#7A4FD6"
  marker-yellow: "#F6D44A"
typography:
  display:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "clamp(40px, 4.8vw, 64px)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.1
  body:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.3
rounded:
  paper: "0px"
  control: "4px"
  sign: "10px"
  round: "50%"
spacing:
  gutter: "24px"
  container: "1200px"
  tight: "8px"
  group: "16px"
  sheet-gap: "34px"
  section: "72px"
components:
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    height: "46px"
    padding: "0 18px"
  button-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "46px"
    padding: "0 18px"
  tag:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "3px"
    height: "44px"
    padding: "0 14px"
  tag-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper}"
    padding: "34px"
  route-sign:
    backgroundColor: "{colors.sign-green}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sign}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "50px"
---

# Design System: new to nova

## Overview

**Creative North Star: "The Community Pinboard"**

The site is the corkboard in a library or coffee shop, moved online for Northern Virginia. Groups and events are paper pinned to a pale blue fabric board: white sheets with soft shadows, a pushpin each, and a slight tilt, as if someone put them up by hand. It is warm and local, written in first person by one person (Becca), and never looks like a directory template.

Colour means place. Each part of Northern Virginia has a colour, grouped by the roads people actually use (Inside the Beltway, I-66 West, Dulles Toll Road, I-95 South), and that colour fills a group's flyer, an event's stub, a Coming up dot or a month chip. Kind of group is never colour: categories are plain white tags. The routes themselves are real green highway guide signs, the one place where official wayfinding meets the handmade board.

Rejected on purpose: the white card grid with pastel category pills, italic serif headlines, all caps, and anything that looks like a SaaS dashboard.

**Key Characteristics:**
- Blue woven-fabric ground, white paper sheets, soft drop shadows, pushpins, small tilts.
- Colour = place (route colours); category = white tags.
- Real highway language: green guide signs, real Interstate and Virginia shields, Overpass (after highway-sign lettering).
- One typeface, sentence case, no italics, no all caps.
- An ink header bar with the Virginia mark: the state tilted 12° with a red pin over NoVA.

## Colors

A cool, quiet ground and ink text, so the place colours carry all the energy.

### Primary
- **Sign Ink** (#1D2A2F): text everywhere, the header bar, solid buttons, selected tags, today markers.

### Place colours (the route groups, `src/routes.ts`)
- **Beltway Coral** (#FF8E72): Inside the Beltway (Arlington, Alexandria, Falls Church, McLean, Annandale).
- **I-66 Yellow** (#F6D44A): I-66 West (Fairfax, Clifton, Centreville, Manassas).
- **Dulles Green** (#93D26C): Dulles Toll Road (Reston, Herndon, Ashburn, Chantilly).
- **I-95 Pink** (#F7A9CB): I-95 South (Lorton, Woodbridge).
- **Anywhere Lilac** (#D7B6F4): statewide, national, three or more route groups, or no area.

### Neutral
- **Fabric Blue** (#CFE2EA): the page background, with a faint woven texture; also hover fills on white controls.
- **Fabric Deep** (#B4D0DC): the rule above the footer.
- **Paper** (#FFFFFF): sheets, tags, inputs, the marker stripe.
- **Muted Slate** (#3D4E55): secondary text (hints, sublines, the calendar button). Passes 4.5:1 on white and on fabric.
- **Guide-sign Green** (#0B6B3A): route signs only.

### Accents
- **Pushpins** (#E2402F red, #1F6FD1 blue, #1E9E57 green, #F2B705 yellow, #7A4FD6 violet): decoration only, rotated through so the board looks hand-pinned. Pins carry no meaning.
- **Marker Yellow** (#F6D44A): text selection and the input focus ring.

### Named Rules
**The Colour Means Place Rule.** Route colours mark where something happens and nothing else. Never colour by category, status or emphasis. Events take their own place; a group's flyer takes the group's towns.

**The Ink On Colour Rule.** Text on a place colour is always ink, never white or grey.

## Typography

**Display, body and label font:** Overpass (Google Fonts, weights 400/600/700/800), falling back to system-ui. A tiny "Middot" face sits in front of it, borrowing only the middle dot (·) from a system font, because Overpass draws it with zero width.

**Character:** Overpass is the open-source cousin of US highway-sign lettering: plain, sturdy and friendly at 800.

### Hierarchy
- **Display** (800, clamp(40px, 4.8vw, 64px) on Groups and Events, up to 72px on About and Join, line-height 1.02–1.04): page headlines, with the key words on a white marker stripe (`.hl`).
- **Headline** (800, 32px; 24px on phones): section headings such as "Where are you headed?" and the week title.
- **Title** (800, 26–28px): flyer names, day headings, sheet headings.
- **Body** (400, 15.5–18px, line-height 1.5–1.65): blurbs, About letter (18px, kept to about 70 characters a line).
- **Label** (700–800, 13–15px): tags, counts, times, buttons, tear-off tabs.

### Named Rules
**The No Italics Rule.** Nothing is italic, including "new to nova". Emphasis comes from weight or the marker stripe.

**The Sentence Case Rule.** Every heading, button and label is in sentence case. No all caps.

## Layout

A single 1200px column with 24px side gutters (`.wrap`). Groups uses a free board: flyers in an auto-fill grid (minimum 280px), 34px apart vertically and 26px across. Route signs sit four across, two across below 1000px. Events places one pinned sheet per day, with stubs in an auto-fill grid (minimum 220px). About puts the letter at 760px wide and two sheets side by side under it.

Below about 700–760px, everything is one column and the page never scrolls sideways. Rows that need more room scroll inside their own box with a fade on the right (the category tags). Route signs stay two across on phones with towns folded behind an arrow. Coming up shows the next three stacked; the month view swaps chips for place-colour dots.

Every touch target is at least 44px.

## Elevation & Depth

Depth comes from paper on fabric: things are pinned or taped to the board, so they cast a soft downward shadow. There is one main shadow and a small one for tags.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 10px 20px rgb(29 54 66 / 0.22), 0 2px 3px rgb(29 54 66 / 0.2)`): sheets, flyers, signs, the Coming up sheet, menus.
- **Tag** (`box-shadow: 0 2px 4px rgb(29 54 66 / 0.22)`): white tags, the Week/Month toggle, the area select, arrow buttons.
- **Stub** (`box-shadow: 0 4px 8px rgb(29 54 66 / 0.18)`): event stubs, deepening on hover.
- **Pin** (`box-shadow: 1px 4px 4px rgb(20 40 50 / 0.4)`): pushpins.

### Named Rules
**The Pins Are For Paper Rule.** Paper (flyers, sheets, the snapshot photo) gets a pushpin or tape and a slight tilt (about -1.5° to 1.5°). Signs and controls are never pinned or tilted.

## Shapes

Paper has square corners. Controls have small 3–4px corners. Route signs have 10px corners with a white inset border. Pins and today markers are circles. Dashed ink lines at 30–50% opacity divide things on paper (tear-off tabs, Coming up rows, month grid). Hover straightens a tilted flyer and lifts it slightly.

## Components

### Buttons
- **Ink** (`.ink-btn`): ink fill, white 15px/700 text, 4px corners, 46px tall. The main action on a sheet ("Check your listing", "Keep me posted").
- **Paper** (`.paper-btn`): white with a 2px ink inset border; hover fills with fabric blue. Secondary actions ("All of NoVA", "Show all events").
- **Header CTA**: "Stay in the loop" as a white button on the ink bar.

### Tags
- White, 3px corners, 44px tall, 14px/700, with the tag shadow. Selected: ink fill, white text. Used for categories, "This weekend" and Week/Month.

### Pinned sheet (`.sheet`)
- White paper, square corners, Lift shadow, a pushpin centred on the top edge, `--tilt` rotation. Padding 34px (22px on phones).

### Flyer (Groups)
- A sheet filled with its place colour: name (28px/800), a bold place line with a pin icon plus kinds, the blurb, then tear-off tabs along the bottom (Next event, Visit, "Yours? Check it") split by dashed lines.

### Route sign (Groups, "Where are you headed?")
- Guide-sign green, 10px corners, a white 2.5px inset border, the real shield (red-white-blue Interstate; Virginia's white shield cut from a black rectangle), towns listed like exits with the group count where mileage would be, and a place-colour panel along the bottom with the total ("21 groups"). A chosen route or town turns its row white with green text.

### Event stub (Events)
- A rectangle in the event's place colour, slightly tilted: time (26px/800), name (17px/800, its link covers the stub), then town in bold · group. "Add to calendar" is an icon button in the top corner.

### Inputs
- White, 2px ink border, 4px corners, 50px tall, labels always visible above (16px/800) with optional hints in muted text. Focus: a 3px marker-yellow ring.

### Navigation
- Ink bar: the Virginia mark and "new to nova" (27px/800) on the left; Groups, Events, About and the "Stay in the loop" button on the right. The current page is underlined. Below 700px, a Menu button opens the links stacked.

## Do's and Don'ts

### Do:
- **Do** colour things by where they happen, using the five route colours.
- **Do** put text on place colours in ink.
- **Do** pin or tape paper and give it a small tilt; keep signs and controls straight.
- **Do** use the marker stripe (`.hl`) for the one or two key words in a headline.
- **Do** keep every target at least 44px and check phone layouts in a real browser tab (headless screenshots substitute the system font at phone width).

### Don't:
- **Don't** colour categories; they are white tags.
- **Don't** use italics, all caps or a second typeface.
- **Don't** put pushpins on signs or controls.
- **Don't** add contact details for groups or subscribers anywhere on the site.
- **Don't** bring back pastel category pills, rounded white cards or the old warm-grey panels.

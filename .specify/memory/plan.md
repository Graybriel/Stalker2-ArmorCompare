# Implementation Plan: Armor Comparison System

**Date**: 2026-01-28 | **Status**: Active | **Constitution**: v1.0.0

## Summary

Stalker 2 Armor Compare is a web-based armor comparison tool for STALKER 2 that enables players to evaluate armor sets side-by-side by protection values, weight, cost, and upgrade potential. The application is data-driven (sourced from armor.json), uses modular JavaScript for maintainability, and prioritizes responsive UI for both desktop and mobile players.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  
**Primary Dependencies**: None (vanilla JavaScript; data-driven from JSON)  
**Storage**: Static JSON files (`data/armor.json`, `data/armor_full.json`)  
**Testing**: Manual browser testing (Chrome, Firefox, Edge)  
**Target Platform**: Web browser (desktop + mobile)  
**Project Type**: Single-page application (frontend-only)  
**Performance Goals**: <1s initial load, armor comparison <100ms, smooth mobile sorting  
**Constraints**: No framework lock-in, responsive design (320px mobile to 4k desktop)  
**Scale/Scope**: 60+ armor entries, 5+ upgrade slots per armor, 7 protection types

## Project Structure

### Source Tree
```
.
├── index.html           # Entry point, UI structure
├── css/
│   └── styles.css       # All styling (no framework)
├── js/
│   ├── app.js           # Initialization, data loading, page setup
│   ├── compare.js       # Armor comparison logic, filtering, sorting
│   └── upgrades.js      # Upgrade system, slot management
├── data/
│   ├── armor.json       # Armor metadata (primary data source)
│   └── armor_full.json  # Extended armor data (backup/reference)
└── .specify/
    ├── memory/
    │   ├── constitution.md  # Project governance
    │   ├── plan.md          # This file
    │   └── spec.md          # User stories & acceptance criteria
    └── templates/           # Reusable templates
```

### File Responsibilities

| File | Responsibility |
|------|-----------------|
| `index.html` | DOM structure, semantic HTML5 |
| `styles.css` | Responsive design, accessibility, visual hierarchy |
| `app.js` | Boot sequence: load armor.json → populate DOM → attach listeners |
| `compare.js` | Filter/sort armor list, calculate stat differences, update table |
| `upgrades.js` | Parse upgrade tree, validate slot placement, calculate bonuses |

## Data Schema (armor.json)

Each armor entry MUST contain:

```json
{
  "Id": "Zorya_Neutral_Armor",
  "Values": {
    "SID": "Zorya_Neutral_Armor",
    "DisplayName": "Sunrise Suit",
    "Type": "chest",
    "weight": "4.0",
    "Cost": "36000.0",
    "slots": "2",
    "thermal": "13.0",
    "electric": "11.0",
    "chemical": "13.0",
    "radiation": "30",
    "psi": "0.0",
    "physical": "2.0",
    "Fall": "0.0",
    "Icon": "[texture path]"
  },
  "UpgradeList": ["upgrade_id_1", "upgrade_id_2", ...],
  "Upgrades": [
    { "SID": "upgrade_id", "displayName": "...", ... }
  ]
}
```

Required fields: `Id`, `DisplayName`, `Type`, `weight`, `Cost`, `slots`, `thermal`, `electric`, `chemical`, `radiation`, `psi`, `physical`

## Development Priorities (by user value)

**P1 - Core Comparison**: Multi-piece armor comparison (single piece + Head+Chest combos) with all stat visibility and independent upgrade sections  
**P1 - Filtering**: Filter by armor type (Head, Chest, Full Body)  
**P1 - Upgrade Display**: View available upgrade slots and categories for each piece independently  
**P2 - Mobile Optimization**: Full responsive design, touch-friendly controls  
**P3 - Advanced Features**: Stat calculators, loadout presets, export data

## Quality Gates

✅ All armor entries in armor.json render without JavaScript errors  
✅ Comparison table renders in <100ms on 60+ armor entries  
✅ Mobile viewport (320px) displays comparison table usably  
✅ No CSS framework; custom styles in styles.css only  
✅ No global JavaScript state pollution  
✅ Each module (app.js, compare.js, upgrades.js) has single responsibility  

---

**Version**: 1.0.0 | **Last Updated**: 2026-01-28

# STALKER 2 Armor Comparison Tool

An interactive web tool for comparing STALKER 2 armor sets, their stats, upgrades, and protective effects side-by-side.

**Live Site:** https://graybriel.github.io/Stalker2-ArmorCompare/

**GitHub Repository:** https://github.com/graybriel/Stalker2-ArmorCompare

## Features

- **Side-by-side Comparison:** Compare two armor sets simultaneously
- **Multiple Armor Types:** Support for full-body suits and separate head/chest combinations
- **Equipment Upgrades:** View available upgrades for each armor piece
- **Detailed Stats:** Compare armor ratings, durability, and protective properties
- **Interactive Interface:** Dynamically load armor data and upgrade information

## How to Use

1. Select an armor type (Full Body or Head/Chest combination) for each column
2. Choose specific armor pieces from the dropdowns
3. View available upgrades for each armor set
4. Compare stats, ratings, and upgrade options side-by-side

## Running Locally

This is a static web app and should be served through a local web server because it loads JSON data with `fetch`.

### VS Code Live Server

1. Open `index.html` in VS Code.
2. Right-click in the editor and select **Open with Live Server**.
3. Open the URL provided by VS Code, usually `http://127.0.0.1:5500`.

### VS Code Live Preview

Open `index.html` and use the **Show Preview** button in the editor. The workspace launch configuration expects Live Preview at `http://localhost:8080`.

Do not open `index.html` directly from the file system; the browser may block loading `data/armor.json`.

### Debugging

Use `F12` or `Ctrl+Shift+I` to open browser developer tools. Check the **Console** for JavaScript errors and the **Network** tab to verify that `data/armor.json` loads successfully.

## Features

- Full-body armor suits and modular head/chest combinations
- Armor upgrade information and categories
- Upgrade effectiveness and compatibility tracking

## Data Sources

Armor data is maintained in [data/armor.json](data/armor.json) and includes:
- Armor stats (ballistic resistance, chemical protection, etc.)
- Available upgrades and their effects
- Armor types and categories

## Contributing & Issues

Found a bug or want to request a feature? Please [open an issue on GitHub](https://github.com/graybriel/Stalker2-ArmorCompare/issues).

## Technology

- HTML5, CSS3, and Vanilla JavaScript
- JSON data format for armor and upgrade information

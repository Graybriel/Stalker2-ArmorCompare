# Quick Start Guide: Armor Comparison System

**For**: Developers implementing Stalker2-ArmorCompare  
**Reading Time**: 10 minutes  
**Prerequisites**: Familiarity with HTML5, CSS3, vanilla JavaScript (ES6+)

---

## 1. Project Overview (30 seconds)

**What**: A web app that displays STALKER 2 armor sets in a filterable, sortable table.  
**Where**: Runs entirely in browser; data comes from `data/armor.json`.  
**Why**: Players want to compare armor stats quickly without spreadsheets.  
**Stack**: Vanilla JavaScript (no frameworks), HTML5, CSS3.

---

## 2. File Structure & Responsibilities (2 minutes)

```
├── index.html           → DOM skeleton, table structure, filter/sort controls
├── css/styles.css       → ALL styling (responsive, mobile-first)
├── js/
│   ├── app.js          → Boot: load armor.json, init page, attach event listeners
│   ├── compare.js      → Filter logic, sort logic, table re-rendering
│   └── upgrades.js     → Parse upgrade tree, categorize upgrades, render upgrade panel
└── data/armor.json     → Source of truth: armor data (60+ entries)
```

**Golden Rule**: Each file has ONE job:
- `app.js` = "What's on the page right now?"
- `compare.js` = "How do I filter/sort the data?"
- `upgrades.js` = "What upgrades does this armor have?"
- `styles.css` = "How does it look?"

---

## 3. Data Model (2 minutes)

Every armor in `armor.json` looks like this:

```json
{
  "Id": "Zorya_Neutral_Armor",
  "Values": {
    "DisplayName": "Sunrise Suit",
    "Type": "chest",
    "weight": "4.0",
    "Cost": "36000.0",
    "slots": "2",
    "physical": "2.0",
    "thermal": "13.0",
    "electric": "11.0",
    "chemical": "13.0",
    "radiation": "30",
    "psi": "0.0"
  },
  "UpgradeList": ["upgrade_id_1", "upgrade_id_2", ...],
  "Upgrades": [
    { "SID": "...", "displayName": "...", ... },
    ...
  ]
}
```

**Key fields you'll use**:
- `Values.DisplayName` → armor name (shown in table)
- `Values.Type` → filtering key ("chest", "head", "full body")
- `Values.weight`, `Values.Cost` → sorting keys
- `Values.thermal`, `Values.electric`, etc. → protection stats (sort + display)
- `UpgradeList` → upgrade IDs (shown in details panel)

---

## 4. Typical User Journey (1 minute)

1. Player opens app → page loads, armor.json fetched, full table renders (~60 rows)
2. Player clicks "Filter: Chest" → only chest armor shows
3. Player clicks "Sort: Weight" → table re-orders by weight ascending
4. Player clicks armor row → upgrade panel expands, shows slot count and upgrade categories
5. Player clicks "All Types" → table reverts to showing all armor types

**What happens in the code**:
- Step 1 = `app.js` bootstrap
- Step 2 = `compare.js` filter + re-render
- Step 3 = `compare.js` sort + re-render
- Step 4 = `upgrades.js` render panel
- Step 5 = `compare.js` filter reset + re-render

---

## 5. Workflow: Starting a New Task (3 minutes)

**Example: Implement T006 (Build armor table HTML)**

1. **Read the task**: "Build armor table HTML structure in `index.html`: `<table>` with `<thead>` for columns, `<tbody>` placeholder for rows"

2. **Plan the code**:
   ```html
   <table id="armorTable">
     <thead>
       <tr>
         <th>Name</th>
         <th>Type</th>
         <th>Weight</th>
         <th>Cost</th>
         <th>Physical</th>
         <th>Thermal</th>
         <th>Electric</th>
         <th>Chemical</th>
         <th>Radiation</th>
         <th>PSI</th>
       </tr>
     </thead>
     <tbody id="armorTableBody">
       <!-- populated by JavaScript -->
     </tbody>
   </table>
   ```

3. **Code it** in `index.html`

4. **Test locally**: Open index.html in browser, verify table structure is there (empty tbody is OK)

5. **Move to next task** (T007 = style the table)

**Key pattern**: HTML structure → CSS styling → JavaScript population

---

## 6. Workflow: Implementing Data Population (3 minutes)

**Example: Implement T008 (Render armor table rows)**

1. **Read the task**: "Implement `app.js` function `renderArmorTable(armorArray)`: generate table rows from armor.json data"

2. **Write the function**:
   ```javascript
   function renderArmorTable(armorArray) {
     const tbody = document.getElementById('armorTableBody');
     tbody.innerHTML = ''; // clear old rows
     
     armorArray.forEach(armor => {
       const row = document.createElement('tr');
       row.innerHTML = `
         <td>${armor.Values.DisplayName}</td>
         <td>${armor.Values.Type}</td>
         <td>${armor.Values.weight}</td>
         <td>${armor.Values.Cost}</td>
         <td>${armor.Values.physical}</td>
         <td>${armor.Values.thermal}</td>
         <td>${armor.Values.electric}</td>
         <td>${armor.Values.chemical}</td>
         <td>${armor.Values.radiation}</td>
         <td>${armor.Values.psi}</td>
       `;
       tbody.appendChild(row);
     });
   }
   ```

3. **Call it from app.js**:
   ```javascript
   fetch('data/armor.json')
     .then(res => res.json())
     .then(data => {
       const armorArray = data; // assumes JSON is array
       renderArmorTable(armorArray);
     });
   ```

4. **Test**: Open app in browser, verify 60+ rows appear, no console errors

---

## 7. Workflow: Implementing Filter/Sort (3 minutes)

**Example: Implement T016 (Filter by type)**

1. **In `compare.js`**, write a pure filter function:
   ```javascript
   function filterArmorByType(armorArray, type) {
     if (!type) return armorArray; // return all if no type specified
     return armorArray.filter(armor => armor.Values.Type === type);
   }
   ```

2. **In `app.js`**, add event listeners to filter buttons:
   ```javascript
   document.getElementById('filterChest').addEventListener('click', () => {
     const filtered = filterArmorByType(allArmor, 'chest');
     renderArmorTable(filtered);
   });
   
   document.getElementById('filterAll').addEventListener('click', () => {
     renderArmorTable(allArmor);
   });
   ```

3. **Test**: Click filter buttons, verify table updates

**Pattern**: Filter function → store current filter state → re-render when filter changes

---

## 8. Workflow: Mobile Responsive CSS (2 minutes)

**Example: Implement T029 (Responsive table)**

1. **Add breakpoints to `styles.css`**:
   ```css
   /* Desktop (1024px+) */
   @media (min-width: 1024px) {
     table { width: 100%; }
     th, td { padding: 12px; font-size: 14px; }
   }
   
   /* Tablet (768px–1023px) */
   @media (min-width: 768px) and (max-width: 1023px) {
     th, td { padding: 10px; font-size: 13px; }
   }
   
   /* Mobile (320px–767px) */
   @media (max-width: 767px) {
     table { font-size: 12px; }
     th, td { padding: 8px; }
     /* Add horizontal scroll wrapper if needed */
     .table-wrapper { overflow-x: auto; }
   }
   ```

2. **Wrap table in `index.html`**:
   ```html
   <div class="table-wrapper">
     <table id="armorTable">...</table>
   </div>
   ```

3. **Test on mobile**: Use browser dev tools, set viewport to 320px, verify table is readable

---

## 9. Common Pitfalls & How to Avoid (2 minutes)

| Pitfall | Solution |
|---------|----------|
| Global variables (`var allArmor = ...`) pollute scope | Use function parameters + return values; pass data as args |
| Table re-renders but filter state is lost | Store current filter/sort state in variables, apply on re-render |
| Hardcoding armor values in HTML instead of reading from JSON | Always iterate JSON, never hardcode |
| CSS breaks on mobile | Use mobile-first media queries; test on real phone viewport |
| Upgrades don't display | Verify upgrade.js categorizes upgrades correctly; check UpgradeList format in armor.json |
| Performance slow with 60+ rows | Re-render only tbody (not full table), use innerHTML once instead of appendChild in loop |

---

## 10. Running Task Phases (MVP Timeline) (1 minute)

**Phase 1 (Setup)**: T001–T005 (~2 hours)  
→ Verify data, set up app.js bootstrap, basic CSS

**Phase 2 (US1 Table)**: T006–T013 (~3 hours)  
→ Table renders, no errors

**Phase 3 (US2 Filter)**: T014–T019 (~2 hours)  
→ Type filters work

**Phase 4 (US3 Sort)**: T020–T026 (~2 hours)  
→ Sort by any column

**Phase 5 (US4 Mobile)**: T027–T035 (~2 hours)  
→ Responsive on 320px

**Phase 6 (US5 Upgrades)**: T036–T043 (~3 hours)  
→ Upgrade panel displays

**Phase 7 (Polish)**: T044–T053 (~4 hours)  
→ Integration, testing, docs

**Total MVP**: ~18 hours

---

## 11. Verification Checklist (2 minutes)

Before marking a task done, verify:

- [ ] No console errors (open DevTools: F12)
- [ ] Feature works as described in task
- [ ] Code is readable (clear variable names, comments for complex logic)
- [ ] No global state pollution (use function params, not window.xxx)
- [ ] Mobile works (test viewport at 320px, 768px, 1024px)
- [ ] Previous features still work (regression test)

---

## 12. Getting Unstuck (30 seconds)

**If stuck**:
1. Check browser console (F12) for errors
2. Verify armor.json loads: check Network tab
3. Check HTML element IDs match JavaScript selectors
4. Use `console.log()` to debug data flow
5. Ask: "What does the function receive? What should it return?"

---

**Ready to start?** Pick task T001 from `/tasks.md`, read the task description, follow the patterns above, and code it. Good luck! 🚀

---

**Version**: 1.0.0 | **Last Updated**: 2026-01-28

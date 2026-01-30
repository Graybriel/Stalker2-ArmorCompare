# 📘 Stalker2-ArmorCompare: Complete Project Breakdown

**Status**: ✅ **READY FOR IMPLEMENTATION**  
**Date**: 2026-01-28  
**MVP Estimate**: 18–22 hours (2–3 developers)

---

## 🎯 What You're Building

A web-based armor comparison tool for STALKER 2 that lets players:
- **View** 60+ armor sets in a sortable, filterable table
- **Filter** by armor type (Chest, Head, Full Body)
- **Sort** by weight, cost, or protection values
- **Compare** armor stats side-by-side
- **Explore** upgrade slots and potential improvements
- **Use** on desktop AND mobile (320px–4K viewports)

**Stack**: Vanilla JavaScript (no frameworks), HTML5, CSS3  
**Data**: Static JSON files (armor.json)  
**Deployment**: GitHub Pages or static hosting

---

## 📚 Documentation Structure

All documents in `.specify/memory/`:

### 1. **constitution.md** (Read First: 3 min)
**What**: Project principles and governance  
**Why**: Establishes "how we build this"  
**Contains**:
- 5 Core Principles (Data-Driven, Modular Architecture, Responsive, User-First, Quality)
- Development Workflow (data → logic → styling)
- Amendment process

**👉 Start here to understand project DNA**

---

### 2. **plan.md** (Read Second: 5 min)
**What**: Technical implementation plan  
**Why**: Establishes "what we're building and how"  
**Contains**:
- Tech stack (JavaScript, HTML5, CSS3)
- Project structure (file organization)
- Data schema (armor.json format)
- Priorities (P1 core, P2 enhanced, P3 future)
- Quality gates (performance, compatibility)

**👉 Read to understand technical approach**

---

### 3. **spec.md** (Read Third: 5 min)
**What**: User stories with acceptance criteria  
**Why**: Establishes "what features deliver value"  
**Contains**:
- 7 user stories (P1–P3 priority)
- Each with: description, why this priority, independent test, acceptance scenarios
- Feature scope table (MVP vs MVP+ vs Future)

**👉 Read to understand user value**

---

### 4. **tasks.md** (Reference During Implementation: 10 min overview)
**What**: 53 actionable implementation tasks  
**Why**: Establishes "what to code and in what order"  
**Contains**:
- Phase 1: Setup (T001–T005)
- Phase 2: US1 Core Table (T006–T013)
- Phase 3: US2 Filtering (T014–T019)
- Phase 4: US3 Sorting (T020–T026)
- Phase 5: US4 Mobile (T027–T035)
- Phase 6: US5 Upgrades (T036–T043)
- Phase 7: Integration & Polish (T044–T053)
- Phase 8: Future (T054–T058, out of scope)

**Each task has**:
- Unique ID (T001, T002, ...)
- [P] marker if parallelizable
- [Story] label (US1, US2, ...)
- Clear description + exact file path
- Acceptance criteria

**👉 Use to pick next task, follow the checklist format**

---

### 5. **quickstart.md** (Use During Coding: 10 min)
**What**: Developer onboarding and implementation patterns  
**Why**: Accelerates coding with tested patterns  
**Contains**:
- Project overview (30 sec)
- File responsibilities (2 min)
- Data model walkthrough (2 min)
- Typical user journey (1 min)
- Task workflow examples (3 min)
- Filter/Sort implementation pattern (3 min)
- Mobile CSS pattern (2 min)
- Common pitfalls + solutions (2 min)
- Timeline (1 min)
- Verification checklist (2 min)

**👉 Keep open while coding; refer to patterns**

---

### 6. **README.md** (Reference: 5 min)
**What**: Project summary + quick reference  
**Why**: Big-picture overview + status  
**Contains**:
- Design documents checklist
- Feature scope summary
- Task breakdown by phase
- Dependency flow (what can run in parallel)
- Test criteria per story
- Getting started steps
- Success metrics

**👉 Use to track overall progress**

---

## 🚀 How to Use These Documents

### **Phase: Planning (Before Code)**
1. Read `constitution.md` (understand principles)
2. Read `plan.md` (understand tech approach)
3. Read `spec.md` (understand user value)
4. Skim `tasks.md` (understand scope)

### **Phase: Implementation (During Code)**
1. Keep `quickstart.md` open (copy patterns from it)
2. Pick a task from `tasks.md`
3. Implement it (follow task description + quickstart pattern)
4. Mark off task: `- [x] T001 ...`
5. Repeat for next task
6. After each phase, review test criteria

### **Phase: QA (After Implementation)**
1. Run through test criteria in `tasks.md` per story
2. Run integration test (T044)
3. Check browser compatibility (T048)
4. Fix any issues
5. Deploy to production

---

## 📊 Task Summary at a Glance

| Phase | Effort | Focus | Can Parallelize? |
|-------|--------|-------|-----------------|
| **1: Setup** (T001–T005) | 2h | Data validation, bootstrap, CSS | ✅ After T005 |
| **2: Table** (T006–T013) | 3h | HTML structure, styling, rendering | ✅ Sorting/Filtering after T009 |
| **3: Filter** (T014–T019) | 2h | Filter UI + logic | ✅ With Phase 4 |
| **4: Sort** (T020–T026) | 2h | Sort UI + logic | ✅ With Phase 3 |
| **5: Mobile** (T027–T035) | 2h | Responsive CSS | ✅ With Phases 3–4 |
| **6: Upgrades** (T036–T043) | 3h | Upgrade panel + categorization | ❌ After Phase 2 |
| **7: Integration** (T044–T053) | 4h | Testing, accessibility, docs | ❌ After all features |

**Total Sequential**: ~18 hours  
**Total Parallel** (optimized): ~14 hours (2–3 developers)

---

## 🎯 Success Criteria (MVP Complete)

- ✅ All 60+ armors display in table
- ✅ All protection columns visible (Physical, Thermal, Electric, Chemical, Radiation, PSI)
- ✅ Filter by type works (Chest, Head, Full Body)
- ✅ Sort by any column works (ascending + descending toggle)
- ✅ Mobile viewport (320px) is usable
- ✅ Upgrade slots visible on demand
- ✅ Zero console errors
- ✅ Render time <100ms
- ✅ Works on Chrome, Firefox, Edge
- ✅ All manual tests pass

**After hitting these**: MVP is complete → ready for production

---

## 🛠️ Getting Started Right Now

### Step 1: Read in Order
```
constitution.md (3 min)
    ↓
plan.md (5 min)
    ↓
spec.md (5 min)
    ↓
quickstart.md (10 min)
```

### Step 2: Start Task T001
1. Open `tasks.md`
2. Find "## Phase 1: Setup"
3. Read task T001 description
4. Open `index.html`, `js/app.js`, etc.
5. Follow pattern in `quickstart.md` section 5–6
6. Code, test in browser
7. Mark `- [x] T001` when done

### Step 3: Move to T002
Repeat for next task

### Step 4: After Phase 1 Complete
Team can split: Assign Phase 2 to Developer A, Phase 3 to Developer B, etc.

---

## 🗺️ Project Map (Files You'll Edit)

```
💾 Files to Edit:

index.html
├─ T003: Add semantic HTML, ARIA labels
├─ T006: Add table structure (<table>, <thead>, <tbody>)
└─ T014: Add filter buttons

css/styles.css
├─ T004: Add CSS reset + base styles
├─ T007: Style table (columns, borders, header)
├─ T015: Style filter buttons
├─ T021: Style sort indicators
└─ T028: Add responsive breakpoints (320px, 768px, 1024px)

js/app.js
├─ T005: Bootstrap function (load armor.json, init page)
├─ T008: Implement renderArmorTable(armorArray)
└─ T017: Add filter button event listeners

js/compare.js
├─ T016: Implement filterArmorByType(armorArray, type)
├─ T022: Implement sortArmor(armorArray, sortKey, direction)
└─ T023: Add sort click handlers

js/upgrades.js
├─ T038: Implement categorizeUpgrades(upgradeList)
└─ T039: Implement renderUpgradePanel(armor)

data/armor.json
├─ T001: Verify schema completeness
└─ T049: Validate data (no missing fields, correct types)
```

---

## ❓ Quick Reference: Common Questions

**Q: Where do I start?**  
A: Read constitution.md → plan.md → spec.md, then task T001

**Q: How do I implement filtering?**  
A: See quickstart.md section 7 (Filter example with code)

**Q: What data format does armor.json use?**  
A: See quickstart.md section 3 (Data Model)

**Q: Can I work on multiple tasks in parallel?**  
A: Yes! See tasks.md "Parallel Execution Examples" + README.md dependency graph

**Q: How do I test my code?**  
A: Open index.html in browser, check browser DevTools (F12), follow task verification checklist

**Q: Is this mobile-friendly?**  
A: Yes! Phase 5 (T027–T035) ensures 320px–4K support

**Q: What if I find a bug?**  
A: Check console (F12), use console.log() to debug, see quickstart.md section 12 (Getting Unstuck)

---

## 📈 Progress Tracking

Track your progress in `tasks.md`:

```markdown
After Task 1:
- [x] T001 Verify armor.json schema
- [ ] T002 Create data-model.md
- [ ] T003 Audit index.html
...

After Phase 1:
- [x] Phase 1 Complete (T001–T005)

After Phase 2:
- [x] Phase 1 Complete (T001–T005)
- [x] Phase 2 Complete (T006–T013)
- [ ] Phase 3 In Progress (T014–T019)
...
```

---

## 🎓 Learning Resources in Docs

**Need to learn a pattern?** All in `quickstart.md`:

- Section 5: "Workflow: Starting a New Task" → How to approach any task
- Section 6: "Workflow: Implementing Data Population" → How to render data
- Section 7: "Workflow: Implementing Filter/Sort" → How to filter + sort
- Section 8: "Workflow: Mobile Responsive CSS" → How to do mobile CSS
- Section 9: "Common Pitfalls" → What NOT to do

---

## 🏁 Final Checklist Before You Start

- [ ] I've read constitution.md
- [ ] I've read plan.md
- [ ] I've read spec.md
- [ ] I've skimmed tasks.md
- [ ] I have quickstart.md handy
- [ ] I have index.html, js/, css/ files open
- [ ] I understand the task ID format (T001, T002, ...)
- [ ] I understand the story labels (US1, US2, ...)
- [ ] I understand "parallel" tasks ([P] marker)
- [ ] I'm ready to code T001 🚀

---

## 📞 Help

- **"Where do I find [thing]?"** → See "📚 Documentation Structure" above
- **"How do I code [feature]?"** → See quickstart.md section 5–8
- **"Is my code correct?"** → Check verification checklist in quickstart.md section 11
- **"I'm stuck"** → See quickstart.md section 12 (Getting Unstuck)

---

**You're ready.** Pick task T001, grab quickstart.md as reference, open your editor, and start coding. 🎮

---

**Version**: 1.0.0 | **Last Updated**: 2026-01-28 | **Status**: Ready for Implementation

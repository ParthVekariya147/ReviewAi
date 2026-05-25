
## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore




```markdown
# CLAUDE.md

આ project માં Claude Code માટેની instructions છે. Automatic bug fixing workflow setup છે.

---

## 📋 Project Overview

આ project માં `bugs.md` file છે જેમાં bugs ની list છે. Tara kaam ek pachi ek badha bugs fix karva nu che, automatic rite, manual intervention vagar.

---

## 🔄 Main Bug Fixing Workflow

### Primary Task
`bugs.md` file ma jetla pan pending bugs `[ ]` che te badha ne ek pachi ek fix kar.

### Steps for Each Bug

1. **Read** - `bugs.md` ma next pending bug `[ ]` shodh
2. **Analyze** - Code base scan kari ne bug kya file/function ma che te find kar
3. **Fix** - Bug fix kar, clean ane minimal change sathe
4. **Verify** - Code syntactically correct che ne te check kar, related functionality break to nathi thayu ne
5. **Update** - `bugs.md` ma:
   - `[ ]` ne `[x]` ma badal
   - Te line ni niche add kar: `   - Fixed: [1 line ma shu karyu]`
6. **Continue** - Next bug par jao

---

## ⏰ Usage Limit Handling (VERY IMPORTANT)

### Jyare Claude Code ni limit avi jai:

1. **Tarat STOP kar** - jya cho tya safely atki ja
2. **Current bug nu state save kar** - `bugs.md` ma note kar:
   ```
   - [ ] Bug #X: [name]
     - IN_PROGRESS: Limit avi gai, 4 kalak pachi retry karvanu che
     - Last status: [shu karyu hatu te]
   ```
3. **Koi file half-edited NA chodish** - either complete kar ke revert kar
4. **`bugs.md` save kari de** progress sathe

### Limit pati jay pachi (4 kalak pachi auto-retry):

User ek shell script chalavshe je 4 kalak pachi Claude Code ne fari start karshe. Tyare:

1. `bugs.md` fari vanch
2. `IN_PROGRESS` marked bug shodh - tyathi shuru kar
3. Jo `IN_PROGRESS` na hoy to next `[ ]` pending bug lai le
4. Workflow continue kar jya thi atkya hata
5. Aam loop chalu rakh jya sudhi badha bugs purna na thay ke ferthi limit na avi jay

### Resume Logic Flow
```
START
  ↓
bugs.md vanch
  ↓
"IN_PROGRESS" bug che?
  ├─ HA → tya thi resume kar
  └─ NA → next [ ] bug lai le
  ↓
Fix kar → Update bugs.md → Next bug
  ↓
Limit aavi? 
  ├─ HA → STOP, save state, exit (4 kalak pachi auto-restart)
  └─ NA → Continue
  ↓
Badha [x] thay gaya? → FINAL REPORT
```

---

## ✅ Strict Rules

### DO
- ✅ Fakt code files ane `bugs.md` j modify kar
- ✅ Pratyek fix pachi short summary aap
- ✅ Risky ke unclear bug hoy to SKIP kar ane `bugs.md` ma note kar: `   - SKIPPED: [reason]`
- ✅ Usage limit najik avi jai to safely stop kar, bugs.md save kari de
- ✅ Minimal changes - bug fix mate jetlu jaruri che tetlu j badal
- ✅ Existing code style follow kar

### DON'T
- ❌ Git commit NA kar
- ❌ Git push NA kar
- ❌ `git` related koi command NA chala
- ❌ New features NA add kar - fakt listed bugs j fix kar
- ❌ Code refactor NA kar jya sudhi bug fix mate jaruri na hoy
- ❌ Dependencies install/update NA kar (jya sudhi bug ne te jaruri na hoy)
- ❌ Mara permission vagar koi pan file delete NA kar
- ❌ Limit avi jay to force continue NA karish - safely stop kar

---

## 💻 Code Standards

- Existing code style follow kar
- Comments aapni bhasha ma j rakh
- Variable names ane structure consistent rakh
- Error handling add kar jya jaruri hoy
- Indentation ane formatting existing code jevu j rakh

---

## 📊 Reporting

### Per Bug Report
Pratyek bug fix pachi ek line:
```
✅ Bug #X fixed: [short reason]
```

### Session End Report (Limit avi gai hoy to)
```
⏸️  SESSION PAUSED - Usage limit reached
- Fixed this session: X bugs
- Pending: Y bugs
- In-progress: [bug name ke "none"]
- Next retry: 4 kalak pachi auto-restart thashe
```

### Final Report (Badha bugs purna thay pachi)
```
========================================
FINAL REPORT - ALL BUGS COMPLETED
========================================
Total bugs: X
✅ Fixed: Y
⏭️  Skipped: Z
Sessions used: N (limit hits)

Fixed bugs:
- Bug #1: [name]
- Bug #2: [name]
...

Skipped bugs (need manual review):
- Bug #X: [reason]
...
========================================
```

---

## 📁 File Structure

```
project/
├── CLAUDE.md          # Aa file - instructions
├── bugs.md            # Bug list - read & update (state pan ahi save thay)
├── src/               # Source code
└── ...
```

---

## 🚨 Emergency Stop

Jo koi pan time e issue lage:
- Te bug skip kar
- `bugs.md` ma note kar with reason
- Next bug par jao
- Final report ma mention kar

---

## 🎯 Quick Start Command

Jyare user aa command aapshe:
```
bugs.md mathi badha bugs fix kar
```

Tyare:
1. Aa CLAUDE.md ni badhi instructions follow kar
2. `bugs.md` vanch
3. IN_PROGRESS ke pending bug shodh
4. Workflow start kar
5. Limit avi jay tya sudhi continue kar
6. Badha purna thay to final report aap

---

**END OF INSTRUCTIONS**
```

બસ આટલું જ - આખી file copy કરીને `CLAUDE.md` નામથી project root માં save કરી દો.

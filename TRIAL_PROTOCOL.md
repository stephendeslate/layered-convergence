# Trial Execution Protocol

Every trial follows this 3-phase, 15-step process. No exceptions. Skipping steps invalidates the trial.

## Phase A: Pre-Build

### Step 1 — Determine Current Layer

Read `layers.json`. Find the first layer with `status: "pending"`. This is the current layer. If no pending layers exist, proceed to Layer 9 (Cross-Layer Integration) or conclude.

### Step 2 — Author Layer Addendum (first trial of new layer only)

If this is the first trial of a new layer:
1. Create `METHODOLOGY_ADDENDUM_L{N}.md` at the project root
2. The addendum defines:
   - New scoring dimensions (if any)
   - Required artifacts and verification checklists
   - Layer-specific conventions and anti-patterns
   - Technology choices and version constraints
   - Failure mode categories to watch for
3. The addendum is **cumulative** — it references but does not repeat prior layer addendums

### Step 3 — Create Clean Trial Directory

```bash
mkdir trial{N}
```

Contents at creation:
- `METHODOLOGY.md` — previous trial's `REVISED_METHODOLOGY.md` merged with current layer's addendum
- Nothing else. No copied code, no templates, no scaffolding.

### Step 4 — Trial Variation Seed

Each trial includes a unique constraint that forces different implementation choices. Examples:
- "All API responses must use cursor-based pagination (no offset)"
- "Use server actions instead of API routes for mutations"
- "Implement the auth flow using middleware, not guards"

The seed is recorded at the top of `METHODOLOGY.md` under `## Trial Variation Seed`.

This prevents convergence via repetition rather than methodology quality.

---

## Phase B: Build + Score

### Step 5 — Build 3 Projects

Build all 3 enterprise applications (AE, EM, FSD) from scratch following `METHODOLOGY.md`. Rules:
- **No code copying** from any previous trial (verified in Step 8)
- **No referencing** previous trial source code during building
- All code must satisfy ALL layer requirements up to and including the current layer
- Each project is self-contained with its own dependencies

### Step 6 — Builder Self-Assessment

The builder produces `BUILD_REPORT.md` containing:
- Self-assessed scores per dimension (all dimensions, not just current layer)
- Failure modes discovered during building (honest count — no target number)
- Difficulties encountered and how they were resolved
- Layer-specific artifact checklist (pass/fail per item)

### Step 7 — Run verify-layer.sh

```bash
./verify-layer.sh trial{N} {layerNum}
```

This script checks:
- Required artifacts exist for ALL layers up to current
- Binary convention gates pass (no banned patterns)
- Source code differs from previous trial (independence)

**If verify-layer.sh fails, the trial cannot proceed to scoring.** Fix issues first.

### Step 8 — Independence Verification

```bash
# Hash comparison
find trial{N}/*/src -type f -exec sha256sum {} \; | sort > /tmp/t{N}.hashes
find trial{N-1}/*/src -type f -exec sha256sum {} \; | sort > /tmp/t{N-1}.hashes
diff /tmp/t{N}.hashes /tmp/t{N-1}.hashes
```

If hashes are identical for any project, the trial is invalid. Rebuild.

### Step 9 — Independent Scoring Session

A **separate session** (not the builder) scores the code:
- Scorer receives: source code only. No `BUILD_REPORT.md`, no builder commentary.
- Scorer evaluates against the full scoring rubric for all active dimensions.
- Scorer produces `SCORE_REPORT.md` with per-dimension scores and justifications.

### Step 10 — Red-Team Session

A **third session** actively searches for methodology violations:
- Uses layer-specific checklist from the addendum
- Searches for anti-patterns (hardcoded data, skipped tests, type assertions, etc.)
- Reports findings in `RED_TEAM_REPORT.md`
- Each finding is classified: critical (blocks convergence), major (must fix), minor (note for next trial)

---

## Phase C: Post-Trial

### Step 11 — Score Reconciliation

Compare 3 score sources:
| Dimension | Builder | Scorer | Delta | Red-Team Flags |
|-----------|---------|--------|-------|----------------|

Record ALL deltas. If any delta > 1.0, investigate and document the discrepancy cause.

### Step 12 — Produce REVISED_METHODOLOGY.md

Based on reconciled scores, red-team findings, and builder observations:
- Update methodology with new failure modes (use honest count)
- Add or refine conventions that prevent discovered anti-patterns
- Strengthen verification checklists
- Note any patterns that worked well (positive reinforcement)

**Do not set a target FM count.** The number is whatever it is.

### Step 13 — Update layers.json

```json
{
  "trials": {"completed": [..., N], ...},
  "failureModesResolved": <cumulative count>
}
```

If convergence criteria met → set `status: "complete"`.

### Step 14 — Check Convergence

A layer converges when ALL of:
- [x] 2 consecutive trials with 0 new failure modes
- [x] All dimensions >= 8.0 (reconciled scores)
- [x] Independent audit delta <= 1.0 on every dimension
- [x] `verify-layer.sh` passes all checks including cumulative regression

If converged: update `layers.json` status to `"complete"`, advance to next layer.
If not converged and max trials not reached: continue with next trial.
If max trials reached without convergence: record as `"incomplete"` with reason. Move on.

### Step 15 — Git Commit

```bash
git add trial{N}/ layers.json
git commit -m "Trial {N}: Layer {L} — {summary}"
```

---

## Adaptive Budget Management

| Resource | Count |
|----------|-------|
| Total trials available | 35 (T15-T49) |
| Minimum required | 25 |
| Reserve pool | 10 |

Reserve trials are drawn when a layer needs more than its minimum. No layer can exceed its maximum. If reserve is exhausted, remaining layers receive only their minimum allocation.

Track budget in `layers.json` — sum all `completed` arrays to see trials used.

---

## Failure Modes of the Protocol Itself

These are the structural gaps this protocol is designed to prevent:

1. **Layer stagnation** → Step 1 enforces progression; layers.json is the source of truth
2. **Code copying** → Steps 7-8 verify independence via hashing and diffing
3. **Self-assessment bias** → Steps 9-10 add independent scorer and red-team
4. **FM count gaming** → Step 12 explicitly forbids target counts
5. **Missing cross-layer integration** → Layer 9 exists; Step 7 checks cumulative regression
6. **Pre-allocated ranges** → Adaptive allocation replaces fixed ranges

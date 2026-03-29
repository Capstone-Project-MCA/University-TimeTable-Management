# Merge Ticket Generation — Test Cases

## Core Formula
- TicketId format: `{courseCode}{sectionId}{groupNo}{mappingType}{i}`
- Each merged CourseMapping row (mergeStatus=true, faculty assigned) → L or T or P tickets stamped with mergeCode
- Each non-merged row (mergeStatus=false, faculty assigned) → L or T or P tickets with empty mergeCode
- facultyUid = null → 0 tickets (always skipped)

---

## TC-1: Screenshot Scenario — 2 Sections, Type L Merged (L=3, T=1, P=2)

Course CSE101 | Section 1 & 2, Group 0, Faculty F001 | MergeCode M101 (type L only)

CourseMapping rows:
  id=1: Section=1, GroupNo=0, Type=L, L=3, Faculty=F001, MergeStatus=true,  MergeCode=M101
  id=2: Section=1, GroupNo=0, Type=T, T=1, Faculty=F001, MergeStatus=false, MergeCode=null
  id=3: Section=1, GroupNo=0, Type=P, P=2, Faculty=F001, MergeStatus=false, MergeCode=null
  id=4: Section=2, GroupNo=0, Type=L, L=3, Faculty=F001, MergeStatus=true,  MergeCode=M101
  id=5: Section=2, GroupNo=0, Type=T, T=1, Faculty=F001, MergeStatus=false, MergeCode=null
  id=6: Section=2, GroupNo=0, Type=P, P=2, Faculty=F001, MergeStatus=false, MergeCode=null

Expected tickets:
  TicketId      Section  LectureNo  MergedCode
  CSE10110L1      1         1         M101
  CSE10110L2      1         2         M101
  CSE10110L3      1         3         M101
  CSE10110T1      1         1         (empty)
  CSE10110P1      1         1         (empty)
  CSE10110P2      1         2         (empty)
  CSE10120L1      2         1         M101
  CSE10120L2      2         2         M101
  CSE10120L3      2         3         M101
  CSE10120T1      2         1         (empty)
  CSE10120P1      2         1         (empty)
  CSE10120P2      2         2         (empty)

TOTAL: 12 tickets | Merged (M101): 6 | Non-merged: 6

Verification SQL:
  SELECT COUNT(*) FROM ticket WHERE Coursecode='CSE101' AND MergedCode='M101'; -- Expected: 6
  SELECT COUNT(*) FROM ticket WHERE Coursecode='CSE101';                        -- Expected: 12

---

## TC-2: 3 Sections Merged, Type L (L=2, T=2, P=0)

Course MA201 | Sections A, B, C | Group 1 | MergeCode M102 | Faculty F002

Expected: 3×L=2 = 6 merged tickets + 3×T=2 = 6 non-merged tickets = 12 total

  SELECT COUNT(*) FROM ticket WHERE Coursecode='MA201' AND MergedCode='M102'; -- Expected: 6
  SELECT Section, COUNT(*) FROM ticket WHERE MergedCode='M102' GROUP BY Section;
  -- Expected: A=>2, B=>2, C=>2

---

## TC-3: Faculty Missing on One Merged Section

Course PH301, L=2 | Sections X (F003) and Y (null) merged as M103

Expected:
  Section X → 2 merged tickets (M103)
  Section Y → 0 tickets (facultyUid null = skipped)
  Total: 2 tickets

  SELECT COUNT(*) FROM ticket WHERE Coursecode='PH301'; -- Expected: 2
  SELECT COUNT(*) FROM ticket WHERE MergedCode='M103';  -- Expected: 2

---

## TC-4: Baseline — No Merges (L=3, T=1, P=2)

Course CS401 | Section P1 | Group 0 | Faculty F004 | No merge

Expected tickets: CS401P100L1, CS401P100L2, CS401P100L3, CS401P100T1, CS401P100P1, CS401P100P2
All have MergedCode = '' (empty)

  SELECT COUNT(*) FROM ticket WHERE Coursecode='CS401';                         -- Expected: 6
  SELECT COUNT(*) FROM ticket WHERE Coursecode='CS401' AND MergedCode <> '';   -- Expected: 0

---

## TC-5: Two Separate Merge Groups, Same Course (L=4)

Course EC501 | MergeCode M104: Sections A1+A2 | MergeCode M105: Sections B1+B2 | Faculty assigned

Expected:
  M104 group: 2×4 = 8 tickets
  M105 group: 2×4 = 8 tickets
  Total: 16 tickets

  SELECT MergedCode, COUNT(*) FROM ticket WHERE Coursecode='EC501' GROUP BY MergedCode;
  -- Expected: M104=>8, M105=>8

---

## General Audit SQL (Run After Every Generate Tickets)

-- 1. Expected vs Actual per mapping row
SELECT
    cm.Coursecode, cm.Section, cm.GroupNo, cm.MappingType,
    cm.MergeStatus, cm.Mergecode, cm.FacultyUID,
    CASE cm.MappingType WHEN 'L' THEN cm.L WHEN 'T' THEN cm.T WHEN 'P' THEN cm.P ELSE 0 END AS expected,
    COUNT(t.TicketId) AS actual,
    CASE
        WHEN cm.FacultyUID IS NULL THEN 'SKIPPED'
        WHEN COUNT(t.TicketId) = CASE cm.MappingType WHEN 'L' THEN cm.L WHEN 'T' THEN cm.T WHEN 'P' THEN cm.P ELSE 0 END THEN 'OK'
        ELSE 'MISMATCH'
    END AS status
FROM coursemapping cm
LEFT JOIN ticket t ON t.CourseMappingId = cm.CourseMappingId
GROUP BY cm.CourseMappingId
ORDER BY cm.Coursecode, cm.Section;

-- 2. Merged group summary
SELECT MergedCode, COUNT(*) AS tickets, GROUP_CONCAT(DISTINCT Section) AS sections
FROM ticket WHERE MergedCode <> ''
GROUP BY MergedCode;

-- 3. Merged mappings with faculty but zero tickets (error detection)
SELECT cm.CourseMappingId, cm.Section, cm.Coursecode, cm.Mergecode
FROM coursemapping cm
LEFT JOIN ticket t ON t.CourseMappingId = cm.CourseMappingId
WHERE cm.MergeStatus = TRUE AND cm.FacultyUID IS NOT NULL AND t.TicketId IS NULL;
-- Should return 0 rows

-- 4. Data integrity check: non-merged mapping must not have mergeCode on ticket
SELECT t.TicketId, t.Section, t.MergedCode
FROM ticket t
JOIN coursemapping cm ON t.CourseMappingId = cm.CourseMappingId
WHERE cm.MergeStatus = FALSE AND t.MergedCode <> '';
-- Should return 0 rows

---

## Formula Quick Reference

  Type | Tickets per row (faculty assigned)
  ---- | ------------------------------------
  L    | L value (with mergeCode if merged)
  T    | T value (with mergeCode if merged)
  P    | P value (with mergeCode if merged)
  any  | 0 if facultyUid is null

  Grand Total = SUM(L for all L-rows with faculty)
              + SUM(T for all T-rows with faculty)
              + SUM(P for all P-rows with faculty)

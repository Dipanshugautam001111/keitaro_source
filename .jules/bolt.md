## 2024-04-05 - Avoid recalculating count() in for loops
**Learning:** Found several places in the codebase where `count($array)` was being evaluated on every iteration of a `for` loop. This is an anti-pattern in PHP that creates unnecessary overhead.
**Action:** When writing `for` loops in PHP, prefer caching the array size in the loop initialization block (`for ($i = 0, $count = count($array); $i < $count; $i++)`) to avoid evaluating `count()` repeatedly.

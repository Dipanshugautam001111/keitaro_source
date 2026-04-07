## 2026-04-07 - Keitaro Port: Referrer Hiding and Bot Detection
**Learning:** In a high-fidelity port from PHP (IonCube) to Next.js, implementing complex redirection logic like `double_meta` or `blank_referrer` requires careful handling of `NextResponse` and manual header/meta tag construction to ensure behavioral parity.
**Action:** Use a centralized `ActionExecutor` to manage these complex response types and ensure consistency across the tracking pipeline.

## 2026-04-07 - Optimization: Single-Pass Macro Replacement
**Learning:** Replacing multiple related tokens (like {sub1}..{sub15}) using a loop with individual `RegExp` objects is less efficient than using a single `RegExp` with a capture group and a callback.
**Action:** Prefer single-pass regex replacement for structured token patterns.

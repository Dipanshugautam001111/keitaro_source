# Keitaro Typescript Port Checklist

## Phase 1: Setup & Environment
- [x] 1.1 Init Next.js + TS + Tailwind
- [x] 1.2 Init Prisma
- [x] 1.3 Create Initial Documentation

## Phase 2: Database Schema
- [ ] 2.1 Implement Prisma Models (campaigns, flows, filters, etc.)
- [ ] 2.2 Migrate Schema

## Phase 3: Core Pipeline & Click Handler
- [ ] 3.1 Implement `/api/click` endpoint (Click Handler Hot Path)
- [ ] 3.2 Implement `RawClick` structure and initial parsing
- [ ] 3.3 Implement `CampaignResolver`
- [ ] 3.4 Implement Geo Resolving (Maxmind/IP) logic
- [ ] 3.5 Implement Device parsing logic

## Phase 4: Bot & Uniqueness Checking
- [ ] 4.1 Implement Bot Signals parsing (Headers, IP, UA)
- [ ] 4.2 Implement Uniqueness checking logic (Redis/Cache)

## Phase 5: Stream/Flow Selector
- [ ] 5.1 Implement evaluation order (forced -> regular -> default)
- [ ] 5.2 Implement Stream Selection Logic
- [ ] 5.3 Implement Landing & Offer selection

## Phase 6: Filter Rules Engine
- [ ] 6.1 Implement `CountryFilter`
- [ ] 6.2 Implement `RegionFilter`
- [ ] 6.3 Implement `CityFilter`
- [ ] 6.4 Implement `IspFilter`
- [ ] 6.5 Implement `CarrierFilter`
- [ ] 6.6 Implement `ConnectionTypeFilter`
- [ ] 6.7 Implement `DeviceTypeFilter`
- [ ] 6.8 Implement `DeviceModelFilter`
- [ ] 6.9 Implement `OsFilter`
- [ ] 6.10 Implement `BrowserFilter`
- [ ] 6.11 Implement `LanguageFilter`
- [ ] 6.12 Implement `ReferrerFilter`
- [ ] 6.13 Implement `KeywordFilter`
- [ ] 6.14 Implement `IpRangeFilter`
- [ ] 6.15 Implement `UserAgentFilter`
- [ ] 6.16 Implement `DayOfWeekFilter`
- [ ] 6.17 Implement `TimeOfDayFilter`
- [ ] 6.18 Implement `SubIdFilter`
- [ ] 6.19 Implement `CustomParamFilter`
- [ ] 6.20 Implement `UniquenessFilter`
- [ ] 6.21 Implement `BotFilter`
- [ ] 6.22 Implement `ProxyFilter`
- [ ] 6.23 Implement `JavaScriptFilter`
- [ ] 6.24 Filter Evaluation Engine (AND/OR Logic)

## Phase 7: Action Execution & Logging
- [ ] 7.1 Implement Redirect, Meta, Iframe actions
- [ ] 7.2 Implement Macro Expander
- [ ] 7.3 Implement Click Logging to DB/Queue

## Phase 8: Testing & Verification
- [ ] 8.1 Setup `bun test` or Jest
- [ ] 8.2 Write Unit Tests for Filters
- [ ] 8.3 Write Integration Tests for Pipeline

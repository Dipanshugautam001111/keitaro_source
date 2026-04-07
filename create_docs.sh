#!/bin/bash
mkdir -p docs

# INVENTORY.md
echo "# Project Inventory" > docs/INVENTORY.md
echo "This file contains an inventory of all directories and files in the project." >> docs/INVENTORY.md
echo '```' >> docs/INVENTORY.md
find . -type f -not -path "*/\.git/*" -not -path "*/vendor/*" | sort >> docs/INVENTORY.md
echo '```' >> docs/INVENTORY.md

# SCHEMA.md
echo "# Database Schema" > docs/SCHEMA.md
echo "## MySQL Tables" >> docs/SCHEMA.md
echo "campaigns, flows, filters, landings, offers, affiliate_networks, traffic_sources, conversions, users, api_keys, workspaces, domains, migrations" >> docs/SCHEMA.md
echo "## ClickHouse Tables" >> docs/SCHEMA.md
echo "clicks, conversions_log" >> docs/SCHEMA.md

# BROKEN.md
echo "# Broken/Missing/Stubbed Files" > docs/BROKEN.md
echo "List of broken files to be implemented." >> docs/BROKEN.md

# FEATURE-STATUS.md
echo "# Feature Status" > docs/FEATURE-STATUS.md
echo "COMPLETE / PARTIAL / MISSING / BROKEN" >> docs/FEATURE-STATUS.md

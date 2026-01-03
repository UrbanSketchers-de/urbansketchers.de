# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
bundle install              # Install dependencies
bundle exec nanoc compile   # Build the site (output in output/)
bundle exec nanoc live      # Dev server with live reload at localhost:3000
bundle exec nanoc deploy    # Deploy via rsync (requires SSH key)
```

## Architecture

This is a [Nanoc](https://nanoc.app) static site generator project for listing Urban Sketchers groups in Germany.

### Data Flow

1. **City data** lives in `data/cities.csv` (columns: city, lat, lon, is_official, website, email, facebook, instagram, bluesky, whatsapp, description)
2. **Custom data source** (`lib/cities_data_source.rb`) reads the CSV and creates nanoc items under `/cities/*`
3. **ERB template** (`content/index.html`) iterates over city items with `@items.find_all('/cities/*')`
4. **Layout** (`layouts/default.html`) wraps content in the page structure
5. **Rules** (`Rules`) defines compilation: ERB filter → layout → output path

### Key Files

- `nanoc.yaml` - Site config, declares the `cities_csv` data source with `items_root: /cities`
- `Rules` - Compilation rules; note `ignore '/cities/**/*'` prevents city items from becoming separate pages
- `lib/cities_data_source.rb` - Custom Nanoc::DataSource that parses CSV and supports live reload via Listen gem

### GitHub Automation

Issue templates (`.github/ISSUE_TEMPLATE/`) let non-technical contributors submit city additions/updates. The workflow `.github/workflows/issue-to-pr.yml` parses these issues and auto-creates PRs with CSV changes.

## Privacy Policy

No external resources (CDNs, Google Fonts, analytics). All assets are self-hosted to keep the privacy policy simple: we don't collect data.

## CSV Format

Fields with commas must be quoted. Example:
```csv
city,lat,lon,is_official,website,email,facebook,instagram,bluesky,whatsapp,description
Hamburg,53.5511,9.9937,1,www.example.de,kontakt@example.de,https://facebook.com/groups/...,@usk_hamburg,@usk.bsky.social,https://chat.whatsapp.com/...,"Treffen jeden Sonntag, 11-14 Uhr"
```

**When changing CSV structure:** Update these files to match:
- `README.md` (CSV column documentation table)
- `.github/ISSUE_TEMPLATE/add-city.yml`
- `.github/ISSUE_TEMPLATE/update-city.yml`

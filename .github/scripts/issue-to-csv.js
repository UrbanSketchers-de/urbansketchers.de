// CSV columns: city,lat,lon,is_official,website,email,facebook,instagram,bluesky,whatsapp,cara,description,founded,chapter_date,deutschlandtreffen

function parseField(body, label) {
  const regex = new RegExp(`### ${label}\\s*\\n\\s*([^#]*?)(?=\\n###|$)`, 's');
  const match = body.match(regex);
  if (!match) return '';
  const value = match[1].trim();
  if (value === '_No response_' || value === 'None') return '';
  return value;
}

const MONTHS = {
  januar: 1, jan: 1, january: 1, jänner: 1,
  februar: 2, feb: 2, february: 2,
  märz: 3, mär: 3, mrz: 3, maerz: 3, march: 3, mar: 3,
  april: 4, apr: 4,
  mai: 5, may: 5,
  juni: 6, jun: 6, june: 6,
  juli: 7, jul: 7, july: 7,
  august: 8, aug: 8,
  september: 9, sep: 9, sept: 9,
  oktober: 10, okt: 10, october: 10, oct: 10,
  november: 11, nov: 11,
  dezember: 12, dez: 12, december: 12, dec: 12,
};

function isoDate(year, month, day) {
  const m = Number(month);
  const d = day === undefined ? undefined : Number(day);
  if (m < 1 || m > 12 || (d !== undefined && (d < 1 || d > 31))) return null;
  const pad = n => String(n).padStart(2, '0');
  return d === undefined ? `${year}-${pad(m)}` : `${year}-${pad(m)}-${pad(d)}`;
}

/**
 * Normalizes a free-text date to YYYY, YYYY-MM or YYYY-MM-DD.
 * Returns '' for empty input, the input unchanged for "entfernen", and null when unrecognized.
 */
function normalizeDate(raw) {
  const text = raw.trim();
  if (text === '' || text.toLowerCase() === 'entfernen') return text.toLowerCase();
  let m;
  if ((m = text.match(/^(\d{4})$/))) return m[1];
  if ((m = text.match(/^(\d{4})-(\d{1,2})$/))) return isoDate(m[1], m[2]);
  if ((m = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) return isoDate(m[1], m[2], m[3]);
  if ((m = text.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/))) return isoDate(m[3], m[2], m[1]);
  if ((m = text.match(/^(\d{1,2})\s*[./]\s*(\d{4})$/))) return isoDate(m[2], m[1]);
  if ((m = text.match(/^(?:(\d{1,2})\.?\s+)?([\p{L}]+)\.?\s+(\d{4})$/u))) {
    const month = MONTHS[m[2].toLowerCase()];
    if (!month) return null;
    return isoDate(m[3], month, m[1]);
  }
  return null;
}

function parseIssueBody(body) {
  const isOfficialRaw = parseField(body, 'Offizielles Chapter\\?');
  return {
    city: parseField(body, 'Stadt'),
    lat: parseField(body, 'Breitengrad \\(lat\\)'),
    lon: parseField(body, 'Längengrad \\(lon\\)'),
    isOfficialRaw,
    isOfficial: isOfficialRaw === 'Ja' ? '1' : '',
    description: parseField(body, 'Treffpunkt & Zeiten'),
    website: parseField(body, 'Website'),
    email: parseField(body, 'E-Mail'),
    facebook: parseField(body, 'Facebook'),
    instagram: parseField(body, 'Instagram'),
    bluesky: parseField(body, 'Bluesky'),
    whatsapp: parseField(body, 'WhatsApp'),
    cara: parseField(body, 'Cara'),
    founded: parseField(body, 'Gründungsdatum'),
    chapterDate: parseField(body, 'Chapter-Anerkennung'),
  };
}

function escapeCSV(field) {
  if (!field) return '';
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Applies a city issue to the CSV text.
 * Returns { csv, city, isNew, notes } on success, where notes lists input a maintainer must fix by hand,
 * or { error } with a message for the issue author.
 */
function applyIssue(csvText, { body, labels }) {
  const isNew = labels.includes('neue-stadt');
  const f = parseIssueBody(body);
  const notes = [];
  const date = (label, raw) => {
    const value = normalizeDate(raw);
    if (value !== null) return value;
    notes.push(`${label} nicht erkannt: "${raw}"`);
    return '';
  };
  const founded = date('Gründungsdatum', f.founded);
  const chapterDate = date('Chapter-Anerkennung', f.chapterDate);

  if (!f.city) return { error: 'Keine Stadt im Issue gefunden' };
  if (isNew && (!f.lat || !f.lon)) return { error: 'Koordinaten fehlen' };

  const lines = csvText.trim().split('\n');
  const header = lines[0];
  let dataLines = lines.slice(1);

  if (isNew) {
    const newLine = [f.city, f.lat, f.lon, f.isOfficial, f.website, f.email, f.facebook, f.instagram, f.bluesky, f.whatsapp, f.cara, f.description, founded, chapterDate, ''].map(escapeCSV).join(',');
    dataLines.push(newLine);
    dataLines.sort((a, b) => parseCSVLine(a)[0].toLowerCase().localeCompare(parseCSVLine(b)[0].toLowerCase(), 'de'));
  } else {
    let found = false;
    dataLines = dataLines.map(line => {
      const fields = parseCSVLine(line);
      if (fields[0].toLowerCase() !== f.city.toLowerCase()) return line;
      found = true;
      const updateField = (newVal, oldVal) => {
        if (newVal === 'entfernen') return '';
        return newVal || oldVal || '';
      };
      return [
        fields[0],
        f.lat || fields[1],
        f.lon || fields[2],
        f.isOfficialRaw ? f.isOfficial : fields[3],
        updateField(f.website, fields[4]),
        updateField(f.email, fields[5]),
        updateField(f.facebook, fields[6]),
        updateField(f.instagram, fields[7]),
        updateField(f.bluesky, fields[8]),
        updateField(f.whatsapp, fields[9]),
        updateField(f.cara, fields[10]),
        updateField(f.description, fields[11]),
        updateField(founded, fields[12]),
        updateField(chapterDate, fields[13]),
        fields[14] ?? '',
      ].map(escapeCSV).join(',');
    });
    if (!found) return { error: `Stadt "${f.city}" nicht gefunden` };
  }

  return { csv: [header, ...dataLines].join('\n') + '\n', city: f.city, isNew, notes };
}

/** Entry point for actions/github-script: rewrites data/cities.csv and exports CITY_NAME, IS_NEW and PR_NOTES. */
function run({ context, core }) {
  const fs = require('fs');
  const csvPath = 'data/cities.csv';
  const issue = context.payload.issue;
  const result = applyIssue(fs.readFileSync(csvPath, 'utf8'), {
    body: issue.body,
    labels: issue.labels.map(l => l.name),
  });
  if (result.error) {
    core.setFailed(result.error);
    return;
  }
  fs.writeFileSync(csvPath, result.csv);
  core.exportVariable('CITY_NAME', result.city);
  core.exportVariable('IS_NEW', result.isNew ? 'true' : 'false');
  const notes = result.notes.map(note => `- ${note}`).join('\n');
  core.exportVariable('PR_NOTES', notes && `**Bitte von Hand prüfen:**\n${notes}`);
}

module.exports = { applyIssue, run };

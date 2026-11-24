// CSV columns: city,lat,lon,is_official,website,email,facebook,instagram,bluesky,whatsapp,cara,description,founded,chapter_date,deutschlandtreffen

function parseField(body, label) {
  const regex = new RegExp(`### ${label}\\s*\\n\\s*([^#]*?)(?=\\n###|$)`, 's');
  const match = body.match(regex);
  if (!match) return '';
  const value = match[1].trim();
  if (value === '_No response_' || value === 'None') return '';
  return value;
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
 * Returns { csv, city, isNew } on success, or { error } with a message for the issue author.
 */
function applyIssue(csvText, { body, labels }) {
  const isNew = labels.includes('neue-stadt');
  const f = parseIssueBody(body);

  if (!f.city) return { error: 'Keine Stadt im Issue gefunden' };
  if (isNew && (!f.lat || !f.lon)) return { error: 'Koordinaten fehlen' };

  const lines = csvText.trim().split('\n');
  const header = lines[0];
  let dataLines = lines.slice(1);

  if (isNew) {
    const newLine = [f.city, f.lat, f.lon, f.isOfficial, f.website, f.email, f.facebook, f.instagram, f.bluesky, f.whatsapp, f.cara, f.description].map(escapeCSV).join(',');
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
        ...fields.slice(12),
      ].map(escapeCSV).join(',');
    });
    if (!found) return { error: `Stadt "${f.city}" nicht gefunden` };
  }

  return { csv: [header, ...dataLines].join('\n') + '\n', city: f.city, isNew };
}

/** Entry point for actions/github-script: rewrites data/cities.csv and exports CITY_NAME and IS_NEW. */
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
}

module.exports = { applyIssue, run };

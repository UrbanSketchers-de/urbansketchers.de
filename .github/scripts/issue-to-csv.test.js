const { test } = require('node:test');
const assert = require('node:assert/strict');
const { applyIssue } = require('./issue-to-csv.js');

const HEADER = 'city,lat,lon,is_official,website,email,facebook,instagram,bluesky,whatsapp,cara,description,founded,chapter_date,deutschlandtreffen';
const CSV = [
  HEADER,
  'Aachen,50.7766,6.0834,1,https://www.usk-ac.de,,,@usk.aachen,,,,,,,',
  'Ulm,48.4011,9.9876,0,,urbansketchersulm@gmail.com,,@ulm_usk,,,,,,,',
].join('\n') + '\n';

const NEW_CITY_LABELS = ['Stadt', 'Breitengrad (lat)', 'Längengrad (lon)', 'Offizielles Chapter?', 'Treffpunkt & Zeiten', 'Website', 'E-Mail', 'Facebook', 'Instagram', 'Bluesky', 'WhatsApp', 'Cara', 'Gründungsdatum', 'Chapter-Anerkennung'];

// Renders an issue body the way GitHub issue forms do; omitted fields read "_No response_".
function issueBody(values) {
  return NEW_CITY_LABELS
    .map(label => `### ${label}\n\n${values[label] ?? '_No response_'}`)
    .join('\n\n');
}

function rowOf(csv, city) {
  return csv.split('\n').find(line => line.startsWith(city + ','));
}

test('new city is inserted in alphabetical order', () => {
  const result = applyIssue(CSV, {
    labels: ['neue-stadt'],
    body: issueBody({ Stadt: 'Bonn', 'Breitengrad (lat)': '50.73', 'Längengrad (lon)': '7.10', Instagram: '@usk_bonn' }),
  });
  assert.deepEqual(result.csv.trim().split('\n').map(l => l.split(',')[0]), ['city', 'Aachen', 'Bonn', 'Ulm']);
  assert.equal(result.city, 'Bonn');
  assert.equal(result.isNew, true);
});

test('update replaces given fields, keeps blank ones, and clears "entfernen"', () => {
  const result = applyIssue(CSV, {
    labels: ['aktualisierung'],
    body: issueBody({ Stadt: 'ulm', 'E-Mail': 'entfernen', Website: 'https://usk-ulm.de' }),
  });
  assert.equal(rowOf(result.csv, 'Ulm'), 'Ulm,48.4011,9.9876,0,https://usk-ulm.de,,,@ulm_usk,,,,,,,');
  assert.equal(result.isNew, false);
});

test('update of an unknown city is an error', () => {
  const result = applyIssue(CSV, { labels: ['aktualisierung'], body: issueBody({ Stadt: 'Atlantis' }) });
  assert.equal(result.error, 'Stadt "Atlantis" nicht gefunden');
});

test('new city without coordinates is an error', () => {
  const result = applyIssue(CSV, { labels: ['neue-stadt'], body: issueBody({ Stadt: 'Bonn' }) });
  assert.equal(result.error, 'Koordinaten fehlen');
});

test('new city writes all columns, with dates normalized', () => {
  const result = applyIssue(CSV, {
    labels: ['neue-stadt'],
    body: issueBody({ Stadt: 'Bonn', 'Breitengrad (lat)': '50.73', 'Längengrad (lon)': '7.10', 'Gründungsdatum': 'September 2025', 'Chapter-Anerkennung': '4.6.2026' }),
  });
  assert.equal(rowOf(result.csv, 'Bonn'), 'Bonn,50.73,7.10,0,,,,,,,,,2025-09,2026-06-04,');
  assert.deepEqual(result.notes, []);
});

test('date formats people type are normalized', () => {
  const cases = {
    '2015': '2015',
    '2015-6': '2015-06',
    '2015-06-04': '2015-06-04',
    '04.06.2015': '2015-06-04',
    '4. 6. 2015': '2015-06-04',
    '6/2015': '2015-06',
    '06.2015': '2015-06',
    'Sept. 2025': '2025-09',
    'März 2026': '2026-03',
    '4. Juni 2015': '2015-06-04',
  };
  const founded = Object.keys(cases).map(input => {
    const result = applyIssue(CSV, { labels: ['aktualisierung'], body: issueBody({ Stadt: 'Ulm', 'Gründungsdatum': input }) });
    return rowOf(result.csv, 'Ulm').split(',')[12];
  });
  assert.deepEqual(founded, Object.values(cases));
});

test('unrecognized date leaves the column unchanged and is reported', () => {
  const csv = CSV.replace('@ulm_usk,,,,,,,', '@ulm_usk,,,,,2012,,');
  const result = applyIssue(csv, { labels: ['aktualisierung'], body: issueBody({ Stadt: 'Ulm', 'Gründungsdatum': 'Frühjahr 2018', 'Chapter-Anerkennung': '2015-13' }) });
  assert.equal(rowOf(result.csv, 'Ulm'), 'Ulm,48.4011,9.9876,0,,urbansketchersulm@gmail.com,,@ulm_usk,,,,,2012,,');
  assert.deepEqual(result.notes, ['Gründungsdatum nicht erkannt: "Frühjahr 2018"', 'Chapter-Anerkennung nicht erkannt: "2015-13"']);
});

test('update can remove a date and keeps deutschlandtreffen', () => {
  const csv = CSV.replace('@ulm_usk,,,,,,,', '@ulm_usk,,,,,2012,2014,2020');
  const result = applyIssue(csv, { labels: ['aktualisierung'], body: issueBody({ Stadt: 'Ulm', 'Chapter-Anerkennung': 'entfernen' }) });
  assert.equal(rowOf(result.csv, 'Ulm'), 'Ulm,48.4011,9.9876,0,,urbansketchersulm@gmail.com,,@ulm_usk,,,,,2012,,2020');
});

test('new-city issue for a listed city updates that row instead of adding one', () => {
  const result = applyIssue(CSV, {
    labels: ['neue-stadt'],
    body: issueBody({ Stadt: 'Ulm', 'Breitengrad (lat)': '48.40', 'Längengrad (lon)': '9.99', Instagram: '@usk_ulm' }),
  });
  assert.deepEqual(result.csv.trim().split('\n').map(l => l.split(',')[0]), ['city', 'Aachen', 'Ulm']);
  assert.equal(rowOf(result.csv, 'Ulm'), 'Ulm,48.40,9.99,0,,urbansketchersulm@gmail.com,,@usk_ulm,,,,,,,');
  assert.equal(result.isNew, false);
  assert.deepEqual(result.notes, ['"Ulm" steht schon in der Liste; als Aktualisierung übernommen.']);
});

test('line breaks in the description become <br> so the row stays on one line', () => {
  const result = applyIssue(CSV, {
    labels: ['aktualisierung'],
    body: issueBody({ Stadt: 'Ulm', 'Treffpunkt & Zeiten': 'Jeden Samstag.\r\n\r\nWir freuen uns!' }),
  });
  assert.equal(rowOf(result.csv, 'Ulm'), 'Ulm,48.4011,9.9876,0,,urbansketchersulm@gmail.com,,@ulm_usk,,,,Jeden Samstag.<br>Wir freuen uns!,,,');
});

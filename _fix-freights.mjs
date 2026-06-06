import { readFileSync, writeFileSync } from 'fs';

const f = 'src/app/masters/freights/page.tsx';
let lines = readFileSync(f, 'utf8').split(/\r?\n/);

// Fix em-dashes: find any line with the corrupted sequence and fix
for (let i = 0; i < lines.length; i++) {
  // The corrupted em-dash appears as multiple chars
  if (lines[i].includes('GridHeader') && lines[i].includes('Freights')) {
    console.log('Found Freights GridHeader at line', i+1);
    // Replace the whole line
    lines[i] = '                        <PanelGrid title={`Freights${selWh ? ` \\u2014 ${t(selWh.wp_name)}` : ""}`} icon={Cloud} refreshing={loadingFr} menuItems={[';
    // Remove the next line (GridMenu items=[)
    if (lines[i+1].trim().startsWith('<GridMenu')) {
      lines.splice(i+1, 1);
      console.log('Removed GridMenu line after');
    }
  }
  
  if (lines[i].includes('GridHeader') && lines[i].includes('Handling')) {
    console.log('Found Handling GridHeader at line', i+1);
    lines[i] = '                        <PanelGrid title="Handling" icon={Building2} refreshing={loadingHa} menuItems={[';
    if (lines[i+1].trim().startsWith('<GridMenu')) {
      lines.splice(i+1, 1);
      console.log('Removed GridMenu line after');
    }
  }
  
  if (lines[i].includes('GridHeader') && lines[i].includes('ATPDA')) {
    console.log('Found ATPDA GridHeader at line', i+1);
    lines[i] = '                        <PanelGrid title="ATPDA" icon={MapPin} refreshing={loadingAt} menuItems={[';
    if (lines[i+1].trim().startsWith('<GridMenu')) {
      lines.splice(i+1, 1);
      console.log('Removed GridMenu line after');
    }
  }
  
  // Remove </GridHeader> lines
  if (lines[i].trim() === '</GridHeader>') {
    console.log('Removed </GridHeader> at line', i+1);
    lines.splice(i, 1);
    i--; // adjust index
  }
}

let c = lines.join('\n');

// Fix ALL em-dashes in the file: replace any corrupted sequence with proper em-dash
// The corrupted sequence is: c3a2 e280ac e2809d in bytes, which in UTF-8 string is:
// \u00e2 (â) + \u20ac (€) + \u201d (")  — but actually it's the double-encoded UTF-8
// Let's just replace the literal chars that appear
c = c.replace(/\u00e2\u20ac\u201d/g, '\u2014'); // â€" → —
c = c.replace(/\u00e2\u20ac\u009d/g, '\u2014'); // alternate encoding

// Also fix the \\u2014 literal we put in
c = c.replace(/\\u2014/g, '\u2014');

writeFileSync(f, c, 'utf8');

// Verify
const verify = readFileSync(f, 'utf8');
const vl = verify.split(/\r?\n/);
console.log('\nVerification:');
console.log('GridHeader refs:', (verify.match(/GridHeader/g) || []).length);
console.log('GridMenu refs:', (verify.match(/GridMenu/g) || []).length);
console.log('PanelGrid refs:', (verify.match(/PanelGrid/g) || []).length);
console.log('Corrupted em-dashes (â€):', (verify.match(/\u00e2\u20ac/g) || []).length);
console.log('Proper em-dashes:', [...verify.matchAll(/\u2014/g)].length);
console.log('DONE');

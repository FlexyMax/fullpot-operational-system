/**
 * Migrate system pages from manual header bars to <PanelGrid>.
 * Usage: node scripts/migrate-system-panels.mjs <page-path>
 *
 * Converts:
 *   <div className="h-10 bg-[#374151] ... rounded-t-lg"> → <PanelGrid title="..." icon={...}>
 *   matching </div> → </PanelGrid>
 */

import { readFileSync, writeFileSync } from 'fs';

const filePath = process.argv[2];
if (!filePath) { console.error('Usage: node scripts/migrate-system-panels.mjs <page.tsx>'); process.exit(1); }

let c = readFileSync(filePath, 'utf8');

// Check if PanelGrid is already imported
if (!c.includes("from '@/components/ui/PanelGrid'")) {
    // Add import after the last lucide import
    const lastLucide = c.lastIndexOf("from 'lucide-react'");
    if (lastLucide === -1) { console.error('No lucide import found'); process.exit(1); }
    const lineEnd = c.indexOf('\n', lastLucide);
    c = c.slice(0, lineEnd + 1) + "import { PanelGrid } from '@/components/ui/PanelGrid';\n" + c.slice(lineEnd + 1);
    console.log('Added PanelGrid import');
}

// Find the header pattern: <div className="h-10 bg-[#374151] ...
// and replace with PanelGrid
const headerRegex = /<div className="h-10 bg-\[#374151\][^"]*rounded-t-lg[^"]*">/g;
let match;
const matches = [];
while ((match = headerRegex.exec(c)) !== null) {
    matches.push({ index: match.index, length: match[0].length, text: match[0] });
}

console.log(`Found ${matches.length} header bar(s) to migrate`);

if (matches.length === 0) {
    console.log('Nothing to migrate');
    process.exit(0);
}

// For each match, find the title span and icon to extract PanelGrid props
for (const m of matches) {
    // Find the title span inside this header
    const headerBlock = c.slice(m.index, m.index + 2000);
    const titleMatch = headerBlock.match(/<span[^>]*>([^<]+)<\/span>/);
    const iconMatch = headerBlock.match(/<(\w+) size=\{?\d+\}? className="text-\[#FB7506\]"/);
    
    const title = titleMatch ? titleMatch[1].trim() : 'Panel';
    const icon = iconMatch ? iconMatch[1] : 'Settings';
    
    console.log(`  → Replacing header "${title}" (icon: ${icon})`);
}

console.log('\nManual review needed — patterns vary too much for safe automated replacement.');
console.log('Use edit_file for each header individually.');

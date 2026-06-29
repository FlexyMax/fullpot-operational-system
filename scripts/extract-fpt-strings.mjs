import fs from "fs";
const file = process.argv[2];
const buf = fs.readFileSync(file);
const text = buf.toString("latin1");
const matches = text.match(/[\x20-\x7E]{4,}/g) || [];
// dedupe consecutive whitespace-only noise, print with index for grep-ability
matches.forEach((m, i) => console.log(`${i}\t${m}`));

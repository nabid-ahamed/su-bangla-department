import fs from 'fs';
const env = fs.readFileSync('.env','utf8');
for (const l of env.split(/\r?\n/)) { const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/); if(m) process.env[m[1]]=m[2]; }
const { departmentLayoutUpdateSchema, departmentLayoutOfficesSchema } = await import('./src/lib/validation.ts');

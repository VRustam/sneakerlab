import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const targets = ['apps/web/src', 'apps/mobile/lib'];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.dart']);
const forbidden = [
  /SUPABASE_SERVICE_ROLE_KEY/,
  /service[_-]?role(?:[_-]?key)?/i,
  /sbp_[A-Za-z0-9_-]{16,}/,
];

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return sourceExtensions.has(path.slice(path.lastIndexOf('.'))) ? [path] : [];
    }),
  );
  return files.flat();
}

const findings = [];
for (const target of targets) {
  for (const file of await sourceFiles(target)) {
    const content = await readFile(file, 'utf8');
    forbidden.forEach((pattern) => {
      if (pattern.test(content))
        findings.push(`${relative(process.cwd(), file)} matches ${pattern}`);
    });
  }
}

if (findings.length > 0) {
  console.error('Potential client-side secret exposure found:');
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exitCode = 1;
} else {
  console.log(
    'Secret scan passed: no service-role key or obvious secret pattern in web/mobile source.',
  );
}

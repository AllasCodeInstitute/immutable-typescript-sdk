import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

interface TsFileBlock {
    target: string;
    content: string;
}

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');
const umlPath = resolve('src/UML/immutable-typescript-sdk.uml');

function parseTsFileBlocks(source: string): TsFileBlock[] {
    const blocks: TsFileBlock[] = [];
    const blockRegex = /ts_file\s+"([^"]+)"\s*\{\s*content\s*<<<TS\n([\s\S]*?)\nTS\s*\}/g;
    let match: RegExpExecArray | null;

    while ((match = blockRegex.exec(source)) !== null) {
        blocks.push({
            target: match[1],
            content: `${match[2]}\n`
        });
    }

    return blocks;
}

function diffPreview(expected: string, actual: string): string {
    const expectedLines = expected.split('\n');
    const actualLines = actual.split('\n');
    const max = Math.max(expectedLines.length, actualLines.length);

    for (let index = 0; index < max; index += 1) {
        if (expectedLines[index] !== actualLines[index]) {
            return [
                `first different line: ${index + 1}`,
                `expected: ${expectedLines[index] ?? '<missing>'}`,
                `actual:   ${actualLines[index] ?? '<missing>'}`
            ].join('\n');
        }
    }

    return 'no textual difference detected';
}

if (!existsSync(umlPath)) {
    throw new Error(`UML source not found: ${umlPath}`);
}

const uml = readFileSync(umlPath, 'utf8');
const blocks = parseTsFileBlocks(uml);

if (blocks.length === 0) {
    throw new Error('No ts_file blocks found in UML source.');
}

let failed = false;

for (const block of blocks) {
    const targetPath = resolve(block.target);

    if (checkOnly) {
        const actual = existsSync(targetPath) ? readFileSync(targetPath, 'utf8') : '';

        if (actual !== block.content) {
            failed = true;
            console.error(`UML compiler mismatch: ${block.target}`);
            console.error(diffPreview(block.content, actual));
        }

        continue;
    }

    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, block.content, 'utf8');
    console.log(`generated ${block.target}`);
}

if (failed) {
    process.exitCode = 1;
}

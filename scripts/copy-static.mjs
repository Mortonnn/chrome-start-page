import { rmSync, mkdirSync, cpSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('public', 'dist', { recursive: true });
console.log('Static build complete: public/ -> dist/');

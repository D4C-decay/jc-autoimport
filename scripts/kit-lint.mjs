#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// El lint siempre revisa el KIT (el dir donde vive este script), no el cwd:
// así `sync.sh --check` puede invocarlo desde cualquier destino.
const KIT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = fs.existsSync(path.join(KIT_ROOT, 'opencode.kit.json')) ? KIT_ROOT : process.cwd();
const badJC = /(jcauto|jc-autoimport|apps\/web|localhost:4200)/i;
const badSec = /(Admin123|c[a-z]*ilioWWE|ghp_|sk-[A-Za-z0-9]{20,})/i;
// Restos de un proyecto concreto (jcautoimport) que se colaron en superficies
// "autoria" del kit (agentes/skills/comandos/docs/templates/plugins). NO se
// aplica al corpus de datos de ui-ux-pro-max (contiene "signals"/"Archivo Black"
// de forma legítima).
const badProj = /(f02434|color-signal|vehicle-card|Archivo Black)/i;

function walk(dir, exts) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    // graphify-out = salida derivada (cache AST gitignored): su contenido
    // replica el código y false-positiva el lint (p. ej. un callee histórico).
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'graphify-out') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

let errs=[];
const ag=walk(path.join(root,'.opencode/agent'),['.md']);
const sk=walk(path.join(root,'.opencode/skills'),['.md']).filter(f=>path.basename(f)==='SKILL.md');
const cmd=walk(path.join(root,'.opencode/command'),['.md']);
const pl=walk(path.join(root,'.opencode/plugin'),['.ts','.js','.mjs']);

for(const f of ag) {
  const c=fs.readFileSync(f,'utf8');
  if(badJC.test(c)) errs.push('JC:'+f);
  if(badSec.test(c)) errs.push('SEC:'+f);
  if(badProj.test(c)) errs.push('PROJ:'+f);
  if(!c.includes('mode:')||!c.includes('model:')) errs.push('FRONTMATTER:'+f);
}

// Plantillas y documentación: son lo que hereda un proyecto nuevo, no pueden
// arrastrar rutas ni datos de un proyecto concreto.
const docs=[...walk(path.join(root,'docs'),['.md']), ...walk(path.join(root,'templates'),['.md'])];
if(fs.existsSync(path.join(root,'README.md'))) docs.push(path.join(root,'README.md'));
for(const f of docs) {
  const c=fs.readFileSync(f,'utf8');
  if(badJC.test(c)) errs.push('JC:'+f);
  if(badSec.test(c)) errs.push('SEC:'+f);
  if(badProj.test(c)) errs.push('PROJ:'+f);
  if(!c.trim()) errs.push('EMPTY:'+f);
}
for(const f of sk) {
  const c=fs.readFileSync(f,'utf8');
  if(badJC.test(c)) errs.push('JC:'+f);
  if(badProj.test(c)) errs.push('PROJ:'+f);
  const name=path.basename(path.dirname(f));
  if(!c.includes('name: '+name)) errs.push('SKNAME:'+f);
}
for(const f of cmd) {
  const c=fs.readFileSync(f,'utf8');
  if(badJC.test(c)) errs.push('JC:'+f);
  if(badProj.test(c)) errs.push('PROJ:'+f);
  if(c.trim().length<40) errs.push('SHORT:'+f);
}
for(const f of pl) {
  const c=fs.readFileSync(f,'utf8');
  if(badJC.test(c)) errs.push('JC:'+f);
  if(badSec.test(c)) errs.push('SEC:'+f);
  if(badProj.test(c)) errs.push('PROJ:'+f);
}
for(const f of walk(root,['.json','.mjs','.sh','.ts'])) {
  if(f.includes('node_modules')||f.includes('kit-lint.mjs')) continue;
  const c=fs.readFileSync(f,'utf8');
  if(badSec.test(c)) errs.push('SEC:'+f);
  if(badJC.test(c)) errs.push('JC:'+f);
}

if (fs.existsSync(path.join(root, 'opencode.kit.json'))) {
  try { JSON.parse(fs.readFileSync(path.join(root, 'opencode.kit.json'), 'utf8')); } catch (e) { errs.push('KITJSON'); }
}
if(errs.length) { console.error('FAIL',errs.slice(0,30)); process.exit(1); }
console.log('OK lint'); process.exit(0);

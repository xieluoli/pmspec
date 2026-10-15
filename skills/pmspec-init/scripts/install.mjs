import { access, copyFile, lstat, mkdir, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const argumentsList = process.argv.slice(2);
const options = {};
for (let index = 0; index < argumentsList.length; index += 1) {
  const argument = argumentsList[index];
  if (argument === '--check' && !options.check) options.check = true;
  else if (['--host', '--workspace'].includes(argument) && !options[argument.slice(2)]) {
    const value = argumentsList[++index];
    if (!value || value.startsWith('--')) throw new Error(`缺少参数值：${argument}`);
    options[argument.slice(2)] = value;
  } else throw new Error(`未知或重复参数：${argument}`);
}
if (!['claude', 'codex'].includes(options.host) || !options.workspace) {
  throw new Error('用法：node install.mjs --host claude|codex --workspace <现有目录> [--check]');
}
const workspace = resolve(options.workspace);
const skillsRoot = fileURLToPath(new URL('../../', import.meta.url));
const skillNames = ['pmspec-init', 'pmspec-explore', 'pmspec-propose', 'pmspec-apply', 'pmspec-review'];
const skillDirectory = options.host === 'claude' ? '.claude/skills' : '.agents/skills';
const agentSource = join(skillsRoot, 'pmspec-apply/agents', options.host === 'claude' ? 'prototype-review.md' : 'prototype-review.toml');
const agentTarget = join(workspace, options.host === 'claude' ? '.claude/agents/prototype-review.md' : '.codex/agents/prototype-review.toml');
async function statIfPresent(path) {
  try { return await lstat(path); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function assertDirectories(path) {
  const parent = dirname(path);
  if (parent !== path) await assertDirectories(parent);
  const stat = await statIfPresent(path);
  if (stat && (stat.isSymbolicLink() || !stat.isDirectory())) throw new Error(`目录不是普通目录或含符号链接：${path}`);
}
await assertDirectories(workspace);
await access(workspace, constants.W_OK);
const requiredFiles = [
  'pmspec-init/scripts/install.mjs',
  'pmspec-propose/templates/proposal.md',
  'pmspec-apply/agents/prototype-review.md',
  'pmspec-apply/agents/prototype-review.toml',
  'pmspec-apply/assets/example.html',
  'pmspec-apply/assets/template.html',
  'pmspec-apply/assets/theme.css',
  'pmspec-apply/assets/shared.css',
  'pmspec-apply/assets/prototype.js',
  'pmspec-apply/scripts/embed-assets.mjs',
  'pmspec-apply/references/runtime.md',
  'pmspec-apply/references/prototype.md',
  'pmspec-apply/references/annotations.md',
  'pmspec-apply/references/review-checklist.md',
];
for (const requiredFile of requiredFiles) {
  const sourceStat = await lstat(join(skillsRoot, requiredFile));
  if (!sourceStat.isFile() || sourceStat.isSymbolicLink()) throw new Error(`来源不完整：${requiredFile}`);
}
const copies = [];
const missingDirectories = new Set();
async function compare(source, target) {
  const sourceStat = await lstat(source);
  const targetStat = await statIfPresent(target);
  if (sourceStat.isSymbolicLink() || targetStat?.isSymbolicLink()) throw new Error(`不处理符号链接：${target}`);
  if (sourceStat.isDirectory()) {
    if (targetStat && !targetStat.isDirectory()) throw new Error(`目录冲突：${target}`);
    if (!targetStat) missingDirectories.add(target);
    const sourceEntries = await readdir(source);
    if (targetStat) {
      const extras = (await readdir(target)).filter((entry) => !sourceEntries.includes(entry));
      if (extras.length) throw new Error(`目标含额外文件，需人工协调：${target}/${extras[0]}`);
    }
    for (const entry of sourceEntries) await compare(join(source, entry), join(target, entry));
  } else {
    if (!sourceStat.isFile() || (targetStat && !targetStat.isFile())) throw new Error(`文件类型冲突：${target}`);
    if (targetStat) {
      if (!(await readFile(source)).equals(await readFile(target))) throw new Error(`内容不同，未覆盖：${target}`);
    } else copies.push({ source, target });
  }
}
for (const skillName of skillNames) {
  await access(join(skillsRoot, skillName, 'SKILL.md'));
  const target = join(workspace, skillDirectory, skillName);
  await assertDirectories(dirname(target));
  await compare(join(skillsRoot, skillName), target);
}
await assertDirectories(dirname(agentTarget));
await compare(agentSource, agentTarget);
if (!options.check) {
  for (const directory of missingDirectories) await mkdir(directory, { recursive: true });
  for (const { source, target } of copies) {
    await mkdir(dirname(target), { recursive: true });
    await copyFile(source, target, constants.COPYFILE_EXCL);
  }
}
console.info(JSON.stringify({
  host: options.host,
  workspace,
  mode: options.check ? '预检，不写入' : '部署',
  skills: skillNames,
  agent: agentTarget,
  newFiles: copies.length,
  runtimeDiscovery: '未验证；需宿主技能发现与独立 Agent 冒烟',
}, null, 2));

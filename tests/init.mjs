import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const script = join(root, 'skills/pmspec-init/scripts/install.mjs');
const temporary = await mkdtemp(join(await realpath(tmpdir()), 'pmspec-init-'));
const run = (workspace, host, ...extra) => spawnSync(process.execPath, [script, '--host', host, '--workspace', workspace, ...extra], { encoding: 'utf8' });
try {
  for (const host of ['claude', 'codex']) {
    const workspace = join(temporary, host);
    await mkdir(workspace);
    await writeFile(join(workspace, 'AGENTS.md'), 'existing project rules');
    const configDirectory = join(workspace, host === 'claude' ? '.claude' : '.codex');
    await mkdir(configDirectory);
    const configFile = join(configDirectory, host === 'claude' ? 'settings.json' : 'config.toml');
    await writeFile(configFile, 'existing configuration');
    const beforeCheck = await readdir(workspace);
    const checked = run(workspace, host, '--check');
    assert.equal(checked.status, 0, checked.stderr);
    assert.deepEqual(await readdir(workspace), beforeCheck, '预检不能创建目录');
    assert.deepEqual(await readdir(configDirectory), [host === 'claude' ? 'settings.json' : 'config.toml']);
    const installed = run(workspace, host);
    assert.equal(installed.status, 0, installed.stderr);
    assert(JSON.parse(installed.stdout).newFiles > 0);
    const skillRoot = join(workspace, host === 'claude' ? '.claude/skills' : '.agents/skills');
    assert.equal((await readdir(skillRoot)).length, 5);
    for (const skill of ['init', 'explore', 'propose', 'apply', 'review']) {
      assert.equal(await readFile(join(skillRoot, `pmspec-${skill}/SKILL.md`), 'utf8'), await readFile(join(root, `skills/pmspec-${skill}/SKILL.md`), 'utf8'));
    }
    for (const file of ['references/design-system.md', 'templates/design/DESIGN.md', 'templates/design/foundations.md', 'templates/design/components.md', 'templates/design/patterns.md', 'templates/design/brand.md']) {
      assert.equal(await readFile(join(skillRoot, 'pmspec-init', file), 'utf8'), await readFile(join(root, 'skills/pmspec-init', file), 'utf8'));
    }
    assert.equal(await readFile(join(skillRoot, 'pmspec-apply/references/default-design.md'), 'utf8'), await readFile(join(root, 'skills/pmspec-apply/references/default-design.md'), 'utf8'));
    assert.deepEqual((await readdir(workspace)).sort(), ['AGENTS.md', ...(host === 'claude' ? ['.claude'] : ['.agents', '.codex'])].sort(), '安装脚本不生成项目设计基准');
    const agentFile = join(workspace, host === 'claude' ? '.claude/agents/prototype-review.md' : '.codex/agents/prototype-review.toml');
    assert.equal(await readFile(agentFile, 'utf8'), await readFile(join(root, 'skills/pmspec-apply/agents', host === 'claude' ? 'prototype-review.md' : 'prototype-review.toml'), 'utf8'));
    assert.equal(await readFile(configFile, 'utf8'), 'existing configuration');
    assert.equal(await readFile(join(workspace, 'AGENTS.md'), 'utf8'), 'existing project rules');
    const repeated = run(workspace, host);
    assert.equal(repeated.status, 0, repeated.stderr);
    assert.equal(JSON.parse(repeated.stdout).newFiles, 0, '重复安装应幂等');
    // 已安装 init 也应能使用其相邻技能作为完整来源。
    const installedRun = spawnSync(process.execPath, [join(skillRoot, 'pmspec-init/scripts/install.mjs'), '--host', host, '--workspace', workspace, '--check'], { encoding: 'utf8' });
    assert.equal(installedRun.status, 0, installedRun.stderr);
    const original = await readFile(join(skillRoot, 'pmspec-explore/SKILL.md'));
    await writeFile(agentFile, 'customized reviewer');
    const conflict = run(workspace, host);
    assert.notEqual(conflict.status, 0, 'Agent 冲突须拒绝');
    assert.equal(await readFile(agentFile, 'utf8'), 'customized reviewer');
    assert((await readFile(join(skillRoot, 'pmspec-explore/SKILL.md'))).equals(original));
  }
  const partial = join(temporary, 'partial');
  await mkdir(join(partial, '.claude/skills/pmspec-review'), { recursive: true });
  await writeFile(join(partial, '.claude/skills/pmspec-review/SKILL.md'), 'custom skill');
  assert.notEqual(run(partial, 'claude').status, 0);
  assert.deepEqual(await readdir(join(partial, '.claude/skills')), ['pmspec-review'], '晚发现冲突也不得先装前序技能');
  const extra = join(temporary, 'extra');
  await mkdir(join(extra, '.agents/skills'), { recursive: true });
  await cp(join(root, 'skills/pmspec-init'), join(extra, '.agents/skills/pmspec-init'), { recursive: true });
  await writeFile(join(extra, '.agents/skills/pmspec-init/local-note.md'), 'keep');
  assert.notEqual(run(extra, 'codex').status, 0, '额外文件须协调');
  assert.equal(await readFile(join(extra, '.agents/skills/pmspec-init/local-note.md'), 'utf8'), 'keep');
  const linked = join(temporary, 'linked');
  await mkdir(linked);
  const outside = join(temporary, 'outside');
  await mkdir(outside);
  await symlink(outside, join(linked, '.claude'));
  assert.notEqual(run(linked, 'claude').status, 0, '拒绝符号链接写入');
  assert.deepEqual(await readdir(outside), []);
  const sourceSnapshot = join(temporary, 'source');
  await cp(join(root, 'skills'), join(sourceSnapshot, 'skills'), { recursive: true });
  await rm(join(sourceSnapshot, 'skills/pmspec-apply/agents/prototype-review.toml'));
  const missingTarget = join(temporary, 'missing-source-target');
  await mkdir(missingTarget);
  const missing = spawnSync(process.execPath, [join(sourceSnapshot, 'skills/pmspec-init/scripts/install.mjs'), '--host', 'codex', '--workspace', missingTarget], { encoding: 'utf8' });
  assert.notEqual(missing.status, 0, '来源不完整须在写前拒绝');
  assert.deepEqual(await readdir(missingTarget), []);
  const designFiles = [
    'pmspec-init/references/design-system.md',
    ...['DESIGN.md', 'foundations.md', 'components.md', 'patterns.md', 'brand.md'].map((name) => `pmspec-init/templates/design/${name}`),
    'pmspec-apply/references/default-design.md',
  ];
  // 同一完整来源部署两种宿主时，任意设计支持文件缺失都必须写前拒绝。
  await cp(join(root, 'skills'), join(sourceSnapshot, 'skills'), { recursive: true });
  for (const relative of designFiles) {
    const source = join(sourceSnapshot, 'skills', relative);
    const original = await readFile(source);
    await rm(source);
    for (const host of ['claude', 'codex']) {
      const rejected = spawnSync(process.execPath, [join(sourceSnapshot, 'skills/pmspec-init/scripts/install.mjs'), '--host', host, '--workspace', missingTarget], { encoding: 'utf8' });
      assert.notEqual(rejected.status, 0, `${host} 缺失设计支持文件应拒绝：${relative}`);
      assert.deepEqual(await readdir(missingTarget), [], '缺来源不产生部分写入');
    }
    await writeFile(source, original);
  }
  assert.notEqual(run(temporary, 'unknown').status, 0);
  assert.notEqual(run(join(temporary, 'does-not-exist'), 'claude').status, 0);
  console.info('通过：Claude Code/Codex 五技能与专用 Agent 部署、无写预检、幂等、已安装 init 自检、保留配置、整批冲突保护、额外文件/符号链接/缺来源/错误参数拒绝');
} finally {
  await rm(temporary, { recursive: true });
}

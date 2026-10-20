// 交给宿主浏览器执行；不在浏览器服务器内 require/import，也不自行写证据文件。
(async (page, { url, sha256, viewport = { width: 1440, height: 1080 }, cases = [], reset = async () => {}, capture = async () => null } = {}) => {
  if (!/^http:\/\/127\.0\.0\.1:\d+\/prototype\.html$/.test(url) || !/^[a-f0-9]{64}$/.test(sha256)) {
    throw new Error('须提供 preview.mjs 返回的 loopback URL 与 SHA256');
  }
  const checks = [];
  const events = [];
  const screenshots = [];
  const handlers = {
    pageerror: error => events.push({ type: 'pageerror', message: error.message }),
    console: message => { if (['error', 'warning'].includes(message.type())) events.push({ type: message.type(), message: message.text() }); },
    requestfailed: request => events.push({ type: 'requestfailed', url: request.url(), message: request.failure()?.errorText }),
    request: request => {
      if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(url).origin) events.push({ type: 'external-request', url: request.url() });
    },
  };
  const check = (name, pass, detail = null) => {
    checks.push({ name, pass: Boolean(pass), detail });
    if (!pass) throw new Error(name);
  };
  const open = async () => {
    const response = await page.goto(url, { waitUntil: 'load' });
    check('当前快照版本', response?.status() === 200 && response.headers()['x-pmspec-sha256'] === sha256);
    await reset(page);
  };
  for (const [event, handler] of Object.entries(handlers)) page.on(event, handler);
  try {
    await page.setViewportSize(viewport);
    await open();
    const structure = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
      return {
        duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].map(element => element.getAttribute('href').slice(1)).filter(id => id && !document.getElementById(id)),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    check('唯一ID、索引锚点与整页横向溢出冒烟', !structure.duplicateIds.length && !structure.brokenAnchors.length && !structure.overflow, structure);
    for (const scenario of cases) {
      try {
        // 每例重新导航，销毁上一例 DOM、内存及定时器；持久状态由 reset 显式恢复。
        await open();
        await scenario.run(page, (name, pass, detail) => check(`${scenario.name} / ${name}`, pass, detail));
        checks.push({ name: scenario.name, pass: true, detail: '用例执行完成' });
        const screenshot = await capture(page, scenario.name);
        if (screenshot) screenshots.push({ name: scenario.name, location: screenshot });
      } catch (error) {
        checks.push({ name: scenario.name, pass: false, detail: error.message });
      }
    }
  } catch (error) {
    checks.push({ name: '运行中止', pass: false, detail: error.message });
  } finally {
    for (const [event, handler] of Object.entries(handlers)) page.removeListener(event, handler);
  }
  return {
    sha256, url, viewport, browser: page.context().browser()?.version() ?? '宿主未提供版本',
    checks, events, screenshots,
    passed: checks.length > 0 && checks.every(item => item.pass) && events.length === 0,
    notRun: ['未在 cases 中声明的产品流程、控件样式与局部遮挡检查', ...(cases.length ? [] : ['未提供产品测试用例；仅运行通用冒烟'])],
  };
})

import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9222;

const proc = spawn(edgePath, [
  '--headless=new',
  '--disable-gpu',
  `--remote-debugging-port=${port}`,
  'about:blank'
]);

async function getWsUrl() {
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const data = await res.json();
      return data.webSocketDebuggerUrl;
    } catch (e) {}
  }
  throw new Error('Could not connect to debugger');
}

async function run() {
  try {
    await getWsUrl();
    const targetsRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === 'page');
    if (!pageTarget) throw new Error('No page target');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description));
      } else if (msg.method === 'Runtime.exceptionThrown') {
        console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
      } else if (msg.method === 'Page.loadEventFired') {
        console.log('[PAGE LOADED]');
      }
    };

    ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 3, method: 'Log.enable' }));
    ws.send(JSON.stringify({
      id: 4,
      method: 'Page.navigate',
      params: { url: 'https://yellow-lemur-288332.hostingersite.com/' }
    }));

    await new Promise(r => setTimeout(r, 7000));

    // Evaluate root element content
    ws.send(JSON.stringify({
      id: 5,
      method: 'Runtime.evaluate',
      params: { expression: 'document.getElementById("root")?.innerHTML' }
    }));

    await new Promise(r => setTimeout(r, 2000));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    proc.kill();
    process.exit(0);
  }
}

run();

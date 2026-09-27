import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'e:\\laragon\\www\\masaha\\scratch\\edge_profile';

const proc = spawn(edgePath, [
  '--headless=new',
  '--disable-gpu',
  '--remote-debugging-port=9222',
  `--user-data-dir=${userDataDir}`,
  'https://yellow-lemur-288332.hostingersite.com/'
]);

proc.stderr.on('data', d => {
  const str = d.toString();
  if (!str.includes('fallback_task_provider')) console.log('[EDGE]', str.trim());
});

async function main() {
  await new Promise(r => setTimeout(r, 2000));
  try {
    const res = await fetch('http://127.0.0.1:9222/json/list');
    const list = await res.json();
    console.log('List count:', list.length);
    const page = list.find(x => x.type === 'page');
    if (!page) {
      console.log('No page found');
      return;
    }
    console.log('Connecting to:', page.webSocketDebuggerUrl);
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.onopen = () => {
      console.log('WS Open');
      ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({ id: 3, method: 'Log.enable' }));
    };
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log('CONSOLE LOG:', data.params.type, JSON.stringify(data.params.args));
      }
      if (data.method === 'Runtime.exceptionThrown') {
        console.log('EXCEPTION THROWN:', JSON.stringify(data.params.exceptionDetails, null, 2));
      }
    };
    await new Promise(r => setTimeout(r, 5000));
    // Get document title and body
    ws.send(JSON.stringify({
      id: 10,
      method: 'Runtime.evaluate',
      params: { expression: 'document.body.innerHTML' }
    }));
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.id === 10) {
        console.log('BODY INNER HTML:', data.result?.result?.value?.slice(0, 300));
      }
      if (data.method === 'Runtime.exceptionThrown') {
        console.log('EXCEPTION THROWN:', JSON.stringify(data.params.exceptionDetails, null, 2));
      }
    };
    await new Promise(r => setTimeout(r, 2000));
  } catch (err) {
    console.error('Error in main:', err);
  } finally {
    proc.kill();
  }
}

main();

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ssDir = 'C:\\Users\\Sparsh Gaba\\.gemini\\antigravity\\brain\\4b43cda7-df4d-4516-91c6-087614956596\\screenshots';
if (!fs.existsSync(ssDir)) {
  fs.mkdirSync(ssDir, { recursive: true });
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const tasks = [
  { name: 'mobile_landing.png', url: 'http://localhost:3000/', w: 412, h: 915 },
  { name: 'mobile_browse.png', url: 'http://localhost:3000/browse', w: 412, h: 915 },
  { name: 'mobile_register.png', url: 'http://localhost:3000/register', w: 412, h: 915 },
  { name: 'mobile_status_allotted.png', url: 'http://localhost:3000/status?num=MUN%202048', w: 412, h: 915 },
  { name: 'mobile_status_pending.png', url: 'http://localhost:3000/status?num=MUN%202049', w: 412, h: 915 },
  { name: 'desktop_dashboard.png', url: 'http://localhost:3000/organizer', w: 1280, h: 800 },
  { name: 'desktop_registrations.png', url: 'http://localhost:3000/organizer/registrations', w: 1280, h: 800 },
  { name: 'desktop_allotment.png', url: 'http://localhost:3000/organizer/allotment', w: 1280, h: 800 },
  { name: 'desktop_setup.png', url: 'http://localhost:3000/organizer/setup', w: 1280, h: 800 },
  { name: 'tablet_allotment.png', url: 'http://localhost:3000/organizer/allotment', w: 768, h: 1024 },
];

async function run() {
  for (const t of tasks) {
    const outPath = path.join(ssDir, t.name);
    console.log(`Capturing ${t.name}...`);
    await new Promise((resolve) => {
      const p = spawn(chromePath, [
        '--headless=new',
        '--disable-gpu',
        `--window-size=${t.w},${t.h}`,
        `--screenshot=${outPath}`,
        '--virtual-time-budget=2000',
        '--hide-scrollbars',
        t.url,
      ]);
      p.on('close', resolve);
    });
  }
  console.log('Screenshots complete!');
}

run();

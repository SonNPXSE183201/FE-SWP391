/**
 * Quick API integration check for completed frontend tasks.
 * Prints PASS/FAIL only — no tokens or sensitive data.
 */
const BASE = process.env.API_URL || 'http://localhost:5000/api/v1';

async function login(identifier, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Identifier: identifier, Password: password }),
  });
  const data = await res.json();
  if (!res.ok || !(data?.Data?.Token || data?.data?.token)) {
    throw new Error(data?.Message || data?.message || `Login failed for ${identifier}`);
  }
  return data?.Data?.Token || data?.data?.token;
}

async function authedGet(token, path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function result(name, pass, detail = '') {
  return { name, pass, detail };
}

async function main() {
  const results = [];

  // 1. Auth via Gateway
  try {
    const adminToken = await login('admin', '12345');
    results.push(result('Auth Login (Gateway)', true, 'admin login OK'));

    // 2. Admin Users
    const users = await authedGet(adminToken, '/admin/users?page=1&pageSize=5');
    const usersOk = users.status === 200 && (users.data?.Data?.Items || users.data?.data?.items || users.data?.Data);
    results.push(result('Admin Users API', !!usersOk, `HTTP ${users.status}`));

    // 3. Reconciliation
    const recon = await authedGet(adminToken, '/admin/reconciliation');
    const reconOk = recon.status === 200 && (recon.data?.IsSuccess === true || recon.data?.success === true || recon.data?.Data != null);
    results.push(result('Admin Reconciliation API', !!reconOk, `HTTP ${recon.status}`));

    // 4. Notifications (check if BE responds — FE may still mock)
    const notif = await authedGet(adminToken, '/notifications?page=1&pageSize=5');
    const notifOk = notif.status === 200;
    results.push(result('Notifications API (BE available)', notifOk, `HTTP ${notif.status}`));

    // 5. Mangaka Wallet
    const mangakaToken = await login('mangaka1', '12345');
    const wallet = await authedGet(mangakaToken, '/wallets/me');
    const walletOk = wallet.status === 200 && (wallet.data?.Data || wallet.data?.data);
    results.push(result('Wallet API', !!walletOk, `HTTP ${wallet.status}`));

    // 6. Flow 0 - pending assistants endpoint
    const pending = await authedGet(adminToken, '/admin/users/pending');
    const pendingOk = pending.status === 200;
    results.push(result('Admin Pending Users (Onboarding)', pendingOk, `HTTP ${pending.status}`));

    // 7. Assistant login
    const assistantToken = await login('assistant1', '12345');
    results.push(result('Assistant Login', !!assistantToken, 'OK'));

    // 8. Editor login
    const editorToken = await login('editor1', '12345');
    results.push(result('Editor Login', !!editorToken, 'OK'));

    // 9. Board login
    const boardToken = await login('board1', '12345');
    results.push(result('Board Login', !!boardToken, 'OK'));

  } catch (e) {
    results.push(result('Setup', false, e.message));
  }

  // Code-level mock flags
  const fs = await import('fs');
  const path = await import('path');
  const root = path.resolve(import.meta.dirname, '..', 'src', 'features');

  const readMock = (rel) => {
    try {
      const content = fs.readFileSync(path.join(root, rel), 'utf8');
      const m = content.match(/const USE_MOCK\s*=\s*(true|false)/);
      return m ? m[1] : 'n/a';
    } catch {
      return 'missing';
    }
  };

  const mockChecks = [
    ['auth (no USE_MOCK expected)', 'auth/api/auth.api.ts', 'n/a'],
    ['notification.api.ts', 'notifications/api/notification.api.ts', 'false'],
    ['reconciliation.api.ts', 'reconciliation/api/reconciliation.api.ts', 'false'],
    ['wallet.api.ts', 'wallet/api/wallet.api.ts', 'n/a'],
    ['admin.api.ts', 'admin/api/admin.api.ts', 'n/a'],
  ];

  for (const [label, file, expected] of mockChecks) {
    const val = readMock(file);
    let pass = true;
    let detail = `USE_MOCK=${val}`;
    if (expected === 'false' && val === 'true') {
      pass = false;
      detail += ' (expected false)';
    } else if (expected === 'n/a' && val === 'true') {
      pass = false;
      detail += ' (should not mock)';
    }
    results.push(result(`FE Mock Flag: ${label}`, pass, detail));
  }

  console.log('\n=== E2E API CHECK REPORT ===\n');
  let passCount = 0;
  for (const r of results) {
    const status = r.pass ? 'PASS' : 'FAIL';
    if (r.pass) passCount++;
    console.log(`${status} | ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  console.log(`\nTotal: ${passCount}/${results.length} passed\n`);
  process.exit(passCount === results.length ? 0 : 1);
}

main();

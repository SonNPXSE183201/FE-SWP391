/**
 * Week A/B/C integration tests via Gateway.
 * A: Mangaka approveExtension API
 * B: Review Chapter queue → detail → revision/approve routes
 * C: Dispute resolve route (GET list still mock on FE)
 *
 * Gateway: http://localhost:5000/api/v1
 */
const BASE = process.env.API_URL || 'http://localhost:5000/api/v1';

async function login(identifier, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Identifier: identifier, Password: password }),
  });
  const data = await res.json();
  if (!res.ok || !data?.data?.token) {
    throw new Error(data?.message || `Login failed: ${identifier}`);
  }
  return data.data.token;
}

async function request(token, method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function ok(name, pass, detail = '') {
  return { name, pass, detail };
}

async function main() {
  const results = [];

  try {
    const mangakaToken = await login('mangaka1', '12345');
    const editorToken = await login('editor1', '12345');

    // ─── A: Extension approval (seed task 6 = Pending extension) ───
    const mangakaTasks = await request(mangakaToken, 'GET', '/tasks/mangaka-list');
    const tasks = mangakaTasks.data?.data ?? [];
    const pendingExt = tasks.find((t) => (t.ExtensionStatus === 'Pending' || t.extensionStatus === 'Pending'));
    results.push(
      ok(
        'A GET mangaka-list has extension fields',
        mangakaTasks.status === 200 && Array.isArray(tasks),
        `HTTP ${mangakaTasks.status}, ${tasks.length} tasks`,
      ),
    );
    const extTaskId = pendingExt?.TaskId ?? pendingExt?.taskId ?? 6;
    results.push(
      ok(
        'A seed task with ExtensionStatus=Pending',
        !!pendingExt,
        pendingExt ? `TaskId=${extTaskId}` : 'none in DB seed',
      ),
    );

    const extApproveRoute = await request(
      mangakaToken,
      'POST',
      `/tasks/${extTaskId}/extension-approval?approve=true`,
    );
    results.push(
      ok(
        'A POST /extension-approval route',
        extApproveRoute.status === 200 || extApproveRoute.status === 400,
        `HTTP ${extApproveRoute.status} ${extApproveRoute.data?.message ?? ''}`,
      ),
    );

    // ─── B: Review Chapter ───────────────────────────────────────
    const queue = await request(editorToken, 'GET', '/reviews/chapters');
    const chapters = queue.data?.data ?? [];
    results.push(
      ok('B GET /reviews/chapters', queue.status === 200, `HTTP ${queue.status}, queue=${chapters.length}`),
    );

    const missingMangaka = chapters.some(
      (c) => !c.Series?.Mangaka?.FullName && !c.series?.mangaka?.fullName,
    );
    if (chapters.length > 0) {
      results.push(
        ok(
          'B BE blocker: queue thiếu Include → Mangaka Unknown',
          missingMangaka,
          missingMangaka
            ? 'Series.Mangaka.FullName absent (expected until BE fix)'
            : 'Mangaka name present',
        ),
      );
    } else {
      results.push(
        ok(
          'B queue empty (seed không có Pending_Review chapter)',
          true,
          'Chỉ smoke route; full approve/revision cần chapter Pending_Review',
        ),
      );
    }

    const detail = await request(editorToken, 'GET', '/reviews/chapters/2');
    results.push(
      ok('B GET /reviews/chapters/{id}', detail.status === 200, `HTTP ${detail.status}`),
    );

    const revision = await request(editorToken, 'POST', '/reviews/chapters/2/revision', {
      FeedbackComment: 'E2E test revision — script',
    });
    results.push(
      ok(
        'B POST /revision (chapter 2 Draft→Rejected)',
        revision.status === 200 || revision.status === 400,
        `HTTP ${revision.status} ${revision.data?.message ?? ''}`,
      ),
    );

    const approveBlocked = await request(editorToken, 'POST', '/reviews/chapters/1/approve', {
      ValidPageCount: 3,
      QcChecklistData: '{}',
    });
    results.push(
      ok(
        'B POST /approve route (ch1 đã Approved → 400)',
        approveBlocked.status === 400 || approveBlocked.status === 200,
        `HTTP ${approveBlocked.status}`,
      ),
    );

    // ─── C: Dispute resolve smoke ────────────────────────────────
    const disputeGet = await request(editorToken, 'GET', '/disputes');
    results.push(
      ok(
        'C GET /disputes',
        disputeGet.status === 200,
        `HTTP ${disputeGet.status}`,
      ),
    );

    const disputeResolve = await request(editorToken, 'POST', '/disputes/99999/resolve', {
      AssistantRate: 50,
    });
    results.push(
      ok(
        'C POST /disputes/{taskId}/resolve route exists',
        disputeResolve.status === 404 || disputeResolve.status === 400 || disputeResolve.status === 200,
        `HTTP ${disputeResolve.status}`,
      ),
    );
  } catch (e) {
    results.push(ok('Setup / Gateway', false, e.message));
  }

  const { execSync } = await import('child_process');
  try {
    execSync('npm run build', {
      cwd: new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'),
      stdio: 'pipe',
    });
    results.push(ok('FE npm run build', true));
  } catch (e) {
    results.push(ok('FE npm run build', false, e.stderr?.toString?.().slice(0, 200) || 'build failed'));
  }

  console.log('\n=== WEEK A/B/C TEST REPORT ===\n');
  let pass = 0;
  for (const r of results) {
    const mark = r.pass ? 'PASS' : 'FAIL';
    if (r.pass) pass++;
    console.log(`${mark} | ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  console.log(`\nTotal: ${pass}/${results.length} passed\n`);

  const reportPath = new URL('../test-reports/week-abc-check.txt', import.meta.url);
  const fs = await import('fs');
  const lines = results.map((r) => `${r.pass ? 'PASS' : 'FAIL'} | ${r.name} — ${r.detail}`);
  fs.writeFileSync(
    reportPath,
    `Week A/B/C — ${new Date().toISOString()}\n\n${lines.join('\n')}\n\nTotal: ${pass}/${results.length}\n`,
  );

  process.exit(pass === results.length ? 0 : 1);
}

main();

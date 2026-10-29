import { isAdmin } from '@/lib/auth';
import { getContent, getSubmissions } from '@/lib/store';

const csvCell = (v: string) => {
  // Neutralise spreadsheet formulas and quote every cell.
  const s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response('Unauthorised', { status: 401 });
  const type = new URL(req.url).searchParams.get('type');
  const stamp = new Date().toISOString().slice(0, 10);

  if (type === 'submissions') {
    const subs = await getSubmissions();
    const keys = [...new Set(subs.flatMap((s) => Object.keys(s.fields)))];
    const rows = [
      ['date', 'type', 'read', ...keys],
      ...subs.map((s) => [s.createdAt, s.kind, s.read ? 'yes' : 'no', ...keys.map((k) => s.fields[k] || '')]),
    ];
    return new Response('﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inbox-${stamp}.csv"`,
      },
    });
  }

  return new Response(JSON.stringify(await getContent(), null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="site-backup-${stamp}.json"`,
    },
  });
}

import Link from 'next/link';
import { BarList, Kpi, LineChart } from '@/components/admin/Charts';
import { requireAdmin } from '@/lib/auth';
import { ga4Report, hasServiceAccount, searchReport, serviceAccountEmail, type Ga4Data, type SearchData } from '@/lib/google';
import { siteBase } from '@/lib/seo';
import { getContent } from '@/lib/store';

export const metadata = { title: 'Analytics' };

const RANGES = [7, 28, 90];

async function attempt<T>(fn: () => Promise<T>): Promise<{ data?: T; error?: string }> {
  try {
    return { data: await fn() };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not load data.' };
  }
}

export default async function Analytics({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const role = await requireAdmin();
  const sp = await searchParams;
  const days = RANGES.includes(Number(sp.days)) ? Number(sp.days) : 28;
  const { settings: s } = await getContent();
  const tagOk = /^G-[A-Z0-9]{4,20}$/.test(s.ga4MeasurementId);
  const keyOk = hasServiceAccount();
  const gaOk = keyOk && Boolean(s.ga4PropertyId);
  const scOk = keyOk && Boolean(s.gscProperty);
  const base = siteBase(s.siteUrl).toString().replace(/\/$/, '');

  const [ga, sc] = await Promise.all([
    gaOk ? attempt<Ga4Data>(() => ga4Report(s.ga4PropertyId, days)) : Promise.resolve({} as { data?: Ga4Data; error?: string }),
    scOk ? attempt<SearchData>(() => searchReport(s.gscProperty, days)) : Promise.resolve({} as { data?: SearchData; error?: string }),
  ]);

  const steps: [boolean, string, string][] = [
    [tagOk, 'Tracking on the website', 'Create a Google Analytics 4 property, then paste its measurement ID (G-…) in Site settings → Google Analytics & Search Console.'],
    [
      Boolean(s.googleVerification) || Boolean(s.gscProperty),
      'Site verified in Search Console',
      'Add the site in Google Search Console with the “HTML tag” method and paste the code in Site settings → Search & sharing.',
    ],
    [
      keyOk,
      'Dashboard access to Google',
      'In Google Cloud, create a service account, enable the “Google Analytics Data API” and “Search Console API”, create a JSON key, and add its client_email and private_key as GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in Vercel → Environment Variables.',
    ],
    [
      Boolean(s.ga4PropertyId),
      'Analytics property connected',
      `Add ${serviceAccountEmail() || 'the service account email'} as a Viewer in Analytics → Admin → Property access, then paste the numeric property ID in Site settings.`,
    ],
    [
      Boolean(s.gscProperty),
      'Search Console property connected',
      `Add ${serviceAccountEmail() || 'the service account email'} as a user in Search Console → Settings → Users, then paste the property name in Site settings.`,
    ],
  ];
  const doneCount = steps.filter(([ok]) => ok).length;

  return (
    <>
      <div className="a-top">
        <div>
          <h1>Analytics</h1>
          <p>Visitors from Google Analytics and searches from Google Search Console. Data refreshes every 30 minutes.</p>
        </div>
        <nav className="seg" aria-label="Date range">
          {RANGES.map((d) => (
            <Link key={d} href={`/admin/analytics?days=${d}`} className={d === days ? 'on' : ''} aria-current={d === days ? 'true' : undefined}>
              {d} days
            </Link>
          ))}
        </nav>
      </div>

      {doneCount < steps.length ? (
        <div className="card setup">
          <div className="a-top" style={{ marginBottom: 8 }}>
            <h2>Connect Google ({doneCount} of {steps.length} done)</h2>
            {role === 'owner' ? (
              <Link className="btn sm" href="/admin/settings#analytics">
                Open settings
              </Link>
            ) : null}
          </div>
          {role === 'owner' ? (
            <ol className="steps">
              {steps.map(([ok, title, how]) => (
                <li key={title} className={ok ? 'ok' : ''}>
                  <span className="mk" aria-hidden="true">
                    {ok ? '✓' : ''}
                  </span>
                  <div>
                    <b>{title}</b> {ok ? <span className="muted small">Done</span> : <p>{how}</p>}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">The site owner is connecting Google. Reports will appear here once that is done.</p>
          )}
        </div>
      ) : null}

      <section className="an">
        <h2 className="a-h">Website visitors · Google Analytics</h2>
        {ga.error ? <div className="notice">Google Analytics: {ga.error}</div> : null}
        {ga.data ? (
          <>
            <div className="kpis">
              <Kpi label="Visitors" value={ga.data.totals.users} prev={ga.data.totals.prevUsers} />
              <Kpi label="Page views" value={ga.data.totals.views} prev={ga.data.totals.prevViews} />
              <Kpi label="Visits" value={ga.data.totals.sessions} />
              <Kpi label="Avg. time per visitor" value={ga.data.totals.users ? ga.data.totals.engagement / ga.data.totals.users : 0} kind="minutes" />
            </div>
            <div className="grid2 eq">
              <div className="card">
                <h3>Visitors per day</h3>
                <LineChart label="Visitors" points={ga.data.daily.map((d) => ({ date: d.date, value: d.users }))} />
              </div>
              <div className="card">
                <h3>Page views per day</h3>
                <LineChart label="Page views" points={ga.data.daily.map((d) => ({ date: d.date, value: d.views }))} />
              </div>
            </div>
            <div className="grid2 eq">
              <div className="card">
                <h3>Most viewed pages</h3>
                <BarList unit="views" rows={ga.data.pages.map((p) => ({ ...p, href: `${base}${p.label}` }))} />
              </div>
              <div className="card">
                <h3>Where visitors come from</h3>
                <BarList unit="visits" rows={ga.data.channels} />
              </div>
              <div className="card">
                <h3>Devices</h3>
                <BarList unit="visitors" rows={ga.data.devices.map((d) => ({ ...d, label: d.label.charAt(0).toUpperCase() + d.label.slice(1) }))} />
              </div>
              <div className="card">
                <h3>Top cities</h3>
                <BarList unit="visitors" rows={ga.data.cities} />
              </div>
            </div>
          </>
        ) : !ga.error ? (
          <div className="card muted small">Visitor reports appear here after Google Analytics is connected.</div>
        ) : null}
      </section>

      <section className="an">
        <h2 className="a-h">Google Search · Search Console</h2>
        {sc.error ? <div className="notice">Search Console: {sc.error}</div> : null}
        {sc.data ? (
          <>
            <div className="kpis">
              <Kpi label="Clicks from Google" value={sc.data.totals.clicks} />
              <Kpi label="Times shown in Google" value={sc.data.totals.impressions} />
              <Kpi label="Click rate" value={sc.data.totals.ctr} kind="percent" />
              <Kpi label="Average position" value={sc.data.totals.position} kind="position" />
            </div>
            <div className="grid2 eq">
              <div className="card">
                <h3>Clicks per day</h3>
                <LineChart label="Clicks" points={sc.data.daily.map((d) => ({ date: d.date, value: d.clicks }))} />
              </div>
              <div className="card">
                <h3>Times shown per day</h3>
                <LineChart label="Impressions" points={sc.data.daily.map((d) => ({ date: d.date, value: d.impressions }))} />
              </div>
            </div>
            <div className="grid2 eq">
              <div className="card">
                <h3>What people searched</h3>
                {sc.data.queries.length ? (
                  <table className="qt">
                    <thead>
                      <tr>
                        <th>Search</th>
                        <th>Clicks</th>
                        <th>Shown</th>
                        <th>Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sc.data.queries.map((q) => (
                        <tr key={q.keys?.[0]}>
                          <td>{q.keys?.[0]}</td>
                          <td>{q.clicks}</td>
                          <td>{q.impressions}</td>
                          <td>{q.position.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="muted small">No searches recorded for this period yet.</p>
                )}
              </div>
              <div className="card">
                <h3>Pages getting Google clicks</h3>
                <BarList
                  unit="clicks"
                  rows={sc.data.pages.map((p) => ({ label: (p.keys?.[0] || '').replace(/^https?:\/\/[^/]+/, '') || '/', value: p.clicks, href: p.keys?.[0] }))}
                  emptyText="No clicks recorded for this period yet."
                />
              </div>
            </div>
          </>
        ) : !sc.error ? (
          <div className="card muted small">Search reports appear here after Search Console is connected.</div>
        ) : null}
      </section>
    </>
  );
}

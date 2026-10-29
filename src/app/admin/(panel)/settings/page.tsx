import { requireOwner } from '@/lib/auth';
import { SettingsEditor } from '@/components/admin/Editors';
import { getContent } from '@/lib/store';
import { formContext } from '../formctx';

export const metadata = { title: 'Site settings' };

export default async function SettingsPage() {
  await requireOwner();
  const [c, ctx] = await Promise.all([getContent(), formContext()]);
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Site settings</h1>
          <p>Headings, texts, contact details, colours and options used across the whole website.</p>
        </div>
      </div>
      <SettingsEditor initial={{ ...c.settings }} ctx={ctx} />
    </>
  );
}

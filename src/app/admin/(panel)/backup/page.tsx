import { requireManager } from '@/lib/auth';
import { BackupPanel } from '@/components/admin/BackupPanel';

export const metadata = { title: 'Backup & restore' };

export default async function BackupPage() {
  await requireManager();
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Backup & restore</h1>
          <p>Download all website text and lists as one file, or restore from a previous download. Uploaded images are not included; back up the data/uploads folder on the server for those.</p>
        </div>
      </div>
      <BackupPanel />
    </>
  );
}

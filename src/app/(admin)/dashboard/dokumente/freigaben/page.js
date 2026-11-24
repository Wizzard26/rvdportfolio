import { requireAdminPage } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';

// Freigaben sind ein eigener Menüpunkt geworden → alte URL leitet dorthin um.
export default async function LegacyFreigabenRedirect() {
    await requireAdminPage();
    redirect('/dashboard/freigaben');
}

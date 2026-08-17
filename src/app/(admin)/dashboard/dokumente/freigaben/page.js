import { redirect } from 'next/navigation';

// Freigaben sind ein eigener Menüpunkt geworden → alte URL leitet dorthin um.
export default function LegacyFreigabenRedirect() {
    redirect('/dashboard/freigaben');
}

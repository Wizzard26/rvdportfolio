'use client';

import { finishShareAction } from '@/lib/content/sharesActions';

// „Alles heruntergeladen" — schließt den Zugang. Rückfrage gegen versehentliches
// Klicken.
export default function CloseShareButton({ token, className }) {
    return (
        <form
            action={finishShareAction}
            onSubmit={(e) => {
                if (!confirm('Zugang jetzt schließen? Der Link ist danach nicht mehr gültig.')) {
                    e.preventDefault();
                }
            }}
        >
            <input type="hidden" name="token" value={token} />
            <button type="submit" className={className}>Alles heruntergeladen</button>
        </form>
    );
}

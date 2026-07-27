'use client';

// Seitenzahl-Navigation für Admin-Listen (Showcase-Projekte, Galerien …).
export default function AdminPager({ page, totalPages, onChange }) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <div className="an-pager">
            <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Zurück">‹</button>
            {pages.map((p) => (
                <button
                    key={p}
                    type="button"
                    onClick={() => onChange(p)}
                    className={p === page ? 'is-active' : ''}
                    aria-current={p === page ? 'page' : undefined}
                >
                    {p}
                </button>
            ))}
            <button type="button" onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Weiter">›</button>
        </div>
    );
}

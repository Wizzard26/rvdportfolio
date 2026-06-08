'use client'
import dynamic from 'next/dynamic';

// Loaded client-only (ssr: false) because the quote is picked randomly on
// mount, which would otherwise cause a server/client hydration mismatch.
// next/dynamic with ssr:false must live in a Client Component (Next 15+).
const Blockqoutes = dynamic(() => import('@/components/blockqoutes/page'), {
    ssr: false,
    loading: () => <section><div className="content-inner"><blockquote style={{ textAlign: 'center' }}>Loading random quote ...</blockquote></div></section>
})

export default function BlockqoutesClient({ quoteData }) {
    return <Blockqoutes quoteData={quoteData} />;
}

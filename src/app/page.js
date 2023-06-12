import Image from 'next/image'
import styles from './page.module.css'
import Header from "@/app/components/header/page";

export default function Home() {
    return (
        <>
            <Header />
            <main className="main-content">
                <div className="content-inner">
                    Hello Portfolio
                </div>
            </main>
        </>
    )
}

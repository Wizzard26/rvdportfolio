import styles from './styles.module.css';

export default function Pagination({currentPage, totalPages, onPageChange}) {
    const pages = [...Array(totalPages).keys()].map((page) => page +1);

    return (
        <div className={`${styles.pagination} col-12 row`}>

            {currentPage > 1 &&
                <>
                    <button className={styles.btn} onClick={() => onPageChange(1)}>
                        &lsaquo;&lsaquo;
                    </button>
                    <button className={styles.btn} onClick={() => onPageChange(currentPage - 1)}>
                        &lsaquo;
                    </button>
                </>
            }
            <ul className={`${styles.paginationUl} row`}>
                {pages.map((page) => (
                    <li
                        key={page}
                        className={`${styles.paginationUlLi} ${page === currentPage ? styles.active : ""}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </li>
                ))}
            </ul>

            {currentPage < totalPages &&
                <>
                    <button className={styles.btn} onClick={() => onPageChange(currentPage + 1)}>
                        &rsaquo;
                    </button>
                    <button className={styles.btn} onClick={() => onPageChange(totalPages)}>
                        &rsaquo;&rsaquo;
                    </button>
                </>
            }
        </div>
    )
}
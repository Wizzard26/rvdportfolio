'use client';

import { useState, useEffect } from 'react';

export default function DockerStats() {
    const [statuses, setStatuses] = useState([]);

    const fetchStatuses = async () => {
        const response = await fetch('/api/container-stats');
        const data = await response.json();
        setStatuses(data);
    };

    useEffect(() => {
        fetchStatuses(); // Initial fetch
        const interval = setInterval(fetchStatuses, 10000); // Update every 60 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    return (
        <>
            {statuses.map((container, index) => (
                <div key={index} className="col-12 row">
                    <div className="col-8 col-md-8">{container.name}</div>
                    <div className="col-4 col-md-4"><span className={`server-stats server--${container.active}`}></span>{container.status}</div>
                </div>
            ))}
        </>
    );
}

'use client';

import { useEffect, useState } from 'react';

export default function ServerList() {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServerData = async () => {
            try {
                const response = await fetch('/api/servers'); // API Route, die du erstellst

                if (!response.ok) {
                    throw new Error('Network response was not ok API CALL');
                }
                const data = await response.json();

                if (Array.isArray(data)) {
                    setServers(data);
                } else {
                    setServers([]);
                }
            } catch (error) {
                console.error('Error fetching server data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServerData();
    }, []);

    if (loading) {
        return <p>Lade Server Einträge ...</p>;
    }

    if (servers.length === 0) {
        return <p>Keine Daten Gefunden.</p>;
    }

    return (
        <>
            {servers.map((server, index) => (
                <div key={index} className="col-12 row">
                    <div className="col-12 col-md-4">{server.servername}</div>
                    <div className="col-12 col-md-4"><a href={server.url} title={server.servername} target="_blank">{server.url}</a></div>
                    <div className="col-12 col-md-4">
                        {Array.isArray(server.owner) && server.owner.length > 0 ? (
                            server.owner.map((owner, ownerIndex) => (
                                <div key={ownerIndex}>
                                    <div>Vorname: {owner.firstname ? owner.firstname : 'Firstname not provided'}</div>
                                    <div>Nachname: {owner.lastname ? owner.lastname : 'Lastname not provided'}</div>
                                </div>
                            ))
                        ) : (
                            <div>Keine Benutzerdaten Gespeichert</div>
                        )}
                    </div>
                </div>
            ))}
        </>
    );
}

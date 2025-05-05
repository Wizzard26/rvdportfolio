'use client';

import {useEffect, useState} from "react";
export default function Clients() {
    const [clients, setClients] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch('/api/crm/clients');

                if (!response.ok) {
                    throw new Error(`HTTP-Fehler! Status: ${response.status}`);
                }

                const data = await response.json();
                setClients(data);
            } catch (error) {
                setError(error);
            }
        };

        fetchClients();
    }, []);

    console.log(clients);
    return (
        <div>
            <h1>Clients</h1>
            <ul>

                {clients.map((client) => (
                    <li key={client.id}>
                        {client.company_name} - {client.primary_contact}<br />
                        {client.address} - {client.city}
                    </li>
                ))}
            </ul>
        </div>
    )
}
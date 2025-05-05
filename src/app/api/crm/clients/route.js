import { NextResponse }  from "next/server";

export async function GET() {
    const authToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyIjoic3VwcG9ydEBnYW1iaXQyNC5kZSIsIm5hbWUiOiJzdXBwb3J0IiwiQVBJX1RJTUUiOjE3MzIxMDU0ODB9.31cvZpWWmnbAm4ov-98mDMKmG87xzLSEhJD5nMSacBXkgWxX01zyHG58M1ah9J34sKZbo38zQzMmJyZbahDCMQ';

    try {
        const response = await fetch('https://kunden.gambit24.de/index.php/api/clients', {
            method: 'GET',
            headers: {
                'authtoken': authToken,
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching clients:', error);

    }
}
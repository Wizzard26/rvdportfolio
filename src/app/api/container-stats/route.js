// app/api/container-status/route.js
import { NextResponse } from 'next/server';

async function fetchContainerStatus(name, url) {
    try {
        const response = await fetch(url);
        return { name, status: response.ok ? 'Run' : 'Down', active: response.ok ? 'active' : 'not-active' };
    } catch (error) {
        return { name, status: 'Offline', active: 'offline' };
    }
}

export async function GET() {
    const containerList = [
        {
            name: 'Next.rene-van-dinter.de',
            url: 'https://next.rene-van-dinter.de'
        },
        {
            name: 'rene-van-dinter.de',
            url: 'https://rene-van-dinter.de'
        },
        {
            name: 'Gambit24.de',
            url: 'https://gambit24.de'
        },
        {
            name: 'Wizzard26.de',
            url: 'https://wizzard26.de'
        },
        {
            name: 'City',
            url: 'http://citybabes.de/'
        },
        {
            name: 'Shopware 6.5 Demo',
            url: 'https://shopware65.rene-van-dinter.de'
        }
    ];

    const statuses = await Promise.all(
        containerList.map(container => fetchContainerStatus(container.name, container.url))
    );

    return NextResponse.json(statuses);
}

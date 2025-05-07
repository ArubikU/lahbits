import { authHeaders } from '@/lib/api-auth';
import { addDevice } from '@/lib/db';
import { sendNotifications } from '@/lib/notifications';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const user = await authHeaders(request)
    if (user) {
        sendNotifications();
        return Response.json({ success: true });
    }
    const authHeadere = request.headers.get('authorization');


    if (authHeadere !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }
    sendNotifications();


    return Response.json({ success: true });
}
export async function POST(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }
    const { device_id } = await request.json()
    if (!device_id) {
        return new Response('Bad Request', {
            status: 400,
        });
    }
    const result = await addDevice(user.id, device_id)
    if (!result.success) {
        return new Response('Internal Server Error', {
            status: 500,
        });
    }
    return Response.json({ success: true });
}
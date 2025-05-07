import { Task, UserDevice } from '@/types';
import axios from 'axios';
import { getAllNotiUserIds, getDevicesByUserId, getUserTasks } from './db';

    const oneSignalAppId = process.env.ONESIGNAL_APP_ID;  // Tu App ID de OneSignal
    const oneSignalApiKey = process.env.ONESIGNAL_API_KEY;  // Tu API Key de OneSignal

// Función para calcular el tiempo restante hasta la fecha límite de la tarea
function calculateTimeRemaining(taskDueDate: string) {
    const now = new Date()
    const dueDate = new Date(taskDueDate)
    const timeRemaining = new Date(now.getTime() - dueDate.getTime()).getTime()
    const hours = Math.floor(timeRemaining / 1000 / 60 / 60)
    const minutes = Math.floor((timeRemaining / 1000 / 60) % 60)
    const seconds = Math.floor((timeRemaining / 1000) % 60)
    return {
        timeRemaining,
        hours: Math.floor(timeRemaining / 1000 / 60 / 60),
        minutes: Math.floor((timeRemaining / 1000 / 60) % 60),
        seconds: Math.floor((timeRemaining / 1000) % 60),
    }
}




async function sendTaskReminder(userId: string) {

    //const user = await getUserById(userId) as User
    const devices = await getDevicesByUserId(userId) as UserDevice[]

    const pendingTasks = await getUserTasks(userId, false) as Task[]

    if (pendingTasks.length > 0) {
        let es = `Tienes ${pendingTasks.length} tareas pendientes`
        let en = `You have ${pendingTasks.length} pending tasks`

        axios.post('https://onesignal.com/api/v1/notifications', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Key ${oneSignalApiKey}`,
            },
            body: {
                app_id: oneSignalAppId,
                contents: { en, es },
                include_player_ids: devices.map(device => device.device_id),
            }
        });

    }

}

async function nearToExpiration(userId: string) {
    const devices = await getDevicesByUserId(userId) as UserDevice[];
    const tasks = await getUserTasks(userId, false) as Task[];

    const tasksNearExpiration = tasks.filter(task => {
        if (!task.deadline) return false; // Skip tasks without a deadline
        const { hours } = calculateTimeRemaining(task.deadline!.toDateString());
        return hours <= 24 && hours > 13; // Tasks expiring within the next 24 hours
    });

    if (tasksNearExpiration.length > 0) {
        for (const task of tasksNearExpiration) {
            let timeRemaining = calculateTimeRemaining(task.deadline!.toDateString())
            let en = `The task "${task.title}" is about to expire, ${timeRemaining.hours} hours and ${timeRemaining.minutes} minutes remaining`;
            let es = `La tarea "${task.title}" está a punto de vencer, ${timeRemaining.hours} horas y ${timeRemaining.minutes} minutos restantes`;

            await axios.post('https://onesignal.com/api/v1/notifications', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Key ${oneSignalApiKey}`,
                },
                body: {
                    app_id: oneSignalAppId,
                    contents: { en, es },
                    include_player_ids: devices.map(device => device.device_id),
                    idempotency_key: uuid4fromString(`${task.id}-${task.user_id}-24h`), // Unique key for idempotency
                }
            });
        }
    }

    const tasksNearExpiration2 = tasks.filter(task => {
        if (!task.deadline) return false; // Skip tasks without a deadline
        const { hours } = calculateTimeRemaining(task.deadline!.toDateString());
        return hours <= 12 && hours > 7; // Tasks expiring within the next 12 hours
    }
    
        );  
    if (tasksNearExpiration2.length > 0) {
        for (const task of tasksNearExpiration2) {
            let timeRemaining = calculateTimeRemaining(task.deadline!.toDateString())
            let en = `The task "${task.title}" is about to expire, ${timeRemaining.hours} hours and ${timeRemaining.minutes} minutes remaining`;
            let es = `La tarea "${task.title}" está a punto de vencer, ${timeRemaining.hours} horas y ${timeRemaining.minutes} minutos restantes`;

            await axios.post('https://onesignal.com/api/v1/notifications', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Key ${oneSignalApiKey}`,
                },
                body: {
                    app_id: oneSignalAppId,
                    contents: { en, es },
                    include_player_ids: devices.map(device => device.device_id),
                    idempotency_key: uuid4fromString(`${task.id}-${task.user_id}-12h`), // Unique key for idempotency
                }
            });
        }
    }
    const tasksNearExpiration3 = tasks.filter(task => {
        if (!task.deadline) return false; // Skip tasks without a deadline
        const { hours,minutes } = calculateTimeRemaining(task.deadline!.toDateString());
        return hours <= 7 && minutes > 30;
    }
        
            );  
    if (tasksNearExpiration3.length > 0) {
        for (const task of tasksNearExpiration3) {

            let timeRemaining = calculateTimeRemaining(task.deadline!.toDateString())
            let en = `The task "${task.title}" is about to expire, ${timeRemaining.hours} hours and ${timeRemaining.minutes} minutes remaining`;
            let es = `La tarea "${task.title}" está a punto de vencer, ${timeRemaining.hours} horas y ${timeRemaining.minutes} minutos restantes`;

            await axios.post('https://onesignal.com/api/v1/notifications', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Key ${oneSignalApiKey}`,
                },
                body: {
                    app_id: oneSignalAppId,
                    contents: { en, es },
                    include_player_ids: devices.map(device => device.device_id),
                    idempotency_key: uuid4fromString(`${task.id}-${task.user_id}-7h`), // Unique key for idempotency
                }
            });
        }
    }

    const tasksNearExpiration4 = tasks.filter(task => {
        if (!task.deadline) return false; // Skip tasks without a deadline
        const { hours,minutes } = calculateTimeRemaining(task.deadline!.toDateString());
        return minutes <= 15;
    }
        
            );

    if (tasksNearExpiration4.length > 0) {
        for (const task of tasksNearExpiration4) {
            let timeRemaining = calculateTimeRemaining(task.deadline!.toDateString())
            let en = `The task "${task.title}" is about to expire,${timeRemaining.minutes} minutes remaining`;
            let es = `La tarea "${task.title}" está a punto de vencer,${timeRemaining.minutes} minutos restantes`;

            await axios.post('https://onesignal.com/api/v1/notifications', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Key ${oneSignalApiKey}`,
                },
                body: {
                    app_id: oneSignalAppId,
                    contents: { en, es },
                    include_player_ids: devices.map(device => device.device_id),
                    idempotency_key: uuid4fromString(`${task.id}-${task.user_id}-15m`), // Unique key for idempotency
                }
            });
        }
    }


    const expired = tasks.filter(task => {
        if (!task.deadline) return false; // Skip tasks without a deadline
        const { hours } = calculateTimeRemaining(task.deadline!.toDateString());
        return hours <= 0 && hours > -1; // Tasks that have expired
    });
    if (expired.length > 0) {
        for (const task of expired) {
            let timeRemaining = calculateTimeRemaining(task.deadline!.toDateString())
            let en = `The task "${task.title}" has expired, ${timeRemaining.minutes} minutes ago`;
            let es = `La tarea "${task.title}" ha vencido, ${timeRemaining.minutes} minutos atrás`;

            await axios.post('https://onesignal.com/api/v1/notifications', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Key ${oneSignalApiKey}`,
                },
                body: {
                    app_id: oneSignalAppId,
                    contents: { en, es },
                    include_player_ids: devices.map(device => device.device_id),
                    idempotency_key: uuid4fromString(`${task.id}-${task.user_id}-expired`), // Unique key for idempotency
                }
            });
        }
    }
}

function uuid4fromString(str: string) {
    const hex = str.replace(/-/g, '')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export async function sendNotifications() {
    const users = await getAllNotiUserIds()
    for (const user of users) {
        await sendTaskReminder(user.id)
        await nearToExpiration(user.id)
    }
    return { success: true }
}
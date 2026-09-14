export const API_URL = 'http://192.168.18.148:8082/fatec/login/v1';

import { User } from '@/@types/user';
import { Auth } from '@/@types/auth';
import { Login } from '@/@types/login';
import { Message } from '@/@types/message';

let onSessionExpired: (() => void) | null = null;

export function registerSessionExpiredHandler(handler: () => void) {
    onSessionExpired = handler;
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || `Erro na requisição (${response.status})`);
    }
    return response.json();
}

async function handleAuthenticatedResponse<T>(response: Response): Promise<T> {
    if (response.status === 401 || response.status === 403) {
        onSessionExpired?.();
    }

    return handleResponse<T>(response);
}

export async function createUser(payload: User): Promise<Auth> {
    const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    return handleResponse<Auth>(response);
}

export async function login(payload: Login): Promise<Auth> {
    const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    return handleResponse<Auth>(response);
}

export async function logout(): Promise<void> {
    const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Erro na requisição (${response.status})`);
    }
}

export async function getMessage(): Promise<Message> {
    const response = await fetch(`${API_URL}/message`, {
        method: 'GET',
        credentials: 'include',
    });

    return handleAuthenticatedResponse<Message>(response);
}

export async function getMessageAdmin(): Promise<Message> {
    const response = await fetch(`${API_URL}/message/admin`, {
        method: 'GET',
        credentials: 'include',
    });

    return handleAuthenticatedResponse<Message>(response);
}
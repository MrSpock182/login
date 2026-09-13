export const API_URL = 'http://localhost:8082/fatec/login/v1';

import { User } from '@/@types/user';
import { Auth } from '@/@types/auth';
import { Login } from '@/@types/login';
import { Message } from '@/@types/message';

import * as authMock from './authMock';
import { notifySessionExpired } from './sessionExpired';

export { registerSessionExpiredHandler } from './sessionExpired';

// Enquanto a integração real não estiver disponível, o mock definido em
// ./mocks/authMock.json responde no lugar do backend. Para voltar a usar o
// backend real, basta definir "enabled": false naquele arquivo.
const USE_MOCK = authMock.MOCK_ENABLED;

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || `Erro na requisição (${response.status})`);
    }
    return response.json();
}

async function handleAuthenticatedResponse<T>(response: Response): Promise<T> {
    if (response.status === 401 || response.status === 403) {
        notifySessionExpired();
    }

    return handleResponse<T>(response);
}

export async function createUser(payload: User): Promise<Auth> {
    if (USE_MOCK) {
        return authMock.createUser(payload);
    }

    const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    return handleResponse<Auth>(response);
}

export async function login(payload: Login): Promise<Auth> {
    if (USE_MOCK) {
        return authMock.login(payload);
    }

    const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    return handleResponse<Auth>(response);
}

export async function logout(): Promise<void> {
    if (USE_MOCK) {
        return authMock.logout();
    }

    const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Erro na requisição (${response.status})`);
    }
}

export async function getMessage(): Promise<Message> {
    if (USE_MOCK) {
        return authMock.getMessage();
    }

    const response = await fetch(`${API_URL}/message`, {
        method: 'GET',
        credentials: 'include',
    });

    return handleAuthenticatedResponse<Message>(response);
}

export async function getMessageAdmin(): Promise<Message> {
    if (USE_MOCK) {
        return authMock.getMessageAdmin();
    }

    const response = await fetch(`${API_URL}/message/admin`, {
        method: 'GET',
        credentials: 'include',
    });

    return handleAuthenticatedResponse<Message>(response);
}

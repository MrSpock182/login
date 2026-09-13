import { Auth } from '@/@types/auth';
import { Login } from '@/@types/login';
import { Message } from '@/@types/message';
import { User } from '@/@types/user';

import { notifySessionExpired } from './sessionExpired';
import mockData from './mocks/authMock.json';

type MockUser = {
    userId: string;
    username: string;
    password: string;
    email: string;
    cep: string;
    roles: string[];
};

export const MOCK_ENABLED: boolean = mockData.enabled;

// "banco de dados" em memória, semeado a partir do arquivo .json
const users: MockUser[] = mockData.users.map((user) => ({ ...user }));

// substitui o cookie de sessão da integração real
let session: Auth | null = null;

function sleep(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, mockData.latencyMs));
}

function isAdmin(roles: string[]): boolean {
    return roles.some((role) => role.toUpperCase().includes('ADMIN'));
}

function toAuth(user: MockUser): Auth {
    return { userId: user.userId, username: user.username, roles: [...user.roles] };
}

export async function createUser(payload: User): Promise<Auth> {
    await sleep();

    if (users.some((user) => user.username === payload.username)) {
        throw new Error(mockData.errors.userExists);
    }

    const user: MockUser = {
        userId: String(users.length + 1),
        username: payload.username,
        password: payload.password,
        email: payload.email,
        cep: payload.cep,
        roles: ['ROLE_USER'],
    };

    users.push(user);
    session = toAuth(user);

    return toAuth(user);
}

export async function login(payload: Login): Promise<Auth> {
    await sleep();

    const user = users.find(
        (candidate) =>
            candidate.username === payload.username && candidate.password === payload.password,
    );

    if (!user) {
        throw new Error(mockData.errors.invalidCredentials);
    }

    session = toAuth(user);

    return toAuth(user);
}

export async function logout(): Promise<void> {
    await sleep();
    session = null;
}

export async function getMessage(): Promise<Message> {
    await sleep();

    if (!session) {
        notifySessionExpired();
        throw new Error(mockData.errors.sessionExpired);
    }

    return { message: mockData.messages.user };
}

export async function getMessageAdmin(): Promise<Message> {
    await sleep();

    if (!session) {
        notifySessionExpired();
        throw new Error(mockData.errors.sessionExpired);
    }

    if (!isAdmin(session.roles)) {
        throw new Error(mockData.errors.adminOnly);
    }

    return { message: mockData.messages.admin };
}

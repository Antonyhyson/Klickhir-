// src/lib/stores/authStore.ts
import { writable, type Writable } from 'svelte/store';

export type User = {
    id: string;
    name: string;
    role: 'client' | 'photographer';
    token: string | null; // Bearer token for API calls
    email: string;
} | null; // User can be null if not logged in

export const user: Writable<User> = writable(null);

export function isLoggedIn(): boolean {
    let $user: User;
    user.subscribe(value => { $user = value; })();
    return !!$user;
}

export function isClient(): boolean {
    let $user: User;
    user.subscribe(value => { $user = value; })();
    return $user !== null && $user.role === 'client';
}

export function isPhotographer(): boolean {
    let $user: User;
    user.subscribe(value => { $user = value; })();
    return $user !== null && $user.role === 'photographer';
}

export function logout(): void {
    user.set(null);
    // In a real app, clear relevant cookies/local storage here
}
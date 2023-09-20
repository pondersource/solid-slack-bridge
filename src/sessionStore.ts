import { Session, getSessionFromStorage } from "@inrupt/solid-client-authn-node";
import type { IStorage } from "@inrupt/solid-client-authn-core";
import { InMemoryStorage } from "@inrupt/solid-client-authn-core";
import type { ISessionInfo } from "@inrupt/solid-client-authn-core";

export class SessionStore {
    private sessions: Record<string, Session> = {};

    saveSession(slackUUID: string, session: Session) {
        this.sessions[slackUUID] = session;
    }

    async getSession(slackUUID: string) {
        return this.sessions[slackUUID];
    }

}
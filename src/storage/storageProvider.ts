import type { IStorage } from "@inrupt/solid-client-authn-core";
import { InMemoryStorage } from "@inrupt/solid-client-authn-core";
import type { ISessionInfo } from "@inrupt/solid-client-authn-core";
import { logger } from "../utils/logger";

export class StorageProvider {
    private sessionIds: Record<string, string> = {};

    // TODO InMemoryStorage must be replaced by DatabaseStorage after everything else works.
    private storages: Record<string, InMemoryStorage> = {};

    saveSession(slackUUID: string, sessionInfo: ISessionInfo) {
        this.sessionIds[slackUUID] = sessionInfo.sessionId;

        if (!this.storages[slackUUID]) {
            this.storages[slackUUID] = new InMemoryStorage();
        }

        this.storages[slackUUID].set('issuer', 'https://solidcommunity.net');

        // Inspiration for these lines taken from: https://github.com/inrupt/solid-client-authn-js/blob/2eea2529a95deaaf345051d4b3b5dc6a9650c41b/packages/node/src/sessionInfo/SessionInfoManager.ts#L47
        if (sessionInfo.webId) {
            logger.info('WEBID', sessionInfo.webId);
            this.storages[slackUUID].set('webId', sessionInfo.webId);
        }

        this.storages[slackUUID].set('isLoggedIn', sessionInfo.isLoggedIn ? 'true' : 'false');
    }

    getSessionId(slackUUID: string): string {
        return this.sessionIds[slackUUID];
    }

    getStorage(slackUUID: string): IStorage {
        if (!this.storages[slackUUID]) {
            logger.info('CREATED STORAGEEEEEEEEEEEEEEEEEEEEEEEEEE')
            this.storages[slackUUID] = new InMemoryStorage();
        }

        return this.storages[slackUUID];
    }

}
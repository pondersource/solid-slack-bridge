import { ExpressReceiver } from "@slack/bolt";
import { expressApp } from "./express";
import express, { NextFunction, Request, Response } from "express"
const cookieSession = require("cookie-session");
import { BASE_URL } from "./config/default";
import { Session, getSessionFromStorage, getSessionIdFromStorageAll } from "@inrupt/solid-client-authn-node";
import { sharedSessions } from "./sharedSessions";


export const expressReceiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    customPropertiesExtractor(req) {
        // console.log("req.session?.sessionId", req.session?.sessionId);
        return {
            // "headers": req.headers,
            "req": req,
            // sessionId: req.session?.sessionId,
        };
    },
    // app: expressApp
});

expressReceiver.app.use(express.json())
expressReceiver.app.use(
    cookieSession({
        name: "session",
        // These keys are required by cookie-session to sign the cookies.
        keys: [
            "Required, but value not relevant for this demo - key1",
            "Required, but value not relevant for this demo - key2",
        ],
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })
);

expressReceiver.app.get("/", async (req: Request, res: Response, next: NextFunction) => {
    const sessionIds = await getSessionIdFromStorageAll();
    for (const sessionId in sessionIds) {
        // Do something with the session ID...
    }
    res.send(
        `<p>There are currently [${sessionIds.length}] visitors.</p>`
    );
});

expressReceiver.app.get("/login", async (req: Request, res: Response) => {
    const session = new Session();

    if (req.session) req.session.sessionId = session.info.sessionId;

    await session.login({
        // oidcIssuer: "https://solidcommunity.net/",
        oidcIssuer: "https://login.inrupt.com",
        redirectUrl: `${BASE_URL}/login/callback`,
        // redirectUrl: `https://app.slack.com/client/T03E34GGWE5/D05SELC7KGV`,
        clientName: "Demo app",
        handleRedirect: (url: any) => res.redirect(url),
    });
});


expressReceiver.app.get("/login/callback", async (req: Request, res: Response) => {
    const session = await getSessionFromStorage(req.session?.sessionId);

    await session?.handleIncomingRedirect(`${BASE_URL}${req.url}`);

    if (session?.info.webId) {
        sharedSessions["BOT_USER"] = session
        // sharedSessions[session?.info.webId] = session
    }

    if (session?.info.isLoggedIn) {
        // (req as any).webId = "webId"
        return res.redirect(`https://app.slack.com/client/T03E34GGWE5/D05SELC7KGV`);
        // return res.send(`<p>Logged in with the WebID ${session.info.webId}.</p>`)

    }
});

expressReceiver.app.get("/logout", async (req: Request, res: Response, next: NextFunction) => {
    const session = await getSessionFromStorage(req.session?.sessionId);
    session?.logout();
    sharedSessions["BOT_USER"] = undefined

    res.send(`<p>Logged out.</p>`);
});

expressReceiver.app.post('/write-to-pod', async (req, res) => {
    const session = await getSessionFromStorage(req.session?.sessionId);

    if (session?.info.isLoggedIn) {
        const msgBody = req.body

        return res.send({
            webID: session.info.webId,
            data: msgBody
        })
        // return res.send(msgBody)
    }

    res.send("Login First")


    // const session = await getSessionFromStorage(req.session?.sessionId);

    // if (session.info.isLoggedIn) {
    //   return res.send({ webId: session.info.webId })
    // }
});

export const expressRouter = expressReceiver.router
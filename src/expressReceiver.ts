import { ExpressReceiver } from "@slack/bolt";
import { expressApp } from "./express";
import express, { NextFunction, Request, Response } from "express"


export const expressReceiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    customPropertiesExtractor(req) {
        console.log("req.session?.sessionId", req.session?.sessionId);

        return {
            // "headers": req.headers,
            sessionId: req.session?.sessionId,
        };
    },
    // app: expressApp
});

expressReceiver.app.use(express.json())

expressReceiver.router.post('/post', async (req, res) => {
    const msgBody = req.body
    console.log("expressReceiver:msgBody", msgBody);
    res.send(msgBody)
});

export const expressRouter = expressReceiver.router
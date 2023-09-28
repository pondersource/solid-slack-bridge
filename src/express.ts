import express, { NextFunction, Request, Response } from "express";
import { SERVER_BASE_URL, SLACK_DOMAIN, CLIENT_ID, CLIENT_SECRET } from "./config/default";
import { sessionStore } from "./sharedSessions";
import axios from "axios";

const cookieSession = require("cookie-session");
const {
  getSessionFromStorage,
  getSessionIdFromStorageAll,
  Session,
} = require("@inrupt/solid-client-authn-node");

const app = express();

app.use(express.json());

app.use(
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

app.get("/", async (req: Request, res: Response) => {
  res.send(
    '<h1>Solid Slack Bridge</h1><br/>' +
    '<p>A bridge that provides a one way sync from Slack to Solid chat.</p><br/>' +
    '<a href="https://slack.com/oauth/v2/authorize?scope=channels%3Ahistory%2Cchannels%3Ajoin%2Cchannels%3Aread%2Cchat%3Awrite%2Ccommands%2Cgroups%3Aread%2Cim%3Ahistory%2Cim%3Aread%2Cim%3Awrite%2Cmpim%3Ahistory%2Cmpim%3Aread%2Cmpim%3Awrite%2Cmpim%3Awrite.invites%2Cusers.profile%3Aread%2Cusers%3Aread%2Cteam%3Aread&amp;user_scope=channels%3Ahistory%2Cchannels%3Aread%2Cgroups%3Ahistory%2Cgroups%3Aread%2Cim%3Ahistory%2Cim%3Aread%2Cmpim%3Ahistory%2Cmpim%3Aread%2Cusers.profile%3Aread%2Cusers%3Aread%2Cteam%3Aread&amp;' +
    'redirect_uri=' + SERVER_BASE_URL + 'oauth' +
    '&amp;client_id=' + CLIENT_ID +
    '" style="align-items:center;color:#fff;background-color:#4A154B;border:0;border-radius:4px;display:inline-flex;font-family:Lato, sans-serif;font-size:18px;font-weight:600;height:56px;justify-content:center;text-decoration:none;width:276px"><svg xmlns="http://www.w3.org/2000/svg" style="height:24px;width:24px;margin-right:12px" viewBox="0 0 122.8 122.8"><path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a"></path><path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0"></path><path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d"></path><path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e"></path></svg>Add to Slack</a>'
    );
});

app.get("/oauth", async (req: Request, res: Response) => {
  const temporaryCode: string = req.query.code as string;

  const formData = new FormData();
  formData.append('client_id', CLIENT_ID ? CLIENT_ID : '');
  formData.append('client_secret', CLIENT_SECRET ? CLIENT_SECRET : '');
  formData.append('code', temporaryCode);

  const response = await axios.post('https://slack.com/api/oauth.v2.access', formData);
  /*
  {
    ok: true,
    app_id: 'A05UNC844KB',
    authed_user: {
      id: 'U05SASLR9FH',
      scope: 'channels:history,groups:history,im:history,mpim:history,channels:read,groups:read,im:read,mpim:read,team:read,users:read,users.profile:read',
      access_token: 'xoxp-5922077426609-5894904859527-5951868855415-7402122b8c9ff44b069dd26a3fcaacd7',
      token_type: 'user'
    },
    scope: 'channels:history,channels:join,channels:read,chat:write,commands,groups:read,im:history,im:read,im:write,mpim:history,mpim:read,mpim:write,mpim:write.invites,users.profile:read,users:read,team:read',
    token_type: 'bot',
    access_token: 'xoxb-5922077426609-5963479626357-l9pAmzap7PDTkVD0hQ3uBUUJ',
    bot_user_id: 'U05UBE3JEAH',
    team: { id: 'T05T429CJHX', name: 'Test workspace' },
    enterprise: null,
    is_enterprise_install: false
  }
  */

  const slackUUID = response.data.authed_user.id; // This is not needed
  const workspace = response.data.team.id;
  const botToken = response.data.access_token; // SLACK_APP_TOKEN
  const userToken = response.data.authed_user.access_token; // SLACK_BOT_USER_TOKEN

  console.log('tokens', workspace, botToken, userToken);

  // TODO Save tokens for this workspace in memory.

  return res.send('<p>You\'re all set up. Enjoy the bridge! :-)</p>');
});

app.get("/login", async (req: Request, res: Response) => {
  const session = new Session();
  const slackUUID = req.query.slackUUID as string;
  const loginURL = req.query.loginURL as string;

  if (req.session) req.session.sessionId = session.info.sessionId;

  await session.login({
    oidcIssuer: loginURL ?? "https://login.inrupt.com", // "https://solidcommunity.net" "https://login.inrupt.com"
    redirectUrl: `${SERVER_BASE_URL}/login/callback?slackUUID=${slackUUID}`,
    clientName: "Solid Slack Bridge",
    handleRedirect: (url: any) => res.redirect(url),
  });
});

app.get("/login/callback", async (req: Request, res: Response) => {
  const session = await getSessionFromStorage(req.session?.sessionId);

  await session?.handleIncomingRedirect(`${SERVER_BASE_URL}${req.url}`);

  if (session?.info.webId && session?.info.isLoggedIn) {
    const slackUUID = req.query.slackUUID as string;
    sessionStore.saveSession(slackUUID, session);
    return res.redirect(SLACK_DOMAIN);
  }
});

app.get("/logout", async (req: Request, res: Response, next: NextFunction) => {
  const slackUUID = req.query.slackUUID as string;
  const session = await getSessionFromStorage(req.session?.sessionId);
  session?.logout();
  sessionStore.removeSession(slackUUID);
  return res.redirect(SLACK_DOMAIN);

});

export const expressApp = app;

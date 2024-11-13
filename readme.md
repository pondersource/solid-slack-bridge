# Solid Slack Bridge
A bridge that provides a one way sync from Slack to Solid chat.

Demo video:

[![Alt text](https://img.youtube.com/vi/Pd5joZkr5S4/hqdefault.jpg)](https://www.youtube.com/watch?v=Pd5joZkr5S4)

## How to use it
Simply add the bot to your Slack workspace and all of your conversations including direct and channel messages will be added to the Solid pods of all the users that have logged in into their Solid accounts.

If a message is sent by a user who has not provided a Solid session, their message will still show up in the pods of the users with a session. Users without a session have the option to set the link to their Solid webID as their Slack profile status. This will help link their messages to their Solid identity.

In order to log in into their Solid accounts, the users need to type `/solid-login` in any of the workspace conversations. The bridge bot will reply with a log in link which they can follow to give the bot access to their Solid pod. From that moment on, the bot will silently forward every Slack message to respective chats in that user's pod.

## How it works
The server listens to 2 separate ports. One of them provides the login endpoint to retrieve the solid session. The other one utilize Slack's Bolt JS library to setup a bot and listen to new Slack message events.

After each Solid session is created, they are stored in a mapping from the user's Slack identifier to their Solid sessions.

On every new message event, first, the maker of that message is extracted. We either have a session for this Slack user, or they have set their Slack status to their webId or we'll just use a link to their profile on Slack. Then, the members of that Slack conversation are retrieved. For each member that has a Solid session, we add the message to their chat on their pod. If a chat does not already exist, we create it.

## How to run it yourself
1. Pick a domain to run the server on
2. Open https://slack.com/ and sign in
3. Open https://api.slack.com/
4. On the top right corner: Your apps > Manage your apps
5. Click "Create new app"
6. Select "From an app manifest" and click Next
7. Select a workspace for development and click Next
8. Copy the app manifest below and paste it into the YAML box and click next. Do not forget to replce the `BASE_URL` in the manifest with your domain and port (see [known issue with YAML syntax](https://github.com/pondersource/solid-slack-bridge/issues/6))
```yaml
display_information:
  name: Solid Slack Bridge
features:
  bot_user:
    display_name: Solid Slack Bridge
    always_online: false
  slash_commands:
    - command: /solid-login
      description: Login to your Solid IDP
      should_escape: false
oauth_config:
  scopes:
    user:
      - channels:history
      - channels:read
      - groups:history
      - groups:read
      - im:history
      - im:read
      - mpim:history
      - mpim:read
      - users.profile:read
      - users:read
      - team:read
    bot:
      - channels:history
      - channels:join
      - channels:read
      - chat:write
      - commands
      - groups:read
      - im:history
      - im:read
      - im:write
      - mpim:history
      - mpim:read
      - mpim:write
      - mpim:write.invites
      - users.profile:read
      - users:read
      - team:read
settings:
  event_subscriptions:
    request_url: <BASE_URL>/slack/events
    user_events:
      - message.channels
      - message.groups
      - message.im
      - message.mpim
    bot_events:
      - message.im
      - message.mpim
  interactivity:
    is_enabled: true
  org_deploy_enabled: false
  socket_mode_enabled: true
  token_rotation_enabled: false
```
9. Click "Create"
10. In the "Install your app" section click "Install to Workspace"
11. Under the "Basic Information" tab look for "App-Level Tokens" and click "Generate Token and Scopes"
12. Pick any name for your token and Add the `connections:write` to the scopes and click "Generate"
13. Make a copy of the `.env.example` file and name it `.env`. Fill it as follows:
```
PORT={the port number for bot connections to Slack}
SERVER_PORT={the port for the server that will host the Solid login pages}
SERVER_BASE_URL={your domain address}
BASE_URL={your domain address}
SLACK_SIGNING_SECRET={Basic Information > App Credentials > Signing Secret}
SLACK_BOT_USER_TOKEN={Oauth & Permissions > Bot User OAuth Token}
SLACK_APP_TOKEN={Basic Information > App-Level Tokens > Token}
```
14. Under the root folder of the project call `docker build --tag ssb .`
15. Call `docker run ssb` to start the server
16. You are all set up. Happy bridging :-)

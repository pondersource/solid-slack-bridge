- create an app in slack (from scratch)
- basic info -> App Creds -> signing Secret
- oAuth -> install app to get token -> bot user OAuth Token 
- oAuth -> Scopes -> Bot Token Scopes
    - chat:write
- Event Subs => Enable -> Request URL /slack/events
- Event Subs => Sub to bot events 'message:im'
- App Home -> Allow user to send slash commands and ...

```yaml
display_information:
  name: test app
features:
  bot_user:
    display_name: test app
    always_online: false
oauth_config:
  scopes:
    user:
      - channels:history
      - groups:history
      - im:history
      - mpim:history
      - channels:read
      - groups:read
      - im:read
      - mpim:read
    bot:
      - channels:history
      - channels:join
      - channels:read
      - chat:write
      - im:history
      - im:read
      - im:write
      - mpim:history
      - mpim:read
      - mpim:write
      - mpim:write.invites
      - groups:read
settings:
  event_subscriptions:
    request_url: https://8000-pondersourc-solidslackb-19lrfyhegf9.ws-eu104.gitpod.io/slack/events
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
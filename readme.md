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
  name: solidify_1
features:
  bot_user:
    display_name: solidify_1
    always_online: false
oauth_config:
  scopes:
    bot:
      - chat:write
      - im:history
      - chat:write.public
settings:
  event_subscriptions:
    request_url: https://guiding-bull-tidy.ngrok-free.app/slack/events
    bot_events:
      - app_home_opened
      - message.im
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
```
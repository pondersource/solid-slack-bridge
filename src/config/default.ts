import 'dotenv/config'

export const PORT = +(process.env.PORT || 8000)
export const SERVER_PORT = +(process.env.SERVER_PORT || 8000)

export const SERVER_BASE_URL = process.env.SERVER_BASE_URL
export const BASE_URL = process.env.BASE_URL

export const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET
export const SLACK_BOT_USER_TOKEN = process.env.SLACK_BOT_USER_TOKEN

export const SLACK_DOMAIN = process.env.SLACK_DOMAIN ?? "https://pypracts.slack.com"

export const CLIENT_ID = process.env.CLIENT_ID
export const CLIENT_SECRET = process.env.CLIENT_SECRET
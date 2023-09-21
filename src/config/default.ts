import 'dotenv/config'

export const PORT = process.env.PORT || 8000
export const SERVER_PORT = process.env.SERVER_PORT || 8000

export const BASE_URL = process.env.BASE_URL

export const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET
export const SLACK_BOT_USER_TOKEN = process.env.SLACK_BOT_USER_TOKEN
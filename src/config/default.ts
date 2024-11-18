import 'dotenv/config'

export const BOLT_PORT = +(process.env.BOLT_PORT || 7000)
export const EXPRESS_PORT = +(process.env.EXPRESS_PORT || 8000)

export const EXPRESS_FULL_URL = process.env.EXPRESS_FULL_URL

export const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET
export const SLACK_BOT_USER_TOKEN = process.env.SLACK_BOT_USER_TOKEN

export const SLACK_DOMAIN = process.env.SLACK_DOMAIN ?? "https://pypracts.slack.com"
export const SOLID_DOMAIN = process.env.SOLID_DOMAIN ?? "https://pivot.pondersource.com"

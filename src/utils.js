import { EXPRESS_PORT } from "./constants"
import express from "express"

export const runServer = () => {
    console.log('Starting server')

    const server = express()

    server.get("/", (req, res) => {
        res.json({
            "Hello": "World"
        })
    })

    server.listen(EXPRESS_PORT, () => console.log(`Server started on port ${EXPRESS_PORT}`))
}
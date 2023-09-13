import { App } from "@slack/bolt"
import { BOLT_PORT, boltConfig } from "./constants";
// import { runServer } from "./utils";

const app = new App(boltConfig);

(async () => {
    console.log('Connecting to slack')

    await app.start(BOLT_PORT);

    app.message(async ({ message, say }) => {

        console.log(message);

    });
    

    console.log(`⚡️ Bolt app is running!`);

    // runServer()
})();


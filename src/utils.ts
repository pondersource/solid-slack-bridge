import {
    addDatetime,
    addStringNoLocale,
    createThing,
    getThing,
    addNamedNode,
    getSolidDataset,
    saveSolidDatasetAt,
    setThing,
    Thing,
    createSolidDataset,
    getPodUrlAll
} from "@inrupt/solid-client";
import { namedNode } from "@rdfjs/data-model";
import { ParamsIncomingMessage } from "@slack/bolt/dist/receivers/ParamsIncomingMessage";
import { IMessage } from "./types";
import { Session } from "@inrupt/solid-client-authn-node";
import { logger } from "./utils/logger";


export const getChatIndexUrl = async ({ session, chatID }: { session: Session, chatID: string }) => {
    const pods = await getPodUrlAll(session.info.webId!, { fetch: session.fetch });
    return `${pods[0]}shops/Chat/${chatID}/index.ttl`;
};


export const getOrCreateChatDataset = async ({ session, chatID }: { session: Session, chatID: string }) => {
    const indexUrl = await getChatIndexUrl({ session, chatID })
    try {
        return await getSolidDataset(indexUrl, { fetch: session.fetch });
    } catch (error: any) {
        if (error.statusCode === 404) {
            let ds = createSolidDataset()
            return saveSolidDatasetAt(indexUrl, ds, { fetch: session.fetch });
        }
    }
};


export const createUserMessage = async ({ messageBody, maker, session }: { messageBody: IMessage, maker?: string, session: Session }) => {
    const { text, ts, channel, user } = messageBody
    const indexUrl = await getChatIndexUrl({ session, chatID: channel })
    logger.info('.......');
    logger.info(indexUrl);
    logger.info('.......');
    let dataset = await getOrCreateChatDataset({ session, chatID: channel })
    // Create the message thing
    let message
    message = addDatetime(createThing(), "http://purl.org/dc/terms/created", new Date());
    message = addStringNoLocale(message, "http://rdfs.org/sioc/ns#content", text);
    message = addNamedNode(message, "http://xmlns.com/foaf/0.1/maker", namedNode(maker!));

    dataset = setThing(dataset!, message);

    let thisThing = getThing(dataset, indexUrl + '#this') as Thing;
    if (thisThing) {
        thisThing = addNamedNode(thisThing, 'http://www.w3.org/2005/01/wf/flow#message', namedNode(message.url));
        dataset = setThing(dataset, thisThing);
    } else {
        logger.info("first message");
        thisThing = createThing({ name: "this" })
        thisThing = addNamedNode(thisThing, 'http://www.w3.org/2005/01/wf/flow#message', namedNode(message.url));
        dataset = setThing(dataset, thisThing);
    }
    // Save the modified dataset
    const updatedDataset = await saveSolidDatasetAt(indexUrl, dataset, { fetch: session.fetch });
    logger.info("Dataset updated");
    return updatedDataset
};







export function getBody(request: ParamsIncomingMessage) {
    return new Promise((resolve) => {
        const bodyParts: any[] = [];
        let body = "";
        request.on('readable', function () {
            body += request.read();
        });
        request.on('data', (chunk) => {
            bodyParts.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(bodyParts).toString();
            resolve(body)
        });
    });
}


export const getReqQuery = (req: ParamsIncomingMessage) => {
    let q = req.url?.split('?')
    let result: any = {};
    if (q && q.length && q.length >= 2) {
        q[1].split('&').forEach((item) => {
            try {
                result[item.split('=')[0]] = item.split('=')[1];
            } catch (e) {
                result[item.split('=')[0]] = '';
            }
        })
    }
    return result;
}

export const isUrlValid = (input: string) => {
    var res = input.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if (res == null)
        return false;
    else
        return true;
}
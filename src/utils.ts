import {
    addDatetime,
    addStringNoLocale,
    createThing,
    getThing,
    getThingAll,
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
import axios from "axios";
import { IMessage } from "./types";
import { Session } from "@inrupt/solid-client-authn-node";
import { IncomingMessage, ServerResponse } from "http";

export const getAllsChats = async ({ session }: { session: Session }) => {
    const pods = await getPodUrlAll(session.info.webId!, { fetch: session.fetch });
    const chatsContainerURL = `${pods[0]}shops/Chat/`;
    const chatContainer = await getSolidDataset(chatsContainerURL, { fetch: session.fetch });
    let allThings = await getThingAll(chatContainer);
    allThings = allThings.filter(thing => {
        return thing.url.length > chatsContainerURL.length;
    });
    const names = allThings.map(thing => {
        return thing.url.substring(chatsContainerURL.length, thing.url.length - 1);
    });
    return names;
};

export const getChatIndexUrl = async ({ session, chatID }: { session: Session, chatID: string }) => {
    const pods = await getPodUrlAll(session.info.webId!, { fetch: session.fetch });
    return `${pods[0]}shops/Chat/${chatID}/index.tts`;
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

export const createMessage = async ({ messageBody }: { messageBody: IMessage }) => {
    const { text, ts, channel, user } = messageBody
    const indexUrl = "https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl"
    let dataset = await getSolidDataset(indexUrl);

    // Create the message thing
    let message
    message = addDatetime(createThing(), "http://purl.org/dc/terms/created", new Date());
    message = addStringNoLocale(message, "http://rdfs.org/sioc/ns#content", text);
    message = addNamedNode(message, "http://xmlns.com/foaf/0.1/maker", namedNode("https://solid-crud-tests-example-1.solidcommunity.net/profile/card#me"));

    dataset = setThing(dataset, message);

    // Update "this" thing to include the new message in the list
    let thisThing = getThing(dataset, indexUrl + '#this') as Thing;
    if (thisThing) {
        console.log("....if");
        thisThing = addNamedNode(thisThing, 'http://www.w3.org/2005/01/wf/flow#message', namedNode(message.url));
        dataset = setThing(dataset, thisThing);

    } else {
        console.log("....else");

        thisThing = createThing({ name: "this" })
        thisThing = addNamedNode(thisThing, 'http://www.w3.org/2005/01/wf/flow#message', namedNode(message.url));
        dataset = setThing(dataset, thisThing);
    }


    // Save the modified dataset
    const updatedDataset = await saveSolidDatasetAt(indexUrl, dataset);

    console.log("Dataset updated");
};

export const createUserMessage = async ({ messageBody, maker, session }: { messageBody: IMessage, maker?: string, session: Session }) => {
    const { text, ts, channel, user } = messageBody
    const indexUrl = await getChatIndexUrl({ session, chatID: channel })
    console.log("🚀 ~ file: utils.ts:70 ~ createUserMessage ~ indexUrl:", indexUrl)

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
        console.log("first message");
        thisThing = createThing({ name: "this" })
        thisThing = addNamedNode(thisThing, 'http://www.w3.org/2005/01/wf/flow#message', namedNode(message.url));
        dataset = setThing(dataset, thisThing);
    }
    // Save the modified dataset
    const updatedDataset = await saveSolidDatasetAt(indexUrl, dataset, { fetch: session.fetch });
    console.log("Dataset updated");
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



export async function createChatHttp(msg: IMessage) {
    let data = `INSERT DATA { <https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#this> <http://www.w3.org/2005/01/wf/flow#message> <https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#Msg1694606282236> .\n<https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#Msg1694606282236> <http://rdfs.org/sioc/ns#content> "${msg.text}\\n" .\n<https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#Msg1694606282236> <http://purl.org/dc/terms/created> "2023-09-13T11:58:02Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .\n<https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#Msg1694606282236> <http://xmlns.com/foaf/0.1/maker> <https://solid-crud-tests-example-1.solidcommunity.net/profile/card#me> .\n }\n`;
    let resp = await axios.patch(
        `https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl`,
        data,
        {
            headers: {
                "content-type": "application/sparql-update",
            },
        }
    );
    console.log("...............");
    console.log(resp.data);
    console.log("...............");
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
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
import axios from "axios";
import { IMessage } from "./types";
import { Session } from "@inrupt/solid-client-authn-node";


export const getChatIndexUrl = async ({ session, chatID }: { session: Session, chatID: string }) => {
    const pods = await getPodUrlAll(session.info.webId!, { fetch: session.fetch });
    return `${pods[0]}chats/${chatID}/index.tts`;
};


export const getOrCreateChatDataset = async ({ session, chatID }: { session: Session, chatID: string }) => {
    const indexUrl = await getChatIndexUrl({ session, chatID })
    try {
        return await getSolidDataset(indexUrl, { fetch: session.fetch });
    } catch (error: any) {
        if (error.statusCode === 404) {
            return saveSolidDatasetAt(indexUrl, createSolidDataset(), { fetch: session.fetch });
        }
    }
};

export const createMessage = async ({ messageBody }: { messageBody: IMessage }) => {
    const { text, ts, channel, user } = messageBody
    // Get the dataset
    const indexUrl = "https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl"
    console.log("-------------0");
    let dataset = await getSolidDataset(indexUrl);
    console.log("-------------1");
    
    // Create the message thing
    let message
    console.log("-------------2");
    message = addDatetime(createThing(), "http://purl.org/dc/terms/created", new Date());
    console.log("-------------3");
    message = addStringNoLocale(message, "http://rdfs.org/sioc/ns#content", text);
    console.log("-------------4");
    message = addNamedNode(message, "http://xmlns.com/foaf/0.1/maker", namedNode("https://solid-crud-tests-example-1.solidcommunity.net/profile/card#me"));
    console.log("-------------5");
    
    dataset = setThing(dataset, message);
    console.log("-------------6");
    console.log("message.url", namedNode(message.url));
    console.log("-------------7");
    
    // Update "this" thing to include the new message in the list
    let thisThing = getThing(dataset, indexUrl + '#this') as Thing;
    console.log("-------------8");
    
    thisThing = addNamedNode(thisThing, 'http://www.w3.org/2005/01/wf/flow#message', namedNode(message.url));
    console.log("-------------9");
    dataset = setThing(dataset, thisThing);
    console.log("-------------10");
    
    // Save the modified dataset
    const updatedDataset = await saveSolidDatasetAt(indexUrl, dataset);
    console.log("-------------11");

    console.log("Dataset updated");
};


export const createUserMessage = async ({ messageBody, session }: { messageBody: IMessage, session: Session }) => {
    const { text, ts, channel, user } = messageBody
    const indexUrl = await getChatIndexUrl({ session, chatID: channel })
    console.log("🚀 ~ file: utils.ts:70 ~ createUserMessage ~ indexUrl:", indexUrl)

    let dataset = await getOrCreateChatDataset({ session, chatID: channel })
    console.log("----------------1");

    // Create the message thing
    let message
    console.log("----------------2");
    message = addDatetime(createThing(), "http://purl.org/dc/terms/created", new Date());
    console.log("----------------3");
    message = addStringNoLocale(message, "http://rdfs.org/sioc/ns#content", text);
    console.log("----------------4");
    message = addNamedNode(message, "http://xmlns.com/foaf/0.1/maker", namedNode("https://solid-crud-tests-example-1.solidcommunity.net/profile/card#me"));
    console.log("----------------5");

    dataset = setThing(dataset!, message);
    console.log("----------------6");

    // Update "this" thing to include the new message in the list
    let thisThing = getThing(dataset, indexUrl + '#this') as Thing;
    console.log("----------------7");

    thisThing = addNamedNode(thisThing, 'http://www.w3.org/2005/01/wf/flow#message', namedNode(message.url));
    console.log("----------------8");
    dataset = setThing(dataset, thisThing);
    console.log("----------------9");

    // Save the modified dataset
    const updatedDataset = await saveSolidDatasetAt(indexUrl, dataset);
    console.log("----------------10");

    console.log("Dataset updated");
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
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

export const getOrCreateChatDataset = async ({ session, chatID }: { session: Session, chatID: string }) => {
    // let chatID = "general"
    const pods = await getPodUrlAll(session.info.webId!, { fetch: session.fetch });
    // /chats/Yashar%20%26%20Reza/index.ttl
    const indexUrl = `${pods[0]}chats/${chatID}index.ttl`;

    try {
        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });
        return ds;
    } catch (error: any) {
        if (error.statusCode === 404) {
            const list = saveSolidDatasetAt(indexUrl, createSolidDataset(), { fetch: session.fetch });
            return list;
        }
    }
};

export const createMessage = async (content: string) => {
    // Get the dataset
    const indexUrl = "https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl"
    let dataset = await getSolidDataset(indexUrl);

    // Create the message thing
    let message
    message = addDatetime(createThing(), "http://purl.org/dc/terms/created", new Date());
    message = addStringNoLocale(message, "http://rdfs.org/sioc/ns#content", content);
    message = addNamedNode(message, "http://xmlns.com/foaf/0.1/maker", namedNode("https://solid-crud-tests-example-1.solidcommunity.net/profile/card#me"));

    dataset = setThing(dataset, message);
    console.log("message.url", namedNode(message.url));

    // Update "this" thing to include the new message in the list
    let thisThing = getThing(dataset, indexUrl + '#this') as Thing;

    thisThing = addNamedNode(thisThing, 'http://www.w3.org/2005/01/wf/flow#message', namedNode(message.url));
    dataset = setThing(dataset, thisThing);

    // Save the modified dataset
    const updatedDataset = await saveSolidDatasetAt(indexUrl, dataset);

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
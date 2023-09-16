import {
    addDatetime,
    addStringNoLocale,
    createThing,
    getSolidDataset,
    addNamedNode,
    saveSolidDatasetAt,

    setThing
} from "@inrupt/solid-client";
import { ParamsIncomingMessage } from "@slack/bolt/dist/receivers/ParamsIncomingMessage";
import axios from "axios";
import { IMessage } from "./types";

export const createChat = async (content: string) => {
    const indexUrl = "https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl"
    const dataset = await getSolidDataset(indexUrl);

    let chat
    chat = addDatetime(createThing(), "http://purl.org/dc/terms/created", new Date());
    chat = addStringNoLocale(chat, "http://rdfs.org/sioc/ns#content", content);
    chat = addStringNoLocale(chat, "http://xmlns.com/foaf/0.1/maker", "https://solid-crud-tests-example-1.solidcommunity.net/profile/card#me");

    const updatedThing = setThing(dataset, chat);

    const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedThing);

    console.log("updatedDataset", updatedDataset);
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
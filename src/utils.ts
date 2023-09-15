import {
    addDatetime,
    addStringNoLocale,
    createThing,
    getSolidDataset,
    addNamedNode,
    saveSolidDatasetAt,

    setThing
} from "@inrupt/solid-client";

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
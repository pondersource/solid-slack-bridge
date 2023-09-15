// import { FieldType, bootModels, setEngine } from "soukai";
// import { SolidEngine, SolidModel, bootSolidModels } from "soukai-solid";
// class Chat extends SolidModel {
//   static rdfsClasses = ["http://www.w3.org/2005/01/wf/flow#message"];

//   static fields = {
//     content: {
//       type: FieldType.String,
//       rdfProperty: "http://rdfs.org/sioc/ns#content",
//     },
//     created: {
//       type: FieldType.String,
//       rdfProperty: "http://purl.org/dc/terms/created",
//     },
//     maker: {
//       type: FieldType.String,
//       rdfProperty: "http://xmlns.com/foaf/0.1/maker",
//     },
//   };
// }

// bootSolidModels();
// bootModels({ Chat });

// setEngine(new SolidEngine(fetch));

// You would normally get the url dynamically, we're hard-coding it here as an example.
// Chat.at(
//   "https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl"
// ).create({ content: "John Doe" });

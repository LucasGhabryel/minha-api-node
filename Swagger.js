import swaggerAutogen from "swagger-autogen";
const doc = {
 info: {
 title: "Minha API",
 description: "Documentação automática da API"
 },
 host: "localhost:3000",
 schemes: ["http"],
 basePath: "/",
};
const outputFile = "./swagger-output.json";
const endpointsFiles = ["./server.js"];
swaggerAutogen()(outputFile, endpointsFiles, doc);

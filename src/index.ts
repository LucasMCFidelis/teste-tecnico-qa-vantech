import fastify from "fastify";

const server = fastify();

server.get("/health", async (_, reply) => {
  return reply.status(200).send({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {},
  });
});

const PORT = Number(process.env.PORT) || 3333;
const HOST = process.env.HOST || "localhost";

server
  .listen({ port: PORT, host: HOST })
  .then(() =>
    console.log(`
        Servidor rodando em http://${HOST}:${PORT}
        `),
  )
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

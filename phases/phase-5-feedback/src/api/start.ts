import { startApiServer } from "./server.js";

const port = Number(process.env.TTJ_API_PORT ?? 8787);
startApiServer(port);

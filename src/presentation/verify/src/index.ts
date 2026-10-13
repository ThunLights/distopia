import { startVerifyRpcServer } from "./server/rpc";

process.on("uncaughtException", (error) => {
  console.error(error);
});

process.on("unhandledRejection", (reason) => {
  console.error(reason);
});

startVerifyRpcServer();

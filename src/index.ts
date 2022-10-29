import { BotCore } from "./application/bot-core";
import dotenv from "dotenv";

dotenv.config();

//Entry point of the application
const app = new BotCore();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { config } from "dotenv";
import { Client } from ".";
config();
// To run this example, you need to have a local Revolt server running and an existing account.
// Copy and paste `.env.example` to `.env` and edit accordingly.
function user() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new Client({
            apiURL: process.env.API_URL,
            debug: true,
        });
        client.on("ready", () => __awaiter(this, void 0, void 0, function* () {
            console.info(`Logged in as ${client.user.username}!`);
            const group = yield client.channels.createGroup({
                name: 'sussy',
                users: []
            });
            const msg = yield group.sendMessage({
                content: "embed test",
                embeds: [
                    {
                        title: 'We do a little!'
                    }
                ]
            });
            yield msg.edit({
                embeds: [{ title: 'sus' }]
            });
        }));
        client.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
            if (message.content === "sus") {
                message.channel.sendMessage("sus!");
            }
            else if (message.content === "bot") {
                const bot = yield client.api.post("/bots/create", {
                    name: "basedbot12",
                });
                message.channel.sendMessage(JSON.stringify(bot));
            }
            else if (message.content === "my bots") {
                message.channel.sendMessage(JSON.stringify(yield client.api.get("/bots/@me")));
            }
            else if (message.content === "join bot") {
                yield client.api.post(`/bots/${'01FCV7DCMRD9MT3JBYT5VEKVRD'}/invite`, { group: message.channel_id });
                // { server: '01FATEGMHEE2M1QGPA65NS6V8K' });
            }
            else if (message.content === "edit bot name") {
                yield client.api.patch(`/bots/${'01FCV7DCMRD9MT3JBYT5VEKVRD'}`, { name: "testingbkaka" });
            }
            else if (message.content === "make bot public") {
                yield client.api.patch(`/bots/${'01FCV7DCMRD9MT3JBYT5VEKVRD'}`, { public: true });
            }
            else if (message.content === "delete bot") {
                yield client.api.delete(`/bots/${'01FCV7DCMRD9MT3JBYT5VEKVRD'}`);
            }
        }));
        try {
            yield client.register({
                email: process.env.EMAIL,
                password: process.env.PASSWORD,
            });
        }
        catch (err) { }
        const onboarding = yield client.login({
            email: process.env.EMAIL,
            password: process.env.PASSWORD,
        });
        onboarding === null || onboarding === void 0 ? void 0 : onboarding('sus', true);
    });
}
/*function bot() {
    const client = new Client({
        apiURL: process.env.API_URL,
    });

    client.on("ready", async () => {
        console.info(
            `Logged in as ${client.user!.username}! [${client.user!._id}]`,
        );
    });

    client.on("message", async (message) => {
        if (message.content === "sus") {
            message.channel!.sendMessage("sus!");
        }
    });

    // client.loginBot(process.env.BOT_TOKEN as string)
}*/
user();
// bot();

import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agent-D522uMMh.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var pingVenice_createServerFn_handler = createServerRpc({
	id: "e8422483ec6fdd0a5658777b451994d595ccfec8df5554f3d20a70d68112541e",
	name: "pingVenice",
	filename: "src/game/agent.ts"
}, (opts) => pingVenice.__executeServer(opts));
var pingVenice = createServerFn({ method: "POST" }).handler(pingVenice_createServerFn_handler, async () => {
	const { veniceChat, veniceReady } = await import("./venice.server-CEo5hj6X.mjs");
	if (!veniceReady()) return {
		ok: false,
		text: "Falta venice_api."
	};
	return {
		ok: true,
		text: await veniceChat([{
			role: "system",
			content: "Respondé en una sola oración, en español."
		}, {
			role: "user",
			content: "Decí 'Team UPAP listo' y nada más."
		}])
	};
});
var chatWithNpc_createServerFn_handler = createServerRpc({
	id: "4827ca590fa65ad9bacff161c271da834d9a1de91f3f0ec67edc9c19edb2bd60",
	name: "chatWithNpc",
	filename: "src/game/agent.ts"
}, (opts) => chatWithNpc.__executeServer(opts));
var chatWithNpc = createServerFn({ method: "POST" }).validator((d) => d).handler(chatWithNpc_createServerFn_handler, async ({ data }) => {
	const who = String(data?.who ?? "").slice(0, 24);
	const message = String(data?.message ?? "").trim().slice(0, 400);
	if (!who || !message) return {
		ok: false,
		text: "Falta el mensaje."
	};
	const { chatAsCharacter, veniceReady } = await import("./venice.server-CEo5hj6X.mjs");
	if (!veniceReady()) return {
		ok: false,
		text: "El agente no tiene clave."
	};
	try {
		return {
			ok: true,
			text: await chatAsCharacter({
				who,
				player: data.player,
				history: Array.isArray(data.history) ? data.history.slice(-10) : [],
				message
			})
		};
	} catch (err) {
		return {
			ok: false,
			text: (err instanceof Error ? err.message : "Error del agente.").slice(0, 180)
		};
	}
});
//#endregion
export { chatWithNpc_createServerFn_handler, pingVenice_createServerFn_handler };

import { BaseCommand } from "./base.js";
import { CommandContext } from "../types/index.js";

export function fmtTime(sec: number): string {
	const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
	const p = (n: number) => String(n).padStart(2, "0");
	return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${m}:${p(s)}`;
}

export default class PauseCommand extends BaseCommand {
	name = "pause";
	description = "Pause the video (stops the stream and remembers the spot). Use resume to continue";
	usage = "pause";

	async execute(context: CommandContext): Promise<void> {
		const at = await context.streamingService.pauseCurrent(context.message);
		if (at !== null) {
			await this.sendSuccess(context.message, `Paused at **${fmtTime(at)}**. Say \`resume\` to continue, or \`seek 1:30:00\` to pick another spot first.`);
		}
	}
}

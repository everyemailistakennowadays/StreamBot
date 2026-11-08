import { BaseCommand } from "./base.js";
import { CommandContext } from "../types/index.js";
import { fmtTime } from "./pause.js";

export default class ResumeCommand extends BaseCommand {
	name = "resume";
	description = "Resume a paused video from where it stopped";
	usage = "resume";
	aliases = ["unpause"];

	async execute(context: CommandContext): Promise<void> {
		const at = await context.streamingService.resumePaused(context.message);
		if (at !== null) {
			await this.sendInfo(context.message, "Resuming", `Starting again from **${fmtTime(at)}**. Takes a few seconds.`);
		}
	}
}

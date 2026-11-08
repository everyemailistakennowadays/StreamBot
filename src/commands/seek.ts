import { BaseCommand } from "./base.js";
import { CommandContext } from "../types/index.js";
import { fmtTime } from "./pause.js";

// "1:23:45", "23:45", "90m", "1h30m", "45s", plain "90" = minutes. A leading + or - is relative to now.
export function parseTime(raw: string): { sec: number; relative: boolean } | null {
	let t = raw.trim().toLowerCase();
	let relative = false, sign = 1;
	if (t.startsWith("+") || t.startsWith("-")) { relative = true; sign = t[0] === "-" ? -1 : 1; t = t.slice(1); }
	let sec = 0;
	if (/^\d+(:\d+){1,2}$/.test(t)) {
		const parts = t.split(":").map(Number);
		sec = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
	} else if (/^(\d+h)?(\d+m)?(\d+s)?$/.test(t) && t.length > 0) {
		const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)!;
		sec = Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
	} else if (/^\d+$/.test(t)) {
		sec = Number(t) * 60;
	} else {
		return null;
	}
	return { sec: sec * sign, relative };
}

export default class SeekCommand extends BaseCommand {
	name = "seek";
	description = "Jump to a time in the video, e.g. seek 1:23:45, seek 45m, seek +5m, seek -30s";
	usage = "seek <time>";
	aliases = ["jump"];

	async execute(context: CommandContext): Promise<void> {
		const arg = context.args.join("");
		const t = arg ? parseTime(arg) : null;
		if (!t) {
			await this.sendError(context.message, "Give a time like `seek 1:23:45`, `seek 45m`, `seek +5m` or `seek -30s`.");
			return;
		}
		const svc = context.streamingService;
		let target = t.sec;
		if (t.relative) {
			const base = svc.getPaused() ? svc.getPaused().offsetSec : svc.getElapsedSec();
			target = base + t.sec;
		}
		target = Math.max(0, target);
		const ok = await svc.seekTo(context.message, target);
		if (ok) {
			const paused = !!svc.getPaused();
			await this.sendInfo(context.message, "Seek", paused ? `Will resume from **${fmtTime(target)}**. Say \`resume\`.` : `Jumping to **${fmtTime(target)}**. Takes a few seconds.`);
		}
	}
}

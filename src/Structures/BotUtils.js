import path from 'path';
import { promisify } from 'util';
import glob2 from 'glob';
import properties from '../Custom/properties';

const glob = promisify(glob2);

export default class {
	constructor(client) {
		this.client = client;
	}
	get directory() {
		return `${path.dirname('BotUtils')}${path.sep}`;
	}

	async loadCommands() {
		const commands = await glob(`${process.cwd()}/src/Commands/**/*.js`);

		for (const command of commands) {
			const { name } = path.parse(command);
			const File = await import(command);
			const interaction = new File.default(this.client, name.toLowerCase());

			this.client.commands.set(interaction.name, interaction);
			this.client.cooldowns.set(interaction.name, new Map());
		}
	}

	async loadEvents() {
		const events = await glob(`${process.cwd()}/src/Events/*.js`);
		for (const eventFile of events) {

			const { name } = path.parse(eventFile);
			const File = await import(eventFile);
			const event = new File.default(this.client, name);

			this.client.events.set(event.name, event);
			event.emitter[event.type](name, (...args) => event.run(...args));

		}
	}

	async loadProperties() {
		properties;
	}

	ms(ms) {
		const s = 1000;
		const m = s * 60;
		const h = m * 60;
		const d = h * 24;

		const msAbs = Math.abs(ms);
		if (msAbs >= d) return Math.round(ms / d) + 'd';
		if (msAbs >= h) return Math.round(ms / h) + 'h';
		if (msAbs >= m) return Math.round(ms / m) + 'm';
		if (msAbs >= s) return Math.round(ms / s) + 's';
		return ms + 'ms';
	}

	randomHex() {
		return Math.floor(Math.random() * (0xffffff + 1));
	}
}
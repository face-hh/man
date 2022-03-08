import Event from '../Structures/EventBase.js';

export default class extends Event {
	constructor(...args) {
		super(...args, {
			once: true,
		});
	}
	async run() {
		console.log('\x1b[32m[BOOT] \x1b[0mReceived "ready" event.');
	}
}
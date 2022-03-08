import Event from '../Structures/EventBase.js';

export default class extends Event {
	async run(error) {
		console.minor(`Error caught: ${error}`);
	}
}
import Event from '../Structures/EventBase';

export default class extends Event {
	async run(error) {
		console.minor(`Error caught: ${error}`);
	}
}
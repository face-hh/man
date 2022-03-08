import Event from '../Structures/EventBase.js';

export default class extends Event {

	async run(message) {
		const args = message.content
			.slice(this.client.config.prefix.length)
			.trim()
			.split(/ +/g);

		const content = args.shift().toLowerCase();
		try {
			const command = this.client.commands.get(content);
			if (!command) return;
			if (!message.content.toLowerCase().startsWith(this.client.config.prefix)) return;

			const timestamps = this.client.cooldowns.get(command.name);

			if (timestamps.has(message.author_id)) {
				const expirationTime = timestamps.get(message.author_id) + command.cooldown;
				if (Date.now() < expirationTime) {
					const timeLeft = this.client.utils.ms((timestamps.get(message.author_id) + command.cooldown) - Date.now());
					return message.channel.sendMessage({ content: `⏰ | This command is on cooldown for \`${timeLeft}\``, flags: 64 });
				}
			}

			await timestamps.set(message.author_id, Date.now());
			setTimeout(async () => await timestamps.delete(message.author_id), command.cooldown);

			await command.run(message, args);
		}
		catch (err) {
			message.channel.sendMessage({ content: 'Something went wrong!' });

			this.client.devMode === true ? console.error(err) : console.minor(`Error caught: ${err}`);
		}
	}

}
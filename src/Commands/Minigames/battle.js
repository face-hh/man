import CommandBase from '../../Structures/CommandBase';
import messageCollector from '../../Custom/messageCollector';

export default class extends CommandBase {
	constructor(...args) {
		super(...args, {
			name: 'battle',
			aliases: ['fight'],
			cooldown: 35000,
		});
	}
	/**
   * @param {Message} interaction
   */
	async run(message, args) {
		const userID = args[0].replace(/<@/gi, '').replace(/>/gi, '');
		const member = this.client.users.get(userID) ?? (await this.client.req('GET', `/users/${userID}`));

		console.log(userID);
		if(!member) return message.channel.sendMessage('Couldn\'t find that user!');
		const msg = await message.channel.sendMessage({
			content: ' ',
			embeds: [{
				title: `Battle request from ${message.author.username}`,
				description: `${member.username}, type "yes" to accept, anything else to deny.`,
				color: '#236421',
			}],
		});

		const collector = await new messageCollector(message.channel, {
			max: 1,
			client: this.client,
			filter: (x) => x.author_id === member._id,
		});

		collector.run();

		collector.on('collect', async (m) => {
			collector.stop();

			if(m.content.toLowerCase() !== 'yes') return msg.edit({ content: 'The opponent denied the battle.', embeds: [] });

			const gameData = [
				{ member: message.author, health: 100, lastAttack: 'heal' },
				{ member: member, health: 100, lastAttack: 'heal' },
			];

			let player = Math.floor(Math.random() * 1);
			let string = '```cs\n';
			let substring = '';
			let battleEmbed;

			function updateEmbed() {
				battleEmbed = {
					title: `${message.author.username} ⚔️ ${member.username}`,
					description: `${string}\n\`\`\`\n` + substring,
					color: '#FFFFFF',
				};

				msg.edit({
					content: `**${gameData[0].member.username}**: ${gameData[0].health} :heart:\n**${gameData[1].member.username}**: ${gameData[1].health} :heart:`,
					embeds: [battleEmbed],
				});
			}
			function checkHealth(mem) {
				if (gameData[mem].health <= 0) return true;
				else return false;
			}

			function attack() {
				let amount = Math.floor(Math.random() * (60 - 12) + 12);

				const tempPlayer = (player + 1) % 2;

				if (gameData[tempPlayer].lastAttack === 'heal') amount = Math.floor(amount / 2);

				gameData[tempPlayer].health -= amount;
				gameData[player].lastAttack = 'attack';

				string += `${gameData[player].member.username} attacked and dealt ${amount} damage\n`;
				substring = `${gameData[tempPlayer].member.username}'s turn.`;
				updateEmbed();
				player = (player + 1) % 2;
			}

			function heal() {
				let amount = Math.floor(Math.random() * (20 - 12) + 12);

				const tempPlayer = (player + 1) % 2;

				if (gameData[tempPlayer].lastAttack === 'heal') amount = Math.floor(amount / 2);

				gameData[player].health += amount;
				gameData[player].lastAttack = 'attack';

				string += `${gameData[player].member.username} healed ${amount} HP\n`;
				substring = `${gameData[tempPlayer].member.username}'s turn.`;
				updateEmbed();
				player = (player + 1) % 2;
			}

			substring = `${gameData[player].member.username}'s turn.`;
			updateEmbed();

			const gameFilter = (x) => x.author_id === message.author_id || x.author_id === member._id;

			const gameCollector = await new messageCollector(message.channel, {
				client: this.client,
				filter: gameFilter,
			});

			gameCollector.run();

			gameCollector.on('collect', async (mm) => {
				if (mm.author_id !== gameData[player].member._id) return;

				const selection = mm.content.toLowerCase();

				if (!['attack', 'heal', 'hp', 'cancel'].includes(selection)) return;

				if (selection === 'attack') attack();
				if (selection === 'heal') heal();
				if (selection === 'cancel') {
					gameCollector.stop('user cancelled');
					message.channel.sendMessage('The battle has been stopped.');
				}

				if (checkHealth(player)) {
					gameCollector.stop();
					gameData[player].health = 0;
					updateEmbed();
					const tempPlayer = (player + 1) % 2;
					message.channel.sendMessage(`🏆 ${gameData[tempPlayer].member.username} has won the game!`);
				}
			});
		});
	}
}
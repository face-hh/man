import dotenv from 'dotenv';
import Bot from './Structures/Bot.js';

(async () => {
	dotenv.config();

	const client = new Bot();

	await client.startTheBot();
})();
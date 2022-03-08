import { Client } from 'revolt.js';
import Utils from './BotUtils.js';
import Database from './BotDatabase';
import config from './BotConfig';

export default class extends Client {
	constructor(options = config) {
		super();

		this.validate(options);

		this.commands = new Map();
		this.devMode = true;
		this.events = new Map();
		this.utils = new Utils(this);
		this.cooldowns = new Map();
		this.config = config;

		this.db = new Database();
	}

	validate(options) {
		if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');

		this.token = options.token;
		this.prefix = options.prefix;
		this.devMode = options.devmode;

	}

	async startTheBot() {
		await this.utils.loadEvents();
		await this.db.loadDatabase();
		await this.utils.loadProperties();
		await this.utils.loadCommands();

		console.table([{
			Events: true,
			Database: true,
			Properties: true,
			Commands: true,
		}]);

		this.loginBot(process.env.TOKEN);
	}
}
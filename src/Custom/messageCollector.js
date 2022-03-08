import { EventEmitter } from 'events';
import Collection from './Collection';
import Revolt from '../../node_modules/revolt.js/dist/maps/Messages';

export default class extends EventEmitter {

	constructor(channel, options = {}) {
		super();
		this.channel = channel;
		this.client = options.client;
		this.timeout = options.timeout;
		this.count = options.count ?? Infinity;
		this.filter = options.filter ?? (() => true);
		this.collected = new Collection(Revolt);
		this.running = false;

		this._onMessageCreate = this._onMessageCreate.bind(this);
		this._onMessageDelete = this._onMessageDelete.bind(this);
		this._onMessageUpdate = this._onMessageUpdate.bind(this);

		this.onCollect = this.onCollect.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
	}

	/**
   * @param {Revolt.Message} msg
   */
	_onMessageCreate(msg) {
		if (!this.running) return;
		if (this.channel._id !== msg.channel_id) return;
		if (!this.filter(msg)) return;
		this.emit('collect', msg);
	}

	/**
   * @param {Eris.Message} msg
   * @param {Eris.OldMessage} oldMsg
   */
	_onMessageUpdate(msg, oldMsg) {
		if (!this.running) return;
		if (this.channel._id !== msg.channel_id) return;
		if (!this.filter(msg)) return this.collected.remove(msg);
		if (!this.collected.has(oldMsg?._id)) return this.emit('collect', msg);
		this.emit('update', msg);
	}

	_onMessageDelete(msg) {
		if (!this.running) return;
		if (!this.collected.has(msg._id)) return;
		this.emit('delete', msg);
	}

	/**
   * @returns {Promise<MessageCollector>}
   */
	run() {
		this.running = true;
		return new Promise(() => {
			this.client.on('message', this._onMessageCreate);
			this.client.on('message/update', this._onMessageUpdate);
			this.client.on('message/delete', this._onMessageDelete);

			this.on('collect', this.onCollect);
			this.on('update', this.onUpdate);
			this.on('delete', this.onDelete);

			if (this.timeout) setTimeout(() => this.stop(), this.timeout);
			// this.once('stop', () => res(this));
		});
	}

	stop() {
		this.running = false;
		this.channel.client.off('message', this._onMessageCreate);
		this.channel.client.off('message/update', this._onMessageUpdate);
		this.channel.client.off('message/delete', this._onMessageDelete);

		this.off('collect', this.onCollect);
		this.off('update', this.onUpdate);
		this.off('delete', this.onDelete);
		this.emit('stop');
		return this;
	}

	/**
   * @param {Eris.Message} msg
   */
	onCollect(msg) {
		this.collected.add(msg);
		if (this.count && this.collected.size === this.count) this.stop();
	}

	/**
   * @param {Eris.Message} msg
   */
	onUpdate(msg) {
		this.collected.update(msg);
	}

	/**
   * @param {Eris.Message} msg
   */
	onDelete(msg) {
		this.collected.remove(msg);
	}
}
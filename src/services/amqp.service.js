const amqp = require('amqp-connection-manager');
const config = require('../config');
const loggerService = require('./logger.service');
const BaseError = require('../models/BaseError');
const storageService = require('../services/storage.service');
const storageKeys = require('../consts/storage-keys');
const isNil = require('../utilities/is-nil');
const noNoticeErrorHandler = require('../error-handlers/no-notice.error-handler');

class AmqpService {
  constructor() {
    const amqpConnectionStr =
      `${config.amqp.protocol}://${config.amqp.user}:${config.amqp.password}` +
      `@${config.amqp.host}:${config.amqp.port}`;
    this._connection = amqp.connect(amqpConnectionStr);
    this._connection.on('connect', () => {
      loggerService.highlight('AMQP connected');
    });
    this._connection.on('disconnect', () => {
      loggerService.highlight('AMQP disconnected');
    });
  }

  async consume(exchange, queue, onMessage) {
    const details = [
      'AmqpService.consume',
      `exchange=${exchange}`,
      `queue=${queue}`
    ];
    try {
      const channelWrapper = this._connection.createChannel({
        setup: async channel => {
          try {
            await Promise.all([
              channel.prefetch(1),
              channel.assertQueue(queue, {
                durable: false,
                // persistent: true,
                // arguments: { 'x-message-ttl': 600000 }
              }),
              channel.consume(queue, message => onMessage(channel, message), { noAck: false })
            ]);
          } catch (err) {
            noNoticeErrorHandler(new BaseError({ message: err?.message, details }));
          }
        }
      });
      await channelWrapper.waitForConnect();
    } catch (err) {
      return Promise.reject(new BaseError({ origin: err, details }));
    }
  }

  async publish(exchange, exchangeType, topic, message, options) {
    const details = [
      'AmqpService.publish',
      `exchange=${exchange}`,
      `topic=${topic}`,
      `message=${JSON.stringify(message)}`
    ];
    try {
      const storageChannels = storageService.getItem(storageKeys.AMQP_PUBLISHER_CHANNELS) ?? [];
      const foundStorageChannel = storageChannels.find(c => c.exchange === exchange);
      let channelWrapper;
      if (!isNil(foundStorageChannel)) {
        channelWrapper = foundStorageChannel.channelWrapper;
      } else {
        channelWrapper = this._connection.createChannel({
          setup: async channel => {
            try {
              await Promise.all([
                Promise.all([channel.assertExchange(exchange, exchangeType, { durable: true })])
              ]);
            } catch (err) {
              noNoticeErrorHandler(new BaseError({ message: err?.message, details }));
            }
          }
        });
        storageService.setItem(storageKeys.AMQP_PUBLISHER_CHANNELS, [
          ...storageChannels,
          { exchange, channelWrapper }
        ]);
      }
      await channelWrapper.waitForConnect();
      await channelWrapper.publish(exchange, topic, Buffer.from(JSON.stringify(message)), options);
    } catch (err) {
      noNoticeErrorHandler(new BaseError({ message: err?.message, details }));
    }
  }
}

module.exports = new AmqpService();

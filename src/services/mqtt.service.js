const mqtt = require('mqtt');
const config = require('../config');
const loggerService = require('./logger.service');
const BaseError = require('../models/BaseError');
const noNoticeErrorHandler = require('../error-handlers/no-notice.error-handler');

class AmqpService {
  constructor() {
    const mqttConnectionStr = `${config.mqtt.protocol}://${config.mqtt.host}:${config.mqtt.port}`;
    this._connection = mqtt.connect(mqttConnectionStr, {
      clientId: config.mqtt.clientId,
      clean: true,
      connectTimeout: 4000,
      username: config.mqtt.username,
      password: config.mqtt.password,
      reconnectPeriod: 1000
    });
    this._connection.on('connect', () => {
      loggerService.highlight('MQTT connected');
    });
  }

  async _waitForConnect() {
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(() => {
        if (this._connection?.connected) {
          clearInterval(intervalId);
          resolve();
        }
      }, 1000);
    });
  }

  async consume(topic, onMessage) {
    const details = ['MqttService.consume', `topic=${topic}`];
    try {
      await this._waitForConnect();
      this._connection.subscribe([topic], () => {
        loggerService.highlight(`MQTT subscribed to topic ${topic}`);
        this._connection.on('message', (topic, payload) => {
          if (onMessage) {
            onMessage(topic, payload.toString());
          }
        });
      });
    } catch (err) {
      return Promise.reject(new BaseError({ origin: err, details }));
    }
  }

  async publish(topic, message) {
    const details = ['MqttService.publish', `topic=${topic}`, `message=${JSON.stringify(message)}`];
    try {
      await this._waitForConnect();
      this._connection.publish(topic, message, { qos: 0, retain: false }, err => {
        if (err) {
          noNoticeErrorHandler(new BaseError({ origin: err, details }));
        }
      });
    } catch (err) {
      return Promise.reject(new BaseError({ origin: err, details }));
    }
  }
}

module.exports = new AmqpService();

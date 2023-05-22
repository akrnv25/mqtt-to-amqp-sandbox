const mqttService = require('./services/mqtt.service');
const amqpService = require('./services/amqp.service');
const config = require('./config');

mqttService
  .consume('testtopic/#', async (topic, content) => {
    await amqpService.publish(config.amqp.exchange, 'topic', 'sandbox.1', { topic, content });
  })
  .then(() => {});

module.exports = {
  mqtt: {
    protocol: process.env.MQTT_PROTOCOL ?? 'mqtt',
    host: process.env.MQTT_HOST ?? 'broker.emqx.io',
    port: process.env.MQTT_PORT ?? 1883,
    clientId: process.env.MQTT_CLIENT_ID ?? `mqtt_${Math.random().toString(16).slice(3)}`,
    username: process.env.MQTT_USERNAME ?? 'emqx',
    password: process.env.MQTT_PASSWORD ?? 'public'
  },
  amqp: {
    protocol: process.env.AMQP_PROTOCOL ?? 'amqp',
    port: process.env.AMQP_PORT ?? 5672,
    host: process.env.AMQP_HOST ?? 'localhost',
    user: process.env.AMQP_USER ?? 'guest',
    password: process.env.AMQP_PASSWORD ?? 'guest',
    vhost: process.env.AMQP_VHOST ?? '',
    exchange: process.env.AMQP_EXCHANGE ?? 'ex_topic'
  },
  logger: {
    fileName: process.env.LOGGER_FILE_NAME ?? './logs/combined.log',
    writeToFile: process.env.LOGGER_WRITE_TO_FILE ?? true
  }
};

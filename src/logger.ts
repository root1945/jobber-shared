import winston, { Logger } from "winston"
import {
  ElasticsearchTransformer,
  ElasticsearchTransport,
  LogData,
  TransformedData
} from "winston-elasticsearch"

const esTransformer = (logData: LogData): TransformedData => {
  const transformed = ElasticsearchTransformer(logData)
  transformed["@timestamp"] = new Date().toISOString()
  return transformed
}

export const winstonLogger = (
  elasticSearchNode: string,
  name: string,
  level: string
): Logger => {
  const options = {
    console: {
      level,
      handleExceptions: true,
      json: false,
      colorize: true
    },
    elasticsearch: {
      level,
      transformer: esTransformer,
      clientOpts: {
        node: elasticSearchNode,
        log: level,
        maxRetries: 2,
        requestTimeout: 10000,
        sniffOnStart: false
      }
    }
  }

  const esTransport: ElasticsearchTransport =
    new ElasticsearchTransport(options.elasticsearch)

  const logger = winston.createLogger({
    defaultMeta: { service: name },
    transports: [new winston.transports.Console(options.console), esTransport],
    exitOnError: false
  })

  return logger
}

"use strict";

const HyperExpressServerInstanceSymbol = Symbol("HyperExpressServerInstanceSymbol");

const HyperExpress = require("hyper-express");
const {Server, Router} = HyperExpress;
const SimplyBuilderCrypto = require('@jamilservices/sb-module-crypto-back');
const {hash256, randomUUIDV4} = SimplyBuilderCrypto;

/**
 * @private
 * @memberof module:jamilservices/hyper-express-server
 * @type {Map<string, ServerInstance>}
 */
const instanceStore = new Map();
/**
 * @private
 * @memberof module:jamilservices/hyper-express-server
 * @type {Map<Number, String>}
 */
const appBusyPort = new Map();

/**
 * @private
 * @function
 * @memberof module:jamilservices/hyper-express-server
 * @param {ServerInstance} instance
 * @param {Number} serverPort
 * @returns {ServerInstance}
 */
const instancePort = (instance, serverPort) => {
    const port = Number(serverPort);
    if (appBusyPort.has(port)) throw new Error('port in use');
    appBusyPort.set(port, instance.instanceId);
    if (typeof port === 'number' && port >= 1) instance.portNumber = port;
    return instance;
};
/**
 * @private
 * @function
 * @memberof module:jamilservices/hyper-express-server
 * @param {ServerInstance} instance
 * @param {String} [serverHost]
 * @returns {ServerInstance}
 */
const instanceHost = (instance, serverHost) => {
    const host = (serverHost || '127.0.0.1');
    if (typeof instance.portNumber === 'undefined') return instance;
    if (typeof host === 'string' && host.length >= 1) instance.hostAddress = host;
    return instance;
};
/**
 * @private
 * @function
 * @memberof module:jamilservices/hyper-express-server
 * @param {ServerInstance} instance
 * @param {String} customId
 * @returns {ServerInstance}
 */
const instanceUUID = (instance, customId) => {
    if (typeof customId === "undefined") {
        instance.instanceId = "hyperExpress-"+ hash256(randomUUIDV4());
    } else instance.instanceId = customId.toString();
    return instance;
};
/**
 * @private
 * @function
 * @memberof module:jamilservices/hyper-express-server
 * @param {ServerInstance} instance
 * @param {Function} [fn]
 */
const instanceStart = (instance, fn) => {
    if (instance && instance[HyperExpressServerInstanceSymbol]) {
        const {portNumber, hostAddress, instanceId} = instance;
        instance[HyperExpressServerInstanceSymbol].listen(portNumber, hostAddress).then((s) => {
            console.log(`starting server instance ${instanceId} at ${hostAddress}:${portNumber}`);
            if(typeof fn === 'function') fn(instance[HyperExpressServerInstanceSymbol]);
        });
    }
};
/**
 * @private
 * @function
 * @memberof module:jamilservices/hyper-express-server
 * @param {ServerInstance} instance
 */
const instanceStop = (instance) => {
    if (instance && instance[HyperExpressServerInstanceSymbol]) {
        console.info(`closing server instance ${instance.instanceId} gracefully`);
        return instance[HyperExpressServerInstanceSymbol].shutdown();
    }
};
/**
 * @private
 * @function
 * @memberof module:jamilservices/hyper-express-server
 * @param {ServerInstance} instance
 * @param {Object} router
 * @param {String} [router.endpoint]
 * @param {Function} router.fn
 */
const instanceRouter = (instance, router) => {
    const {endpoint = "/", fn} = (router || {});
    if(typeof endpoint === "string" && typeof fn === "function") {
        const routerInstance = new Router();
        const routerDefinition = fn(routerInstance);
        const serverInstance = instance[HyperExpressServerInstanceSymbol];
        serverInstance.use(endpoint, routerDefinition);
    }
};
/**
 * @private
 * @function
 * @memberof module:jamilservices/hyper-express-server
 * @param {ServerInstance} instance
 * @param {Function} middleware
 */
const instanceMiddleware = (instance, middleware) => {
    if(typeof middleware === "function") {
        const serverInstance = instance[HyperExpressServerInstanceSymbol];
        serverInstance.use(middleware);
    }
};

/**
 * @class ServerInstance
 * @memberof module:jamilservices/hyper-express-server
 * @property {String} instanceId
 * @property {String} hostAddress
 * @property {Number} portNumber
 * @property {Function} start
 * @property {Function} addRouter
 * @property {Function} addMiddleware
 * @property {Function} shutdown
 */
class ServerInstance {
    /**
     * @constructor
     * @param {Object} settings
     * @param {String} settings.[instanceId]
     * @param {String} settings.[hostAddress]
     * @param {Number} settings.portNumber
     * @param {Object} [options] Server Options
     * @param {String=} options.cert_file_name Path to SSL certificate file to be used for SSL/TLS.
     * @param {String=} options.key_file_name Path to SSL private key file to be used for SSL/TLS.
     * @param {String=} options.passphrase Strong passphrase for SSL cryptographic purposes.
     * @param {String=} options.dh_params_file_name Path to SSL Diffie-Hellman parameters file.
     * @param {Boolean=} options.ssl_prefer_low_memory_usage Specifies uWebsockets to prefer lower memory usage while serving SSL.
     * @param {Boolean=} options.fast_buffers Buffer.allocUnsafe is used when set to true for faster performance.
     * @param {Boolean=} options.fast_abort Determines whether HyperExpress will abrubptly close bad requests. This can be much faster but the client does not receive an HTTP status code as it is a premature connection closure.
     * @param {Boolean=} options.trust_proxy Specifies whether to trust incoming request data from intermediate proxy(s)
     * @param {Number=} options.max_body_buffer Maximum body content to buffer in memory before a request data is handled. Behaves similar to `highWaterMark` in Node.js streams.
     * @param {Number=} options.max_body_length Maximum body content length allowed in bytes. For Reference: 1kb = 1024 bytes and 1mb = 1024kb.
     * @param {Boolean=} options.auto_close Whether to automatically close the server instance when the process exits. Default: true
     * @param {Object} options.streaming Global content streaming options.
     * @param {import('stream').ReadableOptions=} options.streaming.readable Global content streaming options for Readable streams.
     * @param {import('stream').WritableOptions=} options.streaming.writable Global content streaming options for Writable streams.
     */
    constructor(settings = {}, options = {}) {
        const {instanceId, portNumber, hostAddress} = settings;
        if (typeof portNumber === 'undefined') throw new Error('needs port number');
        instanceUUID(this, instanceId);
        instancePort(this, portNumber);
        instanceHost(this, hostAddress);
        this[HyperExpressServerInstanceSymbol] = new Server(options);
    }
    /**
     * @function
     * @void
     * @param {Function} [fn]
     */
    start(fn) {
        const instance = this;
        return instanceStart(instance, fn);
    }
    /**
     * @function
     * @void
     * @param {Object} router
     * @param {String} [router.endpoint]
     * @param {Function} router.fn
     */
    addRouter(router = {}) {
        const instance = this;
        return instanceRouter(instance, router);
    }
    /**
     * @function
     * @void
     * @param {Function} middleware
     */
    addMiddleware(middleware) {
        const instance = this;
        return instanceMiddleware(instance, middleware);
    }
    /**
     * @function
     * @void
     */
    shutdown() {
        const instance = this;
        return instanceStop(instance);
    }
}

/**
 * @private
 * @function
 * @memberof module:jamilservices/hyper-express-server
 * @param {Object} settings
 * @param {String} settings.[instanceId]
 * @param {String} settings.[hostAddress]
 * @param {Number} settings.portNumber
 * @param {Object} [options] Server Options
 * @param {String=} options.cert_file_name Path to SSL certificate file to be used for SSL/TLS.
 * @param {String=} options.key_file_name Path to SSL private key file to be used for SSL/TLS.
 * @param {String=} options.passphrase Strong passphrase for SSL cryptographic purposes.
 * @param {String=} options.dh_params_file_name Path to SSL Diffie-Hellman parameters file.
 * @param {Boolean=} options.ssl_prefer_low_memory_usage Specifies uWebsockets to prefer lower memory usage while serving SSL.
 * @param {Boolean=} options.fast_buffers Buffer.allocUnsafe is used when set to true for faster performance.
 * @param {Boolean=} options.fast_abort Determines whether HyperExpress will abrubptly close bad requests. This can be much faster but the client does not receive an HTTP status code as it is a premature connection closure.
 * @param {Boolean=} options.trust_proxy Specifies whether to trust incoming request data from intermediate proxy(s)
 * @param {Number=} options.max_body_buffer Maximum body content to buffer in memory before a request data is handled. Behaves similar to `highWaterMark` in Node.js streams.
 * @param {Number=} options.max_body_length Maximum body content length allowed in bytes. For Reference: 1kb = 1024 bytes and 1mb = 1024kb.
 * @param {Boolean=} options.auto_close Whether to automatically close the server instance when the process exits. Default: true
 * @param {Object} options.streaming Global content streaming options.
 * @param {import('stream').ReadableOptions=} options.streaming.readable Global content streaming options for Readable streams.
 * @param {import('stream').WritableOptions=} options.streaming.writable Global content streaming options for Writable streams.
 * @returns {ServerInstance|undefined}
 */
const instanceManagerOutputType = (settings = {}, options = {}) => {
    try {
        const {instanceId} = settings;
        if (instanceId && instanceStore.has(instanceId)) return Object.freeze(instanceStore.get(instanceId));
        const instance = new ServerInstance(settings, options);
        if (instance.instanceId) instanceStore.set(instance.instanceId, instance);
        return Object.freeze(instance);
    } catch (e) {
        console.error(e);
    }
    return undefined;
};

/**
 * @alias module:jamilservices/hyper-express-server
 * @typedef {ServerInstance}
 */
module.exports = {
    /**
     * @inheritDoc
     */
    ServerInstance: Object.freeze(instanceManagerOutputType)
};

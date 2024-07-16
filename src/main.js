"use strict";
/**
 * @module jamilservices/hyper-express-server
 */

/**
 * @ignore
 */
const pkgJson = require("../package.json");

/**
 * @ignore
 */
const {ServerInstance} = require("./serverInstance");
/**
 * @private
 * @memberof module:jamilservices/hyper-express-server
 * @type {{app: {name: string, version: string}}}
 */
const internalStore = {
    app: {
        name: pkgJson.name,
        version: pkgJson.version
    }
};
/**
 * @private
 * @ignore
 */
const {name, version} = internalStore.app;
/**
 * @function
 * @memberof module:jamilservices/hyper-express-server
 * @param {Object} data
 * @param {Object} data.settings
 * @param {Object} [data.options]
 * @returns {ServerInstance}
 */
const getServerInstance = (data = {}) => {
    const {settings = {}, options = {}} = data;
    return ServerInstance(settings, options);
};
/**
 * @type {Readonly<{instance: (function({}=): ServerInstance), name: string, version: string}>}
 */
module.exports = Object.freeze({
    name, version,
    instance: getServerInstance
});
## modulo interno

~~~bash
pnpm add git+https://github.com/LittleOwle/littleowle-hyper-express-instance.git
~~~

~~~bash
bun add git@github.com:LittleOwle/littleowle-hyper-express-instance.git
~~~

~~~json
{
  "dependencies": {
    "littleowle-hyper-express-instance": "github:LittleOwle/littleowle-hyper-express-instance#v1.0.4"
  }
}
~~~

### exemplos
~~~js
const HyperExpressIntance = require("littleowle-hyper-express-instance").instance;
const server1 = ServerInstance({portNumber: "3000"});
const server2 = ServerInstance({portNumber: "3001"});

const {routerServer1, routerServer2} = require("./mods/routers");
const {checkHeader, checkToken} = require("./middlewares");

server1.addMiddleware(checkHeader);
server1.addRouter({fn: routerServer1});
server1.start(() => {
    console.log(`start server1 instance: ${server1.instanceId}`);
});

server2.addMiddleware(checkToken);
server2.addRouter({endpoint: "/api", fn: routerServer2});
server2.start(() => {
    console.log(`start server2 instance: ${server2.instanceId}`);
});
~~~

### exemplo de router
~~~js
const routerServer1 = (routerInstance) => {
routerInstance.get('/', (req, res) => res.send("endpoint '/' on routerServer1"));
routerInstance.get('/test', (req, res) => res.send("endpoint '/test' on routerServer1"));
return routerInstance;
};

const routerServer2 = (routerInstance) => {
routerInstance.get('/auth', (req, res) => res.json({endpoint: "/api/auth", router: "routerServer2"}));
routerInstance.get('/me', (req, res) => res.json({endpoint: "/api/me", router: "routerServer2"}));
return routerInstance;
};

module.exports = Object.freeze({ routerServer1, routerServer2});
~~~

### desligando graciosamente
~~~js
server1.shutdown();
server2.shutdown();
~~~

## Paramentros para iniciar uma instancia. `instance({settings, options})`

### settings Object
Objeto de configuração da instancia
~~~js
const settings = {
    instanceId: undefined,
    hostAddress: "127.0.0.1",
    portNumber: undefined
};
~~~

- **instanceId**(string|undefined): opcional na configuração inicial, será gerado um uuidv4 caso não informado, e caso informado será utilizado para criar e/ou recuperar uma instancia.
- **hostAddress**(string|undefined): opcional, o padrão será `127.0.0.1` se não for informado
- **portNumber**(string|number): obrigatório, caso não informado retornará com erro, e tente usar 2 instancia com a mesma porta também retornará com erro.

### options Object
Objeto de configuração do `hyper-express`, o mesmo pode ser encontrado em: https://github.com/kartikk221/hyper-express/blob/master/docs/Server.md#server-constructor-options

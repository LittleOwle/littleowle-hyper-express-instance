## modulo interno

~~~js
const test = ServerInstance({portNumber: "3000"});

const routerCustom1 = (routerInstance, id) => {
routerInstance.get('/', (req, res) => res.send('boo '+ id));
return routerInstance;
};

const routerCustom2 = (routerInstance, id) => {
routerInstance.get('/test', (req, res) => res.send('test '+ id));
return routerInstance;
};

const checkHeader =  (request, response, next) => {
const {method} = request;
if(method === 'GET' || method === 'POST') {
console.log('route specific middleware 1 ran!');
return next();
}
return response.status(403).send('403 Forbidden');
};

test.addMiddleware(checkHeader);

test.addRouter({fn: (r) => (routerCustom1(r, test.instanceId))});
test.addRouter({endpoint: "/api", fn: (r) => (routerCustom2(r, test.instanceId))});
test.start();
~~~
const cors = require("koa2-cors");//导入跨域模块

module.exports=async app=>{
	const allowOrigins = [
    "http://192.168.0.1:8082",
    "http://192.168.0.1:8083"
	];
	app.use(cors({
    origin: function(ctx) {
      if (ctx.url === '/test') {
        return false;
      }
      return '*';
    },
    	exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    	maxAge: 5,
    	credentials: true,
    	//withCredentials:true,
    	allowMethods: ['GET', 'POST', 'DELETE'],
    	allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
	}));
}
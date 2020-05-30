const Koa=require('koa');
const fs=require('promise-fs');
const ejs=require('koa-ejs');
const config=require('./config');     //引用配置文件
//const opn=require('opn');
const network=require('./libs/network');
const {post,upload}=require('./libs/body');

let app=new Koa();   //app为模块应用
const  server= require('http').Server(app.callback());  //server才是服务器
const io=require('socket.io')(server);

//全局错误处理
(async ()=>{
	let data=await fs.readFile('./template/error/error404.html');
	let error404=data.toString();

	data=await fs.readFile('./template/error/error500.html');
	let error500=data.toString();

	app.use(async (ctx,next)=>{
		if(ctx.url=='favicon.ico')return;
		try{
			await next();
			if(!ctx.body){
				ctx.status=404;
				ctx.body=error404;
			}
		}catch(e){
			ctx.status=500;
			ctx.body=error500;
		}
	})
})();

(async ()=>{
	//配置可跨域
	await require('./libs/allows')(app);

	//数据库连接
	app.context.db=await require('./libs/mysql');
	//redis连接
	app.context.redis=require('./libs/redis');

	//生成session
	await require('./libs/session')(app);

	//配置可跨域
	//await require('./libs/allows')(app);
	
	//socket
	await require('./libs/socket')(io);

	//路由
	app.use(require('./router'));

	//模板引擎ejs
	ejs(app,{
		root: config.ejs_path,
		layout: false,
		viewExt: 'ejs',
		cache: false,
		debug: false
	});

	//服务器端口
	server.listen(config.port);

	//显示ip地址
	network.forEach(ip =>{
		console.log(`server running at http://${ip}:${config.port}`);
	});

	//自动用默认浏览器打开此地址
	//opn(`http://localhost:${config.port}`);
})();

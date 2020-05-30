const Router=require('koa-router');
const send=require('koa-send');
const path=require('path');
const {upload_dir}=require('../config');

let router=new Router();

//调用静态资源
require('../libs/static')(router);

//upload文件读取
router.get('/upload/:img', async ctx=>{
	let img=ctx.params.img;
	// let str=path.resolve(upload_dir,img);
	
	await send(ctx, img, {
		maxage: 60*86400*1000,
		immutable: true,
		root: upload_dir
	});
});    

//数据传送形式
router.use(async (ctx,next)=>{
	ctx.set('Access-Control-Allow-Origin', '*');
  	ctx.set('Access-Control-Allow-Methods', 'PUT,DELETE,POST,GET');
  	ctx.set('Access-Control-Allow-Credentials', true);
  	ctx.set('Access-Control-Max-Age', 3600 * 24);
	try{
		await next();

		if(ctx.body!==undefined && ctx.status!==404){
			ctx.body={err:false,data:ctx.body};
		}else{
			ctx.body={err:true,data: 'data not found'};
		}
	}catch(e){
		console.log(e);
		ctx.body='服务器有错';
	}
});

//后台交互
router.use('/admin',require('./admin')); 
 //前端交互  
router.use('',require('./user')); 
//静态渲染       
router.use('/api',require('./api')); 

module.exports=router.routes();
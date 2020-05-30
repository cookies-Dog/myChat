const Router=require('koa-router');
const cache=require('../../libs/cache');
let router=new Router();

router.get('/list', async ctx=>{
	let n=ctx.session.view ||0;
	ctx.session.view=++n;
	ctx.body=`${n}`;
	//ctx.cookies.set('name','blue',{signed:true});
	//console.log(ctx.cookies.get('name',{signed:true}));
})

module.exports=router.routes();
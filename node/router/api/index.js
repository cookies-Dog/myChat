const Router=require('koa-router');
const jwt=require('jsonwebtoken');
const fs=require('promise-fs');
const {my_token}=require('../../config');

let router=new Router();

router.get('/index', async ctx=>{
	//访问该路径时，留下文档，可用于统计浏览量
	fs.appendFile('access.log',`[${new Date().toGMTString()}] ${ctx.method} ${ctx.url}\n`);

	let {username}=ctx.query;
	ctx.body=await ctx.db.query(`select * from user_table where username=?`,[username]);
});

router.get('/dialog', async ctx=>{
	let {username}=ctx.query;
	let rows=await ctx.db.query(`select * from dialog_table where username=?`,[username]);
	function toDouble(n){
		return n>9? ''+n:'0'+n;
	}
	function timedate(timestamp){
   		var oDate=new Date();
   		oDate.setTime(timestamp);
	
   		return toDouble(oDate.getHours())+':'+toDouble(oDate.getMinutes());
   	}
	for(let i=0;i<rows.length;i++){
		let newTime=timedate(rows[i].leastTime);
		rows[i].leastTime=newTime;
	}
	ctx.body=rows;

});
router.get('/conversation', async ctx=>{
	let {title,user}=ctx.query;
	let username=[user+'+'+title,title+'+'+user];
	await ctx.db.query(`update dialog_table set times=? where username=? and title=?`,[0,user,title]);
	let rows=await ctx.db.query(`select * from (select id,conversation,isFriend from conversation_table where username=? or username=? \
		order by id desc limit 10) a order by id`,[username[0],username[1]]); //a=()的值
	let row2=await ctx.db.query(`select image from user_table where username=?`,[title]);
	if(rows.length>0){
		rows[0].image=row2[0].image;
		ctx.body=rows;
	}else{
		ctx.body=row2;
	}
});
router.get('/addFriend', async ctx=>{
	let {myName,user}=ctx.query;
	let count=0;
	let rows=await ctx.db.query(`select username,image,signature,sex,city,hobby from user_table where username=?`,[user]);
	let row2=await ctx.db.query(`select id from friend_table where username=? and friendName \
		=? and isFriend=?`,[myName,user,'yes']);
	if(row2.length>0){
		count=1;
	}
	rows[0].count=count
	ctx.body=rows;
});
router.get('/getNewFriend', async ctx=>{
	let {friendName}=ctx.query;
	ctx.body=await ctx.db.query(`select username,message,friendImg from friend_table \ 
	 where friendName=? and isFriend=?`,[friendName,'no']);
});
router.get('/getFriendCount', async ctx=>{
	let {user}=ctx.query;
	let row1=await ctx.db.query(`select id from friend_table where username=? and isFriend=?`,[user,'yes']);
	let row2=await ctx.db.query(`select id from friend_table where friendName=? and isFriend=?`,[user,'no']);
	let rows=[];
	rows.push({friendCount:row1.length});
	rows.push({newFriendCount:row2.length});
	ctx.body=rows;
});
router.get('/provinces', async ctx=>{
	ctx.body=await ctx.db.query(`select * from provinces_table`);
});
router.get('/personalData', async ctx=>{
	let {username}=ctx.query;
	ctx.body=await ctx.db.query(`select * from user_table where username=?`,[username]);
});

router.get('/111',async ctx=>{
	ctx.body=111;
});

module.exports=router.routes();
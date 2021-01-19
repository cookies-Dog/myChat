const Router=require('koa-router');
const jwt=require('jsonwebtoken');
const fs=require('promise-fs');
const {my_token}=require('../../config');

let router=new Router();

router.get('/index', async ctx=>{
	//访问该路径时，留下文档，可用于统计浏览量
	//fs.appendFile('access.log',`[${new Date().toGMTString()}] ${ctx.method} ${ctx.url}\n`);

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
	await ctx.db.query(`update dialog_table set times=? where username=? and title=?`,[0,user,title]);
	let row1=await ctx.db.query(`select username,isGroup from friend_table where friendName=?`,[title]);
	if(JSON.parse(JSON.stringify(row1))[0].isGroup=='yes'){ //群聊
		//第一次渲染聊天记录需要正序插入
		let rows=await ctx.db.query(`select * from (select id,username,conversation,isImage from conversation_table where friendName=?\
		order by id desc limit 10) a order by id`,[title]); //a=()的值
		let row2={};
		let newUser='';
		let row3=[];
		let row=JSON.parse(JSON.stringify(row1));
		row.forEach(item=>{
			row3.push(item.username);
		});
		if(rows.length>0){
			async function test() {
				for(let index in rows){
					newUser=rows[index].username;
					row2=await ctx.db.query(`select image from user_table where username=?`,[newUser]);
					rows[index].image=row2[0].image;
				}
				return new Promise((resolve,reject)=>{
					resolve(rows);
				})
			}
			//等待异步处理完成
			await test().then(rows => {
				rows[0].isGroup=JSON.parse(JSON.stringify(row1))[0].isGroup;
				rows[0].usernames=row3;
            	return ctx.body = rows;
    		})
		}else{
			ctx.body=[{'id':1,'image':JSON.parse(JSON.stringify(row1))[0].friendImg,isGroup:'yes',usernames:row3}];
		}
	}else{ //私聊
		let row2=await ctx.db.query(`select isFriend,friendImg from friend_table where friendName=? and username=?`,[title,user]);
		let rows=await ctx.db.query(`select * from (select id,username,conversation,isFriend,isImage from conversation_table where\
		 (username=? and friendName=?)  or (username=? and friendName=?) order by id desc limit 10)\
		  a order by id`,[user,title,title,user]); //a=()的值
	    if(rows.length>0){
	    	rows[0].image=JSON.parse(JSON.stringify(row2))[0].friendImg;
	    	rows[0].isGroup='no';
	    	rows[0].isFriends=row2[0].isFriend;
			ctx.body=rows;
	    }else{
	    	ctx.body=[{'image':JSON.parse(JSON.stringify(row1))[0].friendImg,isGroup:'no',isFriends:row2[0].isFriend}]
	    }
	}
});
router.get('/addFriend', async ctx=>{
	let {myName,user}=ctx.query;
	let count=0;
	let rows=await ctx.db.query(`select image,sex,signature,hobby from user_table where username=?`,[user])
	let row2=await ctx.db.query(`select id,note from friend_table where username=? and friendName \
		=? and isFriend=?`,[myName,user,'yes']);
	if(row2.length>0){
		count=1;
		rows[0].note=row2[0].note;
	}else{
		rows[0].count=count;
		rows[0].note='';
	}
	ctx.body=rows;
});
router.get('/getNewFriend', async ctx=>{
	let {friendName}=ctx.query;
	ctx.body=await ctx.db.query(`select username,message,friendImg from friend_table \ 
	 where friendName=? and isFriend=?`,[friendName,'no']);
});
router.get('/getFriendCount', async ctx=>{
	let {user}=ctx.query;
	let row1=await ctx.db.query(`select id from friend_table where username=? and isFriend=? and isGroup=?`,[user,'yes','no']);
	let row2=await ctx.db.query(`select id from friend_table where friendName=? and isFriend=? and isGroup=?`,[user,'no','no']);
	let row3=await ctx.db.query(`select id from friend_table where username=? and isGroup=?`,[user,'yes']);
	let rows=[];
	rows.push({friendCount:row1.length});
	rows.push({newFriendCount:row2.length});
	rows.push({groupCount:row3.length});
	ctx.body=rows;
});
router.get('/provinces', async ctx=>{
	ctx.body=await ctx.db.query(`select * from provinces_table`);
});
router.get('/personalData', async ctx=>{
	let {username}=ctx.query;
	ctx.body=await ctx.db.query(`select * from user_table where username=?`,[username]);
});

router.get('/getEmail', async ctx=>{
	let {username}=ctx.query;
	ctx.body=await ctx.db.query(`select email from user_table where username=?`,[username]);
});

router.get('/getGroupMsg',async ctx=>{
	let {title}=ctx.query;
	let row='';
	let rows=await ctx.db.query(`select friendImg,username,signature,note from friend_table where friendName=?`,[title]);
	async function test(){
		for(let index in rows){
			row=await ctx.db.query(`select image from user_table where username=?`,[rows[index].username]);
			rows[index].image=row[0].image
		}
		return new Promise((resole,reject)=>{
			resole(rows);
		});
	}
	await test().then(rows=>{
		ctx.body=rows;
	})
});

router.get('/others',async ctx=>{
	let {user,groupName}=ctx.query;
	let rows=await ctx.db.query(`select friendName,friendImg,signature from friend_table where\
	 	username=? and isFriend=? and isGroup=?`,[user,'yes','no']);
	let row=await ctx.db.query(`select username from friend_table where friendName=?`,[groupName]);
	let row1=JSON.parse(JSON.stringify(row));
	let newArray=[];
	row1.forEach(item=>{
		newArray.push(item.username);
	});
	let row3=[];
	let row2=JSON.parse(JSON.stringify(rows));
	//该数组在循环时，不能对其长度进行改变
	row2.forEach((item,index)=>{
		if(newArray.includes(rows[0].friendName)==true){
			rows.splice(0,1);
		}else{
			row3.push(rows[0]);
			rows.splice(0,1);
		}
	});
	ctx.body=row3;
});

router.get('/login',async ctx=>{
	ctx.body=111;
});

module.exports=router.routes();
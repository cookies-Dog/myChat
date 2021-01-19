const Router=require('koa-router');
const fs=require('promise-fs');
const path=require('path');
const {post,upload}=require('../../libs/body');
const redis=require('../../libs/redis');
const jwt=require('jsonwebtoken');
const {my_token}=require('../../config');
const passwordLib=require('../../libs/password');
const Email=require('../../libs/mailer');

let router=new Router();
let check={};  //存放验证码

router.post('/userInfo', post(), async ctx=>{
	let username=ctx.request.fields.params.username;
	//生成token
	let token=jwt.sign({
			name:username,
	},'my_token',{expiresIn: 2*3600*1000});
	
	let rows=await ctx.db.query(`select id,image from user_table where username=?`,[username]);
	if(rows.length>0){
		rows[0].token=token;
		ctx.body=rows;
	}else{
		ctx.body='';
	}
});

router.post('/getCity', post(), async ctx=>{
	let {province}=ctx.request.fields;
	ctx.body=await ctx.db.query(`select city from provinces_table,citys_table \ 
		where provinces_table.id=citys_table.provinceID and provinces_table.province=?`,[province]);
});

router.post('/register', post(), async ctx=>{
	let {username,password,sex,age,province,city}=ctx.request.fields;
	let pass=passwordLib(password);
	let address=null;
	if(province==city){
		address=city;
	}else{
		address=province+city;
	}
	let newAddress=address.replace(/省|壮族自治区|自治区|回族自治区|维吾尔自治区|市|盟/g,' ');

	let rows=await ctx.db.query(`select username from user_table where username=?`,[username]);
	if(rows.length>0){
		ctx.body='此用户已存在';
	}else{
		await ctx.db.query(`insert into user_table (username,password,sex,age,city,image,signature,hobby) \ 
			values (?,?,?,?,?,?,?,?)`,[username,pass,sex,age,newAddress,'Elise.png','','']);
		ctx.body='ok';
	}
});

router.post('/login', post(), async ctx=>{
	let {password,token}=ctx.request.fields;
	let pass=passwordLib(password);
	await jwt.verify(token,'my_token', async(err,res)=>{
		if(err){
			ctx.body='该用户没有权限';
		}else{
			let rows=await ctx.db.query(`select password from user_table where username=?`,[res.name]);
			if(pass!==rows[0].password){
				ctx.body='false';
			}else{
				ctx.body='ok';
			}
		}
	});
});
router.post('/initTimes',post(),async ctx=>{
	let {user,title}=ctx.request.fields;
	await ctx.db.query(`update dialog_table set times=? where username=? and title=?`,[0,user,title]);
})
router.post('/searchFriend', post(), async ctx=>{
	let {friendname}=ctx.request.fields;
	
	let	rows=await ctx.db.query(`select username,image from user_table where username like ?`,['%'+friendname+'%']);
	if(rows.length>0){
		ctx.body=rows;
	}else{
		ctx.body='你查找的用户不存在';
	}
});
router.post('/getFriend', post(), async ctx=>{
	let {user}=ctx.request.fields;
	ctx.body=await ctx.db.query(`select friendName,friendImg,signature from \
		friend_table where username=? and isFriend=? and isGroup=?`,[user,'yes','no']);
});
router.post('/getGroup', post(), async ctx=>{
	let {user}=ctx.request.fields;
	ctx.body=await ctx.db.query(`select friendName,friendImg,signature from \
		friend_table where username=? and isGroup=?`,[user,'yes']);
});
router.post('/createDialog', post(), async ctx=>{
	let {myName,user,userImg,friendImg,value,leastTime,users}=ctx.request.fields;
	if(users.length==0){
		let row1=await ctx.db.query(`select id from dialog_table where username=? and title=?`,[myName,user]);
		let row2=await ctx.db.query(`select id from dialog_table where username=? and title=?`,[user,myName]);
		let row3=await ctx.db.query(`select id from friend_table where username=? and friendName=?`,[user,myName]);
		if(row1.length==0){
			await ctx.db.query(`insert into dialog_table (username,title,friendImg,message,leastTime,times) \
				values (?,?,?,?,?,?)`,[myName,user,friendImg,value,leastTime,0]);
		}
		if(row2.length==0 && row3.length>0){
			await ctx.db.query(`insert into dialog_table (username,title,friendImg,message,leastTime,times) \
				values (?,?,?,?,?,?)`,[user,myName,userImg,myName+':'+value,leastTime,1,]);
		}
	}else{
		users.forEach(async item=>{
			let row1=await ctx.db.query(`select friendImg from friend_table where friendName=?`,[user]);
			let row2=await ctx.db.query(`select id from dialog_table where username=? and title=?`,[item,user]);
			if(row2.length==0){
				await ctx.db.query(`insert into dialog_table (username,title,friendImg,message,leastTime,times) \
				values (?,?,?,?,?,?)`,[item,user,row1[0].friendImg,myName+':'+value,leastTime,0]);
			}
		});
	}
});
router.post('/isFriend', post(), async ctx=>{
	let {user,friendName}=ctx.request.fields;
	ctx.body=await ctx.db.query(`select friendImg from friend_table where username=? and friendName=?`,[user,friendName]);
});
router.post('/addFriend', post(), async ctx=>{
	let {myName,user,friendImg,message,signature}=ctx.request.fields;
	let rows=await ctx.db.query(`select id from friend_table where username=? and friendName=?`,[myName,user]);
	if(rows.length>0){
		ctx.body='已存在';
	}else{
		await ctx.db.query(`insert into friend_table (username,friendName,friendImg,message,signature,isFriend,isGroup,note) \ 
			values (?,?,?,?,?,?,?,?)`,[myName,user,friendImg,message,signature,'no','no','']);
	}
});
router.post('/agree', post(), async ctx=>{
	let {myName,user,userImg,friendImg,signature}=ctx.request.fields;
	let rows=await ctx.db.query(`select id from friend_table where username=? and friendName=?`,[myName,user]);
	if(rows.length==0){
		await ctx.db.query(`insert into friend_table (username,friendName,friendImg,isFriend,signature,isGroup,note) \ 
			values(?,?,?,?,?,?,?)`,[myName,user,friendImg,'yes',signature,'no','']);
	}
	await ctx.db.query(`update friend_table set isFriend=?,friendImg=? where username=? and friendName=?`,['yes',userImg,user,myName]);
	ctx.body='ok';

});
router.post('/reject', post(), async ctx=>{
	let {myName,user}=ctx.request.fields;
	await ctx.db.query(`delete from friend_table where username=? and friendName=?`,[user,myName]);
	ctx.body='ok';
});
router.post('/deleteFriend', post(),async ctx=>{
	let {user,myName}=ctx.request.fields;
	await ctx.db.query(`delete from friend_table where username=? and friendName=?`,[myName,user]);
	await ctx.db.query(`delete from dialog_table where username=? and title=?`,[myName,user]);
	await ctx.db.query(`update from dialog_table set isFriend=? where username=? and title=?`,['no',user,myName]);
	let rows=await ctx.db.query(`select conversation,isImage from conversation_table where username=? and friendName=?`,[myName,user]);
	await ctx.db.query(`delete from conversation_table where username=? and friendName=?`,[myName,user]);
	rows.forEach(row=>{
		if(row.isImage=='yes'){
			fs.unlinkSync('upload/'+row.conversation);
		}
	});
	ctx.body='ok';
});
router.post('/deleteDialog', post(), async ctx=>{
	let {user,friendName}=ctx.request.fields;
	await ctx.db.query(`delete from dialog_table where username=? and title=?`,[user,friendName]);
});
router.post('/upload', ...upload({
	maxFileSize:512*1024,
	sizeExceed: async ctx=>{
		
	},
	error: async ctx=>{
		console.log('服务器有错');
	}
	}), async ctx=>{
		let {username,userImg,sex,age,city,signature,hobby,file}=ctx.request.fields;
		if(file!=='undefined'){
			let imgName='upload/'+(file[0].path.split('/',5)[4]);
			let type=file[0].type.split('/',2)[1];
			let newName=imgName+'.'+type;
			userImg=file[0].path.split('/',5)[4]+'.'+type;
			fs.renameSync(imgName,newName);
			let rows=await ctx.db.query(`select image from user_table where username=?`,[username]);
			if(rows.length>0 && rows[0].image!=='Elise.png') fs.unlinkSync('upload/'+rows[0].image);
		}
		await ctx.db.query(`update user_table set image=?,sex=?,age=?,city=?,signature=?,hobby=? \ 
			where username=?`,[userImg,sex,age,city,signature,hobby,username]);
		let row1=await ctx.db.query(`select id from friend_table where friendName=?`,[username]);
		let row2=await ctx.db.query(`select id from dialog_table where title=?`,[username]);
		if(row1.length>0){
			ctx.body=await ctx.db.query(`update friend_table set friendImg=?,signature=? \ 
				where friendName=? and isFriend=?`,[userImg,signature,username,'yes']);
		}
		if(row2.length>0){
			ctx.body=await ctx.db.query(`update dialog_table set friendImg=? where title=?`,[userImg,username]);
		}		
});
router.post('/moreConversation', post(), async ctx=>{
	let {user,title,users,page}=ctx.request.fields;
	if(users.length==0){  //私聊
		ctx.body=await ctx.db.query(`select * from conversation_table where\
		 (username=? and friendName=?) or (username=? and friendName=?) \
		order by id desc limit ?,?`,[user,title,title,user,page,10]);
	}else{
		//加载更多聊天记录需要逆序插入
		let rows=await ctx.db.query(`select * from conversation_table where friendName=? \
		order by id desc limit ?,?`,[title,page,10]);
		let row2={};
		let newUser='';
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
            	return ctx.body = rows;
    		})
		}
	}	
});
router.post('/checkPassword',post(),async ctx=>{
	let {username,password}=ctx.request.fields;
	let newPass=passwordLib(password);
	ctx.body=await ctx.db.query(`select id from user_table where username=? and password=?`,[username,newPass]);
});
router.post('/changePassword',post(),async ctx=>{
	let {username,password}=ctx.request.fields;
	let newPass=passwordLib(password);
	await ctx.db.query(`update user_table set password=? where username=?`,[newPass,username]);
});

router.post('/checkEmail',post(),async ctx=>{
	let username=ctx.request.fields.username;
	let rows=await ctx.db.query(`select email from user_table where username=?`,[username]);
	let code=parseInt(Math.random(0,1)*10000);
	if(code<1000) code+=1000;
	check[username]=code;
	let emails=JSON.parse(JSON.stringify(rows))[0].email; //解析JSON
	async function timeout() {
        return new Promise((resolve, reject) => {
            Email.sendMail(emails, code, (state) => {
                resolve(state);
            });
        })
    }
    await timeout().then(state => {
        if (state) {
            return ctx.body = "发送成功"
        } else {
            return ctx.body = "发送失败"
        }
    })
});

router.post('/checkCode',post(),async ctx=>{
	let {username,code}=ctx.request.fields;
	if(check[username]==code){
		ctx.body='验证码正确';
		delete check[username];
	}else{
		ctx.body='验证码错误';
	}
});

router.post('/bindEmail',post(),async ctx=>{
	let email=ctx.request.fields.email;
	let code=parseInt(Math.random(0,1)*10000);
	if(code<1000) code+=1000;
	check[email]=code;
	async function timeout() {
        return new Promise((resolve, reject) => {
            Email.sendMail(email, code, (state) => {
                resolve(state);
            });
        })
    }
    await timeout().then(state => {
        if (state) {
            return ctx.body = "发送成功"
        } else {
            return ctx.body = "发送失败"
        }
    })
});

router.post('/insertEmail',post(),async ctx=>{
	let {username,email,code,state}=ctx.request.fields;
	if(check[email]==code && (state=='bind1'||state=='bind2')){
		await ctx.db.query(`update user_table set email=? where username=?`,[email,username]);
		ctx.body="验证码正确";
		delete check[email];
	}else if(check[email]==code && state=='mod'){
		ctx.body="验证成功";
		delete check[email];
	}else{
		ctx.body="验证码错误";
	}
});

router.post('/setEmail',post(),async ctx=>{
	let username=ctx.request.fields.username;
	ctx.body=await ctx.db.query(`update user_table set email=? where username=?`,['',username]);
});

router.post('/checkName',post(),async ctx=>{
	let {chatName}=ctx.request.fields;
	let row1=await ctx.db.query(`select id from user_table where username=?`,[chatName]);
	let row2=await ctx.db.query(`select id from friend_table where friendName=?`,[chatName]);
	if(row1.length>0 || row2.length>0){
		ctx.body="00";
	}else{
		ctx.body="01";
	}
});

router.post('/addGroup',post(),async ctx=>{
	let {value,chatName,leastTime}=ctx.request.fields;
	let image,signature='';
	let row=await ctx.db.query(`select friendImg,signature from friend_table where friendName=?`,[chatName]);
	if(row.length>0){
		image=row[0].friendImg;
		signature=row[0].signature;
	}else{
		image="Elise.png";
		signature='这是一个新群聊';
	}
	value.forEach(async item=>{
		await ctx.db.query(`insert into friend_table (username,friendName,friendImg,signature,\
			message,isFriend,isGroup,note) values(?,?,?,?,?,?,?,?)`,[item,chatName,image,signature,'','yes','yes','']);
		await ctx.db.query(`insert into dialog_table (username,title,friendImg,message,\
			times,leastTime) values (?,?,?,?,?,?)`,[item,chatName,image,'',0,leastTime]);
	});
	ctx.body='ok';
});

router.post('/modGroupMsg', ...upload({
	maxFileSize:512*1024,
	sizeExceed: async ctx=>{
		
	},
	error: async ctx=>{
		console.log('服务器有错');
	}
	}), async ctx=>{
		let {friendname,groupName,groupSignature,groupNote,image,file}=ctx.request.fields;
		if(file!=='undefined'){
			//本地imgName='upload/'+(file[0].path.split('\\',4)[3]);
			//服务器上传imgName='upload/'+(file[0].path.split('/',5)[4]);
			let imgName='upload/'+(file[0].path.split('/',5)[4]);
			let type=file[0].type.split('/',2)[1];
			let newName=imgName+'.'+type;
			image=file[0].path.split('/',5)[4]+'.'+type;
			fs.renameSync(imgName,newName);
			let rows=await ctx.db.query(`select friendImg from friend_table where friendName=?`,[friendname]);
			if(rows.length>0 && rows[0].friendImg!=='Elise.png') fs.unlinkSync('upload/'+rows[0].friendImg);
		}
	await ctx.db.query(`update friend_table set friendName=?,friendImg=?,signature=?,note=?\
		where friendName=?`,[groupName,image,groupSignature,groupNote,friendname]);
	ctx.body=await ctx.db.query(`update dialog_table set title=?,friendImg=? where title=?`,[groupName,image,friendname]);
});

router.post('/exitGroup',post(),async ctx=>{
	let {username,groupName}=ctx.request.fields;
	let row=await ctx.db.query(`select id from dialog_table where username=? and title=?`,[username,groupName]);
	if(row.length>0){
		await ctx.db.query(`delete from dialog_table where id=?`,[row[0].id]);
	}
	ctx.body=await ctx.db.query(`delete from friend_table where username=? and friendName=?`,[username,groupName]);
	//应该删除退出群聊的人的聊天信息吗？==不删
});

router.post('/delGroup',post(),async ctx=>{
	let {groupName}=ctx.request.fields;
	await ctx.db.query(`delete from dialog_table where title=?`,[groupName]);
	let rows=await ctx.db.query(`select distinct conversation,isImage,friendImg from conversation_table,friend_table where\
	conversation_table.friendName=friend_table.friendName and friend_table.friendName=?`,[groupName]);
	await ctx.db.query(`delete from conversation_table where friendName=?`,[groupName]);
	rows.forEach(row=>{
		if(row.isImage=='yes'){
			fs.unlinkSync('upload/'+row.conversation);
		}
	});
	if(rows.length>0 && rows[0].friendImg!=='Elise.png') fs.unlinkSync('upload/'+rows[0].friendImg);
	ctx.body=await ctx.db.query(`delete from friend_table where friendName=?`,[groupName]);
});

router.post('/changeNote',post(),async ctx=>{
	let {username,friendname,note}=ctx.request.fields;
	await ctx.db.query(`update friend_table set note=? where username=? and friendName=?`,[note,username,friendname]);
});

router.post('/sendImg',...upload({
	maxFileSize:512*1024,
	sizeExceed: async ctx=>{
		//前端处理,减少请求次数
	},
	error: async ctx=>{
		console.log('服务器有错');
	}
	}), async ctx=>{
		let {file}=ctx.request.fields;
		let image='';
		//把已上传的图片修改类型
		if(file!=='undefined'){
			//已上传的图片地址
			let imgName='upload/'+(file[0].path.split('\\',4)[3]);
			let type=file[0].type.split('/',2)[1];
			let newName=imgName+'.'+type;
			image=file[0].path.split('\\',4)[3]+'.'+type;
			fs.renameSync(imgName,newName);
		}
		ctx.body=image;
});

module.exports=router.routes();
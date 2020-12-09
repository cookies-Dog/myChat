const Router=require('koa-router');
const fs=require('promise-fs');
const path=require('path');
const {post,upload}=require('../../libs/body');
const redis=require('../../libs/redis');
const jwt=require('jsonwebtoken');
const {my_token}=require('../../config');
const passwordLib=require('../../libs/password');
const Email=require('../../libs/mailer');
let check={};  //存放验证码

let router=new Router();

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
router.post('/conversation',post(),async ctx=>{
	let {message,username,friendname,leastTime}=ctx.request.fields;
	let conversation=username+':'+message;
	let newUsername=username+'+'+friendname;
	let isFriend=null;
	let rows=await ctx.db.query(`select id from friend_table where username=? and friendName=?`,[friendname,username]);
	if(rows.length>0){
		isFriend='yes';
	}else{
		isFriend='no';
	}
	await ctx.db.query(`insert into conversation_table (username,conversation,isFriend) values (?,?,?)`,[newUsername,conversation,isFriend]);
	await ctx.db.query(`update dialog_table set message=?,leastTime=? where username=? and title=?`,[message,leastTime,username,friendname]);
	await ctx.db.query(`update dialog_table set message=?,leastTime=?,times=times+1 \
	 where username=? and title=?`,[username+':'+message,leastTime,friendname,username]);
	ctx.body=isFriend;
});
router.post('/initTimes',post(),async ctx=>{
	let {user,title}=ctx.request.fields;
	await ctx.db.query(`update dialog_table set times=? where username=? and title=?`,[0,user,title]);
})
router.post('/searchFriend', post(), async ctx=>{
	let {friendname}=ctx.request.fields;
	let rows=await ctx.db.query(`select username,image from user_table where username like ?`,['%'+friendname+'%']);
	if(rows.length>0){
		ctx.body=rows;
	}else{
		ctx.body='你查找的用户不存在';
	}
});
router.post('/getFriend', post(), async ctx=>{
	let {user}=ctx.request.fields;
	ctx.body=await ctx.db.query(`select friendName,friendImg,signature from \
		friend_table where username=? and isFriend=?`,[user,'yes']);
});
router.post('/createDialog', post(), async ctx=>{
	let {myName,user,userImg,friendImg,value,leastTime}=ctx.request.fields;
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
});
router.post('/isFriend', post(), async ctx=>{
	let {user,friendName}=ctx.request.fields;
	ctx.body=await ctx.db.query(`select id from friend_table where username=? and friendName=?`,[user,friendName]);
});
router.post('/addFriend', post(), async ctx=>{
	let {myName,user,friendImg,message,signature}=ctx.request.fields;
	let rows=await ctx.db.query(`select id from friend_table where username=? and friendName=?`,[myName,user]);
	if(rows.length>0){
		ctx.body='已存在';
	}else{
		await ctx.db.query(`insert into friend_table (username,friendName,friendImg,message,signature,isFriend) \ 
			values (?,?,?,?,?,?)`,[myName,user,friendImg,message,signature,'no']);
	}
});
router.post('/agree', post(), async ctx=>{
	let {myName,user,userImg,friendImg,signature}=ctx.request.fields;
	let rows=await ctx.db.query(`select id from friend_table where username=? and friendName=?`,[myName,user]);
	if(rows.length==0){
		await ctx.db.query(`insert into friend_table (username,friendName,friendImg,isFriend,signature) \ 
			values(?,?,?,?,?)`,[myName,user,friendImg,'yes',signature]);
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
	await ctx.db.query(`delete from conversation_table where username=?`,[myName+'+'+user]);
	ctx.body='ok';
});
router.post('/deleteDialog', post(), async ctx=>{
	let {user,friendName}=ctx.request.fields;
	await ctx.db.query(`delete from dialog_table where username=? and title=?`,[user,friendName]);
});
router.post('/upload', ...upload({
	maxFileSize:512*1024,
	sizeExceed: async ctx=>{
		ctx.body='文件过大';
	},
	error: async ctx=>{
		console.log('服务器有错');
	}
	}), async ctx=>{
		let {username,userImg,sex,age,city,signature,hobby,file}=ctx.request.fields;
		if(file!=='undefined'){
			let imgName='upload/'+(file[0].path.split('\\',4)[3]);
			let type=file[0].type.split('/',2)[1];
			let newName=imgName+'.'+type;
			userImg=file[0].path.split('\\',4)[3]+'.'+type;
			fs.renameSync(imgName,newName);
			let rows=await ctx.db.query(`select image from user_table where username=?`,[username]);
			if(rows.length>0 && rows[0].image!=='Elise.png') fs.unlinkSync('upload/'+rows[0].image);
		}
		await ctx.db.query(`update user_table set image=?,sex=?,age=?,city=?,signature=?,hobby=? \ 
			where username=?`,[userImg,sex,age,city,signature,hobby,username]);
		let row1=await ctx.db.query(`select id from friend_table where friendName=?`,[username]);
		let row2=await ctx.db.query(`select id from dialog_table where title=?`,[username]);
		if(row1.length>0){
			await ctx.db.query(`update friend_table set friendImg=?,signature=? \ 
				where friendName=?`,[userImg,signature,username]);
		}
		if(row2.length>0){
			await ctx.db.query(`update dialog_table set friendImg=? where title=?`,[userImg,username]);
		}		
});
router.post('/moreConversation', post(), async ctx=>{
	let {user,title,page}=ctx.request.fields;
	let username=[user+'+'+title,title+'+'+user];
	ctx.body=await ctx.db.query(`select * from (select id,conversation,isFriend from conversation_table where username=? or username=? \
		order by id desc limit ?,?) a order by id`,[username[0],username[1],page,10]);
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
	ctx.body=ctx.db.query(`update user_table set email=? where username=?`,['',username]);
});

module.exports=router.routes();
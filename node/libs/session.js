const fs=require('promise-fs');
const path=require('path');
const session=require('koa-session');
const client=require('./redis');

module.exports=async app=>{
	try{
		//cookies的key
		app.keys=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../.keys')).toString());
		console.log(`读取了${app.keys.length}个key`);
	}catch(e){
		console.log('读取keys失败，请先生成...');
		console.error(e);
		return;
	};
	let store={
		async get(key,maxAge){
			let data=await client.getAsync(key);
	
			if(!data)return {};
			try{
				return JSON.parse(data);
			}catch(e){
				return {};
			}
		},
		async set(key,session,maxAge){
		//注意形参位置
		// let expire=Math.floor(maxAge._expire/1000);
		// let maxAge2=`{${maxAge.view},${expire},${maxAge._maxAge}}`;
		//console.log(maxAge2)
		//有效期
		await client.psetexAsync(key, maxAge, JSON.stringify(session));
		},
		async destroy(key){
			await client.delAsync(key);
		}
	};
	//session
	app.use(session(
		{
			store,
			maxAge: 2*3600*1000,
			renew: true
		},
		app
	));
};
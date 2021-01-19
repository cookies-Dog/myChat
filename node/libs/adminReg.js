const {questionAsync}=require('./readline');
const mysql=require('./mysql');

let message=[];

function add(str){
	if(str.length==0){
		console.log('该内容为空');
	}else{
		message.push(str);
	}
}

(async ()=>{
	let db=await mysql;
	let username=await questionAsync('your name:');
	add(username);
	let password=await questionAsync('your password:');
	add(password);

	if(message.length==2){
		await db.query(`insert into admin_table (username,password) values\
			(?,?)`,[message[0],message[1]])
	}
})();
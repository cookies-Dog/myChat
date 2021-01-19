const readline=require('readline');

//创建实例
let rl=readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.questionAsync=function (question){
	return new Promise((resolve,reject)=>{
		rl.question(question, str=>{
			resolve(str);
		});
	});
}

module.exports=rl;
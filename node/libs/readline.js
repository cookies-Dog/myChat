const readline=require('readline');

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
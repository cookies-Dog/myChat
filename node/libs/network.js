const os=require('os');

let json=os.networkInterfaces();

let arr=[];
for(let name in json){
	if(name.startsWith('VMware'))continue;

	json[name].forEach(item =>{
		if(item.family=='IPv4'){
			arr.push(item.address);
		}
	})
}

module.exports=arr;
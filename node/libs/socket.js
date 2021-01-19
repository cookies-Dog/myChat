const mysql=require('./mysql');

module.exports=async io=>{
   var allClients=[];
   let db=await mysql;
   io.sockets.on('connection',socket=>{
      allClients.push(socket.id);
      socket.on('disconnect',()=>{
         //console.log('got disConnect');
         var index=allClients.indexOf(socket.id);
         allClients.splice(index,1);
      });

      if(allClients.includes(socket.id)===false) return;
      socket.on('send', async data=> {
         let {user,speak,msg,title,isFriend,leastTime,isImage,image}=data;
         //即时发送消息
         socket.broadcast.emit('getMsg', {username:user,title,message:msg,image,speak,isImage});
         //存储数据
         let newIsImage=null;
         let message=msg;
         if(isImage==true){
            newIsImage='yes';
            message='图片';
         }
         if(typeof(user)=='string'){ //私聊
            //第一句相同,可省略
            await db.query(`insert into conversation_table (username,friendName,conversation,isFriend,isImage)\
             values (?,?,?,?,?)`,[speak,title,msg,isFriend,newIsImage]);
            await db.query(`update dialog_table set message=?,leastTime=? where username=? and title=?`,[message,leastTime,speak,title]);
            await db.query(`update dialog_table set message=?,leastTime=?,times=times+1 \
                where username=? and title=?`,[speak+':'+message,leastTime,title,speak]);
         }else{  //群聊
            await db.query(`insert into conversation_table (username,friendName,conversation,isFriend,isImage)\
             values (?,?,?,?,?)`,[speak,title,msg,isFriend,newIsImage]);
            await db.query(`update dialog_table set message=?,leastTime=?,times=times+1 where title=? and username!=?`,[speak+':'+message,leastTime,title,speak]);
         }
      });
      //添加好友
      socket.on('addFriend', data=>{
         socket.broadcast.emit('getMsgs', {user:data.user,message:data.msg});
      });
      //限制登陆设备台数
      socket.on('clearUser',data=>{
         socket.broadcast.emit('getUser',{username:data.username});
      });
   });
}


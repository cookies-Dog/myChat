let mysql=require('./mysql');

module.exports=async io=>{
   var allClients=[];
   io.sockets.on('connection',socket=>{
      allClients.push(socket.id);
      socket.on('disconnect',()=>{
         //console.log('got disConnect');
         var index=allClients.indexOf(socket.id);
         allClients.splice(index,1);
      });

      if(allClients.includes(socket.id)===false) return;
      socket.on('send', data=> {
         socket.broadcast.emit('getMsg', {username:data.user,title:data.title,message:data.msg,image:data.image,speak:data.speak,isImage:data.isImage}); 
      });
      socket.on('addFriend', data=>{
         socket.broadcast.emit('getMsgs', {user:data.user,message:data.msg});
      });
      socket.on('clearUser',data=>{
         socket.broadcast.emit('getUser',{username:data.username});
      });
   });
}


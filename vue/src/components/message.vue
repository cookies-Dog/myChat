<template>
	<div class="middle-container">
			<div class="row1">
				<input type="text" />
				<p class="placeholder">点击搜索</p>
				<img src="../assets/imgs/search.png">
			</div>
			<div class="dialog" @touchmove="isJumpDelete()">
			<ul class="rows" @mouseout="longClick=false,cur=-1">
				<li :class="{active:index==0}" @touchstart="timeOutEvent(index)" @touchend="dialog(index)" v-for="item,index in message" :key="item.id">
					<i class="image">
						<img :src="item.friendImg|imgPath" alt="">
					</i>
					<p class="title">{{item.title}}</p>
					<p class="message">{{item.message}}</p>
					<span class="lastTime">{{item.leastTime}}</span>
					<span class="newMsg" v-if="item.times>0">{{item.times}}</span>
					<span class="delete" v-if="longClick==true && cur==index" @touchstart.stop="deleteDialog(index)">删除</span>
				</li>	
			</ul>
			</div>
	</div>
</template>
<script>
	export default {
		data(){
			return{
				longClick:false,
				message:null,
				cur:-1,
				user:'',
				userImg:'',
				isJump:true,
				timer:''
			}
		},
		methods:{
			timeOutEvent(index){
				this.timer=setTimeout(()=>{
					this.cur=index;
					this.longClick=true;
				},800);
			},
			async dialog(i){
				if(this.isJump==true){
					if(this.longClick==false){
						this.$router.push({name:'dialog',params:{title:this.message[i].title}})
					}
				}else{
					this.isJump=true;
				}
			},
			isJumpDelete(){
				this.isJump=false;
				clearTimeout(this.timer)
			},
			async deleteDialog(i){
				await this.axios.post('deleteDialog',{
					user:this.user,
					friendName:this.message[i].title
				});
				this.message.splice(i,1)
			},
			toDouble(n){
				return n>9? ''+n:'0'+n;
			},
			timedate(timestamp){
   			var oDate=new Date();
   			oDate.setTime(timestamp);
		
   			return this.toDouble(oDate.getHours())+':'+this.toDouble(oDate.getMinutes());
   		}
		},
		async created(){
			this.user=sessionStorage.getItem('username');
			this.userImg=sessionStorage.getItem('userImg');
			let {data:{data,err,msg}}=await this.axios.get('api/dialog',{
				params:{username:this.user}
			});
			if(err){
				console.log(msg)
			}else{
				this.message=Object.assign(data);
			}
		},
		sockets:{
			async getMsg(data){
				let titles=[];
				let msg='';
				if(data.isImage==false){
					msg=data.speak+':'+data.message;
				}else{
					msg=data.speak+':[图片]';
				}
				let leastTime=this.timedate(new Date().getTime());
				//对话框信息
				if(typeof(data.username)==='string'){  //私聊
					this.message.forEach((item,index)=>{
						titles.push(item.title);
						if(item.title==data.username && this.user==data.title){
							this.message[index].times++;
							this.message[index].message=msg;
						}
					});
					//还要判断是不是好友
					let friendName=data.username;
					let image=data.image;
					if(this.user==data.title && titles.includes(data.username)==false){
						let{data:{data}}=await this.axios.post('/isFriend',{
							user:this.user,
							friendName
						});
						if(data.length>0){
							this.message.push({
								title: friendName, //标题
								message: msg,
								leastTime,
								friendImg: image,
								times: 1,
							});
						}
					}
				}else{  //群聊
					let index=data.username.indexOf(data.speak);
					data.username.splice(index,1);
					this.message.forEach((item,index)=>{ 
						titles.push(item.title); 
						if(item.title==data.title && data.username.indexOf(this.user)>-1){
							this.message[index].times++;
							this.message[index].message=msg;
						}
					});
					let friendName=data.title;
					if(titles.includes(data.title)==false && data.username.indexOf(this.user)>-1){
						let{data:{data}}=await this.axios.post('/isFriend',{
							user:this.user,
							friendName
						});
						this.message.push({
							title: friendName, //标题
							message: msg,
							leastTime,
							friendImg: data[0].friendImg, //待处理
							times: 1,
						});
					}
				}
			}
		}
	}
</script>

<style scoped></style>
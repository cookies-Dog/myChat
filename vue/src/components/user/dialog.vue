<template>
	<div>
		<mt-header fixed :title="title">
			<mt-button icon="back" slot="left" @click="clearTimes()">返回</mt-button>
			<mt-button icon="more" slot="right" v-if="isGroup=='yes'" @click="$router.push({name:'modGroupMsg',params:{groupName:title}})"></mt-button>
		</mt-header>
		<div class="f-content" ref="refash">
			<div class="spaner" ref="spaner">
				<mt-spinner type="fading-circle"></mt-spinner>
			</div>
			<ul :style="style" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd">
				<li v-for="item,index in conversation" :key="index" v-scroll="vScroll">
					<div class="friendContainer" v-if="item.conversation">
						<!-- 朋友发言 -->
						<img :src="(isGroup=='no'?friendImg:item.image)|imgPath" alt="">
						<div class="userInfo" v-if="isGroup=='yes'">
							<span class="identity" :class="{active:item.username==groupManager}">
								{{item.username==groupManager?'群主':'群员'}}
								<!-- {{item.username}},{{groupManager}} -->
							</span>
							<span class="name">{{item.username}}</span>
						</div>
						<div class="dialog">
							<span v-if="item.isImage==false">{{item.conversation}}</span>
							<span v-else>
								<img :src="item.conversation|imgPath">
							</span>
						</div>
					</div>
					<div>
						<div class="myContainer" v-if="item.myconversation">
							<!-- 用户发言 -->
							<img :src="userImg|imgPath" alt="">
							<div class="userInfo" v-if="isGroup=='yes'">
								<span class="identity" :class="{active:groupManager==user}">
									{{isGroupManager}}
								</span>
								<span class="name">我</span>
							</div>
							<div class="dialog">
								<span class="sendError" v-if="item.isFriend=='no'">！</span>
								<span v-if="item.isImage==false">{{item.myconversation}}</span>
								<span v-else>
									<img :src="item.myconversation|imgPath">
								</span>
							</div>
						</div>
					</div>
				</li>
			</ul>
		</div>
		<div class="output">
			<div class="sendImg">
				<img src="../../assets/imgs/add.png">
				<input 
					type="file" 
					accept="image/*"  
					ref="image" 
					multiple="mutiple" 
					@change="sendImg()" 
					@change.once="createDialog()"
				>
			</div>
			<input type="text" v-model="value" @keydown.enter="sendMessage()" />
			<button class="primary" :disabled="!value" @click="sendMessage(),vScroll=true" @click.once="createDialog()">发送</button>
		</div>
	</div>
</template>

<script>
	import { Spinner } from 'mint-ui';
	import {Toast} from 'mint-ui';
	export default {
		data(){
			return{
				title:this.$route.params.title,
				conversation:[],
				value:'',
				user:'',
				userImg:'',
				friendImg:'',
				friendWordLength:0,
				newFWl:0,
				isFriend:'yes',
				startY:'',
				distanceY:'',
				scrollBoxH:'',
				vScroll:true,
				a_watch:0,
				isGroup:null,
				users:[],
				groupManager:null
			}
		},
		async created(){
			this.user=sessionStorage.getItem('username');
			this.userImg=sessionStorage.getItem('userImg');
			let {data:{data,err,msg}}=await this.axios.get('/api/conversation',{
				params:{
					title:this.title,
					user:this.user
				}
			});
			if(err){
				console.log(msg)
			}else{
				this.isGroup=data[0].isGroup;
				if(this.isGroup=='yes' && data[0].id){  //群聊时和群聊消息大于等于1条
					this.users=data[0].usernames;
					this.groupManager=data[0].usernames[0];
				}else{
					this.friendImg=data[0].image;
					this.isFriend=data[0].isFriends;
				} 
				if(data[0].conversation){ 
					data.forEach(cov=>{
						let isImage=false;
						if(cov.isImage!==undefined && cov.isImage=='yes'){
							isImage=true;
						}
						//自己发言部分
						if(cov.username==this.user){
							this.conversation.push({myconversation:cov.conversation,isFriend:cov.isFriend,isImage});
						}
						//朋友发言部分
						if(this.isGroup=='no'){  //私聊
							if(cov.username==this.title && cov.isFriend!=='no'){
								this.conversation.push({conversation:cov.conversation,isImage});
								this.friendWordLength++;
							}
						}else{  //群聊
							if(cov.username==this.user) return;
							this.conversation.push({username:cov.username,conversation:cov.conversation,image:cov.image,isImage})
							this.friendWordLength++;	
						}
					});
				}
				this.newFWl=this.friendWordLength;
			}
		},
		sockets:{
			connect(data){
				if(data){
					console.log('已成功连接');
				}
			},
			getMsg(data){
				if(this.isGroup=='no'){
					if(this.title==data.username && this.user==data.title){
						this.conversation.push({conversation:data.message,isImage:data.isImage});
						this.newFWl++;
					}
				}else{  //群聊
					if(this.title==data.title){
						this.conversation.push({username:data.speak,conversation:data.message,image:data.image,isImage:data.isImage});
						this.newFWl++;
					}
				}
			},
			disconnect(){
				console.log('连接已断开')
			}
		},
		directives: { //自定义指令
    		scroll: {   //自定义指令名称 v-scroll
    		    inserted(el,binding,vnode) {  //插入
    		    	if(binding.value==true){
    		    		// setTimeout(()=>{
    		    		// 	el.scrollIntoView(false); //某窗口从底部滚动到顶部,
    		    		// },100)
    		    		el.scrollIntoView(false);
    		    	}else{ //下拉数据请求完成触发
    		    		let element=document.querySelectorAll('.spaner');
    		    		element[0].style.transition=`all 0.3s ease`;
    		    		vnode.context.a_watch=vnode.context.a_watch+1; //触发watch条件，无意义
    		    	}
    		    }
    		}
		},
		methods:{
			async sendMessage(){
				let newDate=new Date().getTime();
				if(this.isGroup=='no'){ //私聊
					this.$socket.emit('send',{
						user:this.user,
						title:this.title,
						msg:this.value,
						image:this.userImg,
						speak:this.user,
						isImage:false,
						isFriend:this.isFriend,
						leastTime:newDate
					}); 
					this.conversation.push({myconversation:this.value,isImage:false});
				}else{  //群聊
					this.$socket.emit('send',{
						user:this.users,
						title:this.title,
						msg:this.value,
						image:this.userImg,
						speak:this.user,
						isImage:false,
						leastTime:newDate,
						isFriend:'yes'
					});
					this.conversation.push({myconversation:this.value,isImage:false});
				}
				setTimeout(()=>{
					this.value='';
				},100)
			},
			async clearTimes(){
				if(this.newFWl>this.friendWordLength){
					await this.axios.post('/initTimes',{
						title:this.title,
						user:this.user
					});
				}
				this.$router.push('/index');
			},
			async createDialog(){
				let leastTime=new Date().getTime();
				let value='';
				if(this.value==''){
					value='[图片]';
				}else{
					value=this.value;
				}
				if(this.isGroup=='no'){
					await this.axios.post('/createDialog',{
						myName:this.user,
						user:this.title,
						userImg:this.userImg,
						friendImg:this.friendImg,
						value,
						leastTime,
						users:this.users
					});
				}else{
					await this.axios.post('/createDialog',{
						myName:this.user,
						user:this.title,
						userImg:'',
						friendImg:'',
						value,
						leastTime,
						users:this.users
					});
				}
			},
			async sendImg(){
				let size=(this.$refs.image.files[0].size)/(1024*1024);
				if(size>3){
					Toast({
						message:'图片不能大于3m',
						position: 'middle',
						duration: 1500
					});
				}else{
					let newDate=new Date().getTime();
					let formData=new FormData();
					formData.append('file',this.$refs.image.files[0]);
					// let config = {
    				// 		'Content-Type': 'multipart/form-data',
    				// };
					let {data:{data}}=await this.axios.post('sendImg',formData);
					if(data){
						if(this.isGroup=='no'){
							this.$socket.emit('send',{
								user:this.user,
								title:this.title,
								msg:data,
								image:this.userImg,
								speak:this.user,
								isImage:true,
								isFriend:this.isFriend,
								leastTime:newDate
							});
						}else{
							this.$socket.emit('send',{
								user:this.users,
								title:this.title,
								msg:data,
								image:this.userImg,
								speak:this.user,
								isImage:true,
								isFriend:this.isFriend,
								leastTime:newDate
							})
						}
						this.conversation.push({myconversation:data,isImage:true});
					}	
				}	
			},
			touchStart(e){
				if(this.$refs.refash.scrollTop>0) return;

				this.scrollBoxH=this.$refs.refash.scrollHeight;
				this.startY=e.touches[0].clientY;
			},
			touchMove(e){
				if(this.$refs.refash.scrollTop>0 || typeof(this.startY)!='number') return;

				this.distanceY=Math.pow((e.touches[0].clientY-this.startY)/16,0.5);
				if(this.distanceY<0) return;
				let spanerMarginTop=2-this.distanceY;
				if(spanerMarginTop<=0) spanerMarginTop=0;
				this.$refs.spaner.style.marginTop=-spanerMarginTop+'rem';
			},
			async touchEnd(e){
				if(this.$refs.refash.scrollTop>0) return;
				let page=this.conversation.length;
				if(this.distanceY<2 && this.startY>0){ //防止直接下拉
					this.$refs.spaner.style.marginTop=`-2rem`;
				}else if(typeof(this.startY)=='number' && this.distanceY>2){
					let {data:{data}}=await this.axios.post('/moreConversation',{
						user:this.user,
						title:this.title,
						users:this.users,
						page
					});
					if(data){
						this.vScroll=false;
						this.$refs.spaner.style.marginTop=`-2rem`;
						this.startY=''

						if(data!=='data not found'){
							data.forEach(cov=>{
								let isImage=false;
								if(cov.isImage!==undefined && cov.isImage=='yes'){
									isImage=true;
								}
								if(cov.username==this.user){
									this.conversation.unshift({myconversation:cov.conversation,isFriend:cov.isFriend,isImage});
								}
								if(this.isGroup=='no'){
									if(cov.username==this.title && cov.isFriend!=='no'){
										this.conversation.unshift({username:cov.username,conversation:cov.conversation,isImage});
									}
								}else{
									if(cov.username==this.user) return;
									this.conversation.unshift({username:cov.username,conversation:cov.conversation,image:cov.image,isImage});
								}
							});
						}
					}

				}
			}
		},
		watch:{
			a_watch(newValue,oldValue){
				if(this.vScroll==false){
					//核心思想：scrollHeight(目前整个聊天滚动框高度)-(之前聊天框高度)
					let a=this.$refs.refash.scrollHeight - this.scrollBoxH
					this.$refs.refash.scrollTop=a-20;
		 		}
			}
		},
		computed:{
			style(){
				if(this.a==true){
					return{
						position:'absolute',
						bottom:0
					}
				}
			},
			isGroupManager(){
				return this.groupManager==this.user?'群主':'群员';
			}
		}
	}
	
</script>

<style scoped>
	.spaner{padding: 0 45.625%;margin-top: -2rem;}
	.userInfo{position: relative;top:-3.5rem;left: 0;}
	.userInfo .active{background: #d62d2d !important;}
	.f-content{width: 100%;position: absolute;top: 40px;bottom:3.125rem;overflow-y: auto;overflow-x: hidden;padding-top: 0.25rem;}
	.f-content::-webkit-scrollbar{display: none;}
	.f-content ul{width: 100%;}
	.f-content li{width: 100%;}
	.f-content li .friendContainer> img{width: 2.5rem;height: 2.5rem;border-radius: 50%;margin: 0.5rem;}
	.f-content li .friendContainer .userInfo>.identity{background: #3ada2f;display: inline;font-size: 0.5rem;padding: 1px;color: white;border-radius: 2px;margin-left: 3.5rem;}
	.f-content li .friendContainer .userInfo .name{font-size: 0.6rem;color: #5f5c5c;margin-left: 0.5rem;}
	.f-content li .friendContainer .dialog{width: 11rem;margin-top: -3.25rem;margin-left: 3.5rem;}
	.f-content li .friendContainer .dialog span{max-width: 10rem;word-wrap:break-word;background: white;display: inline-block;border-radius: 0.5rem;padding: 0.5rem;font-size: 0.9rem;min-height: 1rem;min-width: 0.5rem;overflow-x: auto;}
	.f-content li .friendContainer .dialog span::-webkit-scrollbar{display: none;}
	.f-content li .friendContainer .dialog span>img{height: 6rem;}
	/* 用户发言 */
	.f-content li .myContainer{text-align: right;}
	.f-content li .myContainer> img{width: 2.5rem;height: 2.5rem;border-radius: 50%;margin: 0.5rem;}
	.f-content li .myContainer .userInfo>.identity{background: #3ada2f;display: inline;font-size: 0.5rem;padding: 1px;color: white;border-radius: 2px;margin-right: 0.5rem;}
	.f-content li .myContainer .userInfo .name{font-size: 0.6rem;color: #5f5c5c;margin-right: 3.5rem;}
	.f-content li .myContainer .dialog{margin-top: -3.25rem;position: relative;right: 3.5rem;}
	.f-content li .myContainer .dialog span{max-width: 10rem;word-wrap:break-word;background: #3ed444;display: inline-block;border-radius: 0.5rem;padding: 0.5rem;font-size: 0.9rem;min-height: 1rem;min-width: 0.5rem;text-align: left;overflow-x: auto;}
	.f-content li .myContainer .dialog span::-webkit-scrollbar{display: none;}
	.f-content li .myContainer .dialog span>img{height: 6rem;}
	.f-content li .myContainer .dialog .sendError{background: #f0f0f0;color: red;}
	.output{width: 100%;height: 3.125rem;position: absolute;bottom: 0;border-top: 1px solid #ded9d9;}
	.output input{width: 65%;height: 2rem;margin-top: 0.625rem;border-radius: 0.5rem;margin-left: 2.5rem;line-height: 2rem;}
	.output .primary{width: 3rem;height: 2rem;background: #7cbff1;position: absolute;right: 0.5rem;outline: none;border-radius: 0.5rem;border: none;margin-top: 0.625rem;}
	.output .sendImg{width: 2rem;height: 2rem;background: #ccc;position: absolute;top: 0.625rem;left: 0.25rem;border-radius: 50%;}
	.output .sendImg input{width: 2rem;height: 2rem;opacity: 0;position: absolute;left: -3.125rem;top: -0.5625rem;}
	.output .sendImg img{width: 2rem;height: 2rem;position: absolute;}
</style>
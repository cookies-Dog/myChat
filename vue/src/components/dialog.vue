<template>
	<div>
		<mt-header fixed :title="title">
			<mt-button icon="back" slot="left" @click="clearTimes()">返回</mt-button>
			<mt-button icon="more" slot="right"></mt-button>
		</mt-header>
		<div class="f-content" ref="refash">
			<div class="spaner" ref="spaner">
				<mt-spinner type="fading-circle"></mt-spinner>
			</div>
			<ul @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd">
				<li v-for="item,index in conversation" :key="index">
					<div class="friendContainer" v-if="item.conversation">
						<!-- 朋友发言 -->
						<img :src="friendImg|imgPath" alt="">
						<div class="dialog" v-scroll="vScroll">
							<span>{{item.conversation}}</span>
						</div>
					</div>
					<div>
						<div class="myContainer" v-if="item.myconversation">
							<!-- 用户发言 -->
							<img :src="userImg|imgPath" alt="">
							<div class="dialog" v-scroll="vScroll">
								<span class="sendError" v-if="item.isFriend=='no'">！</span>
								<span>{{item.myconversation}}</span>
							</div>
						</div>
					</div>
				</li>
			</ul>
		</div>
		<div class="output">
			<input type="text" v-model="value" @keydown.enter="sendMessage()" />
			<button class="primary" :disabled="!value" @touchstart="sendMessage(),vScroll=true" @touchend.once="createDialog()">发送</button>
		</div>
	</div>
</template>

<script>
	import { Spinner } from 'mint-ui';
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
				isFriend:[],
				startY:'',
				distanceY:'',
				scrollBoxH:'',
				vScroll:true,
				a_watch:0
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
				this.friendImg=data[0].image; 
				if(data[0].conversation){  //数据加了一个照片，长度>=1
					data.forEach(cov=>{
						let newUser=cov.conversation.split(':',1);
						let newValue=cov.conversation.split(':',2)[1];
						if(newUser==this.title && cov.isFriend!=='no'){
							this.conversation.push({conversation:newValue});
							this.friendWordLength++;
						}else if(newUser==this.user){
							this.conversation.push({myconversation:newValue,isFriend:cov.isFriend});
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
				if(this.title==data.username && this.user==data.title){
					this.conversation.push({conversation:data.message});
					this.newFWl++;
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
    	    		el.scrollIntoView(true); //某窗口从底部滚动到顶部
    	    	}else{
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
				this.$socket.emit('send',{user:this.user,title:this.title,msg:this.value,image:this.userImg});
				let {data:{data,err,msg}}=await this.axios.post('/conversation',{
					message:this.value,
					username:this.user,
					friendname:this.title,
					leastTime:newDate
				});
				if(data.length>0){
					if(data=='no'){
						this.conversation.push({myconversation:this.value,isFriend:'no'});
					}else{
						this.conversation.push({myconversation:this.value});
					}
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
				await this.axios.post('/createDialog',{
					myName:this.user,
					user:this.title,
					userImg:this.userImg,
					friendImg:this.friendImg,
					value:this.value,
					leastTime
				});
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
						page
					});
					if(data){
						this.vScroll=false;
						this.$refs.spaner.style.marginTop=`-2rem`;
						this.startY=''

						if(data.length>0){
							data.forEach(cov=>{
								let newUser=cov.conversation.split(':',1);
								let newValue=cov.conversation.split(':',2)[1];
								if(newUser==this.title && cov.isFriend!=='no'){
									this.conversation.unshift({conversation:newValue});
								}else if(newUser==this.user){
									this.conversation.unshift({myconversation:newValue,isFriend:cov.isFriend});
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
					let a=this.$refs.refash.scrollHeight - this.scrollBoxH
					this.$refs.refash.scrollTop=a-20;
		 		}
			}
		}
	}
	
</script>

<style scoped>
	.spaner{padding: 0 45.625%;margin-top: -2rem;}
	.f-content{width: 100%;position: absolute;top: 2.5rem;bottom:3.125rem;overflow-y: auto;overflow-x: hidden;}
	.f-content::-webkit-scrollbar{display: none;}
	.f-content ul{width: 100%;}
	.f-content li{width: 100%;}
	.f-content li .friendContainer> img{width: 2.5rem;height: 2.5rem;border-radius: 50%;margin: 0.5rem;}
	.f-content li .friendContainer> .dialog{width: 11rem;margin-top: -3rem;margin-left: 3.5rem;}
	.f-content li .friendContainer>.dialog span{max-width: 10rem;word-wrap:break-word;background: white;display: inline-block;border-radius: 1rem;padding: 0.5rem;font-size: 0.9rem;min-height: 1rem;min-width: 0.5rem;}
	.f-content li .myContainer{text-align: right;}
	.f-content li .myContainer> img{width: 2.5rem;height: 2.5rem;border-radius: 50%;margin: 0.5rem;}
	.f-content li .myContainer> .dialog{margin-top: -3rem;position: relative;right: 3.5rem;}
	.f-content li .myContainer>.dialog span{max-width: 10rem;word-wrap:break-word;background: #3ed444;display: inline-block;border-radius: 1rem;padding: 0.5rem;font-size: 0.9rem;min-height: 1rem;min-width: 0.5rem;text-align: left;}
	.f-content li .myContainer> .dialog .sendError{background: #f0f0f0;color: red;}
	.output{width: 100%;height: 3.125rem;position: absolute;bottom: 0;}
	.output input{width: 75%;margin-top: 0.625rem;}
	.output .primary{width: 3rem;height: 2rem;background: #7cbff1;position: absolute;right: 0.5rem;outline: none;border-radius: 0.5rem;border: none;margin-top: 0.625rem;}
</style>
<template>
	<div>
		<mt-header fixed title="好友资料">
			<mt-button slot="left" icon="back" @click="$router.back()">返回</mt-button>
		</mt-header>
		<div class="content-f1">
			<div class="rows-f1" v-for="item in detailMsg">
				<img :src="item.image|imgPath" alt="">
				<p class="friendName">{{item.username}}</p>
				<span class="sex">{{item.sex}}</span>
				<span class="city">{{item.city}}</span>
				<p class="signature">个性签名：{{item.signature}}</p>
				<div style="margin-top: 1rem">
					<span class="hobby">爱好：{{item.hobby}}</span>
				</div>
			</div>
		</div>
		<div class="foot-f1">
			<button class="del" v-if="showDelete==true" @click="deleteFriend()">删 除 好 友</button>
			<button class="btn1" @click="sendMsg()" v-if="btn1==true">{{btnMsg}}</button>
			<button class="btn2" style="background: #4fa9ec" v-if="btn2==true" @click="agree()">同意</button>
			<button class="btn2" v-if="btn2==true" @click="reject()">拒绝</button>
		</div>
	</div>
</template>

<script>
	import {Toast} from 'mint-ui';
	import { MessageBox } from 'mint-ui';
	export default{
		data(){
			return{
				btnMsg:'发送消息',
				detailMsg:[],
				myName:'',
				btn1:true,
				btn2:false,
				showDelete:true
			}
		},
		async created(){
			this.myName=sessionStorage.getItem('username');
			let [user]=this.$route.params.userInfo.split('?',1);
			let info=this.$route.params.userInfo.split('?',2)[1];
			if(this.myName!==user){
				let {data:{data,err,msg}}=await this.axios.get('/api/addFriend',{
					params:{
						myName: this.myName,
						user
					}
				});
				if(err){
					console.log(msg);
				}else{
					if(info=='add'){
						if(data[0].count==0){
							this.btnMsg='添加好友';
							this.showDelete=false;
						};
					}else{
						this.btn1=false;
						this.btn2=true;
						this.showDelete=false;
					}

					if(data[0].signature==''){
						data[0].signature='这个人很懒，什么也没有留下'
					}
					this.detailMsg=data;
				}
			}else{
				this.$router.push('/personalData');
			}
		},
		methods:{
			async sendMsg(){
				let userImg=sessionStorage.getItem('userImg');
				if(this.btnMsg=='发送消息'){
					this.$router.push({name:'dialog',params:{title:this.detailMsg[0].username}});
				}else{
					let {data:{data}}=await this.axios.post('/addFriend',{
						myName:this.myName,
						user:this.$route.params.userInfo.split('?',1)[0],
						friendImg:userImg,
						message:'你好，我想成为你的好友',
						signature:this.detailMsg[0].signature
					});
					if(data=='已存在'){
						Toast({
							message:'已发送,请勿重发',
							position: 'middle',
							duration: 1000
						});
					}else{
						this.$socket.emit('addFriend',{user:this.$route.params.userInfo.split('?',1)[0],msg:'你好，我想成为你的好友'});
						Toast({
							message:'发送成功',
							position: 'middle',
							duration: 1000
						});
					}
				}
			},
			async agree(){
				let userImg=sessionStorage.getItem('userImg');
				let {data:{data}}=await this.axios.post('/agree',{
					myName:this.myName,
					user:this.$route.params.userInfo.split('?',1)[0],
					userImg,
					friendImg:this.detailMsg[0].image,
					signature:this.detailMsg[0].signature
				});
				if(data=='ok'){
					Toast({
						message: '添加成功',
						position: 'middle',
						duration: 800
					});
					this.$router.push('/friend');
				}
			},
			async reject(){
				let {data:{data}}=await this.axios.post('/reject',{
					myName:this.myName,
					user:this.$route.params.userInfo.split('?',1)[0],
				});
				if(data='ok'){
					this.$router.push('/friend');
				}
			},
			deleteFriend(){
				MessageBox.confirm('你确定要删除该好友吗？').then(async action=>{
					if(action=='confirm'){
						let {data:{data,err,msg}}=await this.axios.post('/deleteFriend',{
							myName:this.myName,
							user:this.$route.params.userInfo.split('?',1)[0]
							});
							if(data.length>0){
							if(data=='ok'){
								Toast({
									message: '删除成功',
									position: 'middle',
									duration: 1000
								});
								this.$router.push('/friend');
							}
						}
					}else{
						return false;
					}
				}).catch(()=>{});
			}
		},

	}
</script>

<style scoped>
	.content-f1{width: 100%;background: white;position: absolute;top: 2.5rem;bottom: 3.125rem;padding-top: 0.5rem;}
	.content-f1 .rows-f1{width: 20rem;position: relative;top: 2rem;overflow: hidden;}
	.content-f1 .rows-f1 img{width: 4rem;height: 4rem;border-radius: 50%;margin-left: 1rem;}
	.content-f1 .rows-f1 .friendName{position: absolute;top: 0;left: 6rem;font-weight: 500;font-size: 1.25rem;}
	.content-f1 .rows-f1 .sex{position: absolute;top: 3rem;left: 6rem;font-size: 0.875rem;}
	.content-f1 .rows-f1 .city{position: absolute;top: 3rem;left: 7.5rem;font-size: 0.875rem;}
	.content-f1 .rows-f1 .signature{width: 100%;height: 3rem;line-height: 3rem;position: relative;top: 1rem;margin-left: 1rem;color: #5a5a5a;font-size: 0.875rem;}
	.content-f1 .rows-f1 .hobby{margin-left: 1rem;color: #5a5a5a;font-size: 0.875rem;display: inline-block;}
	.foot-f1{width: 100%;height: 3.125rem;position: absolute;bottom: 0.5rem;border-top: 1px solid #b8bbbf;background: #f0f0f0;}
	.foot-f1 .btn1{width: 100%;height: 2.5rem;background:#4fa9ec;color: white;border: none;outline: none;font-size: 16px;border-radius: 0.5rem;margin-top: 0.8rem;}
	.foot-f1 .btn2{width:40%;height: 2.5rem;color: white;border: none;outline: none;font-size: 16px;border-radius: 0.5rem;margin: 0.8rem 5% 0 5%;}
	.foot-f1 .del{position: absolute;bottom: 5rem;width: 100%;height: 2.5rem;background: #d9d9d9;border: none;outline: none;font-size: 1rem;color: red;}
</style>
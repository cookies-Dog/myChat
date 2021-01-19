<template>
	<div>
		<mt-header fixed :title="title">
			<mt-button icon="back" slot="left" @click="$router.back()">返回</mt-button>
		</mt-header>
		<div class="title">
			<mt-field label="群聊名称" placeholder="请输入不重复名称" @change="checkName()" v-model="chatName" :disabled="groupName!=='添加群聊'"></mt-field>
		</div>
		<div class="friendContent">
			<div class="myFriend">
				<img src="../../assets/imgs/admin2.png" alt="">
				<p class="title2">{{groupName=='添加群聊'?'我的好友':'可添加好友'}}</p>
			</div>
			<ul>
				<li v-for="item,index in friends">
					<input type="checkbox" :value="item.friendName" :id="index" name="" v-model="value">
					<label :for="index"></label>
					<img :src="item.friendImg|imgPath" alt="">
					<div class="message-f1">
						<span class="f-Name">{{item.friendName}}</span>
						<span class="P-signature">{{item.signature}}</span>
					</div>
				</li>
			</ul>
		</div>
		<mt-button class="createDialog" size="large" type="primary" :disabled="name==false || !value.length" @click.once="addGroup()">{{groupName=='添加群聊'?'创建群聊':'确认添加'}}</mt-button>
	</div>
</template>

<script>
	import { Toast } from 'mint-ui';
	export default{
		data(){
			return{
				value:[],
				chatName:'',
				name:false,
				friends:'',
				username:'',
				groupName:this.$route.params.groupName
			}
		},
		async created(){
			this.username=sessionStorage.getItem('username');
			if(this.$route.params.groupName=='添加群聊'){
				let {data:{data,err,msg}}=await this.axios.post('/getFriend',{
					user:this.username
				});
				if(data){
					this.friends=data;
				}
			}else{
				this.name=true;
				this.chatName=this.groupName;
				let {data:{data}}=await this.axios.get('api/others',{
					params:{
						user:this.username,
						groupName:this.groupName
					}
				});
				if(data.length>0){
					this.friends=data;
				}
			}
		},
		methods:{
			async checkName(){
				if(this.chatName=='查找好友' || this.chatName=='添加群聊'){
					Toast({
						message: '此名称不符合规定，请重新输入',
						position: 'middle',
						duration: 1500
					})
				}else{
					let {data:{data}}=await this.axios.post('checkName',{
						chatName:this.chatName
					});
					if(data=='00'){
						Toast({
							message: '此名称已注册，请重新输入',
							position: 'middle',
							duration: 1500
						})
					}else{
						this.name=true;
					}
				}
			},
			async addGroup(){
				if(this.groupName=='添加群聊'){
					this.value.unshift(this.username);
				}
				let newDate=new Date().getTime();
				let {data:{data}}=await this.axios.post('addGroup',{
					value:this.value,
					chatName:this.chatName,
					leastTime:newDate
				});
				if(data=='ok'){
					let message=this.groupName=='添加群聊'? '创建成功':'添加成功'
					Toast({
						message,
						position: 'middle',
						duration: 1000
					});
					this.$router.push('/index');
				}
			}
		},
		computed:{
			title(){
				return this.$route.params.groupName=='添加群聊'? '建立群聊':'添加好友'
			}
		}
	}
</script>

<style scoped>
	.title{
		width: 100%;
		height: 3rem;
		background: white;
		text-align: center;
		line-height: 3rem;
		top: 40px;
		position: relative;
	}
	.friendContent{
		background: white;
	}
	.friendContent .myFriend{
		width: 100%;
		height: 3rem;
		margin-top: 4rem;
	}
	.friendContent .myFriend img{
		width: 3rem;
		height: 2rem;
		position: absolute;
		left: 0.5rem;
		padding-top: 0.5rem;
	}
	.friendContent .myFriend>.title2{
		position: absolute;left: 4rem;line-height: 3rem;font-weight: 500;
	}
	.friendContent>.myFriend:after{width: 3rem;height: 3rem;position: absolute;right: 0;content: '';background: url('../../assets/imgs/close2.png')}
	.friendContent ul{width: 100%;overflow: hidden;}
	.friendContent ul li{width: 100%;height: 3rem;}
	.friendContent ul li input[type=checkbox]{visibility:hidden;width: 1.8rem;margin-top: 0.6rem;}
	.friendContent ul li label{position:absolute;width:1.5rem;height:1.5rem;left:0.625rem;background:#fff;border:2px solid #ccc;-moz-border-radius:50%;-webkit-border-radius:50%;border-radius:50%;margin-top: 0.6rem;}
	.friendContent ul li label:after {opacity:0;content:'';position:absolute;width:0.5625rem;height:0.3125rem;background:transparent;top:0.375rem;left:0.375rem;border:0.25rem solid #fff;border-top:none;border-right:none;-webkit-transform:rotate(-45deg);-moz-transform:rotate(-45deg);-o-transform:rotate(-45deg);-ms-transform:rotate(-45deg);transform:rotate(-45deg);}
	input[type=checkbox]:checked + label {background:#26a2ff;border:2px solid #26a2ff;}
    input[type=checkbox]:checked + label:after {opacity:1;}
	.friendContent ul li>img{width: 2rem;height: 2rem;margin: 0.5rem;border-radius: 50%;position: relative;display: inline-block;}
	.friendContent ul li .message-f1{position: relative;height: 3rem;top: -3rem;left: 5.5rem;}
	.friendContent ul li .f-Name{position: absolute;top: 0rem;font-size: 0.95rem;font-weight: 500;}
	.friendContent ul li .P-signature{font-size: 0.75rem;color: #888;position: absolute;top:
		 1.25rem;}
	.createDialog{position: absolute;bottom: 0.5rem;height: 3rem;}
</style>
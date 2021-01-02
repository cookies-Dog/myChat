<template>
	<div v-if="message.length>0">
		<mt-header fixed title="群设置">
			<mt-button icon="back" slot="left" @click="$router.back()">返回</mt-button>
		</mt-header>
		<div class="groupContent">
			<div class="groupImg">
				<div class="img">
					<img :src="message[0].friendImg|imgPath" alt="">
				</div>
				<div class="groupName">
					<p>{{title}}</p>
					<p class="name">{{message[0].signature}}</p>
				</div>
				<div class="submitImg">
					<input class="file" type="file" accept="image/*" name="f1" ref="image"
					:disabled="user!==message[0].username" />
				</div>
			</div>
			<div class="members">
				<div class="members-row1">
					<p>群成员{{`(${message.length})`}}</p>
				</div>
				<div class="memberContent">
					<ul :style="{width:message.length*4+'rem'}">
						<li v-for="item,index in message" @click="isJump(index)">
							<img :src="item.image|imgPath" alt="">
							<p class="memberName">{{item.username}}</p>
						</li>
					</ul>
				</div>
				<div class="addMember" @click="isJump2()">
					<div>
						<img src="../assets/imgs/add.png" alt="">
					</div>
					<p>添加</p>
				</div>
			</div>
			<div class="groupMessage">
				<mt-field label="群聊名称" v-model="newGroupName" :disabled="user!==message[0].username"></mt-field>
				<mt-field label="群聊发起人" disabled v-model="groupManager"></mt-field>
				<mt-field label="群公告" v-model="groupSignature" :disabled="user!==message[0].username"></mt-field>
				<mt-field label="群聊备注" v-model="groupNote" :disabled="user!==message[0].username"></mt-field>
			</div>
		</div>
		<mt-button class="delGroup" v-if="user==message[0].username" @click="delGroup()">解散群聊</mt-button>
		<button class="sumbit" @click="modGroupMsg()" v-if="user==message[0].username">确认修改</button>
		<button class="exitGroup" v-if="user!==message[0].username" @click="exitGroup()">退出该群聊</button>
	</div>
</template>
<script>
	import {Toast} from 'mint-ui';
	import { MessageBox } from 'mint-ui';
	export default{
		data(){
			return{
				title:this.$route.params.groupName,
				message:[],
				newGroupName:'',
				groupSignature:'',
				groupNote:'',
				groupManager:'',
				user:'',
				image:''
			}
		},
		async created(){
			this.user=sessionStorage.getItem('username');
			let {data:{data}}=await this.axios.get('api/getGroupMsg',{params:{
				title:this.title
			}});
			if(data.length>0){
				this.message=[...data];
				this.newGroupName=this.title;
				this.groupSignature=data[0].signature;
				this.groupNote=data[0].note;
				this.groupManager=data[0].username;
				this.image=data[0].friendImg;

			}
		},
		methods:{
			async modGroupMsg(){
				let formData=new FormData();
				formData.append('file',this.$refs.image.files[0]);
				formData.append('friendname',this.title);
				formData.append('groupName',this.newGroupName);
				formData.append('groupSignature',this.groupSignature);
				formData.append('groupNote',this.groupNote);
				formData.append('image',this.image);
				let config = {
            		'Content-Type': 'multipart/form-data'
        		};
        		let {data:{data}}=await this.axios.post('modGroupMsg',formData,config);
        		if(data.length>0){
					if(data=='文件过大'){
						alert(`${data}`)
					}else{
						Toast({
							message:'修改成功',
							position: 'middle',
							duration: 1000
						});
						this.$router.push({name:'dialog',params:{title:this.title}});
					}
				}
			},
			exitGroup(){
				MessageBox.confirm('你确定要退出该群聊吗？').then(async action=>{
					if(action=='confirm'){
						let {data:{data}}=await this.axios.post('exitGroup',{
							username:this.user,
							groupName:this.title
						});
						if(data){
							console.log(data)
							Toast({
								message: '已退出该群聊',
								position: 'middle',
								duration: 1000
							});
							this.$router.push('/index');
						}
					}else{
						return false;
					}
				}).catch(()=>{});
			},
			delGroup(){
				MessageBox.confirm('你确定要解散该群聊吗？').then(async action=>{
					if(action=='confirm'){
						let {data:{data}}=await this.axios.post('delGroup',{
							groupName:this.title
						});
						if(data){
							console.log(data)
							Toast({
								message: '已解散该群聊',
								position: 'middle',
								duration: 1000
							});
							this.$router.push('/index');
						}
					}else{
						return false;
					}
				}).catch(()=>{});
			},
			isJump(i){
				let group=this.groupManager+':'+this.title;
				let userInfo=this.message[i].username+'?'+'delMember';
				sessionStorage.setItem('group',group);
				this.$router.push({name:'information',params:{userInfo}});
			},
			isJump2(){
				this.$router.push({name:'addGroup',params:{groupName:this.title}});
			}
		}
	}
</script>

<style scoped>
	.groupContent{
		width: 100%;
		/*overflow: hidden;*/
		position: relative;
		top: 40px;
		/*height: 100vh;*/
	}
	.groupImg{
		width: 100%;
		background: white;
		height: 4rem;
		position: relative;
	}
	.img{
		width: 3rem;
		height: 3rem;
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		overflow: hidden;
	}
	.img img{
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
	}
	.groupName{
		width: 10rem;
		height: 3rem;
		position: absolute;
		top: 0.5rem;
		left: 4rem;
		padding: 0.25rem;
	}
	.groupName .name{
		font-size: 0.8rem;
		font-weight: 500;
		color: #b8bbbf;
	}
	.submitImg{
		width: 6rem;
		height: 4rem;
		position: absolute;
		left: 14rem;
	}
	.file{
		width:73%;
		opacity: 0;
		position: absolute;
		top: 1rem;
		z-index: 999;
	}
	.submitImg:after{width: 1rem;
		height: 1.5rem;
		position: absolute;
		top: 40%;
		left: 80%;
		content: '';
		background:url('../assets/imgs/sprite-img.png') -1966px -76px no-repeat;zoom: 1.2;
	}
	.members{
		width: 100%;
		height:6rem;
		position: relative;
		top: 0.8rem;
		background: white;
		overflow: hidden;
	}
	.members-row1{
		width: 100%;
		height: 1.5rem;
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
	}
	.memberContent{
		width: 16rem;
		height: 4rem;
		position: absolute;
		top: 2rem;
		overflow-x: scroll;
	}
	.memberContent::-webkit-scrollbar {
  		display: none;
	}
	.members ul{
		height: 4rem;
	}
	.members ul li{
		width: 2rem;
		height: 3rem;
		padding: 0.5rem 1rem;
		text-align: center;
		overflow: hidden;
		display: inline-block;
	}
	.members ul li img{
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
	}
	.members ul li .memberName{
		font-size: 12px;
	}
	.addMember{
		width: 2rem;
		height: 3rem;
		padding: 0.5rem 1rem;
		text-align: center;
		position: absolute;
		top: 2rem;
		left: 16rem;
	}
	.addMember div{
		width: 2rem;
		height: 2rem;
		background: #ccc;
		border-radius: 50%;
	}
	.addMember div img{
		width: 2rem;
		height: 2rem;
	}
	.addMember p{
		font-size: 12px;
	}
	.groupMessage{
		width: 100%;
		height: auto;
		position: relative;
		top: 1.8rem;
		background: white;
		z-index: 999;
	}
	.sumbit{
		width: 100%;
		height: 2.5rem;
		background:#4fa9ec;
		color: white;
		border: none;
		outline: none;
		font-size: 1rem;
		border-radius: 0.5rem;
		position: absolute;
		bottom: 0;
	}
	.delGroup{
		position: absolute;
		bottom: 5rem;
		width: 100%;
		height: 2.5rem;
		background: #d9d9d9;
		border: none;
		outline: none;
		font-size: 1rem;
		color: red;
	}
	.exitGroup{
		width: 100%;
		height: 2.5rem;
		background:red;
		color: white;
		border: none;
		outline: none;
		font-size: 1rem;
		border-radius: 0.5rem;
		position: absolute;
		bottom: 0;
	}
</style>
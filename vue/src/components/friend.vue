<template>
	<div class="middle-container">
			<div class="row1">
				<input type="text" placeholder="请搜索用户名" @input="searchUser()" v-model="searchUsername" @mouseout="hideResult()" />
				<ul class="username" v-if="searchResult.length>0">
					<li v-for="item,index in searchResult" :key="index" :class="{active:item.username==searchUsername}" @click="toInformation(index)">
						<img :src="item.image|imgPath" alt="">
						<p>{{item.username}}</p>
					</li>
				</ul>
			</div>
			<div class="newFriendContent">
				<div class="newFriend" @touchstart="getNewFriend()">
					<img src="../assets/imgs/admin2.png" alt="">
					<p class="title">新朋友</p>
					<span class="count" v-if="newFriendCount>0">{{newFriendCount}}</span>
				</div>
				<ul v-if="showNewFriend==true">
					<li v-for="newFriend,index in newFriends" :key="index" @click="toInformation3(index)">
						<img :src="newFriend.friendImg|imgPath" alt="">
						<div class="newFriendMsg">
							<span class="fName-f1">{{newFriend.username}}</span>
							<span class="newMsg">{{newFriend.message}}</span>
						</div>
					</li>
				</ul>
			</div>
			<div class="friendContent">
				<div class="myfriend" @click="getFriend()">
					<img src="../assets/imgs/admin2.png" alt="">
					<p class="title">我的好友 ({{friendCount}})</p>
				</div>
				<ul v-if="showFriends==true">
					<li v-for="friend,index in friends" :key="index" @touchend="toInformation2(index)">
						<img :src="friend.friendImg|imgPath" alt="好友头像">
						<div class="message-f1">
							<span class="f-Name">{{friend.friendName}}</span>
							<span class="P-signature">{{friend.signature}}</span>
						</div>
					</li>
				</ul>
			</div>
	</div>
</template>

<script>
	export default{
		data(){
			return{
				searchUsername:'',
				searchResult:[],
				showFriends:false,
				showNewFriend:false,
				friends:'',
				myName:'',
				friendCount:0,
				newFriendCount:0,
				newFriends:'',
			}
		},
		async created(){
			this.myName=sessionStorage.getItem('username');
			let {data:{data,err,msg}}=await this.axios.get('/api/getFriendCount',{
					params:{user:this.myName}
				});
				if(data.length>0){
					this.friendCount=data[0].friendCount;
					this.newFriendCount=data[1].newFriendCount;
				}
		},
		sockets:{
			getMsgs(data){
				if(data.user==this.myName){
					this.newFriendCount++;
				}
			}
		},
		methods:{
			async searchUser(){
				if(this.searchUsername.length>0){
					let {data:{data,err,msg}}=await this.axios.post('/searchFriend',{
						friendname:this.searchUsername
					});
					if(err){
						console.log(msg)
					}else{
						if(data=='你查找的用户不存在'){
							this.searchResult=[];
							this.searchResult.push({username:data})
						}else{
							this.searchResult=data;
						}
					}
				}
			},
			async getNewFriend(){  
				this.showNewFriend=!this.showNewFriend;
				let {data:{data,err,msg}}=await this.axios.get('/api/getNewFriend',{
					params:{friendName:this.myName}
				});
				if(data.length>0){
					this.count=data.length;
					this.newFriends=data;
				}
			},
			async getFriend(){
				this.showFriends=!this.showFriends;
				let user=sessionStorage.getItem('username');
				if(this.friends.length==0 && this.showFriends==true){
					let {data:{data,err,msg}}=await this.axios.post('/getFriend',{user});
					if(err){
						console.log(msg)
					}else{
						if(data.length>0) this.friends=data;
					}
				}
			},
			hideResult(){
				setTimeout(()=>{
					this.searchResult=[];
				},100);
			},
			toInformation(i){
				if(this.searchResult[i].username!=='你查找的用户不存在'){
					let userInfo=this.searchResult[i].username+'?'+'add';
					this.$router.push({name:'information',params:{userInfo}});
				}
			},
			toInformation2(i){
				let userInfo=this.friends[i].friendName+'?'+'add';
				this.$router.push({name:'information',params:{userInfo}});
			},
			toInformation3(i){
				let userInfo=this.newFriends[i].username+'?'+'agreement';
				this.$router.push({name:'information',params:{userInfo}});
			}
		}
	}
</script>

<style scoped>
	.username{width: 85%;background: white;margin-left: 1.3rem;max-height: 10rem;overflow: auto;}
	.username li{width: 100%;min-height: 2rem;line-height: 2rem;position: relative;margin-top: 0.5rem;}
	.username li>img{width: 2rem;height: 2rem;border-radius: 50%;position: absolute;margin-left: 0.5rem;}
	.username li>p{position: absolute;left: 3rem;}
	.username >.active{background: rgba(0,0,0,0.3);}
	/* 新朋友 */
	.newFriendContent{width: 100%;background: white;margin-top: 0.625rem;}
	.newFriend{width: 100%;height: 3rem;position: relative;z-index: 99;}
	.newFriend img{width: 3rem;height: 3rem;position: absolute;left: 0;}
	.newFriend .title{position: absolute;left: 3rem;line-height: 3rem;font-weight: 500}
	.newFriend .count{position: absolute;top:0.9rem;right: 1rem;width: 1.2rem;height: 1.2rem;border-radius: 50%;background: red;color: white;text-align: center;line-height: 1.2rem;}
	.newFriendContent ul{width: 100%;}
	.newFriendContent ul li{width: 100%;height: 3rem;padding-left: 1rem;}
	.newFriendContent ul li>img{width: 2rem;height: 2rem;margin: 0.25rem 0.5rem;border-radius: 50%;position: relative;display: inline-block;}
	.newFriendContent ul li .newFriendMsg{position: relative;height: 3rem;top: -2.75rem;left: 3rem;}
	.newFriendContent ul li .fName-f1{position: absolute;top: 0rem;font-size: 0.95rem;font-weight: 500;}
	.newFriendContent ul li .newMsg{font-size: 0.75rem;color: #888;position: absolute;top:
		 1.25rem;}
	/* 好友 */
	.friendContent{width: 100%;background: white;}
	.friendContent>.myfriend{width: 100%;height: 3rem;position: relative;}
	.friendContent>.myfriend>img{width: 3rem;height: 3rem;position: absolute;left: 0;}
	.friendContent>.myfriend .title{position: absolute;left: 3rem;line-height: 3rem;font-weight: 500}
	.friendContent>.myfriend:after{width: 3rem;height: 3rem;position: absolute;right: 0;content: '';background: url('../assets/imgs/close2.png')}
	.friendContent ul{width: 100%;}
	.friendContent ul li{width: 100%;height: 3rem;padding-left: 1rem;}
	.friendContent ul li>img{width: 2rem;height: 2rem;margin: 0.25rem 0.5rem;border-radius: 50%;position: relative;display: inline-block;}
	.friendContent ul li .message-f1{position: relative;height: 3rem;top: -2.75rem;left: 3rem;}
	.friendContent ul li .f-Name{position: absolute;top: 0rem;font-size: 0.95rem;font-weight: 500;}
	.friendContent ul li .P-signature{font-size: 0.75rem;color: #888;position: absolute;top:
		 1.25rem;}
</style>
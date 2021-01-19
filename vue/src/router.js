import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);
import {Toast} from 'mint-ui'
import login from '@/components/user/login'
import forget from '@/components/user/forget'
import register from '@/components/user/register'
import agreement from '@/components/user/agreement'
import index from '@/components/user/index'
import message from '@/components/user/message'
import dialog from '@/components/user/dialog'
import friend from '@/components/user/friend'
import information from '@/components/user/information'
import personalData from '@/components/user/personalData'
import modMessage from '@/components/user/modMessage'
import changePassword from '@/components/user/changePassword'
import email from '@/components/user/email'
import addGroup from '@/components/user/addGroup'
import modGroupMsg from '@/components/user/modGroupMsg'
import searchFriend from '@/components/user/searchFriend'

const router= new Router({
	mode:'history',
	base:'/chat/',
	routes:[
		{path:'/login',name:'login',component:login},
		{path:'/forget',name:'forget',component:forget},
		{path:'/register',name:'register',component:register},
		{path:'/agreement',name:'agreement',component:agreement},
		{path:'/index',name:'index',component:index,
		children:[
			{path:'/index',name:'message',component:message},
			{path:'/friend',name:'friend',component:friend},
		]},
		{path:'/dialog/:title',name:'dialog',component:dialog},
		{path:'/information/:userInfo',name:'information',component:information},
		{path:'/personalData',name:'personalData',component:personalData},
		{path:'/modMessage',name:'modMessage',component:modMessage},
		{path:'/changePassword',name:'changePassword',component:changePassword},
		{path:'/email/:emailState',name:'email',component:email},
		{path:'/addGroup/:groupName',name:'addGroup',component:addGroup},
		{path:'/modGroupMsg/:groupName',name:'modGroupMsg',component:modGroupMsg},
		{path:'/searchFriend/:friendName',name:'searchFriend',component:searchFriend},


		{path:'*',redirect:'/login'}
	]
});
//全局路由守卫
router.beforeEach((to,from,next)=>{
	const nextRouter=['message','dialog','friend','information','index',
	'personalData','modMessage','email','addGroup','modGroupMsg','searchFriend'];
	//let token=window.localStorage.getItem('token');
	let token=sessionStorage.getItem('token');
	if(nextRouter.indexOf(to.name)>-1){
		if(!token){
			router.push('login');
			Toast({
				message: '访问权限已过期，请重新登陆',
				position: 'middle',
				duration: 1000
			})
		}
	}
	//满足条件放行
	next()
});

const routerPush=Router.prototype.push;
Router.prototype.push=function push(location) {
	return routerPush.call(this,location).catch(error=>error)
}

export default router;
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);
import {Toast} from 'mint-ui'
import login from '@/components/login'
import forget from '@/components/forget'
import register from '@/components/register'
import agreement from '@/components/agreement'
import index from '@/components/index'
import message from '@/components/message'
import dialog from '@/components/dialog'
import friend from '@/components/friend'
import information from '@/components/information'
import personalData from '@/components/personalData'
import modMessage from '@/components/modMessage'

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

		{path:'*',redirect:'/login'}
	]
});
//全局路由守卫
router.beforeEach((to,from,next)=>{
	const nextRouter=['message','dialog','friend','information','index','personalData'];
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
	next()
});

const routerPush=Router.prototype.push;
Router.prototype.push=function push(location) {
	return routerPush.call(this,location).catch(error=>error)
}

export default router;
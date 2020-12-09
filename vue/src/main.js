import Vue from 'vue'
import App from './App.vue'
import Mint from 'mint-ui'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueSocketIo from 'vue-socket.io'
import store from './store'
import router from './router'

import 'mint-ui/lib/style.css'

Vue.filter('imgPath',val=>{  //过滤器
	return 'http://106.52.230.56/mobile/upload/'+val;
});

//本地：http://192.168.43.45:8000/ localhost:8000
//服务器：http://106.52.230.56/mobile/

Vue.config.productionTip = false

Vue.use(Mint);  //使用mint-ui组件

axios.defaults.baseURL = 'http://106.52.230.56/mobile/'; //默认请求路径
Vue.use(VueAxios,axios);

Vue.use(new VueSocketIo({
	debug: false,
	connection:'http://106.52.230.56',  //与服务器端口一致
}));

new Vue({
	store,router,
  render: h => h(App),
}).$mount('#app')

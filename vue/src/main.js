import Vue from 'vue'
import App from './App.vue'
import Mint from 'mint-ui'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueSocketIo from 'vue-socket.io'
import store from './store'
import router from './router'

import 'mint-ui/lib/style.css'

Vue.filter('imgPath',val=>{
	return 'http://106.52.230.56/mobile/upload/'+val;
});

//192.168.43.198:8000

Vue.config.productionTip = false

Vue.use(Mint);

axios.defaults.baseURL = 'http://106.52.230.56/mobile/';
Vue.use(VueAxios,axios);

Vue.use(new VueSocketIo({
	debug: false,
	connection:'http://106.52.230.56',
}));

new Vue({
	store,router,
  render: h => h(App),
}).$mount('#app')

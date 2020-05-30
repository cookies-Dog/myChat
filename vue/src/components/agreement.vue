<template>
	<div class="agreement">
		<mt-header fixed title="服务协议">
			<mt-button slot="left" icon="back" @click="$router.back()">返回</mt-button>
		</mt-header>
		<div class="agreeContent">
			<h1>管他说啥呢，喵就对了！</h1>
		</div>
	</div>
</template>

<script>

	export default {
		data(){
			return{
				
			}
		}
	}
</script>

<style scoped>
	.agreeContent{width: 100%;position: absolute;top: 2.5rem;overflow: hidden;}
</style>
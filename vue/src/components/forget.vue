<template>
	<div>
		<mt-header fixed title="忘了密码">
			<mt-button slot="left" icon="back" @click="$router.back()">返回</mt-button>
		</mt-header>
		<mt-tab-container>
			<mt-tab-container-item>
				<h1>活该！</h1>
			</mt-tab-container-item>
		</mt-tab-container>
	</div>
</template>

<style scoped>
	.mint-tab-container-item{
		margin-top:100px;
	}
</style>
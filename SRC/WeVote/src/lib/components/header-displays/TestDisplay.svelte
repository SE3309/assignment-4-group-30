<script lang="ts">
    import Figment from "./Figment.svelte";
</script>

<Figment alignment="center" delay={0} position={{x: -150, y: -30, z: -100}} rotation={{x: 0, y: 50 , z: -10}}><h1>T</h1></Figment>
<Figment alignment="center" delay={50} position={{x: -50, y: 40, z: -75}} rotation={{x: 35, y: -30 , z: 30}}><h1>e</h1></Figment>
<Figment alignment="center" delay={100} position={{x: 50, y: -20, z: -25}} rotation={{x: -34, y: -30 , z: -20}}><h1>s</h1></Figment>
<Figment alignment="center" delay={150} position={{x: 150, y: 50, z: 0}} rotation={{x: 30, y: -80 , z: 0}}><h1>t</h1></Figment>

<style>
	h1 {
		color: #5a8c8b; 
		margin: 0px;
		font-size: 5em;
	}
</style>
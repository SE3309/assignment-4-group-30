<script lang="ts">
    import Figment from "./Figment.svelte";
</script>

<Figment alignment="center"
		 delay={0}
		 position={{x: -170, y: 0, z: 0}}
		 rotation={{x: 0, y: 80, z: 0}}>
	<h1>S</h1>
</Figment>
<Figment alignment="center"
		 delay={50}
		 position={{x: -125, y: 20, z: -30}}
		 rotation={{x: 30, y: 50, z: -20}}>
	<h1>i</h1>
</Figment>
<Figment alignment="center"
		 delay={100}
		 position={{x: -80, y: -40, z: -60}}
		 rotation={{x: -10, y: 50, z: 0}}>
	<h1>g</h1>
</Figment>
<Figment alignment="center"
		 delay={150}
		 position={{x: 0, y: 0, z: -70}}
		 rotation={{x: 10, y: 30, z: 20}}>
	<h1>n</h1>
</Figment>
<Figment alignment="center"
		 delay={200}
		 position={{x: 130, y: -10, z: -30}}
		 rotation={{x: 30, y: 0 , z: 20}}>
	<h1>I</h1>
</Figment>
<Figment alignment="center"
		 delay={250}
		 position={{x: 170, y: 10, z: 0}}
		 rotation={{x: 0, y: -70 , z: 0}}>
	<h1>n</h1>
</Figment>

<style>
	h1 {
		color: #5a8c8b; 
		margin: 0px;
		font-size: 5em;
	}
</style>
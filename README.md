# node-gimp

Node can talk to GIMP!

@todo insert cool video

## Usage

```js
// my-cool-program.js

import Gimp from 'node-gimp';


(async function main() {
	const gimp = new Gimp();
	const res = await gimp.sendCommand('(gimp-image-list)');
	console.log(res); // => 
})();

```


The Gimp() constructor can be passed options.

```js
const options = {
	port: 38483,         // defaults to 10008
	responseTimeout: 100 // defaults to 1000
};
const gimp = new Gimp(options);
```



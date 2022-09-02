# node-gimp

Send Script-Fu commands from Node.js to GIMP. Can be used to set colors, create text or layers, run filters, you name it. 

@todo insert cool video

## Usage

```js
// my-cool-program.js

import Gimp from 'node-gimp';


(async function main() {
	const gimp = new Gimp();
	const res = await gimp.sendCommand('(gimp-image-list)');
	console.log(res); // => "(1 #(1))"
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



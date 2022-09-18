# node-gimp

Send Script-Fu commands from Node.js to GIMP. Can be used to set colors, create text or layers, run filters, you name it. 

@todo insert cool video

## Usage

Here's an example using promises.

```js
// my-cool-program.js

import Gimp from 'node-gimp';


(async function main() {
	const gimp = new Gimp();
	const res = await gimp.sendCommand('(gimp-image-list)');
	console.log(res); // => { raw: '(1 #(1))', jse: [ 1, '#', [ 1 ] ] }
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


### Events

A node-gimp class instance emits the following events

  * connect
  * data
  * error

These can be listened to by your code.


#### Events Example

```js
const gimp = new Gimp();

gimp.on('connect', () => {
	console.log('GIMP connection established!');
})

/**
 * data event payload includes responses 
 * to the commands that we send to Gimp.
 */
gimp.on('data', (data) => {
	console.log('GIMP sent us some data!')

	// data variable will contain an object with the {String} response from Script-Fu server, 
	// as well as a javascript expression (jse) of that response.
	// example: { raw: '#t', jse: [true] }
	console.log(data);
})

gimp.on('error', (e) => {
	console.error('GIMP emitted an error!')
	console.error(e)
})


const exampleCommand = `(gimp-context-set-foreground '(255 0 255))`;
gimp.sendCommand(exampleCommand);
```


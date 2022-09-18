import { jest } from '@jest/globals'
import toBeType from "jest-tobetype";
expect.extend(toBeType);
import Gimp from '../Gimp';


// describe('event emitter', () => {
// 	test('connected event', () => {
// 		const mError = new Error('network');
// 		const mServer = {
// 			listen: jest.fn().mockReturnThis(),
// 			on: jest.fn().mockImplementationOnce((event, handler) => {
// 				// handler is the original callback, the mError variable will be passed into the original callback.
// 				handler(mError);
// 			}),
// 		};
// 		const createServerSpy = jest.spyOn(http, 'createServer').mockImplementationOnce(() => mServer);
// 		const logSpy = jest.spyOn(console, 'log');
// 		require('./server');
// 		expect(createServerSpy).toBeCalledTimes(1);
// 		expect(mServer.listen).toBeCalledWith(8080, '127.0.0.1');
// 		expect(mServer.on).toBeCalledWith('error', expect.any(Function));
// 		expect(logSpy).toBeCalledWith(mError);
// 	});
// 	// test('disconnection event');
// 	// test('automatic reconnection');
// });

// describe('idk', () => {
// 	test('disconnection detection', async () => {
// 		jest.mock('../Gimp');
		
// 		const net = jest.createMockFromModule('node:net');

// 		const mockSocket = new net.Socket({});

// 		const mockError = new Error('disconnected');

// 		net.mockImplementation(() => {
// 			return {
// 				connect: jest.fn().mockImplementationOnce((params) => {
// 					console.log(`mockSocket called with port:${params.port}`);
// 				})
// 			}
// 		})

// 		Gimp.mockImplementation(() => {
// 		  	return {
// 				on: jest.fn().mockImplementationOnce((event, handler) => {
// 					handler(mockError);
// 				}),
// 				socket: mockSocket
// 			};
// 		});


// 		const gimp = new Gimp({ reconnectionTimeout: 500 });
// 		gimp.on('disconnect', () => {

// 		})
// 		await gimp.connect();

// 		// forcefully d/c
// 		mockSocket.destroy();


// 		expect(mockGimp.on).toBeCalledWith('disconnection', expect.any(Function));;
// 	})
// })

describe('sendCommand', () => {
	test('integration', async () => {
		const gimp = new Gimp();
		await gimp.connect();
		const resP = gimp.sendCommand('(gimp-image-list)');
		await expect(resP).resolves.toBeType("object");
		await gimp.disconnect();
	});
	test('change the colour of gimp foreground', async () => {
		const gimp = new Gimp();
		await gimp.connect();
		const res = await gimp.sendCommand(`(gimp-context-set-foreground '(80 30 70))`);
		expect(res.raw).toBe("(#t)");
		await gimp.disconnect();
	});
});


describe('gimpImageList', () => {
	test('integration', async () => {
		const gimp = new Gimp();
		await gimp.connect();
		const res = await gimp.gimpImageList();
		expect(res.raw).toBeType("string");
		expect(res.jse[0]).toBeType("number");
		expect(res.jse[1]).toBe("#");
		expect(res.jse[2]).toBeType("array");
		await gimp.disconnect();
	})
})

describe('gimpTextLayerNew', () => {
	test('integration', async () => {
		const gimp = new Gimp();
		await gimp.connect();
		const iRes = await gimp.gimpImageList();
		const { jse } = iRes;
		const image = jse[2][jse[2].length-1];
		const text = 'Hello World!';
		const fontname = 'Nimbus Sans';
		const size = '35';
		const unit = 0;

		const tRes = await gimp.gimpTextLayerNew(image, text, fontname, size, unit);

		expect(tRes.jse[0]).toBeType("number");
		await gimp.disconnect();
	})
})


describe('gimpImageInsertLayer', () => {
	test('integration', async () => {
		const gimp = new Gimp();
		await gimp.connect();
		const iRes = await gimp.gimpImageList();
		console.log(iRes)
		const image = iRes.jse[2][iRes.jse[2].length-1];
		const tRes = await gimp.gimpTextLayerNew(image);
		console.log(tRes)
		const textLayer = tRes.jse[0];
		console.log(` gimp-image-insert-layer incoming with image:${image} textLayer:${textLayer}`)
		const res = await gimp.gimpImageInsertLayer(image, textLayer, 0, -1);
		console.log(res)
		await gimp.disconnect();
	})
})


describe('gimpTextFontname', () => {
	test('integration', async () => {
		const gimp = new Gimp();
		await gimp.connect();
		console.log('get image list')
		const iRes = await gimp.gimpImageList();
		console.log(iRes);
		const image = iRes.jse[2][iRes.jse[2].length-1];
		// (image, drawable, x, y, text, border, antialias, size, sizeType, fontname)
		console.log(`create text with image ${image}`);
		const res = await gimp.gimpTextFontname(image, -1, 50, 50, "Hello world!", 0, 0, 35, 0, 'Nimbus Sans');
		console.log('here is the result')
		console.log(res);
		await gimp.disconnect();
	})
})

describe('gimpImageHeight', () => {
	test('integration', async () => {
		const gimp = new Gimp();
		await gimp.connect();
		const iRes = await gimp.gimpImageList();
		const image = iRes.jse[2][iRes.jse[2].length-1];
		const { jse } = await gimp.gimpImageHeight(image);
		expect(jse).toBeType("array");
		expect(jse[0]).toBeType("number");
		await gimp.disconnect();
	})
});

describe('gimpImageWidth', () => {
	test('integration', async () => {
		const gimp = new Gimp();
		await gimp.connect();
		const iRes = await gimp.gimpImageList();
		const image = iRes.jse[2][iRes.jse[2].length-1];
		const { jse } = await gimp.gimpImageWidth(image);
		expect(jse).toBeType("array");
		expect(jse[0]).toBeType("number");
		await gimp.disconnect();
	})
});



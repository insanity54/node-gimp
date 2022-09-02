import { jest } from '@jest/globals'
import Gimp from '../Gimp';


describe('sendCommand', () => {
	test('invocation', async () => {
		const gimp = new Gimp();
		const resP = gimp.sendCommand('(gimp-image-list)');
		await expect(resP).resolves.toMatch(/\(\d #\(/);
	});
});
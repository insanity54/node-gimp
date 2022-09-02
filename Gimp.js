// Gimp.js

import { decode, createDecode, types } from 'binary-data';
import net from 'node:net';

const { uint8, array } = types;

export default class Gimp {

    constructor (options) {
        this.port = options?.port || 10008;
        this.responseTimeout = options?.responseTimeout || 1000;
        this.socket = new net.Socket({});
        this.protocol = {
            magic: uint8,
            error: uint8,
            lengthH: uint8,
            lengthL: uint8,
            output: array(uint8, ({node}) => node.lengthL, 'bytes')
        };
        this.decoder = createDecode(this.protocol);

        return this;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.socket.connect({
                port: this.port
            });
            this.socket.on('connect', () => { resolve(this) });
            this.socket.on('error', (e) => { reject(e) });
        });
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            this.socket.end();
            this.socket.on('end', () => { resolve(this) })
            this.socket.on('error', (e) => { reject(e) });
        })
    }



    send(gimpCommand) {
        return new Promise((resolve, reject) => {
            try {
                const magic = new Buffer.alloc(1, 'G');
                const commandBuffer = new Buffer.from(gimpCommand);
                const commandLenH = new Buffer.alloc(1, 0);
                const commandLenL = new Buffer.alloc(1, commandBuffer.length);
                const payload = new Buffer.concat([magic, commandLenH, commandLenL, commandBuffer]);
                this.socket.write(payload, resolve);
            } catch (e) {
                reject(e);
            }
        });
    }

    setupDecoder() {
        this.socket.pipe(this.decoder);
    }

    async sendCommand(gimpCommand) {
        await this.connect();
        this.setupDecoder();
        await this.send(gimpCommand);
        const res = await this.getResponse();
        await this.disconnect();
        return res;
    }

    async getResponse() {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject('timeout while waiting for response from GIMP');
            }, this.responseTimeout);
            this.decoder.on('data', (packet) => {
                const p = this.translatePacket(packet);
                clearTimeout(timer);
                resolve(p);
            });
        });
    }



    translatePacket(packet) {
        // convert to ascii using a hackish method of creating a second Buffer to do the conversion
        return new Buffer.from(packet.output).toString('ascii');
    }
};




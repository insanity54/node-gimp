// Gimp.js

import { decode, createDecode, types } from 'binary-data';
import net from 'node:net';
import { EventEmitter } from 'node:events';
import s from 'my-little-schemer';
import queue from 'fastq';
const { uint8, array } = types;



export default class Gimp extends EventEmitter {

    constructor (options) {
        super();
        this.port = options?.port || 10008;
        this.responseTimeout = options?.responseTimeout || 1800;
        this.reconnectionTimeout = options?.reconnectionTimeout || 2000;

        this.socket = new net.Socket();
        this.intervalConnect = false;


        

        this.socket.on('connect', this.clearIntervalConnect.bind(this));

        this.socket.on('error', (err) => {
            console.log(err);
            console.error('we had error on teh socket');
            this.emit('error', err);
            this.launchIntervalConnect.bind(this);
        })

        this.socket.on('close', this.launchIntervalConnect.bind(this));
        this.socket.on('end', this.launchIntervalConnect.bind(this));

        this.protocol = {
            magic: uint8,
            error: uint8,
            lengthH: uint8,
            lengthL: uint8,
            output: array(uint8, ({node}) => node.lengthL, 'bytes')
        };

        this.sendQueue = queue.promise(this, this.queueWorker, 1); // concurrency of 1

        this.setupDecoder();

    }


    connect () {
        this.socket.connect({ port: this.port });
    }

    launchIntervalConnect() {
        if (this.intervalConnect) return;
        console.log('ok boiiis lets launchIntervalConnect()')
        this.intervalConnect = setInterval(this.connect.bind(this), 2000);
    }

    clearIntervalConnect() {
        if (!this.intervalConnect) return;
        this.emit('connect');
        clearInterval(this.intervalConnect);
        this.intervalConnect = false;
    }


    // the worker function that acts on the sendQueue
    async queueWorker (gimpCommand) {
        try {
            await this.__send(gimpCommand);
            const res = await this.getResponse();
            return res;
        } catch (e) {
            console.error('error while queue thing');
            console.log(e);
        }
    }


    setupDecoder() {
        this.decoder = createDecode(this.protocol);
        this.socket.pipe(this.decoder);
    }



    /**
     * under-the-hood __send. This bypasses the queue which means it is possible to call this too quickly
     * and therefor receive responses out of order. It's best to use send() unless another rate-limiting method is employed
     */
    __send(gimpCommand) {
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

    async getResponse() {
        return new Promise((resolve, reject) => {
            // let timer = setTimeout(() => {
            //     reject('ERROR: Timeout reached while waiting for response from GIMP');
            // }, this.responseTimeout);
            this.decoder.once('data', (data) => {
                const translated = this.translatePacket(data);
                const expression = this.parseResponse(translated);
                // clearTimeout(timer);

                const d = {
                    raw: translated,
                    jse: expression
                };

                console.log(d)

                // emit on the socket so libraries importing this Gimp client can stay up-to-date
                this.emit('data', d);

                resolve(d)
            })
        });
    }

    async sendCommand(gimpCommand) {
        const res = await this.sendQueue.push(gimpCommand);
        return res;
    }

    parseResponse(data) {
        return s.jSExpression(data);
    }




    translatePacket(packet) {
        // convert to ascii using a hackish method of creating a second Buffer to do the conversion
        return new Buffer.from(packet.output).toString('ascii');
    }


    async gimpImageList () {
        return this.sendCommand(`(gimp-image-list)`);
    }

    async gimpTextLayerNew (image, text = 'Hello, node-gimp!', fontname = 'Nimbus Sans', size = 35, unit = 0) {
        return this.sendCommand(`(gimp-text-layer-new ${image} "${text}" "${fontname}" ${size} ${unit})`);
    }

    // (gimp-text-fontname image drawable x y text border antialias size size-type fontname)
    async gimpTextFontname (image, drawable, x, y, text, border, antialias, size, sizeType, fontname) {
        return this.sendCommand(`(gimp-text-fontname ${image} ${drawable} ${x} ${y} "${text}" ${border} ${antialias} ${size} ${sizeType} "${fontname}")`);
    }

    async gimpImageInsertLayer (image, layer, parent, position) {
        return this.sendCommand(`(gimp-image-insert-layer ${image} ${layer} ${parent} ${position})`);
    }

    async gimpImageHeight (image) {
        return this.sendCommand(`(gimp-image-height ${image})`);
    }

    async gimpImageWidth (image) {
        return this.sendCommand(`(gimp-image-width ${image})`);
    }


};





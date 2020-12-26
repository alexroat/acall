const mediasoup = require('mediasoup');
const fs = require('fs');


export class MsServer
{
    constructor()
    {
        this.config = require("./ms-config")
    }

    static async runMediasoupWorker() {
        const config = this.config;
        const worker = await mediasoup.createWorker({
            logLevel: config.mediasoup.worker.logLevel,
            logTags: config.mediasoup.worker.logTags,
            rtcMinPort: config.mediasoup.worker.rtcMinPort,
            rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
        });

        worker.on('died', () => {
            console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
            setTimeout(() => process.exit(1), 2000);
        });
        return worker;
//        const mediaCodecs = config.mediasoup.router.mediaCodecs;
//        this.mediasoupRouter = await this.worker.createRouter({mediaCodecs});
    }

    static async  createWebRtcTransport(router) {
        const config = this.config;
        const {
            maxIncomingBitrate,
            initialAvailableOutgoingBitrate
        } = config.mediasoup.webRtcTransport;

        return await router.createWebRtcTransport({
            listenIps: config.mediasoup.webRtcTransport.listenIps,
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            initialAvailableOutgoingBitrate,
        });


    }

    static async  createConsumer(producer, transport, router, rtpCapabilities) {
        const config = this.config;
        if (!router.canConsume(
                {
                    producerId: producer.id,
                    rtpCapabilities,
                }))
            throw new Error('can not consume');
        return await transport.consume({
            producerId: producer.id,
            rtpCapabilities,
            paused: producer.kind === 'video',
        });

    }

}
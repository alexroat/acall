const {RTCPeerConnection} = require('wrtc');



(async () => {


    const pc = new RTCPeerConnection({
        portRange: {
            min: 10000, // defaults to 0
            max: 20000  // defaults to 65535
        }
    });


    console.log(pc)
    const offer = await pc.createOffer();
    console.log(offer)

console.log(pc.addEventListener)

})()



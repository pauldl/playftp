require('dotenv').config();
const FtpSrv = require('ftp-srv');
const ffprobe = require('ffprobe');
const util = require('util');
const path = require('path');
const fs = require('fs');

// First, we're going to create our resolver for pasv mode
const { networkInterfaces } = require('os');
const { Netmask } = require('netmask');

// Grab the network interfaces to see what we're listening on
const nets = networkInterfaces();
function getNetworks() {
    let networks = {};
    for (const name of Object.keys(nets)) { 
		for (const net of nets[name]) {
			if (net.family === 'IPv4' && !net.internal) {
				networks[net.address + "/24"] = net.address;
			}
		}
	}
	return networks;
}

// Resolve the correct network address based on the connection
const resolverFunction = (address) => {
	const networks = getNetworks();
	for (const network in networks) {
		if (new Netmask(network).contains(address)) {
			return networks[network];
		}
	}
    return "127.0.0.1";
}

const ftpServer = new FtpSrv({
	url: process.env.PLAYFTP_URL,
	pasv_url: resolverFunction,
	greeting: "Welcome to playftp - 3Play FTP receiver"
});

ftpServer.on('login', ({ connection, username, password }, resolve, reject) => { 
	if(username === process.env.PLAYFTP_USER && password === process.env.PLAYFTP_PASS) {
		connection.on('STOR', (error, filename) => {
			// check file type to see if it's media=
			if (error === null) {
				// is file a mov?
				if (filename.match(/\.mov$/)) {
					ffprobe(filename, { path: process.env.FFPROBE_PATH }).then((info) => {
						var timecode = '';
						for (sid in info.streams) {
							let stream = info.streams[sid];
							if (stream.codec_type && stream.codec_type === 'data' && stream.codec_tag_string && stream.codec_tag_string === 'tmcd') {
								timecode = stream.tags.timecode.replace(/[:;]/g, '-');
							}
						}
						if (timecode !== '') {
							var basename = path.basename(filename);
							var dirname = path.dirname(filename);
							var newbasename = timecode + '-' + basename;
							var newfilename = path.join(dirname, newbasename);
							console.log('Mov file detected. Renaming with timecode. ' + newbasename);
							fs.renameSync(filename, newfilename);
						}
					}).catch((err) => {
					});
				}
			}
		});
		
		return resolve({ root:process.env.PLAYFTP_ROOT });    
	}
	return reject(new FtpSrv.ftpErrors.GeneralError('Invalid username or password', 401));
});



ftpServer.listen().then(() => { 
	console.log('Ftp server is starting...')
});
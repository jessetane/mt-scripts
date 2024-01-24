import MikroApi from 'mikroapi'

export default ensureWireguardPeer

async function ensureWireguardPeer (host, opts) {
	const { publicKey, ipAddress, comment } = opts

	// setup api client
	const api = new MikroApi(host)
	await api.connect()

	// get server info
	const servers = await api.exec('/interface/wireguard/print') || []
	const server = servers[0]
	if (!server) throw new Error('no server found')
	console.log(servers)

	// create or update peer
	const peers = await api.exec('/interface/wireguard/peers/print') || []
	console.log(peers)
	const peer = peers.find(p => p['public-key'] + '=' === publicKey)
	if (peer) {
		console.log('updating peer')
		await api.exec('/interface/wireguard/peers/set', {
			'.id': peer['.id'],
			interface: server.name,
			'allowed-address': ipAddress + '/32',
			comment
		})
	} else {
		console.log('adding new peer')
		await api.exec('/interface/wireguard/peers/add', {
			interface: server.name,
			'public-key': publicKey,
			'allowed-address': ipAddress + '/32',
			comment
		})
	}

	api.close()
}

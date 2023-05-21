#!/usr/bin/env node

import MikroApi from 'mikroapi'
import fs from 'fs/promises'

const hostsJson = await fs.readFile('./hosts.json', 'utf8')
const hosts = JSON.parse(hostsJson)

const args = process.argv.slice(2)
const host = args[0]
const publicKey = args[1]
const ipAddress = args[2]
const comment = args[3]

ensureWireguardPeer(host, publicKey, ipAddress, comment)

async function ensureWireguardPeer (host, publicKey, ipAddress, comment) {
	// get host info from db 
	const config = hosts[host]
	if (!config) throw new Error(`unknown host ${host}`)

	// setup api client
	const api = new MikroApi(config)
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

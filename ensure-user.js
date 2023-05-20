#!/usr/bin/env node

import MikroApi from 'mikroapi'
import fs from 'fs/promises'

const hostsJson = await fs.readFile('./hosts.json', 'utf8')
const hosts = JSON.parse(hostsJson)

const args = process.argv.slice(2)
const host = args[0]
const user = args[1]
const group = args[2]
const password = args[3]
const sshKey = args[4]

ensureUser(host, user, group, password, sshKey)

async function ensureUser (host, user, group, password, sshKey) {
	// configure api client and connect to host
	const config = hosts[host]
	if (!config) throw new Error(`unknown host ${host}`)
	const api = new MikroApi(config)
	await api.connect()

	// create or update user
	let users = await api.exec('/user/print')
	if (users.find(u => u.name === user)) {
		// user exists
		console.log(`found existing user ${user}, updating`)
		await api.exec('/user/set', {
			'.id': user,
			group,
			password,
		})
	} else {
		// create new user
		console.log(`creating new user ${user}`)
		await api.exec('/user/add', {
			name: user,
			group,
			password
		})
	}

	if (sshKey) {
		// ensure password login is allowed
		let res = await api.exec('/ip/ssh/print')
		if (res[0]['always-allow-password-login'] === 'false') {
			console.log('ssh: enabling always-allow-password-login')
			await api.exec('/ip/ssh/set', {
				'always-allow-password-login': 'yes'
			})
		}
		// remove existing keys for user
		const keys = await api.exec('/user/ssh-keys/print') || []
		for (let k of keys) {
			if (k.user === user) {
				console.log(`removing existing ssh key ${JSON.stringify(k)}`)
				await api.exec('/user/ssh-keys/remove', { '.id': k['.id'] })
			}
		}
		// create file to hold pub key data 
		const file = `${user}.ssh-pub-key.txt`
		res = []
		while (!res.find(f => f.name === file)) {
			// check to see if file was created every 1/2 second
			res = await api.exec('/file/print', { file })
			await new Promise(r => setTimeout(r, 500))
		}
		// set file contents
		await api.exec('/file/set', {
			'.id': file,
			contents: sshKey
		})
		// import key (erases file automatically)
		console.log(`importing ssh key ${sshKey}`)
		await api.exec('/user/ssh-keys/import', {
			'public-key-file': file,
			user
		})
	}
	
	api.close()
}

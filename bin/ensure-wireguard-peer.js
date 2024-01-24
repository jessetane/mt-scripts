#!/usr/bin/env node

import fs from 'fs/promises'
import ensureWireguardPeer from '../ensure-wireguard-peer.js'

const hostsJson = await fs.readFile('./hosts.json', 'utf8')
const hosts = JSON.parse(hostsJson)

const args = process.argv.slice(2)
const host = args[0]
const publicKey = args[1]
const ipAddress = args[2]
const comment = args[3]

ensureWireguardPeer(hosts[host], { publicKey, ipAddress, comment, script: true })

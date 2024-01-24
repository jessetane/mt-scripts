#!/usr/bin/env node

import fs from 'fs/promises'
import ensureUser from '../ensure-user.js'

const hostsJson = await fs.readFile('./hosts.json', 'utf8')
const hosts = JSON.parse(hostsJson)

const args = process.argv.slice(2)
const host = args[0]
const user = args[1]
const group = args[2]
const password = args[3]
const sshKey = args[4]

ensureUser(hosts[host], user, group, password, sshKey)

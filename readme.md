# mt-scripts
Misc Mikrotik configuration scripts using the [API](https://wiki.mikrotik.com/wiki/Manual:API).

## Why
Needed some basic network automation tooling.

## How
[MikroApi](https://github.com/jessetane/mikroapi)

## Example
``` shell
$ cd mt-scripts && npm install
$ cp example.hosts.json hosts.json
$ vim hosts.json # edit accordingly
$ ./ensure-user.js hostname username group password 'ssh-rsa pubkeydata user@host'
```

## License
MIT

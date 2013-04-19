#NodeJS Git Server
===

A multi-tenant git server using NodeJS.

Read the Documented Code: [Here](http://qrpike.github.io/NodeJS-Git-Server/host.coffee.html)

Made to be able to support many git repo's and users with Read/Write customizable permissions.


## Install Git Server
===
To install the git server run:

	npm install git-server


## Example Usage
===
The GitServer is a very easy to get up and running git server. It uses the Pushover module for listening to git events, and its own layer to do the security for each repo & user.

	var GitServer = require('git-server');
	var newUser = {
		username:'demo',
		password:'demo'
	}
	var newRepo = {
		name:'myrepo',
		anonRead:false,
		users: [
			{ user:newUser, permissions:['R','W'] }
		]
	}
	_g = new GitServer([ newRepo ], [ newUser ]);

When we start the git server, it will default to port 7000. We can test this using git on this (or another ) machine.

	git clone http://localhost:7000/myrepo.git

Since this repo does *NOT* allow anonymous reading, it will prompt us for a user/pass

To make this faster, we can use the basic auth structure:

	git clone http://demo:demo@localhost:7000/myrepo.git

This should not prompt you for any user/pass. Also in the future when you push changes, or pull, it will not ask you for this info again. 


### This is a work in progress - please feel free to contribute!


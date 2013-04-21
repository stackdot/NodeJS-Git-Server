#NodeJS Git Server
=========
![image](header.png)


A multi-tenant git server using NodeJS.

Read the Documented Code: [Here](http://qrpike.github.io/NodeJS-Git-Server/host.coffee.html)

Made to be able to support many git repo's and users with Read/Write customizable permissions.


## Install Git Server
=========
To install the git server run:

	npm install git-server


## Example Usage
=========
The GitServer is a very easy to get up and running git server. It uses the [Pushover](https://github.com/substack/pushover) module for listening to git events, and its own layer to do the security for each repo & user.

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
	_g = new GitServer([ newRepo ]);

When we start the git server, it will default to port 7000. We can test this using git on this (or another ) machine.

	git clone http://localhost:7000/myrepo.git

Since this repo does *NOT* allow anonymous reading, it will prompt us for a user/pass

To make this faster, we can use the basic auth structure:

	git clone http://demo:demo@localhost:7000/myrepo.git

This should not prompt you for any user/pass. Also in the future when you push changes, or pull, it will not ask you for this info again. 

## CLI Usage
=========
When you install this package globally using

	sudo npm install -g git-server

You will now have a CLI interface you can run and interact with. 

Get started by typing `git-server` or `gitserver` into your terminal.

You should see something similar to this:
![image](cli-screenshot.png)

With this interface you can type the following to see the available commands:

	git-server> help

You will see a list of possible commands, just enter a command and the prompt will ask you for any additional details needed.

## TODO Items
=========
- Add HTTPS Support
- Add onPush & onFetch actions for repos
- 

### This is a work in progress - please feel free to contribute!
please contribute
#License
=========
(The MIT License)

Copyright (c) 2010 [Quinton Pike](https://twitter.com/QuintonPike)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

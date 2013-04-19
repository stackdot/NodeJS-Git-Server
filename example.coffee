


#Require the GitServer module
GitServer = require './host.js'



# Create a simple user:
userOne = 
	username	: 'demo'
	password	: 'demo'



###
	##Create example repo 1
	
	This repo does NOT allow Anonymous access
###
repoOne = 
	name		: 'stackdot'
	anonRead 	: false
	users		: [ { user:userOne, permissions:['R','W'] } ]



###
	##Create example repo 2
	
	This repo allows Anonymous reading (fetch,clone) access
###
repoTwo =
	name		: 'anon'
	anonRead	: true
	users		: [ { user:userOne, permissions:['R'] } ]



# Put these into arrays
repos 	= [ repoOne, repoTwo ]
users	= [ userOne ]



###
	#Create the GitServer object
	
		We are passing in `repos` array for the list of Repos we want to run  return
		We are passing in `users` for all of the users we want to use  return
		We are passing in `true` to enable verbose logging  return
		We are passing in `/tmp/repos` to specify where the .git repos should live  return
		We are passing in `7000` for the port to run on ( port 80 requires sudo )
		
###
_git = new GitServer repos, users, true, '/tmp/repos', 7000
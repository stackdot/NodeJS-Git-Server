
###
	This is the CLI interface for using git-server.
###


# Get required packages:
{EventEmitter}	= require 'events'
CLI 			= require 'cli-listener'
GitServer 		= require './host.js'
mkdirp			= require 'mkdirp'
fs				= require 'fs'
async			= require 'async'
path			= require 'path'
Table			= require 'cli-table'
commander		= require 'commander'



# Ability to pass in certain settings
commander
	.version('0.0.1')
	.option( '-p, --port [value]', 'Port to run Git on',parseInt)
	.option( '-d, --directory [value]', 'Directory of the repos')
	.option( '-l, --logging', 'Verbose logging on or off')
	.parse( process.argv )


# Set the port to either -p passed in, or fall back to port 7000
repoPort		= commander.port || 7000
logging			= commander.logging || false # set logging too


# Get this users home directory if we didnt pass in where the repo location is
getUserHomeDir = ()->
	if process.platform is 'win32'
		dir = 'USERPROFILE' 
	else dir = 'HOME'
	process.env[dir]



# Set the repo location and repo.db file
repoLocation	= commander.directory || path.join( getUserHomeDir(), './git-server/repos' )
if commander.directory != undefined
	repoDB		= commander.directory+'.db'
else
	repoDB 		= path.join( getUserHomeDir(), './git-server/repos.db' )



# Create the folders if they dont exist
mkdirp.sync repoLocation


# If we have a .db file use the data in it, otherwise use a blank object
if fs.existsSync repoDB
	repos = JSON.parse( fs.readFileSync( repoDB ) )
else repos = { repos:[], users:[] }




# GITCLI Class
class GITCLI extends EventEmitter




	###
		Constructor for the CLI interface
		@param {Object} gitServer Git-Server object instance
		@param {Array} users Users we are managing
	###
	constructor: ( @gitServer, @users = [] )->
		
		# Available calls the user can make in the CLI
		availableCalls = 
			'create repo'		: @createRepo
			'create user'		: @createUser
			'list repos'		: @listRepos
			'list users'		: @listUsers
			'add user to repo'	: @addUserToRepo
		
		# Our fabulous welcome message
		welcomeMessage = """
			Welcome to Git Server - Powered by NodeJS
			 - Repo Location: 	#{repoLocation}
			 - Listening Port: 	#{repoPort}
			 - Repo Count: #{@gitServer.repos.length}
			 - User Count: #{@users.length}
		"""
		
		# Create the CLI Object
		@cli = new CLI 'git-server', welcomeMessage, availableCalls
		
		# If we trigger a `changedData` write the data to the .db file
		@on 'changedData', @saveConfig
	
	
	
	
	# Create a new repo
	createRepo: ( callback )=>
		@cli.ask { name:'Repo Name: ', anonRead:'Anonymous Access? [y,N] :: ' }, ( err, results )=>
			if err then throw err
			name = results.name.toLowerCase()
			anon = results.anonRead.toLowerCase()
			if anon is 'y' then anon = true
			else anon = false
			@gitServer.createRepo name:name, anonRead:anon, users:[]
			@emit 'changedData'
			callback()
			
			
			
			
	# Create a new user
	createUser: ( callback )=>
		@cli.ask { username:'Users username: ', password:'Users password: ' }, ( err, answers )=>
			if err then throw err
			username = answers.username.toLowerCase()
			user = @getUser username
			if user != false
				console.log 'This username already exists'
				callback()
			else
				user = 
					username : username
					password : answers.password
				@users.push user
				@emit 'changedData'
				callback()
	
	
	
	
	# Add a user to a repo
	addUserToRepo: ( callback )=>
		@cli.ask { repoName:'Repo Name: ', username:'Users username: ', permissions: 'Permissions (comma seperated: R,W ): ' }, ( err, answers )=>
			repoName = answers.repoName.toLowerCase()
			username = answers.username.toLowerCase()
			repo = @gitServer.getRepo repoName+'.git'
			user = @getUser username
			permissions	= answers.permissions.split(',')
			permissions = ['R'] if permissions.length is 0
			if repo is false
				console.log 'Repo doesnt exist.'
			else if user is false
				console.log 'User doesnt exist.'
			else
				repo.users.push
					user: user
					permissions: permissions
				@emit 'changedData'
				callback()
	
	
	
	###
		Loop through and find this user
		@param {String} username Username of the user we are looking for
	###
	getUser: ( username )=>
		for user in @users
			return user if user.username is username
		false
	
	
	###
		Get the number of columns needed from a % width
		@param {Int} percentage Percentage of the console width
	###
	columnPercentage: ( percentage )=>
		Math.floor process.stdout.columns*( percentage/100 )
	
	
	
	
	# List out all the current users and their associated repo's & permissions
	listUsers: ( callback )=>
		users	= @users
		for user in @users
			user.repos = []
			for repo in @gitServer.repos
				for repoUser in repo.users
					if repoUser.user.username is user.username
						user.repos.push
							name: repo.name
							permissions: repoUser.permissions
		
		# create new console table
		table 	= new Table
			head:['Username','Password','Repos']
			colWidths: [@columnPercentage(40)-1,@columnPercentage(20)-1,@columnPercentage(40)-1]
		
		# Fill up the table
		for user in @users
			repos = for repo in user.repos
				"#{repo.name} (#{repo.permissions.join(',')})"
			table.push [ user.username, user.password, repos.join('\n') ]
		
		#log it
		console.log table.toString()
		callback()
	
	
	
	
	# List out all the repo's and their associated users
	listRepos: ( callback )=>
		repos = @gitServer.repos
		# Create a new table
		table = new Table
			head:['Repo Name','Anonymous Reads','Users']
			colWidths: [@columnPercentage(40)-1,@columnPercentage(20)-1,@columnPercentage(40)-1]
		
		# Fill up the table
		for repo in repos
			users = for user in repo.users
				"#{user.user.username} (#{user.permissions.join(',')})"
			table.push [ repo.name, repo.anonRead, users.join('\n') ]
		
		#log it
		console.log table.toString()
		callback()
	
	
	
	
	# Save the data to the .db file
	saveConfig: ()=>
		config = JSON.stringify({ repos:@gitServer.repos, users:@users })
		fs.writeFileSync repoDB, config



# Start me up buttercup
_g = new GitServer repos.repos, logging, repoLocation, repoPort
_c = new GITCLI _g, repos.users
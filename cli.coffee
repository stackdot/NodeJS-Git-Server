


###
	This is the CLI interface for using git-server.
###


# Get required packages:
{EventEmitter}	= require 'events'
CLI 			= require '../Node-CLI/cli.js'
GitServer 		= require './host.js'
mkdirp			= require 'mkdirp'
fs				= require 'fs'
async			= require 'async'
path			= require 'path'
Table			= require 'cli-table'



repoPort		= 7000
repoLocation	= path.resolve '../repos/'
repoDB			= path.resolve '../repos.db'



mkdirp.sync repos
if fs.existsSync repoDB
	repos = JSON.parse( fs.readFileSync( repoDB ) )
else repos = { repos:[], users:[] }



console.log repos




class GITCLI extends EventEmitter



	constructor: ( @gitServer, @users = [] )->
		
		availableCalls = 
			'create repo'		: @createRepo
			'create user'		: @createUser
			'list repos'		: @listRepos
			'list users'		: @listUsers
			'add user to repo'	: @addUserToRepo
		
		welcomeMessage = """
			Welcome to Git Server - Powered by NodeJS
			 - Repo Location: 	#{repoLocation}
			 - Listening Port: 	#{repoPort}
			 - Repo Count: #{@gitServer.repos.length}
			 - User Count: #{@users.length}
		"""
		
		@cli = new CLI 'git-server', welcomeMessage, availableCalls
		@on 'changedData', @saveConfig
	
	
	
	askQuestions: ( questions = [] )=>
		
	
	
	
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
				
		table 	= new Table
			head:['Username','Password','Repos']
			colWidths: [@columnPercentage(40)-1,@columnPercentage(20)-1,@columnPercentage(40)-1]
			
		for user in @users
			repos = for repo in user.repos
				"#{repo.name} (#{repo.permissions.join(',')})"
			table.push [ user.username, user.password, repos.join('\n') ]
		console.log table.toString()
		callback()
	
	
	listRepos: ( callback )=>
		repos = @gitServer.repos
		table = new Table
			head:['Repo Name','Anonymous Reads','Users']
			colWidths: [@columnPercentage(40)-1,@columnPercentage(20)-1,@columnPercentage(40)-1]
			
		for repo in repos
			users = for user in repo.users
				"#{user.user.username} (#{user.permissions.join(',')})"
			table.push [ repo.name, repo.anonRead, users.join('\n') ]
		console.log table.toString()
		callback()
	
	
	saveConfig: ()=>
		config = JSON.stringify({ repos:@gitServer.repos, users:@users })
		fs.writeFileSync repoDB, config



_g = new GitServer repos.repos, true, repoLocation, repoPort
_c = new GITCLI _g, repos.users
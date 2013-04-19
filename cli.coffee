


###
	This is the CLI interface for using git-server.
###


# Get required packages:
CLI 		= require '../Node-CLI/cli.js'
GitServer 	= require './host.js'
mkdirp		= require 'mkdirp'
fs			= require 'fs'
async		= require 'async'
path		= require 'path'
Table		= require 'cli-table'



repoPort		= 7000
repoLocation	= path.resolve '../repos/'
repoDB			= path.resolve '../repos.db'



mkdirp.sync repos
if fs.existsSync repoDB
	repos = JSON.parse( fs.readFileSync( repoDB ) )
else repos = { repos:[], users:[] }



console.log repos




class GITCLI



	constructor: ( @gitServer, @users = [] )->
		
		availableCalls = 
			'create repo'	: @createRepo
			'list repos'	: @listRepos
			'list users'	: @listUsers
		
		welcomeMessage = """
			Welcome to Git Server - Powered by NodeJS
			 - Repo Location: 	#{repoLocation}
			 - Listening Port: 	#{repoPort}
		"""
		
		@cli = new CLI 'git-server', welcomeMessage, availableCalls
	
	
	
	createRepo: ( callback )=>
		async.series
			name: ( cb )=>
				@cli.question 'Repo Name:', (r)->cb(null,r)
			anonRead: ( cb )=>
				@cli.question 'Anonymous Access? [y,N] :', (r)->cb(null,r)
		,( err, results )=>
			name = results.name.toLowerCase()
			anon = results.anonRead.toLowerCase()
			if anon is 'y' then anon = true
			else anon = false
			console.log 'Create Repo: ', name,' with Anonymous access: ', anon
			@gitServer.createRepo name:name, anonRead:anon, users:[]
			@saveConfig()
			callback()
			
	
	
	listUsers: ()=>
		console.log 'List Users'
	
	
	
	listRepos: ( callback )=>
		repos = @gitServer.repos
		table = new Table
			head:['name','anon','users']
			colWidths: [30,10,50]
			
		for repo in repos
			table.push [ repo.name, repo.anonRead, repo.users ]
		console.log table.toString()
		callback()
	
	
	saveConfig: ()=>
		config = JSON.stringify({ repos:@gitServer.repos, users:@users })
		fs.writeFileSync repoDB, config



_g = new GitServer repos.repos, false, repoLocation, repoPort
_c = new GITCLI _g, repos.users
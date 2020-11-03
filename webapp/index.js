var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); 
var session = require("express-session")
var cookieParser = require('cookie-parser');
const TokenGenerator = require('uuid-token-generator');

var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");

var amqp = require('amqplib/callback_api');
var restvirhus = "192.168.160.56:8090";
var sessionMiddleware = session({
    secret: "kappa",
});
var total_requests = 0;
var total_connections = 0;
var total_transfer = 0;

app.use(express.static(__dirname + '/views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

var Users = [];
app.set('view engine', 'ejs');
app.get('/signup', function(req, res){
	if(req.session.user)
		res.redirect('/protected_page')
	else
   		res.render('signup',{message: ''})
});

app.post('/signup', function(req, res){
   if(!req.body.id || !req.body.password || req.body.id.length <1 || req.body.password.length < 1){
   		console.log('Error')
    	 // res.status("400");
    	res.send("Error with username or password");
      	//res.render('signup',{message: 'Error with username or password'})
   } else {

   		flag = 0;
	   	var httptemp = require('http');
		httptemp.get('http://'+restvirhus+'/account/list', (resp) => {
			let data = '';
			resp.on('data',function(chunk){
				data+=chunk;
			})
			resp.on('end',function(){
				temp = JSON.parse('{"data": '+data+'}');
				//console.log(JSON.parse(temp));
				for(index in temp.data){
					if(temp.data[index].id == req.body.id){
						res.render('signup', {
            		   		message: "User Already Exists! Login or choose another user id"});
						flag = 1;
         				console.log("Send message")
					}
					
				}
				if(flag == 0){
		      		tokengen = new TokenGenerator();
		      		acc_token = tokengen.generate();
		      		console.log(acc_token)
			      	var newUser = {id: req.body.id, password: req.body.password, token: acc_token};
			      	Users.push(newUser);
			      	addUser(req.body.id,req.body.password,acc_token);
			      	req.session.user = newUser;
			      	console.log("User"+newUser.id+" added!")
			      	fs.mkdir('configs/'+req.session.user.id, function (err) {
							    if (err) {
							        console.log('failed to create directory', err);
							    } 
							});


			      	res.redirect('/overview');
		  		}
			})
		}).on('error',function(err){
			console.log("Error: "+err.message);
			return true;

		})

   		
      	
   }
});

function existUser(user){
	
}

function addRecord(id_human,id_signal,file){
	var http = require('http');

	var content = 'id_humano='+id_human+'&id_sinal='+id_signal+'&ficheiro='+file;
	var post_options = {
	      host: restvirhus.split(":")[0],
	      port: restvirhus.split(":")[1],
		 
	      path: '/signals/insert',
	      method: 'POST',
	      headers: {
	          'Content-Type': 'application/x-www-form-urlencoded',
	          'Content-Length': Buffer.byteLength(content)
	      }
	  };
	  
	    var post_req = http.request(post_options, function(res) {
	      res.setEncoding('utf8');
	      res.on('data', function (chunk) {
	          console.log('Response: ' + chunk);
	      });
	  });

	  // post the data
	  post_req.write(content);
	  post_req.end();
	  
}

function addVH(id,user,name){
	var http = require('http');

	var content = 'id_humano='+Date.now()+'&id_account='+user+'&ficheiro='+name;
	var post_options = {
	      host: restvirhus.split(":")[0],
	      port: restvirhus.split(":")[1],
		 
	      path: '/humans/insert',
	      method: 'POST',
	      headers: {
	          'Content-Type': 'application/x-www-form-urlencoded',
	          'Content-Length': Buffer.byteLength(content)
	      }
	  };
	  
	    var post_req = http.request(post_options, function(res) {
	      res.setEncoding('utf8');
	      res.on('data', function (chunk) {
	          console.log('Response: ' + chunk);
	      });
	  });

	  // post the data
	  post_req.write(content);
	  post_req.end();
	  
}

function addUser(user,pass,token){
	var http = require('http');

	var content = 'id='+user+'&password='+pass+'&token='+token;
	var post_options = {
	      host: restvirhus.split(":")[0],
	      port: restvirhus.split(":")[1],
		 
	      path: '/account/create',
	      method: 'POST',
	      headers: {
	          'Content-Type': 'application/x-www-form-urlencoded',
	          'Content-Length': Buffer.byteLength(content)
	      }
	  };
	  
	    var post_req = http.request(post_options, function(res) {
	      res.setEncoding('utf8');
	      res.on('data', function (chunk) {
	          console.log('Response: ' + chunk);
	      });
	  });

	  // post the data
	  post_req.write(content);
	  post_req.end();
	  
}

app.get('/protected_page', checkSignIn, function(req, res){
	if(req.session.user){
		total_requests+=1;
		res.render('protected_page', {id: req.session.user.id})
		console.log(req.session.user)
	}
   	else
   		res.redirect('/login')
});

app.get('/test',function(req,res){
	res.send('test');
})

app.get('/login', function(req, res){
   res.render('login',{message: ""});
});

app.get('/overview',function(req,res){
	if(req.session.user){
		res.render('overview',{id: req.session.user.id})
	}else
		res.redirect('/login')
})
app.get('/get_configs',function(req,res){
	if(req.session.user){
		total_requests+=1;
		output = {configs: []}
		fs.readdir('configs/'+req.session.user.id,function(err,files){
			
			//res.json(output)
			//console.log(output);
			var httptemp = require('http');
			httptemp.get("http://"+restvirhus+"/humans/get?id_account="+req.session.user.id, (resp)=> {
				let data = '';
				resp.on('data',function(chunk){
					data+=chunk;
				})
				resp.on('end',function(){
					jsondata = JSON.parse(data);
					console.log(JSON.parse(data))
					for(index in jsondata){
						output.configs.push(jsondata[index].ficheiro);
					}
					res.json(output);
					
				})
			}).on('error', function(err){
				console.log("Error:"+err.message);
				res.json([]);
			})
		})	
	}else{
		console.log(req.query)
		if(typeof req.query.token !== 'undefined'){
			console.log(req.query)
			for(i in Users){
				if(Users[i].token == req.query.token){
					output = {configs: []}
					console.log("Guaranteed output")
					fs.readdir('configs/'+Users[i].id,function(err,files){
						if(err)
							return res.sendStatus(409)
						for(i = 0;i<files.length;i++)
							if(!files[i].includes(".dat"))
								output.configs.push(files[i])
						res.json(output)
						var httptemp = require('http');
						/*httptemp.get("http://"+restvirhus+"/humans/get?id_account="+req.session.user.id, (resp)=> {
							let data = '';
							resp.on('data',function(chunk){
								data+=chunk;
							})
							resp.on('end',function(){
								res.json(data);
							})
						}).on('error', function(err){
							console.log("Error:"+err.message);
							res.json([]);
						})*/


					})	
				}
			}
		}else
		res.sendStatus(401);
	}
})

app.get('/api',function(req,res){
	res.render('api')
})

app.post('/login', function(req, res){
   	console.log(Users);
   	var httptemp = require('http');
   	var flag = 0;
   	httptemp.get('http://'+restvirhus+'/account/list',(resp)=>{
   		let data = '';
   		resp.on('data',function(chunk){
   			data+=chunk;

   		})

   		resp.on('end',function(){
				temp = JSON.parse('{"data": '+data+'}');
				console.log(temp);
				for(index in temp.data){
					if(temp.data[index].id === req.body.id && temp.data[index].password === req.body.password){
						var user = temp.data[index];
		            	req.session.user = user;
		            	res.redirect('/overview');
		            	flag = 1;
		         	}
					
					
				}
				if(flag == 0){
		      		res.render('login', {message: "Invalid credentials!"});
		  		}
			})
   	})


   
});

app.get('/getAccountInfo',function(req,res){
	if(req.session.user){
		var output = {}
	var util = require('util'), exec = require('child_process').exec, child;
		child = exec('du -sh configs/'+req.session.user.id, function(error, stdout, stderr){
		    
		    if (error !== null){
		        console.log('exec error: ' + error);
		    }
		    console.log(stdout)
		    output.space = stdout.split('\t')[0]
		    res.json(output)
		});
	}else
		res.sendStatus(401);
	
})

app.get('/stats',function(req,res){
	if(req.session.user){
		total_requests+=1;
		res.render('stats', {id: req.session.user.id})
	}
	else
		res.redirect('/signup');
})
app.get('/', function(req,res){
		res.render('presentation')
	
})

app.get("/documentation",function(req,res){
	res.render('documentation')
})

app.get("/messaging",function(req,res){
	res.render('messaging')
})
	
app.get('/systeminfo',function(req,res){
	if(req.session.user){
		total_requests+=1;
		var output =  {n_users: Users.length,'total_connections': total_connections, 'total_transfer': total_transfer, 'total_requests': total_requests, systeminfo:[]}
		var util = require('util'), exec = require('child_process').exec, child;
		child = exec('du -sh configs/', function(error, stdout, stderr){
		    
		    if (error !== null){
		        console.log('exec error: ' + error);
		    }

		    
		    output.systeminfo.push(stdout.split('\t')[0])
		    child = exec("cat /proc/meminfo | awk '{print $2}'",function(err, stdout,stderr){
		    	 
			    if (error !== null){
			        console.log('exec error: ' + error);
			    }
			    mem = parseInt(stdout.split('\n')[1])+parseInt(stdout.split('\n')[2])
			   
			    output.systeminfo.push(mem)
			    res.json(output);
		    })
		   
		});
		
	}else
		res.sendStatus(401);
})

app.get('/logout', function(req, res){
   req.session.destroy(function(){
      console.log("user logged out.")
   });
   res.redirect('/login');
});

app.get('/get_session',function(req,res){
	res.json(req.session.user)
})

app.get('/profile',function(req,res){
	if(req.session.user){
		total_requests+=1;
		res.render('profile',{user: req.session.user.id, token: req.session.user.token})
	}else
		res.redirect('/login')
	
})
app.get('/example',function(req,res){
	res.download('views/example.html')
})
app.post('/config',function(req,res){
	//req has configs, write configs to tempconfig file -> execute ecgsyn with tempconfig file -> return results with freq at the end
	//Delete temp config file. Make sure is a User blah blah
	if(req.session.user){
		var output = "";
			  for (i in req.body.configs){
			  	console.log(req.body.configs[i])
			  	output+=req.body.configs[i]+'\n';
			}	

			try {
				if(fs.lstatSync('configs/'+req.session.user.id).isDirectory()){
					fs.writeFile('configs/'+req.session.user.id+'/'+req.body.name, output, function (err) {
						  if (err) console.log(err);
						  console.log('Saved!');
						  addVH(req.body.name,req.session.user.id,req.body.name);
						  res.sendStatus(200)
						});

				}else{
					fs.mkdir('configs/'+req.session.user.id, function (err) {
					    if (err) {
					        console.log('failed to create directory', err);
					    } else {
					       fs.writeFile('configs/'+req.session.user.id+'/'+req.body.name, output, function (err) {
							  if (err) throw err;
							  addVH(req.body.name,req.session.user.id,req.body.name);
							  res.sendStatus(200)
							});

					    }
					});
				}
			}catch(e){
				console.log(e)

		}
	}
	 //Needs cleaning
})


app.get('/download_data',function(req,res){
	if(req.session.user){
		total_requests+=1;
		try {
			if (fs.existsSync('configs/'+req.session.user.id+'/'+req.query.file)) {
		    	res.download('configs/'+req.session.user.id+'/'+req.query.file);
			}else
			  	res.sendStatus(404);
			} catch(err) {
			  	console.error(err)
			  	res.sendStatus(409);
			}
	}else if(typeof req.query.token !== 'undefined' && typeof req.query.file !== 'undefined'){
		for(i in Users){
				if(Users[i].token == req.query.token){
					try {
				if (fs.existsSync('configs/'+Users[i].id+'/'+req.query.file)) {
			    	res.download('configs/'+Users[i].id+'/'+req.query.file);
				}else
				  	res.sendStatus(404);
				} catch(err) {
				  	console.error(err)
				  	res.sendStatus(409);
				}
					}
			}
		}else
		res.sendStatus(402)
})

app.get('/get_metadata',function(req,res){
	if(req.session.user){
		total_requests+=1;
			try {
				console.log(req.query.user)
				if(typeof req.query.user === 'undefined')
					if (fs.existsSync('configs/'+req.session.user.id+'/'+req.query.file)) {
				    	res.download('configs/'+req.session.user.id+'/'+req.query.file);
					}else
					  	res.sendStatus(404);
				else{
					if (fs.existsSync('configs/'+req.query.user+'/'+req.query.file)) {
				    	res.download('configs/'+req.query.user+'/'+req.query.file);
					}else
					  	res.sendStatus(404);
				  } 
				}
				catch(err) {
				  	console.error(err)
				  	res.sendStatus(409);
				}
			
		}
		
	else if(typeof req.query.token !== 'undefined' && typeof req.query.file !== 'undefined'){
		for(i in Users){
				if(Users[i].token == req.query.token){
					try {
				if (fs.existsSync('configs/'+Users[i].id+'/'+req.query.file)) {
			    	res.download('configs/'+Users[i].id+'/'+req.query.file);
				}else
				  	res.sendStatus(404);
				} catch(err) {
				  	console.error(err)
				  	res.sendStatus(409);
				}
					}
			}
		}else
		res.sendStatus(402)
});

app.get('/get_config',function(req,res){// get recordings
	if(req.session.user){
		total_requests+=1;
		try{

			

			console.log(req.query.name)
			fs.readFile('configs/'+req.session.user.id+"/"+req.query.name,'utf8',function(err,data){
				if(err){
					console.log("Error opening file "+err);
					res.sendStatus(401);
				}
					 
				else{
				output = {config:data.split("\n").slice(0,20), replays: []}
				var httptemp = require('http');

				httptemp.get('http://'+restvirhus+'/signals/get?id_humano='+req.query.name,(resp)=>{
					let data = '';
					resp.on('data',function(chunk){
						data+=chunk;
					})
					resp.on('end',function(){
						for(i in JSON.parse(data)){
							output.replays.push(JSON.parse(data)[i].ficheiro);
							
						}
						console.log(JSON.parse(data))
						res.json(output);
					})
				}).on('error',function(err){
					console.log("Error:" + err.message);
					res.json(output)
				})

				
				}
			})
		}catch(e){
			//res.sendStatus(401);
			res.json([]);
		}
		
		
	}else if(typeof req.query.token !== 'undefined' && typeof req.query.name !== 'undefined'){
		for(i in Users){
				if(Users[i].token == req.query.token){
					try{
					console.log(req.query.name)
					fs.readFile('configs/'+Users[i].id+"/"+req.query.name,'utf8',function(err,data){
						if(err)
							 console.log("Error opening file "+err);
						else{
						output = {config:data.split("\n").slice(0,20), replays: []}
						fs.readdir('configs/'+Users[i].id,function(err,files){
							for(i = 0;i<files.length;i++){
								if(files[i].includes(req.query.name) && files[i].includes(".dat"))
									output.replays.push(files[i])
							}
							//output.replays = files;
							res.json(output)
						})
					}
						
					})
		}catch(e){
			res.sendStatus(401);
		}
		break;
				}
			}
	}
	else
		res.sendStatus(401);
})

app.use('/protected_page', function(err, req, res, next){
	console.log(err);
   //User should be authenticated! Redirect him to log in.
   res.redirect('/login');
});


http.listen(3000,function(){
	console.log("Listening on port 3000")
});




// SocketIO stuff commands COMMANDS

io.on('connection', function(socket){
 total_connections+=1;
  var session = socket.request.session.user;
  console.log('a user connected');
  console.log(socket.request.session.user) // Now connections have a session attached, cool :)
  if(typeof socket.handshake.query.token !== 'undefined' && socket.handshake.query.token != 'undefined'){
  	  //var handshakeData = socket.request;
  	 console.log("loggeduser => " +  socket.handshake.query.token);
  	 token = socket.handshake.query.token;
  	 //console.log("middleware:", handshakeData._query['token']);
  	for(user in Users){
  	 	if(Users[user].token == token){
  	 		session = Users[user];
  	 		console.log('auth sucess ')
  	 		socket.emit('auth_sucess',session)

  	 	}
  	 }

  }
  if(typeof session === "undefined"){
  	//socket disconnect
  	socket.disconnect();
  	total_connections-=1;
  }
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
  	//console.log(socket.handshake.session.user)
    console.log('message: ' + msg);
  });


  socket.on('auth',function(token){
  	 for(user in Users){
  	 	if(Users[user].token == token){
  	 		socket.request.session.user = Users[user]
  	 		console.log('auth sucess ')

  	 	}
  	 }
  })

  socket.on('whoami',function(tmp,callback){
  	total_requests+=1;
  	console.log("whoami"+session)
  	callback(session)
  })

  socket.on('play',function(name_of_config_file){
  		total_requests+=1;
  		var emotion = name_of_config_file.emotion;
  		console.log(socket.request.session.user)
  		var timestamp = Date.now();
  		var name = name_of_config_file.name.split("-")[1];
  		addRecord(name_of_config_file.name.split("-")[1],name+"_"+timestamp,name+"_"+timestamp+".dat");
  		//io.emit('set_freq','1000')'configs/'+req.session.user.id+'/'+req.session.user.id+'_'+req.body.name
  		console.log(Date.now())
  		const { spawn } = require('child_process');
  		console.log(name_of_config_file.name.split("-")[0])
  		
		const ls = spawn('../generator/ecgsyn',['-c','configs/'+socket.request.session.user.id+'/'+name_of_config_file.name.split("-")[1]]);
		let freqData = ""
		let finished = 0;
		let process_output = [];
		let emg_eda_output = []
		var readStream = "";
		try{
		    readStream = fs.createReadStream(name_of_config_file.emotion+"/BL_1")

		 	readStream.on('error',function(err){
		 		console.log("Error on reading stream : "+ err)
		 	})

		 	readStream.on('data',function(data){
		 		sample = ab2str(data).split("\r\n")
		 		emg_eda_output = emg_eda_output.concat(sample)
		 		//console.log(sample)
		 		this.pause()
		 		
		 	})

		 	readStream.on('close',function(){
		 		console.log()
		 		
		 	})

		 	socket.on(name_of_config_file.name+"_stimulation",function(stimulation){
				//console.log(stimulation)
				//console.log(socket.request.session.user.id+"_"+name_of_config_file.split("-")[1])
				//process_output = [];
				
				process_output = process_output.slice(0,process_output.length%freqData)
				emg_eda_output = emg_eda_output.slice(0,emg_eda_output%freqData)
				//readStream.pause()
				emotion = stimulation.emotion;
				readStream = fs.createReadStream(stimulation.emotion+"/BL_1")
				readStream.resume();
				readStream.on('error',function(err){
			 		console.log("Error on reading stream : "+ err)
			 	})

			 	readStream.on('data',function(data){
			 		sample = ab2str(data).split("\r\n")
			 		emg_eda_output = emg_eda_output.concat(sample)
			 		//console.log(sample)
			 		this.pause()
		 		
		 	})

		 	readStream.on('close',function(){
		 		console.log()
		 		
		 	})

			console.log(stimulation.emotion+"/BL_1")
			try {
				output = "";
				  for (i in stimulation.config){
				  	//console.log(stimulation[i])
				  	output+=stimulation.config[i]+'\n';

				  }
				 
				  fs.writeFile('configs/'+socket.request.session.user.id+'/'+name_of_config_file.name.split("-")[1], output, function (err) {
					  if (err) throw err;
					  console.log('Stimulation toggled, configuration Saved!');
					});
			}
			catch(error) {
				console.error(error);
				  // expected output: ReferenceError: nonExistentFunction is not defined
				  // Note - error messages will vary depending on browser
			}




			//socket.emit(name_of_config_file+"_valueData",process_output.slice(freqData*multiplier))
		})
		}
		catch(e){
			console.log(e)
		}


		//let freq = 256;
		ls.stdout.on('data', (data) => {
			
			sample = ab2str(data).split(",")
			 if(freqData == ""){
			 	
			 	freq = sample.shift()
				console.log(freq)
				freqData = freq;
				total_transfer+=freq.length;
				socket.emit(name_of_config_file.name+'_set_freq',freq)
				fs.writeFile("configs/"+socket.request.session.user.id+"/"+name+"_"+timestamp+".dat",freqData+"\n",function(err){
					if(err)
						console.log("Error writing to file " +err)
				})

			}
			process_output = process_output.concat(sample)
			
			
		//socket.on()	
			
		  //console.log(sample);
		});
		ls.on('exit',function(){
			console.log("Done")

			 if(socket.connected){
			 	finished = 1;
			// 	multiplier = Math.floor(process_output.length/freqData);
			// 	socket.emit(name_of_config_file+'_valueData',process_output.slice(0,freqData*multiplier))
			// 	process_output=process_output.slice(freqData*multiplier)
			// 	socket.disconnect();
					
			 }
		})

		


		socket.on(name_of_config_file.name+"_finished?",function(status,callback){
				total_requests+=1;
		 		if(finished==1)
		 		callback('yes')
		 		else
		 			callback('No')
		 	});

		socket.on(name_of_config_file.name+"_stop",function(temp){
			ls.kill();
			console.log("Killed it!")
			finished = 1;
			readStream.destroy()
		})

		socket.on(name_of_config_file.name+"_requestData",function(temp){
			total_requests+=1;
			console.log("Wants me data")
			console.log(process_output.length)
			console.log(emg_eda_output.length)
			//	var block {ecg: [], other: []}
			if(process_output.length<emg_eda_output.length)
				multiplier = Math.floor(process_output.length/freqData);
			else
				multiplier = Math.floor(emg_eda_output.length/freqData);
			if(multiplier>1){
					//for(index = 0; index<freqData*10;index++){
					//	socket.emit(name_of_config_file+'_value',process_output[index]);
				//	}
					block = { ecg: process_output.slice(0,freqData*1), other: emg_eda_output.slice(0,freqData*1), emotion: emotion }
					output = []
					for(i = 0; i< block.ecg.length;i++){
						output.push(block.ecg[i]+","+block.other[i]+","+emotion+"\n")
					}

					fs.appendFile("configs/"+socket.request.session.user.id+"/"+name+"_"+timestamp+".dat",output.join("\n"),function(err){
						if(err)
							console.log("Error in writing to file: "+err)
					})
					total_transfer+=output.join('\n').length;
					socket.emit(name_of_config_file.name+'_valueData',block)
					process_output=process_output.slice(freqData*1)
					emg_eda_output=emg_eda_output.slice(freqData*1)
			}else{
				//for(index = 0; index<freqData*multiplier;index++){
			//		socket.emit(name_of_config_file+'_value',process_output[index]);
				//}
				if(process_output.length<emg_eda_output.length){
					block = {ecg:process_output.slice(0), other: emg_eda_output.slice(0,process_output.length), emotion: emotion}
					output = []
					for(i = 0; i< block.ecg.length;i++){
						output.push(block.ecg[i]+","+block.other[i]+","+emotion+"\n")
					}
					
					fs.appendFile("configs/"+socket.request.session.user.id+"/"+name+"_"+timestamp+".dat",output.join("\n"),function(err){
						if(err)
							console.log("Error in writing to file: "+err)
					})
				total_transfer+=output.join('\n').length;
				socket.emit(name_of_config_file.name+'_valueData',block)
				process_output=process_output.slice(block.ecg.length)
				emg_eda_output=emg_eda_output.slice(block.other.length)
			}else{
				block = {ecg:process_output.slice(0,emg_eda_output.length), other: emg_eda_output.slice(0)}
				output = []
					for(i = 0; i< block.ecg.length;i++){
						output.push(block.ecg[i]+","+block.other[i]+","+emotion+"\n")
					}
					
					fs.appendFile("configs/"+socket.request.session.user.id+"/"+name+"_"+timestamp+".dat",output.join("\n"),function(err){
						if(err)
							console.log("Error in writing to file: "+err)
					})
				total_transfer+=output.join('\n').length;
				socket.emit(name_of_config_file.name+'_valueData',block)
				process_output=process_output.slice(block.ecg.length)
				emg_eda_output=emg_eda_output.slice(block.other.length)
				
				}
			}
			
			if(readStream.isPaused()){
				readStream.resume();
			}
		 
			
		})
  })

  socket.on('playrecord',function(name_of_config_file){
  		total_requests+=1;
		 var name = name_of_config_file.split("-")[1];
		 let freqData = ""
		 let finished = 0;
		 let process_output = [];
		 try{
		 	var readStream = fs.createReadStream("configs/"+session.id+"/"+name)

		 	readStream.on('error',function(err){
		 		console.log("Error on reading stream : "+ err)
		 	})

		 	readStream.on('data',function(data){
		 		sample = ab2str(data).split("\n")
		 		if(freqData == ""){

		 			freqData = sample.shift();
		 			total_transfer+=freqData.length;
		 			socket.emit(name_of_config_file+"_set_freq",freqData)
		 		}
		 		
		 		process_output = process_output.concat(sample)
		 		readStream.pause()
		 		
		 	})

		 	readStream.on('close',function(){
		 		socket.emit(name_of_config_file+'_done',"");
		 		finished = 1;
		 	})
		 	socket.on(name_of_config_file+"_finished?",function(status,callback){
		 		total_requests+=1;
		 		if(finished==1)
		 		callback('yes')
		 		else
		 			callback('No')
		 	});
		 	socket.on(name_of_config_file+"_requestData",function(temp){
		 		total_requests+=1;
		 		//console.log("Wants me data")
				//console.log(process_output.length)
				multiplier = Math.floor(process_output.length/freqData);
				
				if(multiplier>1){
						//for(index = 0; index<freqData*10;index++){
						//	socket.emit(name_of_config_file+'_value',process_output[index]);
					//	}
						block = process_output.slice(0,freqData*multiplier)
						//console.log(block)
						total_transfer+=block.join('\n').length;
						socket.emit(name_of_config_file+'_valueData',block)
						process_output=process_output.slice(freqData*multiplier)
				}else{
					//for(index = 0; index<freqData*multiplier;index++){
				//		socket.emit(name_of_config_file+'_value',process_output[index]);
					//}
					if(finished == 1 && process_output.length == 0){
						console.log("I think its over")
						socket.emit(name_of_config_file+'_done',"temp");
					}
					block = process_output.slice(0)
					
					//console.log(block)
					total_transfer+=block.join('\n').length;
					socket.emit(name_of_config_file+'_valueData',block)
					process_output=process_output.slice(block.length)
				}
				readStream.resume()
				
			 	})


		 }catch(e){
		 	console.log(e)
		 }
		 //console.log(name)

  })
});


amqp.connect('amqp://192.168.160.56', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'main';
     channel.on('error',function(err){
    	console.log("Cool error:"+err.message)
    })
    channel.assertQueue(queue, {
      durable: false
    });
	
	
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, function(msg) {
          //  console.log(" [x] Received %s", msg.content.toString());
         // channel.deleteQueue(msg.content.toString());

        	 console.log("Writing");
				 var user = msg.content.toString().split('-')[0];
				 var datfile = msg.content.toString().split('-')[1];
				 let freqData = ""
				 let finished = 0;
				 let process_output = [];
				 var emitter = "";
				 if(datfile.includes(".dat")){
				 try{
				 	var readStream = fs.createReadStream("configs/"+user+"/"+datfile)

				 	readStream.on('error',function(err){
				 		console.log("Error on reading stream : "+ err)
				 		channel.sendToQueue(msg.content.toString(),Buffer.from(err.message))
				 	})

				 	readStream.on('data',function(data){
				 		sample = ab2str(data).split("\n")
				 		if(freqData == ""){

				 			freqData = sample.shift();
				 			total_transfer+=freqData.length;
				 			//socket.emit(name_of_config_file+"_set_freq",freqData)
				 			console.log(freqData)
				 		}
				 		
				 		process_output = process_output.concat(sample)
				 		//readStream.pause()


				 		
				 	})
				 	setTimeout(function(){
				 		 emitter = setInterval(function(){
				 			var data = process_output.shift();
				 			if(typeof(data) !== 'undefined' && data.length>0){
				 				console.log(data.length)
				 				channel.sendToQueue(msg.content.toString(), Buffer.from(data))
				 			}
				 			
				 		},1/freqData)
				 	},2000)
				 	readStream.on('close',function(){
				 		//socket.emit(name_of_config_file+'_done',"");
				 		finished = 1;
				 		console.log("Done")
				 	})
				 }
				 catch(e){
				 	channel.sendToQueue(msg.content.toString(),Buff.from(e.message));
				 	console.log(e.message)
				 }
				}else
					channel.sendToQueue(msg.content.toString(),Buffer.from("Error: invalid file "+datfile))
			
			
			
			
        }, {
            noAck: false
        });
		
		
  });
});


function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function mkdirp(filepath) {
    var dirname = path.dirname(filepath);
    console.log(filepath);
	  if (!fs.existsSync(dirname)){
	    fs.mkdirSync(dirname);
	}
}

function checkSignIn(req, res, next){
   if(req.session.user){
      next();     //If session exists, proceed to page
   } else {
      console.log("Error: User tried to access protected_page without sesssion")
      //console.log(req.session.user);
      next();  //Error, trying to access unauthorized page!
   }
}

module.exports = app;

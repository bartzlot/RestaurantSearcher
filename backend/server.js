/*
    Created by Kammar1006
*/

const opt = require('../settings.json');
const PORT = opt.port;
const COOKIE_FLAG = opt.cookie

const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const {queryDatabase} = require('./db.js');
const bcrypt = require("bcrypt");

const app = express();
app.use(express.static(`${__dirname}/../frontend`));

const server = http.createServer(app);
const io = socketio(server, {
	cookie: true,
});

const {isAlnum, isEmail, isLen} = require("./strings_analyzer.js");
const { randomBytes } = require('crypto');

let translationTab = [];
const setCID = (sock) => {
	//console.log(sock.request.headers.cookie);
	let cid;
	if(sock.handshake.headers.cookie == undefined){
		return false;
	}
	let cookie = (sock.handshake.headers.cookie).split(" ");
	cookie.forEach(element => {
		if(element.split("=")[0]==COOKIE_FLAG) cid = element.split("=")[1];	
	});
	if(cid == undefined || cid == ""){
		return false;
	}
	else{
		if(cid[cid.length-1] == ";"){
			cid = cid.substring(0, cid.length-1);
		}
	}
	return cid;
}
const setTranslationTab = (cid) => {
	if(translationTab[cid]==undefined){
		translationTab[cid]={
			user_id: -1,
			db_stats: {},
			test_counter: 0,
		};
	}
}
const hasher = (data) => {
	return bcrypt.hashSync(data, 10);
}
const hashCompare = (data, hash) => {
	return (bcrypt.compareSync(data, hash));
}
const emit_login_data = (sock, db_stats) => {
	let emit_db_stats = {...db_stats};
	sock.emit("login", emit_db_stats); 
}

io.on('connection', (sock) => {
	let cid = setCID(sock);
	if(!cid){
		cid = randomBytes(30).toString('hex');
		sock.emit("set-cookie", `${COOKIE_FLAG}=${cid}; Path=/; SameSite=None; Secure`);
	}
	setTranslationTab(cid);
	console.log("User: "+cid);

	sock.on("counter", () => {
		translationTab[cid].test_counter++;
		sock.emit("message", "Count: "+translationTab[cid].test_counter);
	});

	//login:
	sock.on("login", (login, pass) => {
		if(!(isAlnum(login) && isAlnum(pass))) return;

		queryDatabase("SELECT * FROM users WHERE login =?", [login])
		.then((res) => {
			if(res && res.length == 1){
				if(hashCompare(pass, res[0].password)){
					console.log("Pass OKOK");
					translationTab[cid].user_id = res[0].id;
					translationTab[cid].db_stats = res[0];
					console.log(translationTab[cid]);
					emit_login_data(sock, translationTab[cid].db_stats);
				}
				else{
					console.log("Pass NOTOK");
					sock.emit("login", "Wrong login or password")
				}
			}
			else{
				console.log("Pass NOTOK");
				sock.emit("login", "Wrong login or password")
			}
		}).catch((err) => {
			console.log("DB ERROR: "+err);
		})
			
		
	});

	//register:
	sock.on("register", (login, pass, pass2, email) => {
		console.log("Register:", login, pass, pass2, email);
		
		if(!(isEmail(email))){
			console.log("Email is NOT ok");
			sock.emit("register", "wrong email format");
			return;
		}

		if(!(isLen(login, 4, 20) && isAlnum(login))){
			console.log("Login len ERR");
			sock.emit("register", "wrong login format/length");
			return;
		}

		if(!(isLen(pass, 8, 50) && isAlnum(pass))){
			console.log("Pass len ERR");
			sock.emit("register", "wrong pass format/length");
			return;
		}

		if(pass === pass2){
			console.log("All OK!!");

			queryDatabase("SELECT `login`, `email` FROM `users` WHERE login=? OR email=?", [login, email])
			.then((res) => {
				if(res.length){
					let a=0, b=0;
					res.forEach(e => {
						if(e.email == email) a = 1;
						if(e.login == login) b = 1;
					});
					if(a){
						console.log("Email is in db");
						sock.emit("register", "email in db");
					} 
					if(b){
						console.log("Login is in db");
						sock.emit("register", "login in db");
					} 
				}
				else{
					queryDatabase("INSERT INTO `users` (`id`, `login`, `password`, `email`) VALUES ('', ?, ?, ?)", [login, hasher(pass), email])
					.then(() => {
						sock.emit("register", "register");
					}).catch((err) => {console.log("DB Error: "+err)});
				}
			}).catch((err) => {console.log("DB Error: "+err);});
		}
		else{
			sock.emit("register", "pass != pass2");
		}
	});

	//logout
	sock.on("logout", () => {
		translationTab[cid].db_stats = {};
		translationTab[cid].user_id = -1;
		sock.emit("logout");
	});

	//for all users searching db
	sock.on("searchByName", (name) => {
		if(isAlnum(name)){
			queryDatabase("SELECT * FROM places WHERE name =?", [name])
			.then((res) => {
				sock.emit("places", res);
			}).catch((err) => {console.log("DB Error: "+err);});
		}
	});

	//for auth users sth:
	sock.on("auth_user_only", (some_data) => {
		if(translationTab[cid].user_id === -1) return;
		//do sth:

		/*
			//if in db exist sth like rank/grade, may use only for rank:
			if(translationTab[cid].db_stats.rank == "Admin"){
				//do sth
			}
		*/
	});
});

server.listen(PORT, () => {
	console.log("Work");
	console.log(hasher("test"))
});
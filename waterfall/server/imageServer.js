const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const { query } = require('express');
const e = require('express');

//setting up app (which uses lib express.js)
const app = express();
app.use(express.json()); // ready app for json files that we might use later

const port = process.env.PORT || 3000; //process.env.PORT reades the current port, 3000 by default

//print the listening port
app.listen(port, () => {
    console.log(`Listening on port ${port} ...`);
});


var allowedOrigins = ['http://localhost:3000', 'http://localhost:4000'];

// app.use(cors({
//     origin: function(origin, callback) { 
//         // allow requests with no origin 
//         // (like mobile apps or curl requests)
//         console.log(origin);
//         if (origin == null) return callback(null, true);
        
//         if(allowedOrigins.indexOf(origin) === -1 ){
//             var msg = 'The CORS policy for this site does not ' +
//                     `allow access from the specified Origin [(str) ${origin}].`;
//             return callback(new Error(msg), false);
//         }
            
//         return callback(null, true);
//     }
// }));

//01
app.get('/api/my-project-name/tags', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let tag = req.params.tag;
    let query = `SELECT tag FROM tags;`;
    execute(query).then((sqlresponse) => {
        let arr = [];
        for (i = 0; i < sqlresponse.length; i++) {
            arr.push(sqlresponse[i]["tag"]);
        }
        if (arr.length > 0) { res.send({ "found": true, "tags": arr }); }
        else { res.send({ "found": false }); };
    });
});

app.get('/api/my-project-name/:tag/related-tags', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let tag = req.params.tag;
    let query = `SELECT tag2 FROM tags_connection WHERE tag1 = "${tag}" order by strength desc limit 10;`;
    execute(query).then((sqlresponse) => {
        let arr = [];
        for (i = 0; i < sqlresponse.length; i++) {
            arr.push(sqlresponse[i]["tag2"]);
        }
        if (arr.length > 0) { res.send({ "found": true, "related tags": arr }); }
        else { res.send({ "found": false }); };
    });
});

//02
app.get('/api/my-project-name/:tag/usernames', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let tag = req.params.tag;
    let query = `SELECT username FROM tags_usernames WHERE tag="${tag}";`;
    execute(query).then((sqlresponse) => {
        let arr = [];
        for (i = 0; i < sqlresponse.length; i++) {
            arr.push(sqlresponse[i]["username"]);
        }
        if (arr.length > 0) { res.send({ "found": true, "usernames": arr }); }
        else { res.send({ "found": false }); };
    });
});

//03
app.get('/api/my-project-name/:username/user-info', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let username = req.params.username;
    let query = `SELECT tag FROM tags_usernames WHERE username="${username}";`;
    execute(query).then((sqlresponse) => {
        let dict = {};
        for (i = 0; i < sqlresponse.length; i++) {
            dict[sqlresponse[i]["tag"]] = true;
        }
        if (sqlresponse.length > 0) {
            res.send({
                "found": true,
                "user-info": {
                    "name": username,
                    "media": {
                        "school-email": "xxxx@ucsd.edu",
                        "ins": "sampleinsid",
                        "phone": ""
                    },
                    "tags": dict
                }
            })
        }
        else { res.send({ "found": false }); };
    });
});

//03
app.get('/api/my-project-name/:username/tags', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let username = req.params.username;
    let query = `SELECT tag FROM tags_usernames WHERE username="${username}";`;
    execute(query).then((sqlresponse) => {
        // let dict = {};
        // for (i = 0; i < sqlresponse.length; i++) {
        //     dict[sqlresponse[i]["tag"]] = true;
        // }
        let arr = []
        for (i = 0; i < sqlresponse.length; i++) {
            arr.push(sqlresponse[i]["tag"]);
        }
        if (sqlresponse.length > 0) {
            res.send({
                "found": true,
                "tags": arr
            })
        }
        else { res.send({ "found": false }); };
    });
});

//04
app.post('/api/my-project-name/:username/add-tag', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let username = req.params.username;
    let tag = req.query.tag;
    let query0 = `INSERT IGNORE INTO tags(tag) VALUES("${tag}");`
    let query1 = `SELECT * FROM tags_usernames WHERE tag = "${tag}" AND username = "${username}";`;
    let query2 = `INSERT INTO tags_usernames(tag,username) VALUES("${tag}","${username}") ON DUPLICATE KEY UPDATE username="${username}";`;
    let query3 = `SELECT tag FROM tags_usernames WHERE username="${username}";`;
    execute(query0).then(() => {
        execute(query1).then((exists) => {
            if (exists.length > 0) { res.send({ "success": false }); }
            else {
                res.send({ "success": true });
                execute(query3).then((tags) => {
                    tags.forEach((row) => {
                        let element = row.tag;
                        if (element < tag) { tagA = element; tagB = tag; }
                        else { tagA = tag; tagB = element };
                        let query4 = `INSERT INTO tags_connection(tagcombined,tag2,tag1,strength) VALUES(concat("${tagA}","#","${tagB}"),"${tagA}","${tagB}",1) ON DUPLICATE KEY UPDATE strength = strength+1;`
/* welcome to .... */
/* call back hell  */
                        let query5 = `INSERT INTO tags_connection(tagcombined,tag1,tag2,strength) VALUES(concat("${tagA}","#","${tagB}"),"${tagA}","${tagB}",1) ON DUPLICATE KEY UPDATE strength = strength+1;`
                        execute(query4);
                        execute(query5);
                    });
                });
                execute(query2);
            }
        });
    });
});

// //04
// app.get('/api/my-project-name/:username/add-tag', async (req, res) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     let username = req.params.username;
//     let tag = req.query.tag;
//     for (i = 0; i < sqlresponse.length; i++) {
//         let tag = tags[i];
//         let query1 = `SELECT count(*) FROM tags_people WHERE tag = "${tag}" AND username = "tigo";`
//     }
//     // res.send(JSON04);
// })

//05
app.post('/api/my-project-name/:username/remove-tags', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.send(JSON05);
});

//06
app.post('/api/my-project-name/login', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let username = req.query.username;
    let userpassword = req.query.password;
    let query = `select * from users where username="${username}" and userpassword="${userpassword}";`;
    execute(query).then((fit) => {
        if (fit.length > 0) { res.send({ "success": true }); }
        else { res.send({ "success": false }); }
    });
});

//07
app.post('/api/my-project-name/register', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let username = req.query.username;
    let userpassword = req.query.password;
    let query1 = `select * from users where username="${username}";`;
    let query2 = `INSERT INTO users(username,userpassword) VALUES("${username}","${userpassword}") on duplicate key update userpassword = "${userpassword}";`
    execute(query1).then((exists) => {
        if (exists.length > 0) { res.send({ "success": false }); }
        else { res.send({ "success": true }); }
        execute(query2);
    });
})


/**********************************
    NOT USED START
*************************************/
//setting up mysql connection
const connection = mysql.createConnection({
    host: "tigofam.mysql.database.azure.com",
    user: 'bmomark@tigofam',
    password: 'mypassword',
    database: 'mydb',
    port: 3306,
	ssl: true
});

//connect to sql Server, Only once.
connection.connect((err) => {
    if (err) console.log('error!');
});

/**
 * execute sql and return query result
 * @param  {string} sqlStatement
 * @returns  {JSON} query result
 */
async function execute(sqlStatement){
    try {
        const ans = await helpexecute(sqlStatement);
        return ans;
    } catch (err) {
        console.log('error: ',err.message);
    }
}

//Async query with callback func.
function helpexecute(sqlStatement) {
    return new Promise((resolve, reject) => {
        connection.query(sqlStatement, (err, result, fields) => {
            if (err) reject(err);
            else {
                resolve(result);
                // console.log(` sent on query ${sqlStatement} -> \n `, result, ` \n <- sent on query ${sqlStatement} `);
            }
        });
    });
}

/**********************************
    NOT USED ENDS
*************************************/

const JSON01 = {
    "found": true,
    "related tags": [
        "usc-student",
        "handson-boy",
        "csci-104"
    ]
}

const JSON011 = {
    "found": true,
    "tags": [
        "usc-student",
        "handson-boy",
        "csci-104"
    ]
}

const JSON02 = {
    "found": true,
    "usernames": [
        "peter xu",
        "beach boy",
        "yuhao zhao"
    ]
}

const JSON03a = {
    "found": true,
    "user-info": {
        "name" : "Yi Jiang",
        "media" : {
            "school-email":"xxxx@ucsd.edu",
            "ins":"sampleinsid",
            "phone":false
        },
        "tags": {
            "trojan":true,
            "condom":true,
            "love-hackathon":true
        }
    }
}

const JSON03b = {
    "found": false
}

const JSON04 = {
    "success":{
        "handsome":true,
        "icecream-addict":false
    }
}

const JSON05 = {
    "success":{
        "handsome":true,
        "icecream-addict":false
    }
}

const JSON06 = {
    "success":true
}

const JSON07={
    "success":true
}

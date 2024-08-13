// XXX even though ethers is not used in the code below, it's very likely
// it will be used by any DApp, so we are already including it here
const { ethers } = require("ethers");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

function hex2str (hex) {
  ethers.toUtf8String(hex)
}

function str2hex (payload) {
  ethers.hexlify(ethers.toUtf8Bytes(payload))
}

function isEmpty(userInput){
  return  userInput === null || userInput === undefined || userInput === '';
}

let users = []
let wordCount = 0

async function handle_advance(data) {
 console.log("Received advance request data " + JSON.stringify(data));

 const metadata = data["metadata"]
 const sender = metadata["msg_sender"]
 const payload = data["payload"]

 let sentence = hex2str(payload)

 
if (isEmpty(sentence)) {
   // empy input
   const report_req = await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: str2hex("input is empty")}),
  });
   return "reject"
}

 
 const notice_req = await fetch(rollup_server + "/notice", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ payload: str2hex(sentence) }),
});

let wordsArray = sentence.split(/\s+/);

users.push(sender);
wordCount = wordsArray.length;

  return "accept";
}

async function handle_inspect(data) {
console.log("Received inspect request data " + JSON.stringify(data));

  const payload = data["payload"]
  let response = hex2str(payload)

  if (response == "user"){
    response = JSON.stringify({users})
  } else if (response == "wordcount") {
      response = JSON.stringify({wordCount}) 
  } else {
     response = "Route not implemented"
  }

  const report_rep = await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: response}),
  });

  return "accept";
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();

const { spawn } = require('child_process');
const ls = spawn('../generator/ecgsyn',['-c','configs/config']);
let output = ""
ls.stdout.on('data', (data) => {
	temp = ab2str(data).split("\n");
	if(output == ""){
		console.log(ab2str(data).split("\n")[0])
		output = 1
	}
	
 	console.log(temp);
});
ls.on('exit',function(){
	//console.log(output.split("\n").length)
	console.log("done")
})

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}
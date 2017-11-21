var dumpChannel = -239281784,
	musicChannel = -1001091002937,
	token = '426316387:AAELVSI2Xsf4-tyAJ9MxjZIjFrMtl1OTgZQ';

const http = require('http'),
 https = require('https'),
 fs = require("fs"),
 Telegraf = require('telegraf'),
 { Extra, Markup } = require('telegraf'),
 { exec, execSync, spawn, spawnSync } = require('child_process'),
ffmpeg = require('fluent-ffmpeg');

var url = '';
//var command = ffmpeg();
const bot = new Telegraf(token);
bot.telegram.getMe().then((botInfo) => {
  bot.id = botInfo.id
  bot.options.username = botInfo.username
  process.env.username = botInfo.username
});
//bot.use(Telegraf.log());
bot.catch((err) => {
  console.log('CONDUCTOR WE HAVE A PROBLEM: \n\n', err)
});

bot.on('audio', async (ctx) => {
	//return console.log(ctx.message.audio.file_id);
	let user = await ctx.telegram.getChatMember(-1001091002937,ctx.message.from.id);
	//console.log(user);
	if (user.can_post_messages===true || user.status==='member') convert3(ctx, ctx.message);
});
bot.on('channel_post', (ctx) => {
	//return console.log(ctx.update.channel_post);
	if (typeof ctx.update.channel_post.audio ==="object"&& ctx.update.channel_post.chat.id===-1001091002937) convert3(ctx, ctx.update.channel_post);
});
bot.startPolling();
console.log('Music bot is running!');

function convert3(ctx, message){
	ctx.replyWithChatAction('record_audio');
	ctx.telegram.getFile(message.audio.file_id).then((file) => {
		console.log('we got a file, let\'s download it then convert');
		var previewTime = Math.round(message.audio.duration/5);
		var filename = message.message_id+file.file_path.split('/')[1];
		https.get('https://api.telegram.org/file/bot'+bot.telegram.token+'/'+file.file_path, function(response) {
		var saveFile = response.pipe(fs.createWriteStream(filename));
		saveFile.on('finish', function () {
			ffmpeg().input(fs.createReadStream('./'+filename)).audioChannels(1).audioCodec('libopus').seekInput(previewTime).noVideo().inputOptions(['-t 30', '-ac 1']).output(filename+'.ogg').on('end', function() {
			console.log('Finished Converting! let\'s Send this over.');
			ctx.telegram.sendVoice(-239281784,{
				source: fs.readFileSync(filename+'.ogg'),
				disable_notification: true
			}).then((msg) =>{
				voiceId = msg.voice.file_id; 
				delMsg = msg.message_id;
				ctx.replyWithVoice(voiceId, {
					caption: 'Generated Song Preview\n\n@KapMusic',
					reply_to_message_id: message.message_id,
					disable_notification: true
				}).then((replied) =>{
					ctx.telegram.deleteMessage(-239281784, msg.message_id).then((deleted)=>{
						console.log('all done! let\'s make sure to folder isn\'t too bloated.');
							checkFolder();
					})
				})
			});
		}).run();
		});
		});
	});

}
function checkFolder(){
fs.readdir('./', (err, files) => {
	console.log(files.length);
  if (files.length>8){
	  console.log('cleaning folders');
	  execSync('find . -name "*.mp3" -type f -delete');
	  execSync('find . -name "*.ogg" -type f -delete');
  }
});
}
bot.startPolling();
fs.readFile('./index.html', function (err, html) {
    if (err) {
        throw err; 
    }       
    http.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();  
    }).listen(8000);
});

setInterval(function() {
    http.get("http://kapperbotmusic.glitch.me/");
  console.log('pingpong');
}, 200000);

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

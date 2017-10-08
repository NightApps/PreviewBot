@echo off
set url=%~1
set token=%2
set time=%3
set /a time=%time%/5
title Downloading Song...
wget "https://api.telegram.org/file/bot%token%/%url%"
set input=%url:~6% 
title Converting Song...
ffmpeg -ss %time% -t 30 -i "%input%" -y -vn -c:a libopus -map_metadata -1 -ac 1 -af "volume=2.7dB" output.ogg
del "%input%"
title Bot is running...
exit
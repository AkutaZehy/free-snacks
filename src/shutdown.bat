@ECHO OFF

CHCP 65001

ECHO 输入倒计时（min）：

SET /p time=%0
SET /a value=time*60
SHUTDOWN -s -t %value%
@echo off
cd /d C:\newSYS

java -Xms1024m -Xmx4096m -jar wbill_consBsub.jar ^
 --spring.profiles.active=prod ^
 --spring.config.additional-location=file:C:\newSYS\

pause

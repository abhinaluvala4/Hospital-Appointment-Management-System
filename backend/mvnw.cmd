@echo off
setlocal
set "MAVEN_VERSION=3.10.0"
set "MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%"
if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0mvnw-bootstrap.ps1"
  if errorlevel 1 exit /b %ERRORLEVEL%
)
call "%MAVEN_HOME%\bin\mvn.cmd" %*
exit /b %ERRORLEVEL%

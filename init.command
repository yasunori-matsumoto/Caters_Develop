cd `dirname $0`
mkdir src
mkdir build
sudo npm-check-updates -u
sudo npm install --save-dev
sudo npm install bower --save-dev
bower install
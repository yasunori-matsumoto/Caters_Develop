cd `dirname $0`
mkdir src
mkdir release
sudo npm-check-updates -u
sudo npm install --save-dev
sudo npm install gulp --save-dev
sudo npm install bower --save-dev
bower install

# 斗鱼弹幕助手多平台版
###DouyuTV Danmu Helper


### Installation:

For development, run:

```shell
./scripts/load_globals.sh
sudo npm install --python=python2.7
npm start
```

#### Known Bugs:

Node-sass may fail the `npm start` command. I recommend running the following command to fix this:

```
npm i -g node-sass
npm rebuild node-sass
```

As for preparing the Windows/Mac/Linux apps for distribution. You will first need to run the ```npm install```. Afterwards, run the following to build all the apps for all architectures and distributions:

```shell
# Requires GNU Make to be installed
make
```

### <a name="build-app"></a> Building the Desktop Application

Since the app was built using Node.js, you only need to run the following command for development testing:

```shell
npm start
```

npm start will run the latest build and then launch the application.

In order to only build the latest code run:

```shell
gulp
```

As for building the final Desktop Application. You can use any of the following make commands to build them:

- Mac: `make mac-64`
- Windows 32-Bit: `make windows`
- Windows 64-Bit: `make windows-64`
- Linux: `make linux`
- Linux 64-bit: `make linux-64`

Alternatively, you can build all the apps at once by calling `make apps`


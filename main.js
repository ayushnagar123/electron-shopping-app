const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow,Menu,ipcMain} = electron;

//set environment
process.env.NODE_ENV='production'

let mainWindow;
let addWindow;

// listen for app to be ready

app.on('ready',function(){
    // create new window

    mainWindow = new BrowserWindow({
        webPreferences:{nodeIntegration:true}
    });
    //load html file
    mainWindow.loadURL(url.format({
        pathname:path.join(__dirname,'mainWindow.html'),
        protocol:'file:',
        slashes:true
    }));
    //quit app when closed
    mainWindow.on('closed',()=>{
        app.quit();
    })

    // Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    //insert menu
    Menu.setApplicationMenu(mainMenu);
});

function createAddWindow(){
    addWindow = new BrowserWindow({
        width:300,
        height:200,
        title:'Add Shopping List item',
        webPreferences:{nodeIntegration:true}
    });

    //load html file
    addWindow.loadURL(url.format({
        pathname:path.join(__dirname,'addWindow.html'),
        protocol:'file:',
        slashes:true
    }));

    //garbage collection handle
    addWindow.on('close',()=>{
        addWindow=null;
    })
}

//catch item add
ipcMain.on('item:add',(e,item)=>{
    mainWindow.webContents.send('item:add',item);
    addWindow.close();
})

//create menu template
const mainMenuTemplate= [
    {
        label:'File',
        submenu:[
            {
                label:'Add item',
                click(){
                    createAddWindow();
                }
            },
            {
                label:'Clear item',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label:'Quit',
                accelerator:process.platform == 'darwin'?'Command+Q':'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//if mac, add empty object to menu
if(process.platform=='darwin'){
    mainMenuTemplate.unshift({});
}

//add developer tool item if not in production
if(process.env.NODE_ENV!='production'){
    mainMenuTemplate.push({
        label:'Developer Tools',
        submenu:[
            {
                label:'Toggle DevTools',
                accelerator:process.platform=='darwin'?'Command+I':'Ctrl+I',
                click(item,focusWindow){
                    focusWindow.toggleDevTools();
                }
            },
            {
                role:'reload'
            }
        ]
    })
}
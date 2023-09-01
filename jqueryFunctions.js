//added this specific function to control besogo without having to maintain or edit the whole piece
besogo.bubbleController = (control,value,editor) => {
  switch(control){
  case"next":
    editor.nextNode(value);
    break;
  case"prev":
    editor.prevNode(value);
    break;
  case"delete":
    editor.cutCurrent();
    break;
  case'tool':
    editor.setTool(value);
    break;
  case'move':
    let current = editor.getCurrent();
    return current.moveNumber;
    break
}

//Bubble has specific set up and boxes for each name

//initialize
function(instance, context) {         
  let canvas = instance.canvas;
  let $editor = $('<div>');
  canvas.append($editor);
  instance.data.$editor = $editor;  
}

//update
function(instance, properties, context) {
  let $editor = instance.data.$editor;  
    
  if ($editor.hasClass('besogo-container')) {
     return;
  }    
  
  $editor
      .attr('class', 'besogo-' + properties.type)
      .attr('panels', properties.panels)
      .attr('sgf', properties.sgf);  
      
  let tools = {
      'editor': 'auto',
      'viewer': 'navOnly'
  };
  
  let editor = window.besogo.create($editor[0], {
      panels: properties.panels,
      tool: tools[properties.type],
  });
  if(!properties.togglePreviewMove){
	editor.toggleVariantStyle(true);
  }
  instance.data.editor = editor;
}

//preview
function(instance, properties) {
	let editor = $('<div>')
    	.attr('class', 'besogo-viewer');
	$(instance.canvas).append(editor);
    besogo.autoInit();

}

//initialize states (see exposed states)
function(properties, context) {

return null;

}

//get_sgf_url
function(instance, properties, context) {
  let besogo = instance.data.editor;
  let sgf = window.besogo.composeSgf(besogo);
  console.log(sgf);

  // Extract player information from properties
  let playerInfo = {
    PB: properties.blackplayer || "", // Black player info
    PW: properties.whiteplayer || "", // White player info
    BR: properties.blackrank || "", // Black player rank
    WR: properties.whiterank || "", // White player rank
    KM: properties.komi || "" // Komi value
    // Add more properties as needed
  };

  // Construct player info string
  let playerInfoString = "";
  for (let prop in playerInfo) {
    if (playerInfo[prop]) {
      playerInfoString += prop + "[" + playerInfo[prop] + "]";
    }
  }
  console.log(playerInfoString);

  // Find the position to inject player info
  let semicolonPosition = sgf.indexOf(';', sgf.indexOf(';') + 1);
  let injectionPosition = semicolonPosition - 1;

  // Inject player info into SGF content
  sgf = sgf.slice(0, injectionPosition) + "\n" + playerInfoString + sgf.slice(injectionPosition);

  let base64 = Base64.encode(sgf);
  console.log("After injection:", sgf);

  context.uploadContent(properties.filename, base64, function(err, url) {
    if (err) {
      alert('We have a problem when uploading...');
    } else {
      instance.publishState('sgfurl', url);
      instance.triggerEvent('Save File After Upload');
    }
  }, properties.attachToThing);
}


//load_sgf_to_goban
function(instance, properties, context) {
    let success = function(response) {
        let sgf = window.besogo.parseSgf(response);        
        window.besogo.loadSgf(sgf, instance.data.editor);
        if(!properties.togglepreviewmove){
        	instance.data.editor.toggleVariantStyle(true);
    	}
    };    
    $.get(properties.file).then(function(response) {
        let sgf = window.besogo.parseSgf(response);
        window.besogo.loadSgf(sgf, instance.data.editor);
        let sgf_info = instance.data.editor.getGameInfo()
        console.log(sgf_info)
        instance.publishState('PB', sgf_info.PB)
        instance.publishState('BR', sgf_info.BR)
        instance.publishState('PW', sgf_info.PW)
        instance.publishState('WR', sgf_info.WR)
        if(sgf_info.KM == 375){sgf_info.KM = 7.5}
        instance.publishState('KM', sgf_info.KM)
    });
    
}

//next_node
function(instance, properties, context) {
    let control = properties.control
    let value = properties.value
    let editor = instance.data.editor
    window.besogo.bubbleController(control, value, editor);
	try{
     let curret_move = window.besogo.bubbleController('move', 0, editor)
     console.log(curret_move)
     if(curret_move != undefined){
		instance.publishState('CM', curret_move)
     }   
    }catch(error){
	console.log('error getting current move', error)
    }
}

//prev_node
function(instance, properties, context) {
    let control = properties.control
    let value = properties.value
    let editor = instance.data.editor
    window.besogo.bubbleController(control, value, editor);
	try{
     let curret_move = window.besogo.bubbleController('move', 0, editor)
     console.log(curret_move)
     if(curret_move != undefined){
		instance.publishState('CM', curret_move)
     } 
    }catch(error){
	console.log('error getting current move', error)
    }
}

//delete_node
function(instance, properties, context) {
    let control = properties.control
    let value = 0
    let editor = instance.data.editor
    window.besogo.bubbleController(control, value, editor);
	try{
     let curret_move = window.besogo.bubbleController('move', 0, editor)
     console.log(curret_move)
     if(curret_move != undefined){
		instance.publishState('CM', curret_move)
     }   
    }catch(error){
	console.log('error getting current move', error)
    }
}

//set_tool
function(instance, properties, context) {
    let control = 'tool'
	let value = properties.tool
    let editor = instance.data.editor
    window.besogo.bubbleController(control, value, editor);
}

//offline_download
function(instance, properties, context) {
  // Declare the saveFile function within the main function scope
  function saveFile(fileName, text) {
    var link = document.createElement('a');
    var blob = new Blob([text], { encoding: "UTF-8", type: "text/plain;charset=UTF-8" });

    link.download = fileName;
    link.href = URL.createObjectURL(blob);
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  let besogo = instance.data.editor;
  let sgf = window.besogo.composeSgf(besogo);
  console.log(sgf);

  // Extract player information from properties
  let playerInfo = {
    PB: properties.pb || "", // Black player info
    PW: properties.pw || "", // White player info
    BR: properties.br || "", // Black player rank
    WR: properties.wr || "", // White player rank
    KM: properties.komi || "" // Komi value
    // Add more properties as needed
  };

  // Construct player info string
  let playerInfoString = "";
  for (let prop in playerInfo) {
    if (playerInfo[prop]) {
      playerInfoString += prop + "[" + playerInfo[prop] + "]";
    }
  }
  console.log(playerInfoString);

  // Find the position to inject player info
  let semicolonPosition = sgf.indexOf(';', sgf.indexOf(';') + 1);
  let injectionPosition = semicolonPosition - 1;

  // Inject player info into SGF content
  sgf = sgf.slice(0, injectionPosition) + "\n" + playerInfoString + sgf.slice(injectionPosition);

  console.log("After injection:", sgf);

  let today = new Date();
  let formattedDate = today.toISOString().substring(0, 10);
  let fileName = properties.pb + "-" + properties.pw + "-" + formattedDate + ".sgf";

  // Trigger the file download using the saveFile function
  saveFile(fileName, sgf);
}

//autoplay
function(instance, properties, context) {
  function getTotalMovesFromSgf(sgf) {
    let movesSection = sgf.split(';').slice(1).join(';');
    let totalMoves = movesSection.split(';').length;
    return totalMoves;
  }

  let besogo = instance.data.editor;
  let smartGoFormat = window.besogo.composeSgf(besogo);
  let secondsPerMove = properties.seconds_per_move;
  let totalMoves = getTotalMovesFromSgf(smartGoFormat);
  let currentMove = window.besogo.bubbleController('move', 0, besogo);
   

  setInterval(function() {
    if (currentMove <= totalMoves) {
      currentMove++;
      window.besogo.bubbleController('next', 1, besogo); // Call the 'next' method
    } else {
      clearInterval(this); // Clear the interval
    }
  }.bind(this), secondsPerMove * 1000);
}

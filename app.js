////////////////////////////////////////////////////Set Ships////////////////////////////////////////////////////

let allFields = document.querySelector('div#user-board').children; //from 0 to 121
let allComputerFields = document.querySelector('div#computer-board').children; //from 1000 to 1121

const shipSizeList = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

let reservedSpaceByComputer = new Set();
let computerShipsLocation = new Set();
let possibleShotsForComputer = new Array();
let theBestShotsForComputer = new Array();

let playerShipsLocation = new Set();

let fieldsHitByComputer = new Set(); //stores the fields ID where there are only ships
let fieldsHitByPlayer = new Set(); //stores the fields ID where there are only ships


//Set initial appropriate properties
var fieldId = 0;
for(let element of allFields) {

  element.setAttribute('id', fieldId);

  if(element.getAttribute('class') == 'field') {
    element.setAttribute('ondrop', 'drop(event)');
    element.setAttribute('ondragover', 'allowDrop(event)');
  }
  
  if(element.classList.contains('ship')) {
    element.setAttribute('ondragstart', 'drag(event)');
    element.setAttribute('draggable', 'true');
    element.setAttribute('onclick', 'rotation(event)');
  }
  
  fieldId++;
} 

function allowDrop(ev) {
    ev.preventDefault();
  }

function drag(ev) {

  const shipClassName = ev.target.className;
  ev.dataTransfer.setData("className", shipClassName);
  ev.dataTransfer.setData('shipId', ev.target.id);

  //Transfer coordinates of the ship
  const shipCoordinates = []

  for(let element of allFields) 
    if(element.className == shipClassName)
      shipCoordinates.push(element.id);

  ev.dataTransfer.setData('list', shipCoordinates);
}

function drop(ev) {

  ev.preventDefault();

  const shipClassName = ev.dataTransfer.getData("className");

  const shipCoordinatesText = ev.dataTransfer.getData('list');
  const movementDistance = ev.target.id - ev.dataTransfer.getData('shipId');

  if(!isItLegallMoveBoard(shipCoordinatesText.split(","), movementDistance))
    return;

  if(!isItLegallMoveOtherShips(shipCoordinatesText.split(","), movementDistance))
    return;

  //Delete old ship
  for(let shipId of shipCoordinatesText.split(",")) {

    allFields[parseInt(shipId)].removeAttribute('ondragstart');
    allFields[parseInt(shipId)].removeAttribute('draggable');
    allFields[parseInt(shipId)].removeAttribute('onclick');

    allFields[parseInt(shipId)].setAttribute('class', 'field');
    allFields[parseInt(shipId)].setAttribute('ondrop', 'drop(event)');
    allFields[parseInt(shipId)].setAttribute('ondragover', 'allowDrop(event)');
  }

  //Insert new ship
  for(let shipId of shipCoordinatesText.split(",")) {

    allFields[parseInt(shipId) + movementDistance].removeAttribute('ondrop');
    allFields[parseInt(shipId) + movementDistance].removeAttribute('ondragover');

    allFields[parseInt(shipId) + movementDistance].setAttribute('class', shipClassName);
    allFields[parseInt(shipId) + movementDistance].setAttribute('ondragstart', 'drag(event)');
    allFields[parseInt(shipId) + movementDistance].setAttribute('draggable', 'true');
    allFields[parseInt(shipId) + movementDistance].setAttribute('onclick', 'rotation(event)');
  }
}

function isItLegallMoveBoard(oldShipCoordinates, movementDistance) {

  minOldCoordinates = parseInt(oldShipCoordinates[0]);
  maxOldCoordinates = parseInt(oldShipCoordinates[oldShipCoordinates.length - 1]);

  minNewCoordinates = minOldCoordinates + movementDistance;
  maxNewCoordinates = maxOldCoordinates + movementDistance;

  //Out off the map
  if(minNewCoordinates <  12)
    return false;
  if(maxNewCoordinates > 121)
    return false;

  //Cliked ship is horizontal
  if(parseInt(oldShipCoordinates[1]) - parseInt(oldShipCoordinates[0]) == 1) {

    //There are fields on different rows
    if(Math.floor(minNewCoordinates / 11) != Math.floor(maxNewCoordinates / 11))
      return false;
    
    //Field out off the map on the left side
    if(minNewCoordinates % 11 == 0)
      return false;
  }

  //Otherwise clied ship is vertical. Above conditions are enough.

  return true;
}

function isItLegallMoveOtherShips(oldShipCoordinates, movementDistance) {

  newShipCoordinates = [];

  for(let coordinates of oldShipCoordinates) {
    newShipCoordinates.push(parseInt(coordinates) + movementDistance);
  }

  const shipClassName = allFields[oldShipCoordinates[0]].className;
  allShipsCoordinates = [];

  for(let element of allFields) 
    if(element.classList.contains('ship') && element.className != shipClassName)
        allShipsCoordinates.push(parseInt(element.id));

  for(let coordinates of newShipCoordinates)
    for(let freeSpace of [0, -1, 1, -11, 11, -10, 10, -12, 12])
      if(allShipsCoordinates.includes(coordinates + freeSpace))
        return false;
    
  return true;
}

function rotation(ev) {
  
  const shipClassName = ev.target.className;
  const shipCoordinates = [];

  for(let element of allFields) 
    if(element.className == shipClassName)
      shipCoordinates.push(element.id);
  
  const shipSize = getShipSize(ev.target);
  const pivotPointId = parseInt(shipCoordinates[0]);
  
  if(shipSize == 1)
    return;

  //Clicked ship is horizontal. We need to check the correctness of the move
  if(shipCoordinates[1] - shipCoordinates[0] == 1) {

    newShipCoordinates = [];
    
    for(let i = 0; i < shipSize; i++)
      newShipCoordinates.push(pivotPointId + 11 * i);

    if(!isItLegallMoveBoard(newShipCoordinates, 0))
      return;

    if(!isItLegallMoveOtherShips(newShipCoordinates, 0))
      return;
  }

  //Cliked ship is vertival. We also need to check the correctness of the move
  else {

    newShipCoordinates = [];

    for(let i = 0; i < shipSize; i++)
      newShipCoordinates.push(pivotPointId + i);

    if(!isItLegallMoveBoard(newShipCoordinates, 0))
      return;

    if(!isItLegallMoveOtherShips(newShipCoordinates, 0))
      return;
  }

  //erase old ship
  for(let i = 0; i < shipSize; i++) {

    allFields[shipCoordinates[i]].removeAttribute('ondragstart');
    allFields[shipCoordinates[i]].removeAttribute('draggable');
    allFields[shipCoordinates[i]].removeAttribute('onclick');

    allFields[shipCoordinates[i]].setAttribute('class', 'field');
    allFields[shipCoordinates[i]].setAttribute('ondrop', 'drop(event)');
    allFields[shipCoordinates[i]].setAttribute('ondragover', 'allowDrop(event)');
    }

  //Clicked ship is horizontal
  if(shipCoordinates[1] - shipCoordinates[0] == 1) {

    for(let i = 0; i < shipSize; i++) {

    allFields[pivotPointId + 11 * i].removeAttribute('ondrop');
    allFields[pivotPointId + 11 * i].removeAttribute('ondragover');

    allFields[pivotPointId + 11 * i].setAttribute('class', shipClassName);
    allFields[pivotPointId + 11 * i].setAttribute('ondragstart', 'drag(event)');
    allFields[pivotPointId + 11 * i].setAttribute('draggable', 'true');
    allFields[pivotPointId + 11 * i].setAttribute('onclick', 'rotation(event)');
    }
  }

  //Cliked ship is vertical
  else {

    for(let i = 0; i < shipSize; i++) {

      allFields[pivotPointId + i].removeAttribute('ondrop');
      allFields[pivotPointId + i].removeAttribute('ondragover');
  
      allFields[pivotPointId + i].setAttribute('class', shipClassName);
      allFields[pivotPointId + i].setAttribute('ondragstart', 'drag(event)');
      allFields[pivotPointId + i].setAttribute('draggable', 'true');
      allFields[pivotPointId + i].setAttribute('onclick', 'rotation(event)');
    }
  }
}

function getShipSize (ship) {
  if(ship.classList.contains('large'))
    return 4;

  if(ship.className.match('big'))
    return 3;

  if(ship.className.match('medium'))
    return 2;

  if(ship.className.match('small'))
    return 1;

  else 
    return 0;
}


////////////////////////////////////////////////////Start Game////////////////////////////////////////////////////


function startGame(ev) {
  ev.target.textContent = 'BATTLE!';
  ev.target.removeAttribute('onclick');

  for(let element of allFields) {

    if(element.getAttribute('class') == 'field') {
      element.removeAttribute('ondrop');
      element.removeAttribute('ondragover');
    }

    if(element.classList.contains('ship')) {
      element.removeAttribute('ondragstart');
      element.removeAttribute('draggable');
      element.removeAttribute('onclick');
    }
  }

  let computerFieldId = 1000
  for(let element of allComputerFields) {

    if(element.getAttribute('class') == 'field')
      element.setAttribute('onclick', 'shoot(event)');

    element.setAttribute('id', computerFieldId);
    computerFieldId++;
  }

  for(let playerFild of allFields) {
    if(playerFild.classList.contains('ship')) 
      playerShipsLocation.add(parseInt(playerFild.id));
    
    if(playerFild.classList.contains('ship') || playerFild.getAttribute('class') == 'field')
      possibleShotsForComputer.push(parseInt(playerFild.id));
  }

  randomSetComputerShips();
}

function randomSetComputerShips() {

  for(let shipSize of shipSizeList) {
      placeShip(shipSize)
  }
}

function placeShip(shipSize) {
  //position = 0 means horizontal 
  //position = 1 means vertical

  let position = Math.floor(Math.random() * 2);

  if(shipSize == 4)
    placeLargeShip(position);

  if(shipSize == 3)
    placeBigShip(position);

  if(shipSize == 2)
    placeMediumShip(position);

  if(shipSize == 1)
    placeSmallShip();
}

function placeLargeShip(position) {
  let axisX; //location from 0 to 9 on the map 
  let axisY; //location from 0 to 9 on the map
  let reservedId; // reserved ID from 1000 to 1121

  if(position == 0) {
    axisX = Math.floor(Math.random() * 7);
    axisY = Math.floor(Math.random() * 10);
    
    reservedId = axisY * 11 + axisX + 12 + 1000; //convert to appriopriate ID
    
    for(let i = reservedId; i < reservedId + 4; i++) {
      reservedSpaceAroundTheCell(i);
      computerShipsLocation.add(i);
    }
  }

  if(position == 1) {
    axisX = Math.floor(Math.random() * 10);
    axisY = Math.floor(Math.random() * 7);

    reservedId = axisY * 11 + axisX + 12 + 1000; //convert to appriopriate ID

    for(let i = reservedId; i < reservedId + 44; i += 11) {
      reservedSpaceAroundTheCell(i);
      computerShipsLocation.add(i);
    }
  }
}

function placeBigShip(position) {
  let axisX; //location from 0 to 9 on the map 
  let axisY; //location from 0 to 9 on the map
  let reservedId; // reserved ID from 1000 to 1121

  if(position == 0) {
    axisX = Math.floor(Math.random() * 8);
    axisY = Math.floor(Math.random() * 10);
    
    for(let y = 0; y < 10; y++)
      for(let x = 0; x < 10; x++) {
        let aux = 1; // auxiliary var which helps us ensure that we can reserve new place

        axisY = (axisY + y) % 10;
        axisX = (axisX + x) % 8;
        reservedId = axisY * 11 + axisX + 12 + 1000; //convert to appropriate ID
        
        //we have to check if our new place is avaliable
        for(let i = reservedId; i < reservedId + 3; i++)
          if(reservedSpaceByComputer.has(i)) 
            aux = 0;
          
        //if our new place is avaliable we can reserved it
        if(aux == 1) {
          for(let i = reservedId; i < reservedId + 3; i++) {
            reservedSpaceAroundTheCell(i);
            computerShipsLocation.add(i);
          }
          //we have to leave from function when we find appropriate place
          return;
        }
      }
  }

  if(position == 1) {
    axisX = Math.floor(Math.random() * 10);
    axisY = Math.floor(Math.random() * 8);

    for(let y = 0; y < 10; y++)
      for(let x = 0; x < 10; x++) {
        let aux = 1; // auxiliary var which helps us ensure that we can reserve new place

        axisY = (axisY + y) % 8;
        axisX = (axisX + x) % 10;

        reservedId = axisY * 11 + axisX + 12 + 1000; //convert to appriopriate ID

        //we have to check if our new place is avaliable
        for(let i = reservedId; i < reservedId + 33; i+= 11)
          if(reservedSpaceByComputer.has(i))
            aux = 0;

        //if our new place is avaliable we can reserved it
        if(aux == 1) {
          for(let i = reservedId; i < reservedId + 33; i += 11) {
            reservedSpaceAroundTheCell(i);
            computerShipsLocation.add(i);
          }
          //we have to leave from function when we find appropriate place
          return;
        }
      }
  }
}

function placeMediumShip(position) {
  let axisX; //location from 0 to 9 on the map 
  let axisY; //location from 0 to 9 on the map
  let reservedId; // reserved ID from 1000 to 1121

  if(position == 0) {
    axisX = Math.floor(Math.random() * 9);
    axisY = Math.floor(Math.random() * 10);
    
    for(let y = 0; y < 10; y++)
      for(let x = 0; x < 10; x++) {
        let aux = 1; // auxiliary var which helps us ensure that we can reserve new place

        axisY = (axisY + y) % 10;
        axisX = (axisX + x) % 9;
        reservedId = axisY * 11 + axisX + 12 + 1000; //convert to appropriate ID
        
        //we have to check if our new place is avaliable
        for(let i = reservedId; i < reservedId + 2; i++)
          if(reservedSpaceByComputer.has(i))
            aux = 0;
          
        //if our new place is avaliable we can reserved it
        if(aux == 1) {
          for(let i = reservedId; i < reservedId + 2; i++) {
            reservedSpaceAroundTheCell(i);
            computerShipsLocation.add(i);
          }
          //we have to leave from function when we find appropriate place
          return;
        }
      }
  }

  if(position == 1) {
    axisX = Math.floor(Math.random() * 10);
    axisY = Math.floor(Math.random() * 9);

    for(let y = 0; y < 10; y++)
      for(let x = 0; x < 10; x++) {
        let aux = 1; // auxiliary var which helps us ensure that we can reserve new place

        axisY = (axisY + y) % 9;
        axisX = (axisX + x) % 10;

        reservedId = axisY * 11 + axisX + 12 + 1000; //convert to appriopriate ID

        //we have to check if our new place is avaliable
        for(let i = reservedId; i < reservedId + 22; i+= 11)
          if(reservedSpaceByComputer.has(i))
            aux = 0;

        //if our new place is avaliable we can reserved it
        if(aux == 1) {
          for(let i = reservedId; i < reservedId + 22; i += 11) {
            reservedSpaceAroundTheCell(i);
            computerShipsLocation.add(i);
          }
          //we have to leave from function when we find appropriate place
          return;
        }
      }
  }
}

function placeSmallShip() {
  let axisX; //location from 0 to 9 on the map 
  let axisY; //location from 0 to 9 on the map
  let reservedId; // reserved ID from 1000 to 1121

  axisX = Math.floor(Math.random() * 10);
  axisY = Math.floor(Math.random() * 10);
  
  for(let y = 0; y < 10; y++)
    for(let x = 0; x < 10; x++) {
      let aux = 1; // auxiliary var which helps us ensure that we can reserve new place

      axisY = (axisY + y) % 10;
      axisX = (axisX + x) % 10;
      reservedId = axisY * 11 + axisX + 12 + 1000; //convert to appropriate ID
      
      //we have to check if our new place is avaliable
      if(reservedSpaceByComputer.has(reservedId)) 
        aux = 0;
        
      //if our new place is avaliable we can reserved it
      if(aux == 1) {
        reservedSpaceAroundTheCell(reservedId);
        computerShipsLocation.add(reservedId);
        
        //we have to leave from function when we find appropriate place
        return;
      }
    }
}

function reservedSpaceAroundTheCell(reservedId) {
  let i = reservedId;

  for(let j of [i, i+1, i-1, i+11, i-11, i+12, i-12, i+10, i-10])
    reservedSpaceByComputer.add(j);
}

function shoot(ev) {
  ev.target.removeAttribute('onclick');
  let shotDownFieldId = parseInt(ev.target.id);

  if(computerShipsLocation.has(shotDownFieldId)) {
    ev.target.setAttribute('class', 'cross');
    ev.target.textContent = 'X';

    fieldsHitByPlayer.add(shotDownFieldId)
    checkIfShipIsSank(shotDownFieldId, computerShipsLocation, fieldsHitByPlayer);
    checkEndGame();
  }

  else {
    ev.target.setAttribute('class', 'miss');

    const pointDiv = document.createElement('div');
    pointDiv.className = 'point';
    
    ev.target.appendChild(pointDiv);
    

    computerShot()
  }
}

async function computerShot() {
  let shotDownFieldId;

  if(theBestShotsForComputer.length == 0)
    shotDownFieldId = possibleShotsForComputer[Math.floor(Math.random() * possibleShotsForComputer.length)];
    

  else {
    shotDownFieldId = theBestShotsForComputer[Math.floor(Math.random() * theBestShotsForComputer.length)];

    const bestIndex = theBestShotsForComputer.indexOf(shotDownFieldId);
    theBestShotsForComputer.splice(bestIndex, 1);
  }

  const index = possibleShotsForComputer.indexOf(shotDownFieldId);
  possibleShotsForComputer.splice(index, 1);

  if(playerShipsLocation.has(shotDownFieldId)) {
    allFields[shotDownFieldId].setAttribute('class', 'cross');
    allFields[shotDownFieldId].textContent = 'X';

    fieldsHitByComputer.add(shotDownFieldId);
    checkIfShipIsSank(shotDownFieldId, playerShipsLocation, fieldsHitByComputer);

    checkEndGame();

    await sleep(50);
    computerShot();
  }

  else {
    allFields[shotDownFieldId].setAttribute('class', 'miss');

    const pointDiv = document.createElement('div');
    pointDiv.className = 'point';
    
    allFields[shotDownFieldId].appendChild(pointDiv);
  } 
}

function checkIfShipIsSank(fieldId, shipBoard, hitShipsBoard) {
  let sanken = 1
  let sankenShip = new Set([fieldId]);

  for(let i = 1; i < 4; i++) {

    if(shipBoard.has(fieldId + i)) {
      if(! hitShipsBoard.has(fieldId + i))
        sanken = 0;
      else
        sankenShip.add(fieldId + i)
    }

    else
      break;
  }

  for(let i = 1; i < 4; i++) {

    if(shipBoard.has(fieldId - i)) {
      if(! hitShipsBoard.has(fieldId - i))
        sanken = 0;
      else
        sankenShip.add(fieldId - i)
    }

    else
      break;
  }

  for(let i = 11; i < 44; i += 11) {

    if(shipBoard.has(fieldId + i)) {
      if(! hitShipsBoard.has(fieldId + i))
        sanken = 0;
      else
        sankenShip.add(fieldId + i)
    }

    else
      break;
  }

  for(let i = 11; i < 44; i += 11) {

    if(shipBoard.has(fieldId - i)) {
      if(! hitShipsBoard.has(fieldId - i))
        sanken = 0;
      else
        sankenShip.add(fieldId - i)
    }

    else
      break;
  }

  if(sanken == 1) {
    markFieldsAroundShip(sankenShip);
    theBestShotsForComputer = new Array();
  }

  if(sanken == 0) {
    if(fieldId < 1000)
      setTheBestShotsForComputer(sankenShip);
  }
}

function markFieldsAroundShip(shipLocationSet) {
  const iterator = shipLocationSet.values();

  //we have to check if we are looking on computer board or player board
  if(iterator.next().value > 1000) 
    for(let elementId of shipLocationSet)
      for(let i of [1, -1, 11, -11, 12, -12, 10, -10])
        if(elementId + i <= 1120)
          if(allComputerFields[elementId + i - 1000].getAttribute('class') == 'field') {

            allComputerFields[elementId + i - 1000].setAttribute('class', 'miss')
            allComputerFields[elementId + i - 1000].removeAttribute('onclick');

            const pointDiv = document.createElement('div');
            pointDiv.className = 'point';
            
            allComputerFields[elementId + i - 1000].appendChild(pointDiv);
          }
        
  //we have to check if we are looking on computer board or player board
  if(iterator.next().value < 1000) 
    for(let elementId of shipLocationSet) 
      for(let i of [1, -1, 11, -11, 12, -12, 10, -10])
        if(elementId + i <= 120)
          if(allFields[elementId + i].getAttribute('class') == 'field') {

            const index = possibleShotsForComputer.indexOf(elementId + i);
            possibleShotsForComputer.splice(index, 1);

            const pointDiv = document.createElement('div');
            pointDiv.className = 'point';
            
            allFields[elementId + i].appendChild(pointDiv);
            allFields[elementId + i].setAttribute('class', 'miss');
          }

}

async function checkEndGame() {
  await sleep(50);

  if(fieldsHitByComputer.size == 20) {
    alert("You lose");
    window.location.reload();
  }
  
  if(fieldsHitByPlayer.size == 20) {
    alert("You win");
    window.location.reload();
  }
}

function setTheBestShotsForComputer(shotDownFields) {
  shotDownFields = Array.from(shotDownFields);
  theBestShotsForComputer = new Array();

  //first possiblility
  if(shotDownFields.length == 1)
    for(let i of [1, -1, 11, -11])
      if(possibleShotsForComputer.includes(shotDownFields[0] + i))
        theBestShotsForComputer.push(shotDownFields[0] + i);
  
  //second possiblility
  if(shotDownFields.length == 2) {

    if(Math.abs(shotDownFields[1] - shotDownFields[0]) == 1) {

      if(possibleShotsForComputer.includes(Math.min(...shotDownFields) - 1))
        theBestShotsForComputer.push(Math.min(...shotDownFields) - 1);

      if(possibleShotsForComputer.includes(Math.max(...shotDownFields) + 1))
        theBestShotsForComputer.push(Math.max(...shotDownFields) + 1);
    }

    if(Math.abs(shotDownFields[1] - shotDownFields[0]) == 11) {

      if(possibleShotsForComputer.includes(Math.min(...shotDownFields) - 11))
        theBestShotsForComputer.push(Math.min(...shotDownFields) - 11);

      if(possibleShotsForComputer.includes(Math.max(...shotDownFields) + 11))
        theBestShotsForComputer.push(Math.max(...shotDownFields) + 11);
    }
  }

  if(shotDownFields.length == 3) {

    if(Math.abs(shotDownFields[1] - shotDownFields[0]) < 11) {

      if(possibleShotsForComputer.includes(Math.min(...shotDownFields) - 1))
        theBestShotsForComputer.push(Math.min(...shotDownFields) - 1);

      if(possibleShotsForComputer.includes(Math.max(...shotDownFields) + 1))
        theBestShotsForComputer.push(Math.max(...shotDownFields) + 1);
    }

    if(Math.abs(shotDownFields[1] - shotDownFields[0]) >= 11) {

      if(possibleShotsForComputer.includes(Math.min(...shotDownFields) - 11))
        theBestShotsForComputer.push(Math.min(...shotDownFields) - 11);

      if(possibleShotsForComputer.includes(Math.max(...shotDownFields) + 11))
        theBestShotsForComputer.push(Math.max(...shotDownFields) + 11);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
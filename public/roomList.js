const roomList = document.getElementById("room-list");
const roomNameInput = document.getElementById("room-name");

roomList.style.display = "none";

let roomArray = [];

function bufferRoomData(roomsData) {
	roomList.innerText = "";
	roomsArray = roomsData;

	/*for (var i = 0; i < 10; i++) {
		roomsArray[i + "room"] = 100;
	}*/
	
	let newRoomAdd = setTimeout(addNewRooms, 50);
}

function addNewRooms() {
	let iCount = 0;
	
	for (var itemKey in roomsArray) {
		if (roomsArray[itemKey] != null && itemKey != "") {
			let newButton = document.createElement("button")
			let mainP = document.createElement("span");
			let mainP2 = document.createElement("span");
			
			mainP.innerText = itemKey;
			mainP2.innerText = "Players: " + roomsArray[itemKey];

			newButton.appendChild(mainP);
			newButton.appendChild(mainP2);
			
			newButton.addEventListener("click", e => {
				roomNameInput.value = e.target.children[0].innerText;
				roomList.style.display = "none";
			})
		
			roomList.appendChild(newButton)

			iCount += 1;
		}
	}

	if (iCount < 1) {
		let newButton = document.createElement("button")
		let mainP = document.createElement("span");
		let mainP2 = document.createElement("span");
			
		mainP.innerText = "No Active Rooms";
		mainP2.innerText = "Try creating your own instead!";

			newButton.appendChild(mainP);
			newButton.appendChild(mainP2);
		
			roomList.appendChild(newButton)

		iCount = 1;
	}

	let calculatedDrop = 0;
	
	if (iCount < 3) {
		calculatedDrop = (iCount - 1) * 30 + 53;
	}
	else {
		calculatedDrop = 63;
	}
	roomList.style.transform = "translateY(" + calculatedDrop + "px)"
}

function fetchDataFromServer() {
	fetch("/api/rooms")
	.then(res => {
		return res.json();
	})
	.then(data => {	
		bufferRoomData(data);
	})
}

fetchDataFromServer();

roomNameInput.addEventListener("click", e => {
	roomList.style.display = "block";
})

document.addEventListener("click", e => {
	if (e.target != roomNameInput && e.target != roomList) {
		roomList.style.display = "none";
	}
})
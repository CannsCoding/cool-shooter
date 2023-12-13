// https://threejs.org/examples

// 3D rendering

import * as THREE from '../three/three.module.min.js';

import { PointerLockControls } from '/three/PointerLockControls.js';

import { GLTFLoader } from '../three/GLTFLoader.js';

//https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js

//import {PointerLockControls} from 'https://threejs.org/examples/jsm/controls/PointerLockControls.js'

// Load up localStorage and display

let gunSelectionButtons = document.getElementsByClassName("gun-select-button");

let weaponTracker = {
	activeWeapon: 0,
	lastActiveWeaponKeypress: false,
	gunID: 5,
	offHandWeapon: 0
}

for (var i = 0; i < gunSelectionButtons.length; i++) {
	gunSelectionButtons[i].addEventListener("click", e => {

		uiData.playButtonSound();

		weaponTracker.gunID = Number(e.target.value);
		weaponTracker.offHandWeapon = 0;

		for (var i = 0; i < gunSelectionButtons.length; i++) {
			gunSelectionButtons[i].classList.remove("selected-input");
		}

		e.target.classList.add("selected-input");
		localStorage.setItem("gun", weaponTracker.gunID)

	})
}

let changeGunOnRespawn = document.getElementsByClassName("gun-select-button-death");

for (var i = 0; i < changeGunOnRespawn.length; i++) {
	changeGunOnRespawn[i].addEventListener("click", e => {

		uiData.playButtonSound();

		weaponTracker.gunID = Number(e.target.value);
		weaponTracker.offHandWeapon = 0;

		for (var i = 0; i < changeGunOnRespawn.length; i++) {
			changeGunOnRespawn[i].classList.remove("selected-input");
		}

		e.target.classList.add("selected-input");
		localStorage.setItem("gun", weaponTracker.gunID)

	})
}

if (localStorage.getItem("gun") != null) {
	weaponTracker.gunID = Math.max(0, Math.min(4, Number(localStorage.getItem("gun"))));

	gunSelectionButtons[weaponTracker.gunID].classList.add("selected-input");
	changeGunOnRespawn[weaponTracker.gunID].classList.add("selected-input");
}
else {
	gunSelectionButtons[0].classList.add("selected-input");
	changeGunOnRespawn[0].classList.add("selected-input");
}

if (localStorage.getItem("username") != null) {
	document.getElementById("player-name").value = localStorage.getItem("username");
}

let scene, camera, renderer, cube, clock, keyboard, socket, controls, playerHolders, room, blocks, bullets, playerScores, kills, loader, multiplayerWeaponLoaded, loadedModels, gameMap, gameMapAllObjects, playerNames, gunManager, isShooting, lastShootTime, modelNumberLoad, rightClickDown, moveGunToShoot, middleButtonDown, sceneLoader, sceneMaps, tempTimer, worldMap, uiData, playerColourRecorder, gunRotateTimerAddition, gunSwayAdditionTimer, gunShotRotationAnimation, newPlayerKillSound, grassObjectsHolder, gunModelHolder, globalPlayerModel, localPlayerArms, mobileFingerMovementPos, mobileEuler, scenePointLight, playerHasShot, playerHasShootCube, multiplayerHealthObjectHolder, explosionParticleHolder, sceneAlphas, slowMovement;

room = "qfhiehfiheahfijwdi9r3uru8u2uu2ue92eu9u";
blocks = []
bullets = []
loadedModels = [];
grassObjectsHolder = [];
playerColourRecorder = [];
gunModelHolder = [];
playerScores = {};
playerNames = {};

multiplayerHealthObjectHolder = {};

explosionParticleHolder = [];

kills = 0;
tempTimer = 0;

playerHasShot = false;

worldMap = Math.round(Math.random() * 6);

gunRotateTimerAddition = 0;
gunSwayAdditionTimer = [0, 0];
gunShotRotationAnimation = [0, 0, 0, 0];

mobileFingerMovementPos = [0, 0]

slowMovement = false;

uiData = {
	playButtonSound: function() {
		let tempAudioObject = new Audio("/sounds/buttonClick.wav");
		tempAudioObject.currentTime = 0;
		tempAudioObject.volume = 1;
		tempAudioObject.play();
	}
}

// Load background texture
sceneLoader = new THREE.TextureLoader();

sceneMaps = {
	woodenBox: sceneLoader.load('/textures/woodenBox.jpg'),
	woodenPlank: sceneLoader.load('/textures/woodenPlank.webp'),
	shippingContainerRed: sceneLoader.load('/textures/shippingRed.jpg'),
	shippingContainerBlue: sceneLoader.load('/textures/shippingBlue.jpg'),
	shippingContainerGreen: sceneLoader.load('/textures/shippingGreen.jpg'),
	brickWall: sceneLoader.load('/textures/brickWall.jpg'),
	brickWall2: sceneLoader.load('/textures/brickPost.jpg'),
	floor1: sceneLoader.load('/textures/dirt.jpg'),
	floor2: sceneLoader.load('/textures/sand.jpg'),
	floor3: sceneLoader.load('/textures/1.jpg'),
	windows: sceneLoader.load('/textures/windows.jpg'),
	road: sceneLoader.load('/textures/road.png'),
	carpet: sceneLoader.load('/textures/brickWall.jpg'),
	roofing: sceneLoader.load('/textures/houseRoof.jpg'),
	houseWall: sceneLoader.load('/textures/houseWall.jpg'),
	dwayne: sceneLoader.load('/textures/dwayne.jpeg'),
	sandstone: sceneLoader.load('/textures/sandstone.jpg'),
	bricks: sceneLoader.load('/textures/2.png'),
	normalMap: sceneLoader.load('/images/normal.jpg')
}

sceneAlphas = {
	fenceAlpha: sceneLoader.load('/alphaMaps/fenceAlpha.png')
}

modelNumberLoad = 0
moveGunToShoot = false;
middleButtonDown = false;

gameMap = [];
gameMapAllObjects = [];

const gameSound = [
	new Audio("/sounds/pistol.mp3"),
	new Audio("/sounds/sniper.mp3"),
	new Audio("/sounds/machineGun.mp3"),
	new Audio("/sounds/assaultRifle.mp3"),
	new Audio("/sounds/bazooka.mp3"),
	new Audio("/sounds/silencedPistol.wav"),
	new Audio("/sounds/bulletImpact.wav"),
	new Audio("/sounds/playerMove.wav")
];

const reloadSounds = [
	new Audio("/sounds/reloads/glockReload.mp3"),
	new Audio("/sounds/reloads/sniperReload.mp3"),
	new Audio("/sounds/reloads/machineGunReload.mp3"),
	new Audio("/sounds/reloads/machineGunReload.mp3"),
	new Audio("/sounds/reloads/bazookaReload.mp3"),
	new Audio("/sounds/reloads/glockReload.mp3")
];

const multiplayerShootSounds = gameSound;

newPlayerKillSound = new Audio("/sounds/earnedPoints.wav");

// Gun selected object with different shoot speeds and damages
isShooting = false;
lastShootTime = 0;

gunManager = [{
	name: "Pistol",
	shootDelay: 0.15,
	ammo: 10,
	damage: 20,
	reload: 1,
	gunModel: 0,
	ammoCount: 10,
	animation: false,
	knockBack: 0.1
}, {
	name: "Sniper",
	shootDelay: 1,
	ammo: 3,
	damage: 101,
	reload: 4,
	gunModel: 4,
	ammoCount: 3,
	animation: false,
	knockBack: 0.2
}, {
	name: "Machine Gun",
	shootDelay: 0.07,
	ammo: 40,
	damage: 5,
	reload: 3,
	gunModel: 2,
	ammoCount: 40,
	animation: false,
	knockBack: 0.05
}, {
	name: "Assault Rifle",
	shootDelay: 0.2,
	ammo: 15,
	damage: 20,
	reload: 2,
	gunModel: 2,
	ammoCount: 15,
	animation: false,
	knockBack: 0.15
}, {
	name: "Bazooka",
	shootDelay: 0.5,
	ammo: 1,
	damage: 80,
	reload: 3,
	gunModel: 3,
	ammoCount: 1,
	animation: false,
	knockBack: 0.3
}, {
	name: "Glock 17",
	shootDelay: 0.1,
	ammo: 10,
	damage: 10,
	reload: 1,
	gunModel: 1,
	ammoCount: 10,
	animation: false,
	knockBack: 0
}]

const playerScoreDisplay = document.getElementById("player-score-display");
const healthBar = document.getElementById("healthBarDisplay");
const healthBarCounter = document.getElementById("healthBarDisplay-counter");
const playerKillNotification = document.getElementById("killNotification");
const FPSDisplay = document.getElementById("FPS-display");

let FPS = 60;
let FPSCounter = 0;
let FPSInterval;

const bulletSpeed = -4;

let gravity = 0;
const mapWidth = 3;
const mapHeight = 3;

const blockWidth = 50;
const blockLength = 50;
const blockHeight = 0.2;

let canReloadGunWithR = true;

let player = {
	height: 5,
	savedHeight: 5,
	gravity: 9.81 * 10,
	graphicsOffset: 2.5,
	canJump: false,
	groundHeight: 0,
	jumpHeight: 35,
	collisionAccuracy: 0.01,
	speed: 2.8,
	sideSpeed: 2,
	recordedSpeed: 2.8,
	friction: 0.8,
	velocity: {
		x: 0,
		y: 0,
		z: 0
	},
	name: "Player",
	health: 100,
	maxHealth: 100,
	lastJump: false,
	lastPressedSpace: false
}

let footstepCache = {
	x: 0,
	y: 0,
	z: 0,
	distance: 6,
	sound: new Audio("/sounds/playerMove2.wav"),
	volume: 1
}

healthBar.value = player.health;
healthBarCounter.innerText = player.health + " / " + player.maxHealth;

keyboard = {}

let chunks = [];


function changePlayerWeaponOnRespawn() {

	scene.remove(loadedModels[0]);
	modelNumberLoad = gunManager[weaponTracker.gunID].gunModel;

	let newClonedMesh = gunModelHolder[modelNumberLoad].clone();
	loadedModels[0] = newClonedMesh;
	scene.add(newClonedMesh)

	if (weaponTracker.offHandWeapon != 0 || weaponTracker.gunID == 0) {
		weaponTracker.gunID = weaponTracker.offHandWeapon;
	}

	weaponTracker.offHandWeapon = 0;
}

addMobileSupport()

function init() {

	scene = new THREE.Scene();

	scene.fog = new THREE.Fog(0xefefef, 100, 200);

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);

	clock = new THREE.Clock();

	let antialiasingStored = sessionStorage.getItem("antialiasing");

	if (antialiasingStored == null) {
		antialiasingStored = "1"
	}

	if (antialiasingStored == "1") {
		antialiasingStored = true;
	}
	else {
		antialiasingStored = false;
	}

	renderer = new THREE.WebGLRenderer({ antialias: antialiasingStored });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor("#7eb8de")
	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFShadowMap;

	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;

	// THREE.BasicShadowMap, THREE.PCFShadowMap, THREE.PCFSoftShadowMap, THREE.VSMShadowMap

	// Default pixel quality
	renderer.setPixelRatio(window.devicePixelRatio);


	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.1;

	document.body.appendChild(renderer.domElement);

	// Create geometry

	loadMap();

	chunks.push([])
	//createPlane([2, 2], [0, -3, 0], [-90, 0, 0], chunks[0], 0)

	camera.position.z = 70;
	camera.position.y = 60;
	camera.position.x = 40;

	camera.rotation.x = -1.3;

	// add lights

	let light = new THREE.DirectionalLight(0xffffdd, 1.0);
	light.position.set(blockWidth * mapWidth * 0.5, 100, blockHeight * mapHeight * 0.5)
	light.castShadow = true;
	light.isLightInScene = true;

	light.shadow.camera.near = 1;
	light.shadow.camera.far = 500;

	light.shadow.bias = -0.001;

	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;

	light.shadow.camera.left = blockWidth * mapWidth;
	light.shadow.camera.right = blockWidth * mapWidth * -1;
	light.shadow.camera.top = blockWidth * mapWidth;
	light.shadow.camera.bottom = blockWidth * mapWidth * -1;

	scene.add(light);

	light.target.position.set(light.position.x + 1, light.position.y - 1, light.position.z + 1)

	scenePointLight = light;

	light = new THREE.AmbientLight(0xfff6de, 0.3)
	light.position.set(0, 0, 0)
	light.isLightInScene = true;
	scene.add(light);

	// Bullet shooting
	renderer.domElement.addEventListener("mousedown", e => {
		if (event.button == 0) {
			isShooting = true;
		}
		else if (event.button == 1) {
			e.preventDefault();
			middleButtonDown = true;
		}
		else if (event.button == 2) {
			rightClickDown = true;
		}
	})

	renderer.domElement.addEventListener("mouseup", e => {
		if (event.button == 0) {
			isShooting = false;
		}
		else if (event.button == 1) {
			middleButtonDown = false;
		}
		else if (event.button == 2) {
			rightClickDown = false;
		}
	})

	renderer.domElement.addEventListener("touchstart", e => {
		let touch = e.targetTouches[0];
		mobileFingerMovementPos = [touch.pageX, touch.pageY];
	})

	mobileEuler = new THREE.Euler(0, 0, 0, 'YXZ');

	renderer.domElement.addEventListener("touchmove", e => {
		let touch = e.targetTouches[0];

		let movementX = (mobileFingerMovementPos[0] - touch.pageX) * -0.02;
		let movementY = (mobileFingerMovementPos[1] - touch.pageY) * -0.01;

		let _PI_2 = Math.PI / 2;

		mobileEuler.setFromQuaternion(camera.quaternion);

		mobileEuler.y -= movementX;
		mobileEuler.x -= movementY;

		mobileEuler.x = Math.max(_PI_2 - Math.PI, Math.min(_PI_2 - 0, mobileEuler.x));

		camera.quaternion.setFromEuler(mobileEuler);

		mobileFingerMovementPos = [touch.pageX, touch.pageY];
	})

	renderer.domElement.addEventListener("touchend", e => {
		let touch = e.changedTouches[0];
		mobileFingerMovementPos = [touch.pageX, touch.pageY];
	})

	// Socket.io

	socket = io();
	playerHolders = {}

	socket.emit("joined")

	socket.on("position", (data) => {

		if (data.roomID == room) {
			playerScores[data.socketID] = data.kills;
			playerNames[data.socketID] = data.name;
		}

		if (data.socketID != socket.id && data.roomID == room) {

			if (gunModelHolder[data.gun] != null && globalPlayerModel != null) {

				if (playerHolders[data.socketID] == null) {
					playerHolders[data.socketID] = createPlayer(data.gun);
				}

				if (playerHolders[data.socketID].selectedGun != data.gun) {
					updatePlayersWeapon(data.gun, playerHolders[data.socketID])
				}

				playerHolders[data.socketID].position.set(data.position.x, data.position.y - player.graphicsOffset, data.position.z);
				playerHolders[data.socketID].rotation.y = data.rotation + 1.5;

				playerHolders[data.socketID].translateY(1);

				scene.add(playerHolders[data.socketID]);

				// Display multiplayer health bar

				updatePlayersHealth(data.health, playerHolders[data.socketID], data.socketID);
			}
			else {
				console.log("Not enough models " + gunModelHolder)
			}

		}
		else if (data.socketID == socket.id) {
			document.getElementById("PING-display").innerHTML = (Date.now() - data.currentDate) + "ms";

			feather.replace();
		}
	})

	socket.on("bullet", (data) => {

		if (data.roomID == room) {
			// Record time that bullet is created
			bullets.push([createBullet([1, 1, 2], [data.position.x, data.position.y, data.position.z], data.socketID, data.gunDamage, playerHolders[data.socketID]), Date.now()]);
			bullets[bullets.length - 1][0].rotation.copy(data.rotation);

			scene.add(bullets[bullets.length - 1][0]);

			if (socket.id != data.socketID) {

				// Calculate gun sound volume

				let width = data.position.x - camera.position.x;
				let height = data.position.z - camera.position.z;

				let triangulation = Math.sqrt((width * width) + (height * height));
				let threshhold = 40;
				let calcVolume = (threshhold - triangulation) / 40;

				if (calcVolume < 0) calcVolume = 0;
				if (calcVolume > 1) calcVolume = 1;

				multiplayerShootSounds[data.gunID].volume = calcVolume;
				console.log(multiplayerShootSounds[data.gunID].volume)

				multiplayerShootSounds[data.gunID].currentTime = 0;
				multiplayerShootSounds[data.gunID].play();
			}

			console.log("Bullet recieved")
		}
	})

	socket.on("playerHit", (sniper, personHitInGame, personHitSocketID, roomID) => {

		console.log("New kill")

		if (roomID == room && sniper == socket.id && personHitSocketID != sniper) {
			kills += 1;
			playerKillNotification.style.opacity = 1;
			document.getElementById("PlayerKillMessage").innerText = "You killed " + personHitInGame;
			let playerNotificationInterval = setTimeout(resetKillsNotification, 1000)

			// Play kill sound

			newPlayerKillSound.currentTime = 0;
			newPlayerKillSound.play();
		}
	})

	function resetKillsNotification() {
		playerKillNotification.style.opacity = 0;
	}

	// Change player colours when player hits them

	socket.on("playerHitByBullet", (sniper, personHitInGame, roomID) => {

		if (roomID == room && sniper == socket.id && personHitInGame != sniper) {
			// Light up players crosshair
			document.getElementById("playerCrosshair").style.color = "#ff1a1a";
			document.getElementById("playerCrosshair").innerText = "x";

			let playerNotificationInterval = setTimeout(resetPlayerColours, 1000)
		}
	})

	function resetPlayerColours() {
		console.log("Reseting crosshair")
		document.getElementById("playerCrosshair").style.color = "#0a0a0a";
		document.getElementById("playerCrosshair").innerText = "+";
	}

	socket.on("roomChange", data => {
		if (socket.id == data[1] && room == data[0]) {

			console.log(worldMap + "  " + data[2])

			if (worldMap == data[2]) {
				return;
			}

			worldMap = data[2];
			loadMap();
		}
	})

	socket.on("leave", data => {
		scene.remove(playerHolders[data])
		playerScores[data] = null;
	})

	// Map choosing listeners

	document.getElementById("map-1").addEventListener("click", e => {
		document.getElementById("selected-map-display").innerText = "Cargo Depot";

		uiData.playButtonSound();

		if (worldMap == 0) {
			return;
		}

		worldMap = 0;
		loadMap();
	})

	document.getElementById("map-2").addEventListener("click", e => {
		document.getElementById("selected-map-display").innerText = "Building Site";

		uiData.playButtonSound();

		if (worldMap == 1) {
			return;
		}

		worldMap = 1;
		loadMap();
	})

	document.getElementById("map-3").addEventListener("click", e => {
		document.getElementById("selected-map-display").innerText = "Cargo Dump";

		uiData.playButtonSound();

		if (worldMap == 2) {
			return;
		}

		worldMap = 2;
		loadMap();
	})

	document.getElementById("map-4").addEventListener("click", e => {
		document.getElementById("selected-map-display").innerText = "Risky Road";

		uiData.playButtonSound();

		if (worldMap == 3) {
			return;
		}

		worldMap = 3;
		loadMap();
	})

	document.getElementById("map-5").addEventListener("click", e => {
		document.getElementById("selected-map-display").innerText = "Sandy City";

		uiData.playButtonSound();

		if (worldMap == 4) {
			return;
		}

		worldMap = 4;
		loadMap();
	})

	document.getElementById("map-6").addEventListener("click", e => {
		document.getElementById("selected-map-display").innerText = "Gucci Garage";

		uiData.playButtonSound();

		if (worldMap == 5) {
			return;
		}

		worldMap = 5;
		loadMap();
	})

	document.getElementById("map-7").addEventListener("click", e => {
		document.getElementById("selected-map-display").innerText = "Snow Station";

		uiData.playButtonSound();

		if (worldMap == 6) {
			return;
		}

		worldMap = 6;
		loadMap();
	})

	document.getElementById("map-8").addEventListener("click", e => {
		document.getElementById("selected-map-display").innerText = "Metal Maze";

		uiData.playButtonSound();

		if (worldMap == 7) {
			return;
		}

		worldMap = 7;
		loadMap();
	})

	loadupGrassModelsIntoScene();
	loadupPlayerModelAndSave();

}

function loadMap() {

	// Reset game map

	let iterations = gameMapAllObjects.length;
	for (var i = 0; i < iterations; i++) {
		let obj = gameMapAllObjects[i];
		scene.remove(obj);
	}

	gameMap = [];
	gameMapAllObjects = [];

	console.log("Remove children")

	// Floor

	for (var x = 0; x < mapWidth; x++) {
		for (var y = 0; y < mapHeight; y++) {

			let typeOfCube = ((x + y) % 2);

			let tempcalc = (x + 2) % 3
			if (worldMap == 3 && !tempcalc) typeOfCube = 10;

			createCube([blockWidth, blockHeight, blockLength], [x * blockWidth + 10, 0, y * blockLength + 10], typeOfCube, true, false);

		}
	}

	let smallWallHeight = 2.8;
	let tallWallHeight = 4;
	let borderWallHeight = 5;
	let buildingHeight = 5;
	let towerHeight = 20;
	let containerHeight = 4;

	// Boxes createCube([dimensions], [positions], colourType, collider, castShadows)

	// Wall positioning

	// Border walls --------------------
	createCube([0.5, borderWallHeight * 2, 140], [130, borderWallHeight, 50], 3, true, true);
	createCube([0.5, borderWallHeight * 2, 140], [-10, borderWallHeight, 50], 3, true, true);

	createCube([140, borderWallHeight * 2, 0.5], [60, borderWallHeight, 120], 3, true, true);
	createCube([140, borderWallHeight * 2, 0.5], [60, borderWallHeight, -15], 3, true, true);

	if (worldMap == 0) {

		// Other walls ---------------------

		smallWallHeight = 4.5

		createCube([1, tallWallHeight * 2, 80], [100, tallWallHeight, 60], 3, true, false);
		createCube([1, tallWallHeight * 2, 80], [20, tallWallHeight, 60], 3, true, false);

		createCube([25, smallWallHeight * 2, 0.1], [88, smallWallHeight, 100], 17, true, false);
		createCube([25, smallWallHeight * 2, 0.1], [32, smallWallHeight, 100], 17, true, false);

		createCube([25, smallWallHeight * 2, 0.1], [88, smallWallHeight, 20], 17, true, false);
		createCube([25, smallWallHeight * 2, 0.1], [32, smallWallHeight, 20], 17, true, false);

		// Platforms -------------------------

		createCube([15, 0.5, 1], [58, (containerHeight * 4) + 0.1, 47], 8, true, false);
		createCube([15, 0.5, 1], [58, (containerHeight * 4) + 0.1, 45.7], 8, true, false);

		createCube([2, 0.5, 18], [46, (containerHeight * 4) + 0.1, 66], 8, true, false);

		createCube([1, 0.5, 18], [82, (containerHeight * 4) + 0.1, 66], 8, true, false);
		createCube([1, 0.5, 18], [80.8, (containerHeight * 4) + 0.1, 66], 8, true, false);

		// Taller building structures ---------------------

		// Wall posts right from start screen
		createCube([5, buildingHeight * 2, 5], [100, buildingHeight, 100], 2, true, false);
		createCube([5, buildingHeight * 2, 5], [100, buildingHeight, 20], 2, true, false);
		// Wall posts left from start screen
		createCube([5, buildingHeight * 2, 5], [20, buildingHeight, 100], 2, true, false);
		createCube([5, buildingHeight * 2, 5], [20, buildingHeight, 20], 2, true, false);
		// Wall posts bottom from start screen
		createCube([3, buildingHeight * 2, 3], [75, buildingHeight, 100], 2, true, false);
		createCube([3, buildingHeight * 2, 3], [45, buildingHeight, 100], 2, true, false);
		// Wall posts top from start screen
		createCube([3, buildingHeight * 2, 3], [75, buildingHeight, 20], 2, true, false);
		createCube([3, buildingHeight * 2, 3], [45, buildingHeight, 20], 2, true, false);

		// Decor ------------------- Shipping containers and boxes

		createCube([9, containerHeight * 2, 18], [48, containerHeight, 49], 4, true, false);
		createCube([9, containerHeight * 2, 18], [68, containerHeight, 49], 5, true, false);

		createCube([9, containerHeight * 2, 18], [37, containerHeight, 49], 4, true, false);
		createCube([9, containerHeight * 2, 18], [80, containerHeight, 49], 5, true, false);
		// Crates on top
		createCube([9, containerHeight * 2, 18], [48.5, containerHeight * 3, 48.7], 6, true, false);
		createCube([9, containerHeight * 2, 18], [68.2, containerHeight * 3, 49.5], 4, true, false);

		createCube([9, containerHeight * 2, 18], [80.5, containerHeight * 3, 49.2], 6, true, false);

		// Other side of crates
		createCube([9, containerHeight * 2, 18], [48, containerHeight, 82], 4, true, false);
		createCube([9, containerHeight * 2, 18], [68, containerHeight, 81.7], 4, true, false);

		createCube([9, containerHeight * 2, 18], [36.8, containerHeight, 82.5], 4, true, false);
		createCube([9, containerHeight * 2, 18], [80.5, containerHeight, 82], 5, true, false);
		// Other side crates on top
		createCube([9, containerHeight * 2, 18], [48.2, containerHeight * 3, 81.5], 5, true, false);

		createCube([9, containerHeight * 2, 18], [37.2, containerHeight * 3, 82], 4, true, false);
		createCube([9, containerHeight * 2, 18], [80, containerHeight * 3, 81.6], 5, true, false);

		createCube([3, 3, 3], [71, (containerHeight * 2) + 1.5, 81], 7, true, false);
		createCube([3, 3, 3], [70, (containerHeight * 2) + 1.5, 77.5], 7, true, false);
		createCube([3, 3, 3], [68, (containerHeight * 2) + 1.5, 81], 7, true, false);
		createCube([3, 3, 3], [70, (containerHeight * 2) + 4.5, 79], 7, true, false);

		createCube([3, 3, 3], [39, (containerHeight * 2) + 1.5, 50], 7, true, false);
		createCube([3, 3, 3], [35.5, (containerHeight * 2) + 1.5, 49], 7, true, false);
		createCube([3, 3, 3], [39.5, (containerHeight * 2) + 1.5, 46], 7, true, false);
		createCube([3, 3, 3], [38.5, (containerHeight * 2) + 4.5, 48], 7, true, false);

		createCube([5, 5, 5], [36, 2.5, 37], 7, true, false);
		createCube([3, 3, 3], [31.7, 1.5, 36.7], 7, true, false);
	}
	else if (worldMap == 1) {

		// Buildings
		createCube([50, 1, 50], [60, 0.1, 60], 9, true, false);

		createCube([3, buildingHeight * 2, 3], [43, buildingHeight, 43], 3, true, false);
		createCube([3, buildingHeight * 2, 3], [77, buildingHeight, 43], 3, true, false);
		createCube([3, buildingHeight * 2, 3], [43, buildingHeight, 77], 3, true, false);
		createCube([3, buildingHeight * 2, 3], [77, buildingHeight, 77], 3, true, false);

		createCube([15, towerHeight * 2, 15], [60, towerHeight, 60], 3, true, false);

		// Upper level
		createCube([50, 1, 50], [60, buildingHeight * 2 + 0.5, 60], 9, true, false);

		createCube([3, buildingHeight * 2, 3], [43, buildingHeight * 3 + 1, 43], 3, true, false);
		createCube([3, buildingHeight * 2, 3], [77, buildingHeight * 3 + 1, 43], 3, true, false);
		createCube([3, buildingHeight * 2, 3], [43, buildingHeight * 3 + 1, 77], 3, true, false);
		createCube([3, buildingHeight * 2, 3], [77, buildingHeight * 3 + 1, 77], 3, true, false);

		// Upper upper level
		createCube([50, 1, 50], [60, buildingHeight * 4 + 0.5, 60], 9, true, false);

		createCube([3, buildingHeight * 2, 3], [43, buildingHeight * 5 + 1, 43], 3, true, false);
		createCube([3, buildingHeight * 2, 3], [77, buildingHeight * 5 + 1, 43], 3, true, false);
		createCube([3, buildingHeight * 2, 3], [43, buildingHeight * 5 + 1, 77], 3, true, false);
		createCube([3, buildingHeight * 2, 3], [77, buildingHeight * 5 + 1, 77], 3, true, false);

		// Upper upper upper level
		createCube([50, 1, 50], [60, buildingHeight * 6 + 0.5, 60], 9, true, false);

		createCube([3, buildingHeight * 2, 3], [43, buildingHeight * 7 + 1, 43], 3, true, false);
		createCube([3, buildingHeight * 2, 3], [77, buildingHeight * 7 + 1, 43], 3, true, false);
		createCube([3, buildingHeight * 2, 3], [43, buildingHeight * 7 + 1, 77], 3, true, false);
		createCube([3, buildingHeight * 2, 3], [77, buildingHeight * 7 + 1, 77], 3, true, false);

		// Shipping crates

		createCube([9, containerHeight * 2, 18], [60, containerHeight, 100], 6, true, false);
		createCube([9, containerHeight * 2, 18], [70, containerHeight, 99.6], 5, true, false);
		createCube([9, containerHeight * 2, 18], [66, containerHeight * 3, 99.8], 4, true, false);

		createCube([9, containerHeight * 2, 18], [10, containerHeight, 20], 4, true, false);
		createCube([9, containerHeight * 2, 18], [10, containerHeight, 40], 5, true, false);
		createCube([18, containerHeight * 2, 9], [50, containerHeight, 10], 6, true, false);
		createCube([18, containerHeight * 2, 9], [50, containerHeight * 3, 10], 6, true, false);

		createCube([18, containerHeight * 2, 9], [100, containerHeight, 40], 6, true, false);
		createCube([18, containerHeight * 2, 9], [100, containerHeight, 49.5], 6, true, false);
		createCube([18, containerHeight * 2, 9], [99.5, containerHeight * 3, 40.2], 6, true, false);
		createCube([18, containerHeight * 2, 9], [100.2, containerHeight * 3, 50], 4, true, false);
		createCube([18, containerHeight * 2, 9], [99.8, containerHeight * 5, 40.2], 5, true, false);

		createCube([9, containerHeight * 2, 18], [110, containerHeight, 100], 6, true, false);

		createCube([18, containerHeight * 2, 9], [20, containerHeight, 100], 4, true, false);
		createCube([18, containerHeight * 2, 9], [19.2, containerHeight, 90], 4, true, false);

		createCube([9, containerHeight * 2, 18], [48, buildingHeight * 6 + containerHeight + 1, 62], 4, true, false);

		// Boxes

		createCube([3, 3, 3], [58, 1.5, 111], 7, true, false);

		createCube([3, 3, 3], [46.5, buildingHeight * 2 + 2.5, 73], 7, true, false);
		createCube([4, 4, 4], [50, buildingHeight * 2 + 3, 73], 7, true, false);

		createCube([3, 3, 3], [50, buildingHeight * 6 + 2.5, 73], 7, true, false);
		createCube([4, 5, 4], [46.5, buildingHeight * 6 + 3.5, 73], 7, true, false);

		createCube([4, 3, 4], [96, containerHeight * 6 + 1.5, 40.2], 7, true, false);

		// Telephone poles

		let telePos = [10, 5, 10, 55, 10, 105];

		for (var i = 0; i < telePos.length; i += 2) {
			createCube([1, 24, 1], [telePos[i], 12, telePos[i + 1]], 8, true, false);
			createCube([8, 0.5, 1], [telePos[i], 24.2, telePos[i + 1]], 8, true, false);

			createCube([1, 1, 1], [telePos[i], 25, telePos[i + 1]], 8, true, false);
			createCube([1, 1, 1], [telePos[i] - 3.5, 25, telePos[i + 1]], 8, true, false);
			createCube([1, 1, 1], [telePos[i] + 3.5, 25, telePos[i + 1]], 8, true, false);
		}

	}
	else if (worldMap == 2) {

		// Shipping containers
		createCube([9, containerHeight * 2, 18], [10, containerHeight, 50], 4, true, false);
		createCube([9, containerHeight * 2, 18], [14, containerHeight, 70], 5, true, false);
		createCube([9, containerHeight * 2, 18], [12, containerHeight, 10], 5, true, false);
		createCube([9, containerHeight * 2, 18], [30, containerHeight, 35], 6, true, false);
		createCube([9, containerHeight * 2, 18], [39.4, containerHeight, 35], 6, true, false);
		createCube([9, containerHeight * 2, 18], [35, containerHeight, 65], 6, true, false);
		createCube([18, containerHeight * 2, 9], [60, containerHeight, 50], 4, true, false);
		createCube([18, containerHeight * 2, 9], [60.5, containerHeight, 59.2], 5, true, false);

		createCube([9, containerHeight * 2, 18], [87, containerHeight, 27], 4, true, false);
		createCube([9, containerHeight * 2, 18], [87, containerHeight, 50], 5, true, false);
		createCube([9, containerHeight * 2, 18], [110, containerHeight, 40], 5, true, false);
		createCube([18, containerHeight * 2, 9], [65, containerHeight, 25], 4, true, false);

		createCube([18, containerHeight * 2, 9], [60, containerHeight, 80], 6, true, false);
		createCube([18, containerHeight * 2, 9], [60, containerHeight, 97], 6, true, false);
		createCube([9, containerHeight * 2, 18], [35, containerHeight, 90], 5, true, false);

		createCube([9, containerHeight * 2, 18], [87, containerHeight, 100], 6, true, false);
		createCube([9, containerHeight * 2, 18], [87, containerHeight, 80], 4, true, false);

		// Upper level cargo
		createCube([18, containerHeight * 2, 9], [25, containerHeight * 3, 65], 4, true, false);
		createCube([18, containerHeight * 2, 9], [98, containerHeight * 3, 39], 6, true, false);
		createCube([18, containerHeight * 2, 9], [60.1, containerHeight * 3, 56], 4, true, false);
		createCube([9, containerHeight * 2, 18], [60, containerHeight * 3, 87], 4, true, false);
		createCube([9, containerHeight * 2, 18], [87, containerHeight * 3, 88], 5, true, false);

		// Upper level wooden planks
		createCube([15, 0.5, 1], [45, (containerHeight * 2) + 0.1, 95], 8, true, false);
		createCube([15, 0.5, 1], [45, (containerHeight * 2) + 0.1, 96.5], 8, true, false);

		// Boxes
		createCube([3, 3, 3], [48, 1.5, 35], 7, true, false);
		createCube([3, 3, 3], [48.5, 1.5, 31], 7, true, false);
		createCube([3, 5, 3], [45.5, 2.5, 32], 7, true, false);

		// Telephone poles

		let telePos = [20, 5, 20, 55, 20, 105, 80, 25, 80, 75, 80, 125];

		for (var i = 0; i < telePos.length; i += 2) {
			createCube([1, 24, 1], [telePos[i], 12, telePos[i + 1]], 8, true, false);
			createCube([8, 0.5, 1], [telePos[i], 24.2, telePos[i + 1]], 8, true, false);

			createCube([1, 1, 1], [telePos[i], 25, telePos[i + 1]], 8, true, false);
			createCube([1, 1, 1], [telePos[i] - 3.5, 25, telePos[i + 1]], 8, true, false);
			createCube([1, 1, 1], [telePos[i] + 3.5, 25, telePos[i + 1]], 8, true, false);
		}
	}
	else if (worldMap == 3) {

		// Containers ------------
		createCube([9, containerHeight * 2, 18], [48, containerHeight, 5], 5, true, false);

		createCube([9, containerHeight * 2, 18], [72, containerHeight, 90], 6, true, false);
		createCube([18, containerHeight * 2, 9], [50, containerHeight, 75], 4, true, false);

		createCube([18, containerHeight * 2, 9], [63, containerHeight, 36], 4, true, false);

		createCube([18, containerHeight * 2, 9], [10, containerHeight, 15], 4, true, false);

		createCube([9, containerHeight * 2, 18], [100, containerHeight, 100], 5, true, false);
		createCube([9, containerHeight * 2, 18], [109.5, containerHeight, 100], 6, true, false);

		createCube([18, containerHeight * 2, 9], [10, containerHeight, 105], 5, true, false);

		// Building left ---------------
		createCube([30, 0.5, 70], [15, 0.25, 60], 11, true, false);
		createCube([30, 0.5, 70], [15, buildingHeight * 2 + 0.1, 60], 11, true, false);
		createCube([33, 0.5, 73], [15, buildingHeight * 4 + 0.1, 60], 12, true, false);

		createCube([5, 0.5, 70], [32.5, buildingHeight * 2 + 0.1, 60], 9, true, false);

		createCube([0.5, buildingHeight * 2, 70], [0, buildingHeight, 60], 13, true, false);
		createCube([0.5, buildingHeight * 2, 32], [30, buildingHeight, 41], 13, true, false);
		createCube([0.5, buildingHeight * 2, 32], [30, buildingHeight, 79], 13, true, false);

		createCube([30, buildingHeight * 2, 0.5], [15, buildingHeight, 95], 13, true, false);
		createCube([30, buildingHeight * 2, 0.5], [15, buildingHeight, 25], 13, true, false);

		createCube([24, buildingHeight * 2, 0.5], [18, buildingHeight, 55], 13, true, false);
		createCube([6, buildingHeight * 2, 0.5], [27, buildingHeight, 70], 13, true, false);
		createCube([20, buildingHeight * 2, 0.5], [8, buildingHeight, 70], 13, true, false);

		// Building Left Upper Level --------------

		createCube([0.5, buildingHeight * 2, 70], [0, buildingHeight * 3, 60], 13, true, false);
		createCube([0.5, buildingHeight * 2, 32], [30, buildingHeight * 3, 41], 13, true, false);
		createCube([0.5, buildingHeight * 2, 32], [30, buildingHeight * 3, 79], 13, true, false);

		createCube([30, buildingHeight * 2, 0.5], [15, buildingHeight * 3, 95], 13, true, false);
		createCube([30, buildingHeight * 2, 0.5], [15, buildingHeight * 3, 25], 13, true, false);

		createCube([24, buildingHeight * 2, 0.5], [18, buildingHeight * 3, 55], 13, true, false);
		createCube([6, buildingHeight * 2, 0.5], [27, buildingHeight * 3, 70], 13, true, false);
		createCube([20, buildingHeight * 2, 0.5], [8, buildingHeight * 3, 70], 13, true, false);

		// Building right ---------------
		createCube([30, 0.5, 60], [100, 0.25, 40], 11, true, false);
		createCube([30, 0.5, 60], [100, buildingHeight * 2 + 0.1, 40], 11, true, false);
		createCube([33, 0.5, 63], [100, buildingHeight * 4 + 0.1, 40], 12, true, false);

		createCube([5, 0.5, 60], [82.5, buildingHeight * 2 + 0.1, 40], 9, true, false);

		createCube([0.5, buildingHeight * 2, 60], [115, buildingHeight, 40], 13, true, false);
		createCube([0.5, buildingHeight * 2, 26], [85, buildingHeight, 23], 13, true, false);
		createCube([0.5, buildingHeight * 2, 26], [85, buildingHeight, 57], 13, true, false);

		createCube([30, buildingHeight * 2, 0.5], [100, buildingHeight, 70], 13, true, false);
		createCube([30, buildingHeight * 2, 0.5], [100, buildingHeight, 10], 13, true, false);

		createCube([24, buildingHeight * 2, 0.5], [103, buildingHeight, 35], 13, true, false);
		createCube([24, buildingHeight * 2, 0.5], [97, buildingHeight, 45], 13, true, false);
		createCube([0.5, buildingHeight * 2, 20], [105, buildingHeight, 20], 13, true, false);

		// Building right upper level ----------------

		createCube([0.5, buildingHeight * 2, 60], [115, buildingHeight * 3, 40], 13, true, false);
		createCube([0.5, buildingHeight * 2, 26], [85, buildingHeight * 3, 23], 13, true, false);
		createCube([0.5, buildingHeight * 2, 26], [85, buildingHeight * 3, 57], 13, true, false);

		createCube([30, buildingHeight * 2, 0.5], [100, buildingHeight * 3, 70], 13, true, false);
		createCube([30, buildingHeight * 2, 0.5], [100, buildingHeight * 3, 10], 13, true, false);

		createCube([24, buildingHeight * 2, 0.5], [103, buildingHeight * 3, 35], 13, true, false);
		createCube([24, buildingHeight * 2, 0.5], [97, buildingHeight * 3, 45], 13, true, false);
		createCube([0.5, buildingHeight * 2, 20], [105, buildingHeight * 3, 20], 13, true, false);

		// Boxes
		createCube([3, 3, 3], [52, 1.5, 82], 7, true, false);
		createCube([3, 3, 3], [50, 1.5, 85], 7, true, false);
		createCube([3, 5, 3], [48.5, 2.5, 81.7], 7, true, false);

		createCube([3, 3, 3], [58, 1.5, 29.5], 7, true, false);
		createCube([4, 4, 4], [62, 2, 28], 7, true, false);

		createCube([4, 4, 4], [82.5, buildingHeight * 2 + 2.1, 30], 7, true, false);

		createCube([4, 4, 4], [32.5, buildingHeight * 2 + 2.1, 40], 7, true, false);
		createCube([4, 4, 4], [32.5, buildingHeight * 2 + 2.1, 80], 7, true, false);

		// Pavement

		//createCube([1, 0.3, 140], [35, 0.15, 50], 11, true, false);
		//createCube([1, 0.3, 140], [85, 0.15, 50], 11, true, false);

		// Telephone poles

		let telePos = [60, 10, 60, 60, 60, 110];

		for (var i = 0; i < telePos.length; i += 2) {
			createCube([1, 24, 1], [telePos[i], 12, telePos[i + 1]], 8, true, false);
			createCube([8, 0.5, 1], [telePos[i], 24.2, telePos[i + 1]], 8, true, false);

			createCube([1, 1, 1], [telePos[i], 25, telePos[i + 1]], 8, true, false);
			createCube([1, 1, 1], [telePos[i] - 3.5, 25, telePos[i + 1]], 8, true, false);
			createCube([1, 1, 1], [telePos[i] + 3.5, 25, telePos[i + 1]], 8, true, false);
		}

	}
	else if (worldMap == 4) {

		// Extra ground --------------------
		createCube([2, 5, 26], [101, 1.5, -4.5], 0, false, true);
		createCube([2, 4, 26], [103, 1, -4.5], 0, false, true);
		createCube([2, 3, 26], [105, 0.5, -4.5], 0, false, true);
		createCube([2, 2, 26], [107, 0, -4.5], 0, false, true);
		createCube([2, 1, 26], [109, -0.5, -4.5], 0, false, true);

		createCube([60, 6, 26], [70, 2, -4.5], 0, false, true);

		createCube([2, 5, 26], [39, 1.5, -4.5], 0, false, true);
		createCube([2, 4, 26], [37, 1, -4.5], 0, false, true);
		createCube([2, 3, 26], [35, 0.5, -4.5], 0, false, true);
		createCube([2, 2, 26], [33, 0, -4.5], 0, false, true);
		createCube([2, 1, 26], [31, -0.5, -4.5], 0, false, true);

		// Building 1 ------------------------
		createCube([46, 2, 32], [107, ((buildingHeight + 2) * 2), 43], 14, true, false);

		createCube([0.5, (buildingHeight + 2) * 2, 30], [85.3, (buildingHeight + 2), 43], 3, true, false);
		createCube([0.5, (buildingHeight + 2) * 2, 30], [129.5, (buildingHeight + 2), 43], 3, true, false);

		createCube([35, (buildingHeight + 2) * 2, 0.5], [103, (buildingHeight + 2), 58], 3, true, false);
		createCube([3, (buildingHeight + 2) * 2, 0.5], [128.5, (buildingHeight + 2), 58], 3, true, false);

		createCube([35, (buildingHeight + 2) * 2, 0.5], [112, (buildingHeight + 2), 28], 3, true, false);
		createCube([3, (buildingHeight + 2) * 2, 0.5], [86.5, (buildingHeight + 2), 28], 3, true, false);

		createCube([2, (buildingHeight + 2) * 2, 2], [96, (buildingHeight + 2), 37], 3, true, false);
		createCube([2, (buildingHeight + 2) * 2, 2], [106, (buildingHeight + 2), 37], 3, true, false);
		createCube([2, (buildingHeight + 2) * 2, 2], [116, (buildingHeight + 2), 37], 3, true, false);

		createCube([0.1, (buildingHeight + 2) * 2, 20], [96, (buildingHeight + 2), 48], 17, true, false);
		createCube([0.1, (buildingHeight + 2) * 2, 20], [106, (buildingHeight + 2), 48], 17, true, false);
		createCube([0.1, (buildingHeight + 2) * 2, 20], [116, (buildingHeight + 2), 48], 17, true, false);

		// Spawn walls ----------------

		createCube([80, smallWallHeight * 2, 2.5], [70, smallWallHeight, 10], 3, true, false);

		createCube([3, buildingHeight * 2, 3], [70, buildingHeight, 10], 14, true, false);
		createCube([3, buildingHeight * 2, 3], [30, buildingHeight, 10], 14, true, false);
		createCube([3, buildingHeight * 2, 3], [110, buildingHeight, 10], 14, true, false);

		createCube([1, tallWallHeight * 2, 20], [70, tallWallHeight, 20], 3, true, false);
		createCube([3, buildingHeight * 2, 3], [70, buildingHeight, 30], 14, true, false);
		createCube([15, tallWallHeight * 2, 1], [77.5, tallWallHeight, 30], 3, true, false);

		createCube([3, buildingHeight * 2, 3], [70, buildingHeight, 40.5], 14, true, false);
		createCube([1, tallWallHeight * 2, 35], [70, tallWallHeight, 58], 3, true, false);

		createCube([60, (buildingHeight + 2) * 2, 10], [70, (buildingHeight + 2), 78], 3, true, false);
		createCube([62, 2, 12], [70, ((buildingHeight + 2) * 2) + 0.1, 78], 14, true, false);

		createCube([60, (buildingHeight + 2) * 2, 20], [70, (buildingHeight + 2), 110], 3, true, false);
		createCube([62, 2, 22], [70, ((buildingHeight + 2) * 2) + 0.1, 110], 14, true, false);

		createCube([20, (buildingHeight + 2) * 2, 40], [0, (buildingHeight + 2), 60], 3, true, false);
		createCube([22, 2, 42], [0, ((buildingHeight + 2) * 2) + 0.1, 60], 14, true, false);

		// Containers ------------

		createCube([18, containerHeight * 2, 9], [30, containerHeight, 78], 4, true, false);

		createCube([18, containerHeight * 2, 9], [36, containerHeight, 45], 6, true, false);
		createCube([18, containerHeight * 2, 9], [36, containerHeight, 55], 4, true, false);
		createCube([9, containerHeight * 2, 18], [50, containerHeight, 50], 5, true, false);

		createCube([18, containerHeight * 2, 9], [43, containerHeight * 3, 50], 6, true, false);

		createCube([9, containerHeight * 2, 18], [0, containerHeight, 20], 6, true, false);
		createCube([9, containerHeight * 2, 18], [-5, containerHeight, 0], 5, true, false);

		createCube([9, containerHeight * 2, 18], [5, containerHeight, 95], 5, true, false);
		createCube([18, containerHeight * 2, 9], [20, containerHeight, 112], 4, true, false);

		createCube([9, containerHeight * 2, 18], [120, containerHeight, 106], 5, true, false);

		createCube([18, containerHeight * 2, 9], [60, containerHeight + 5, -6], 4, true, false);

		// Wooden planks ------------------

		createCube([1, 0.5, 20], [93, ((buildingHeight + 2) * 2) + 1.3, 66], 8, true, false);
		createCube([1, 0.5, 20], [94.6, ((buildingHeight + 2) * 2) + 1.3, 66], 8, true, false);

		createCube([1, 0.5, 20], [80, ((buildingHeight + 2) * 2) + 1.3, 90.5], 8, true, false);
		createCube([1, 0.5, 20], [82, ((buildingHeight + 2) * 2) + 1.3, 90.5], 8, true, false);

		createCube([2, 0.5, 19], [48, ((buildingHeight + 2) * 2) + 1.3, 91], 8, true, false);

		// Boxes ------------------------
		createCube([3, 3, 3], [40, 1.5, 15.5], 7, true, false);
		createCube([5, 5, 5], [44.2, 2.5, 14], 7, true, false);

		createCube([4, 4, 4], [62, 2, 85.2], 7, true, false);
		createCube([3, 3, 3], [62.1, 5.5, 84.9], 7, true, false);

		createCube([4, 5, 4], [86, 2.5, 98], 7, true, false);
		createCube([3, 4, 3], [85.6, 7, 98.3], 7, true, false);
	}
	else if (worldMap == 5) {

		// Building walls
		createCube([129, 0.5, 99], [60, 0.25, 60], 11, true, true);
		createCube([58, 0.5, 104], [20, buildingHeight * 3 + 0.1, 60], 12, true, false);
		createCube([58, 0.5, 104], [97, buildingHeight * 3 + 0.1, 60], 12, true, false);

		createCube([0.5, buildingHeight * 3, 100], [-5, buildingHeight * 1.5, 60], 15, true, false);
		createCube([0.5, buildingHeight * 3, 100], [125, buildingHeight * 1.5, 60], 15, true, false);

		createCube([35, buildingHeight * 3, 5], [27.5, buildingHeight * 1.5, 12.5], 15, true, false);
		createCube([35, buildingHeight * 3, 5], [92.5, buildingHeight * 1.5, 12.5], 15, true, false);

		createCube([35, buildingHeight * 3, 5], [27.5, buildingHeight * 1.5, 107.5], 15, true, false);
		createCube([35, buildingHeight * 3, 5], [92.5, buildingHeight * 1.5, 107.5], 15, true, false);

		createCube([1, buildingHeight * 3, 34], [45, buildingHeight * 1.5, 27.5], 15, true, false);
		createCube([1, buildingHeight * 3, 34], [75, buildingHeight * 1.5, 27.5], 15, true, false);

		createCube([1, buildingHeight * 3, 34], [45, buildingHeight * 1.5, 93], 15, true, false);
		createCube([1, buildingHeight * 3, 34], [75, buildingHeight * 1.5, 93], 15, true, false);


		createCube([0.5, buildingHeight * 3, 75], [10, buildingHeight * 1.5, 60], 15, true, true);

		createCube([0.5, buildingHeight * 3, 75], [110, buildingHeight * 1.5, 60], 15, true, true);


		createCube([28, buildingHeight * 3, 5], [24, buildingHeight * 1.5, 41.5], 15, true, true);
		createCube([28, buildingHeight * 3, 5], [96, buildingHeight * 1.5, 41.5], 15, true, true);

		createCube([28, buildingHeight * 3, 5], [24, buildingHeight * 1.5, 78.5], 15, true, true);
		createCube([28, buildingHeight * 3, 5], [96, buildingHeight * 1.5, 78.5], 15, true, true);

		createCube([3, buildingHeight * 3, 24], [28, buildingHeight * 1.5, 27], 15, true, true);

		createCube([8, buildingHeight * 3, 8], [92, buildingHeight * 1.5, 28], 15, true, true);
		createCube([8, buildingHeight * 3, 8], [28, buildingHeight * 1.5, 92], 15, true, true);

		createCube([3, buildingHeight * 3, 16], [87, buildingHeight * 1.5, 100], 15, true, true);
		createCube([3, buildingHeight * 3, 16], [100, buildingHeight * 1.5, 100], 15, true, true);

		// Cargo crates ---------------

		createCube([9, containerHeight * 2, 18], [67, containerHeight + 0.5, 30], 5, true, false);
		createCube([18, containerHeight * 2, 9], [55, containerHeight + 0.5, 90], 6, true, false);

		createCube([9, containerHeight * 2, 18], [20, containerHeight + 0.5, 58], 5, true, false);
		createCube([9, containerHeight * 2, 18], [29.5, containerHeight + 0.5, 58.2], 4, true, false);

		createCube([9, containerHeight * 2, 18], [100, containerHeight + 0.5, 58], 5, true, false);
		createCube([9, containerHeight * 2, 18], [80, containerHeight + 0.5, 57.5], 6, true, false);

		createCube([9, containerHeight * 2, 18], [120, containerHeight + 0.5, 30], 6, true, false);
		createCube([9, containerHeight * 2, 18], [5, containerHeight + 0.5, 70], 4, true, false);

		// Boxes ------------------------
		createCube([3, 3, 3], [50, 2, 55], 7, true, false);
		createCube([3, 3, 3], [53, 2, 55.5], 7, true, false);
		createCube([3, 3, 3], [51, 5, 55], 7, true, false);

		createCube([3, 3, 3], [65, 2, 75], 7, true, false);
		createCube([3, 3, 3], [68, 2, 75.5], 7, true, false);
		createCube([3, 3, 3], [66, 5, 75], 7, true, false);

		createCube([3, 3, 3], [50, 2, 23], 7, true, false);
		createCube([3, 3, 3], [53, 2, 24], 7, true, false);
		createCube([3, 3, 3], [56, 2, 23.2], 7, true, false);

		createCube([3, 3, 3], [50, 5, 24], 7, true, false);
		createCube([3, 3, 3], [52.8, 5, 24.5], 7, true, false);
		createCube([3, 3, 3], [56.2, 5, 25], 7, true, false);

		createCube([3, 3, 3], [50.2, 2, 26.5], 7, true, false);
		createCube([3, 3, 3], [53.5, 2, 27], 7, true, false);
		createCube([3, 3, 3], [57.7, 2, 27], 7, true, false);
	}
	else if (worldMap == 6) {
		// Rail Lines -----------
		createCube([0.7, 0.5, 140], [56, 0.25, 55], 16, true, true);
		createCube([0.7, 0.5, 140], [64, 0.25, 55], 16, true, true);

		// Wooden posts
		createCube([1, smallWallHeight * 2, 1], [50, smallWallHeight, 0], 8, true, false);

		for (var i = 0; i < 100; i += 20) {
			createCube([0.6, 0.6, 20], [50, tallWallHeight, 10 + i], 8, true, false);
			createCube([0.6, 0.6, 20], [50, tallWallHeight / 2, 10 + i], 8, true, false);
			createCube([1, smallWallHeight * 2, 1], [50, smallWallHeight, 20 + i], 8, true, false);
		}

		createCube([1, smallWallHeight * 2, 1], [70, smallWallHeight, 0], 8, true, false);

		for (var i = 0; i < 100; i += 20) {
			createCube([0.6, 0.6, 20], [70, tallWallHeight, 10 + i], 8, true, false);
			createCube([0.6, 0.6, 20], [70, tallWallHeight / 2, 10 + i], 8, true, false);
			createCube([1, smallWallHeight * 2, 1], [70, smallWallHeight, 20 + i], 8, true, false);
		}

		// Walls -----------------
		createCube([3, tallWallHeight * 2, 3], [85, tallWallHeight, 0], 3, true, false);
		createCube([30, smallWallHeight * 2, 2], [100, smallWallHeight, 0], 15, true, false);
		createCube([3, tallWallHeight * 2, 3], [115, tallWallHeight, 0], 3, true, false);

		createCube([2, smallWallHeight * 2, 40], [115, smallWallHeight, 20], 15, true, false);
		createCube([3, tallWallHeight * 2, 3], [115, tallWallHeight, 40], 3, true, false);
		createCube([3, tallWallHeight * 2, 3], [85, tallWallHeight, 40], 3, true, false);
		createCube([30, smallWallHeight * 2, 2], [100, smallWallHeight, 40], 15, true, false);

		createCube([2, smallWallHeight * 2, 40], [115, smallWallHeight, 60], 15, true, false);
		createCube([3, tallWallHeight * 2, 3], [115, tallWallHeight, 80], 3, true, false);
		createCube([3, tallWallHeight * 2, 3], [85, tallWallHeight, 80], 3, true, false);
		createCube([30, smallWallHeight * 2, 2], [100, smallWallHeight, 80], 15, true, false);

		// Cargo crates -----------
		createCube([9, containerHeight * 2, 18], [100, containerHeight, 20], 5, true, false);
		createCube([9, containerHeight * 2, 18], [90.5, containerHeight, 20.5], 4, true, false);
		createCube([9, containerHeight * 2, 18], [100.25, containerHeight * 3, 20.25], 6, true, false);
		createCube([9, containerHeight * 2, 18], [90.25, containerHeight * 3, 20], 4, true, false);

		createCube([9, containerHeight * 2, 18], [100, containerHeight, 60], 6, true, false);
		createCube([9, containerHeight * 2, 18], [90.5, containerHeight, 60.5], 4, true, false);
		createCube([18, containerHeight * 2, 9], [95.25, containerHeight * 3, 54.5], 4, true, false);
		createCube([18, containerHeight * 2, 9], [95, containerHeight * 3, 64], 5, true, false);
	}
	else if (worldMap == 7) {
		// Cargo crates -----------
		for (let x = 0; x < 7; x += 1) {
			for (let z = 0; z < 7; z += 1) {
				createCube([9, 18, containerHeight * 2], [(x * 19) - ((x % 2) * 9.5), 9, z * 19], ((x + z) % 3) + 4, true, false);
			}
		}

		// Boxes -----------

		for (let x = 0; x < 7; x += 1) {
			for (let z = 0; z < 7; z += 1) {
				if ((x + z) % 3 == 0) createCube([3, 6, 3], [x * 19, 3, (z * 19) + 8], 7, true, false);

				if ((x - z) % 3 == 0) createCube([5, 5, 5], [x * 19, 2.5, (z * 19) + 12.2], 7, true, false);

				if ((x + z) % 4 == 0) createCube([3, 3, 3], [(x * 19) + 3.1, 1.5, (z * 19) + 7.5], 7, true, false);
			}
		}

		// Fences ----------

		for (let x = 0; x < 7; x += 1) {
			for (let z = 0; z < 7; z += 1) {
				if (x % 2 == 1) {
					if ((x - z) % 3 == 0) createCube([22, 14, 0.1], [(x * 19) + 5, 7, (z * 19)], 17, true, false);
				}

				if (x % 2 == 0) {
					if ((x + z + 1) % 3 == 0) createCube([0.1, 14, 22], [(x * 19) + 7, 7, (z * 19) + 9.5], 17, true, false);
				}
			}
		}

	}

	renderer.shadowMap.needsUpdate = true;

	for (var i = 0; i < gameMapAllObjects.length; i++) {
		//gameMapAllObjects[i].shadowMap.autoUpdate = false;
		//gameMapAllObjects[i].shadowMap.needsUpdate = true;
	}
}

function createCube(dimensions, positions, type, isCollider, doesNotCastShadows) {

	const geometry = new THREE.BoxBufferGeometry(1, 1, 1);

	let material = new THREE.MeshLambertMaterial({ color: 0x9C6C51 });

	if (type == 0) {
		let texture = sceneMaps.floor1;

		if (worldMap == 4) texture = sceneMaps.floor2;
		if (worldMap == 2 || worldMap == 3 || worldMap == 5 || worldMap == 7) texture = sceneMaps.floor3;

		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set(0, 0);
		texture.repeat.set(7, 7);

		material = new THREE.MeshLambertMaterial({
			map: texture
		});

		if (worldMap == 6) {
			material = new THREE.MeshLambertMaterial({
				color: 0xffffff
			});
		}
	}
	else if (type == 1) {
		let texture = sceneMaps.floor1;

		if (worldMap == 4) texture = sceneMaps.floor2;
		if (worldMap == 2 || worldMap == 3 || worldMap == 5) texture = sceneMaps.floor3;

		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set(0, 0);
		texture.repeat.set(7, 7);

		material = new THREE.MeshLambertMaterial({
			map: texture
		});

		if (worldMap == 6) {
			material = new THREE.MeshLambertMaterial({
				color: 0xffffff
			});
		}
	}
	else if (type == 2) {
		let texture = sceneMaps.brickWall2
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set(0, 0);
		texture.repeat.set(dimensions[0] / 3, dimensions[1] / 3);

		material = new THREE.MeshLambertMaterial({
			map: texture
		});
	}
	else if (type == 3) {
		let texture = sceneMaps.brickWall
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set(0, 0);
		texture.repeat.set(dimensions[0] / 5, dimensions[1] / 5);

		material = new THREE.MeshLambertMaterial({
			map: texture
		});
	}
	else if (type == 4) {
		material = new THREE.MeshLambertMaterial({
			map: sceneMaps.shippingContainerBlue
		});
	}
	else if (type == 5) {
		material = new THREE.MeshLambertMaterial({
			map: sceneMaps.shippingContainerRed
		});
	}
	else if (type == 6) {
		material = new THREE.MeshLambertMaterial({
			map: sceneMaps.shippingContainerGreen
		});
	}
	else if (type == 7) {
		// Wooden boxes
		let texture = sceneMaps.woodenBox
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set(0, 0);
		texture.repeat.set(1, 1);

		material = new THREE.MeshLambertMaterial({
			map: texture,
			color: 0xCCCCCC
		});
	}
	else if (type == 8) {
		// Wooden planks
		material = new THREE.MeshLambertMaterial({
			map: sceneMaps.woodenPlank
		});
	}
	else if (type == 9) {
		let texture = sceneMaps.windows
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set(0, 0);
		texture.repeat.set(1, 1);

		material = new THREE.MeshLambertMaterial({
			map: texture
		});
	}
	else if (type == 10) {
		let texture = sceneMaps.road
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set(0, 0);
		texture.repeat.set(2, 2);

		material = new THREE.MeshLambertMaterial({
			map: texture
		});
	}
	else if (type == 11) {
		let texture = sceneMaps.carpet
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set(0, 0);
		texture.repeat.set(8, 16);

		material = new THREE.MeshLambertMaterial({
			map: texture
		});
	}
	else if (type == 12) {
		let texture = sceneMaps.roofing
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set(0, 0);
		texture.repeat.set(8, 13);

		material = new THREE.MeshLambertMaterial({
			map: texture
		});
	}
	else if (type == 13) {
		let texture = sceneMaps.houseWall
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set(0, 0);
		texture.repeat.set(dimensions[0] / 0.05, dimensions[1] / 2.5);

		material = new THREE.MeshLambertMaterial({
			map: texture
		});
	}
	else if (type == 14) {
		let texture = sceneMaps.sandstone
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set(0, 0);
		texture.repeat.set(dimensions[0] / 0.5, dimensions[1] / 0.05);

		material = new THREE.MeshLambertMaterial({
			map: texture
		});
	}
	else if (type == 15) {
		// Wooden planks
		let texture = sceneMaps.bricks;
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set(0, 0);
		texture.repeat.set(12, 8);
		material = new THREE.MeshLambertMaterial({
			map: texture,
			color: 0xdddddd
		});
	}
	else if (type == 16) {
		// Wooden planks
		material = new THREE.MeshLambertMaterial({
			color: 0x111111
		});
	}
	else if (type == 17) {
		// Wooden planks
		let texture = sceneAlphas.fenceAlpha
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set(0, 0);
		texture.repeat.set(Math.max(dimensions[0], dimensions[2]) * 2, dimensions[1] * 2);

		material = new THREE.MeshPhongMaterial({
			color: 0x131313,
			shininess: 0,
			alphaMap: texture,
			transparent: true
		});
	}

	//const texture = new THREE.TextureLoader().load("textures/material.jpg")
	//const material = new THREE.MeshBasicMaterial( { map: texture } )

	cube = new THREE.Mesh(geometry, material);

	cube.position.x = positions[0];
	cube.position.y = positions[1];
	cube.position.z = positions[2];

	cube.scale.x = dimensions[0];
	cube.scale.y = dimensions[1];
	cube.scale.z = dimensions[2];

	cube.receiveShadow = true;

	if (!doesNotCastShadows) {
		cube.castShadow = true;
	}

	if (type == 0 || type == 1) {
		cube.castShadow = false;
	}

	if (isCollider) {
		gameMap.push(cube)
	}

	gameMapAllObjects.push(cube);

	cube.isAGameObject = true;

	scene.add(cube);
}

// Create a player character when they join

function createPlayer(gunModelMulti) {

	// radius top, radius bottom, height, radialsegments
	/*const geometry = new THREE.CylinderGeometry(1, 1, 4, 32);
	const material = new THREE.MeshLambertMaterial({ 
		color: possibleColours[0], 
		map: sceneMaps.dwayne 
	});
	
	cube = new THREE.Mesh(geometry, material);*/

	let cube = globalPlayerModel.clone();

	cube.position.x = 0;
	cube.position.y = 2;
	cube.position.z = 1;

	cube.castShadow = true;
	cube.receiveShadow = false;

	cube.selectedGun = gunModelMulti;

	let gunMesh = gunModelHolder[gunModelMulti]

	const multiplayerWeaponLoaded = gunMesh.clone();
	cube.add(multiplayerWeaponLoaded);

	multiplayerWeaponLoaded.position.set(4.3, 1, 0.9);
	multiplayerWeaponLoaded.rotation.set(1.5, 0, 1.5);

	multiplayerWeaponLoaded.scale.x = multiplayerWeaponLoaded.scale.x * 1.3
	multiplayerWeaponLoaded.scale.y = multiplayerWeaponLoaded.scale.y * 1.3
	multiplayerWeaponLoaded.scale.z = multiplayerWeaponLoaded.scale.z * 1.3

	if (gunModelMulti != 2) {
		multiplayerWeaponLoaded.rotateX(-1.5)
	}

	if (gunModelMulti == 4) {
		multiplayerWeaponLoaded.rotateX(-1.6)
	}

	multiplayerWeaponLoaded.isWeapon = true;

	return cube;
}

function updatePlayersWeapon(gunModelMulti, playerModel) {

	playerModel.selectedGun = gunModelMulti;

	let hasFoundChild = false;
	for (var i = 0; i < playerModel.children.length; i++) {

		if (hasFoundChild) {
			continue;
		}

		if (playerModel.children[i].isWeapon != null) {
			playerModel.remove(playerModel.children[i])
		}
	}

	let gunMesh = gunModelHolder[gunModelMulti]

	const multiplayerWeaponLoaded = gunMesh.clone();
	playerModel.add(multiplayerWeaponLoaded);

	multiplayerWeaponLoaded.position.set(4.3, 1, 0.9);
	multiplayerWeaponLoaded.rotation.set(1.5, 0, 1.5);

	multiplayerWeaponLoaded.scale.x = multiplayerWeaponLoaded.scale.x * 1.3
	multiplayerWeaponLoaded.scale.y = multiplayerWeaponLoaded.scale.y * 1.3
	multiplayerWeaponLoaded.scale.z = multiplayerWeaponLoaded.scale.z * 1.3

	if (gunModelMulti != 2) {
		multiplayerWeaponLoaded.rotateX(-1.5)
	}

	if (gunModelMulti == 4) {
		multiplayerWeaponLoaded.rotateX(-1.6)
	}

	multiplayerWeaponLoaded.isWeapon = true;
}

function updatePlayersHealth(multiplayerHealth, playerModel, multiplayerID) {

	if (multiplayerHealthObjectHolder[multiplayerID] != null) {

		multiplayerHealthObjectHolder[multiplayerID][1].scale.x = multiplayerHealth / 100;

	}
	else {

		let geometry = new THREE.BoxGeometry(4, 0.5, 0.01);
		let material = new THREE.MeshLambertMaterial({ color: 0x242424 });

		let plane = new THREE.Mesh(geometry, material);

		plane.position.x = 0;
		plane.position.y = 5;
		plane.position.z = 0;

		scene.add(plane);

		playerModel.add(plane);

		// Display health

		geometry = new THREE.BoxGeometry(4, 0.5, 0.03);
		material = new THREE.MeshLambertMaterial({ color: 0x58e04f });

		let plane2 = new THREE.Mesh(geometry, material);

		plane2.position.x = 0;
		plane2.position.y = 0;
		plane2.position.z = 0;

		scene.add(plane2);

		plane.add(plane2);

		multiplayerHealthObjectHolder[multiplayerID] = [plane, plane2];
	}
}

function pointHealthAtPlayer() {
	for (let dataFound in multiplayerHealthObjectHolder) {
		if (multiplayerHealthObjectHolder[dataFound][0] != null) {
			// in camera space...

			var newDir = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);

			var pos = new THREE.Vector3();
			pos.addVectors(newDir, multiplayerHealthObjectHolder[dataFound][0].position);

			multiplayerHealthObjectHolder[dataFound][0].lookAt(pos);
		}
	}
}

// Create bullet

function createBullet(dimensions, positions, nameObject, damageOfBullet, playerModel) {

	const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.5);
	const material = new THREE.MeshLambertMaterial({ color: 0xEEEE87 });

	cube = new THREE.Mesh(geometry, material);

	cube.position.x = positions[0];
	cube.position.y = positions[1];
	cube.position.z = positions[2];

	cube.castShadow = true;
	cube.receiveShadow = false;

	cube.bulletsOwner = nameObject;
	cube.bulletDamageForPlayer = damageOfBullet;

	if (playerModel != null) {
		cube.bulletType = playerModel.selectedGun
	}
	else if (nameObject == socket.id) {
		cube.bulletType = weaponTracker.gunID - 1;
	}

	if (cube.bulletType == 3) {
		// Bazooka rocket

		cube.scale.set(10, 10, 10)
		cube.material.color.setRGB(0.1, 0.1, 0.1);
	}

	return cube;
}

// Load 3D models into game 

function loadupGrassModelsIntoScene() {

	loader = new GLTFLoader();

	loader.load('/models/grass.glb', function(gltf) {

		let mesh = gltf.scene.children[0]

		for (var x = -5; x < 120; x += (Math.random() * 20) + 5) {
			for (var z = -5; z < 120; z += (Math.random() * 20) + 5) {
				let currentMesh = mesh.clone();

				scene.add(currentMesh);
				currentMesh.position.set(x + (Math.random() * 10) - 5, 0 + (Math.random() * 0.05), z + (Math.random() * 10) - 5);

				grassObjectsHolder.push([currentMesh, (Math.random() * 10)])
			}
		}

	});

}

function animateGrassObjects(delta) {
	for (var i = 0; i < grassObjectsHolder.length; i++) {
		grassObjectsHolder[i][0].rotateX(Math.sin((gunSwayAdditionTimer[0] + grassObjectsHolder[i][1]) / 5) * 0.0006)
	}
}

function loadupPlayerModelAndSave() {

	loader = new GLTFLoader();

	loader.load('./models/lowPolyCharacter.glb', function(gltf) {

		let mesh = gltf.scene.children[0]

		globalPlayerModel = mesh.clone();

		// Give main player arms

		localPlayerArms = globalPlayerModel.clone();
		scene.add(localPlayerArms);

	});

}

function setupGBLModelsAndAdd() {

	modelNumberLoad = gunManager[weaponTracker.gunID].gunModel;

	loader.load('/models/gameWeapons.glb', function(gltf) {

		gunModelHolder = [];
		for (var i = 0; i < gltf.scene.children.length; i++) {
			gunModelHolder.push(gltf.scene.children[i].clone());
		}

		let mesh = gltf.scene.children[modelNumberLoad];

		loadedModels.push(mesh)

		scene.add(mesh);
		mesh.position.set(10, 10, 10);

		// Backup pistol

		mesh = gltf.scene.children[1];

		if (modelNumberLoad < 1) {
			mesh = gltf.scene.children[0];
		}

		loadedModels.push(mesh)

		scene.add(mesh);
		mesh.position.set(10, 10, 10);

	});

}

function updateLoadedModelsPositionAndRotation() {

	if (localPlayerArms != null) {
		localPlayerArms.position.copy(camera.position);
		localPlayerArms.rotation.copy(camera.rotation);

		if (rightClickDown) {
			localPlayerArms.translateX(-0.6);
			localPlayerArms.translateY(-0.1);
		}

		localPlayerArms.translateY(-0.8);
		localPlayerArms.translateZ(0.38);
		localPlayerArms.translateX(0.4);

		localPlayerArms.rotateY(1.5);
		localPlayerArms.rotateY(Math.cos(gunSwayAdditionTimer[0] * 0.8) * gunSwayAdditionTimer[1]);

		localPlayerArms.translateY(Math.sin(gunSwayAdditionTimer[0]) * 0.03);

		localPlayerArms.rotateZ(gunShotRotationAnimation[0] - gunShotRotationAnimation[3]);
		localPlayerArms.translateX(-gunShotRotationAnimation[1] - gunShotRotationAnimation[2] - gunShotRotationAnimation[3]);
	}

	for (var i = 0; i < loadedModels.length; i++) {
		loadedModels[i].position.copy(camera.position);
		loadedModels[i].rotation.copy(camera.rotation);

		if (weaponTracker.activeWeapon != i) {
			loadedModels[i].visible = false;
			continue; // Skip over unactive weapons
		}

		loadedModels[i].visible = true;

		if (moveGunToShoot) {
			moveGunToShoot = false;
			gunShotRotationAnimation[0] = 0.2;
			gunShotRotationAnimation[1] = 0.2;

			if (weaponTracker.gunID != 4) {
				player.velocity.y -= Math.sin(camera.rotation.x) * gunManager[weaponTracker.gunID].knockBack;
			}
		}

		loadedModels[i].rotateX(gunShotRotationAnimation[0] - gunShotRotationAnimation[3]);
		loadedModels[i].translateZ(gunShotRotationAnimation[1] + gunShotRotationAnimation[2] + gunShotRotationAnimation[3]);

		gunShotRotationAnimation[0] -= (gunShotRotationAnimation[0] - 0) / (FPS * 0.2);
		gunShotRotationAnimation[1] -= (gunShotRotationAnimation[1] - 0) / (FPS * 0.2);

		loadedModels[i].translateY(Math.sin(gunSwayAdditionTimer[0]) * 0.03);
		loadedModels[i].rotateY(Math.cos(gunSwayAdditionTimer[0] * 0.8) * gunSwayAdditionTimer[1]);

		// Allow sniper to zoom in and out

		if (rightClickDown) {
			if (modelNumberLoad == 4) {
				zoomInFunction(20, 6);
				// Slow down movement of sniper
				slowMovement = "sniper";
			}
			else {
				zoomInFunction(60, 6);
				slowMovement = "others";
			}
		}
		else {
			if (modelNumberLoad == 4) {
				zoomOutFunction(20, 6);
				// Revert movement of sniper
				slowMovement = "";
			}
			else {
				zoomOutFunction(60, 6);
				slowMovement = "";
			}
		}

		// Move gun models into position

		if (!rightClickDown) {

			loadedModels[i].translateZ(-1);
			loadedModels[i].translateX(0.5);
			loadedModels[i].translateY(-0.9);

			if (modelNumberLoad == 2) {
				loadedModels[i].translateZ(-0.5);
				loadedModels[i].translateY(0.6);
				loadedModels[i].rotateX(1.5);

				if (gunManager[weaponTracker.gunID].animation) {
					loadedModels[i].rotateX(gunRotateTimerAddition);
				}
			}
			else if (modelNumberLoad == 3) {
				loadedModels[i].translateZ(-0.7);
				loadedModels[i].translateY(0.6);

				if (gunManager[weaponTracker.gunID].animation) {
					loadedModels[i].rotateX(gunRotateTimerAddition);
				}
			}
			else if (modelNumberLoad == 4) {
				loadedModels[i].translateZ(-0.5);
				loadedModels[i].translateY(0.7);
				loadedModels[i].rotateX(-1.5);

				if (gunManager[weaponTracker.gunID].animation) {
					loadedModels[i].rotateX(gunRotateTimerAddition);
				}
			}
			else {
				loadedModels[i].translateY(0.01);
				loadedModels[i].translateZ(-0.2);
				loadedModels[i].translateX(0.2);

				if (gunManager[weaponTracker.gunID].animation) {
					loadedModels[i].rotateX(gunRotateTimerAddition);
				}
			}
		}
		else {

			loadedModels[i].translateZ(-1.2);
			loadedModels[i].translateX(0);
			loadedModels[i].translateY(-1);

			if (modelNumberLoad == 2) {
				loadedModels[i].translateZ(-0.5);
				loadedModels[i].translateY(0.55);
				loadedModels[i].rotateX(1.5);

				if (gunManager[weaponTracker.gunID].animation) {
					loadedModels[i].rotateX(gunRotateTimerAddition);
				}
			}
			else if (modelNumberLoad == 3) {
				loadedModels[i].translateZ(-0.5);
				loadedModels[i].translateX(0.01);
				loadedModels[i].translateY(0.54);

				if (gunManager[weaponTracker.gunID].animation) {
					loadedModels[i].rotateX(gunRotateTimerAddition);
				}
			}
			else if (modelNumberLoad == 4) {
				loadedModels[i].translateZ(1.1);
				loadedModels[i].translateY(1);
				loadedModels[i].rotateX(-1.55);

				if (gunManager[weaponTracker.gunID].animation) {
					loadedModels[i].rotateX(gunRotateTimerAddition);
				}
			}
			else {
				loadedModels[i].translateY(0.1);
				loadedModels[i].translateZ(0.1);

				if (gunManager[weaponTracker.gunID].animation) {
					loadedModels[i].rotateX(gunRotateTimerAddition);
				}
			}
		}
	}
}

function zoomInFunction(zoomAmount, speed) {
	const fov = getFov();
	camera.fov = clickZoom(fov, "zoomIn", zoomAmount, speed);
	camera.updateProjectionMatrix();
};

function zoomOutFunction(zoomAmount, speed) {
	const fov = getFov();
	camera.fov = clickZoom(fov, "zoomOut", zoomAmount, speed);
	camera.updateProjectionMatrix();
};

function clickZoom(value, zoomType, zoomAmount, speed) {
	if (value >= zoomAmount && zoomType === "zoomIn") {
		return value - speed;
	} else if (value <= 75 && zoomType === "zoomOut") {
		return value + speed;
	} else {
		return value;
	}
};

function getFov() {
	return Math.floor((2 * Math.atan(camera.getFilmHeight() / 2 / camera.getFocalLength()) * 180) / Math.PI);
};

// Change render scale on window size change

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

// Keyboard controlls

function processKeyboard(delta) {

	if (gravity == 0) {
		return;
	}

	if (keyboard["c"]) {
		player.height = player.savedHeight / 1.4;

		player.velocity.x = 0.8 * player.velocity.x;
		player.velocity.z = 0.8 * player.velocity.z;
	}
	else {
		player.height = player.savedHeight;
	}

	player.velocity.x = player.friction * player.velocity.x;
	player.velocity.z = player.friction * player.velocity.z;

	if (keyboard["w"]) {
		player.velocity.x += player.speed * delta;
		if (keyboard["shift"]) player.velocity.x += player.speed * delta * 0.4;
	}
	if (keyboard["s"]) {
		player.velocity.x -= player.speed * delta;
	}

	if (keyboard["a"]) {
		player.velocity.z -= player.sideSpeed * delta;
	}
	if (keyboard["d"]) {
		player.velocity.z += player.sideSpeed * delta;
	}

	controls.moveForward(player.velocity.x)
	controls.moveRight(player.velocity.z)

	if (player.canJump) {
		if (footstepCache.x > camera.position.x + footstepCache.distance || footstepCache.x < camera.position.x - footstepCache.distance || footstepCache.z > camera.position.z + footstepCache.distance || footstepCache.z < camera.position.z - footstepCache.distance) {
			// Make noise
			footstepCache.sound.currentTime = 0;
			footstepCache.sound.volume = footstepCache.volume;
			footstepCache.sound.play();

			footstepCache.x = camera.position.x;
			footstepCache.y = camera.position.y;
			footstepCache.z = camera.position.z;
		}
	}

	// Reloading

	if ((keyboard["r"]) && canReloadGunWithR) {
		canReloadGunWithR = false;
		document.getElementById("gunAmmoDisplay").innerText = "Reloading...";
		let ammoRefillWait = setTimeout(refillAmmoSlot, Number(gunManager[weaponTracker.gunID].reload) * 1000);

		gunShotRotationAnimation[2] = 0.5;

		reloadSounds[weaponTracker.gunID].currentTime = 0;
		reloadSounds[weaponTracker.gunID].play();
	}

	if ((keyboard["e"] || middleButtonDown) && !weaponTracker.lastActiveWeaponKeypress && canReloadGunWithR) {
		switchPlayerGun();
	}

	gunShotRotationAnimation[2] -= (gunShotRotationAnimation[2] - 0) * ((1 / gunManager[weaponTracker.gunID].reload) * delta);
	gunShotRotationAnimation[3] -= (gunShotRotationAnimation[3] - 0) * (4 * delta);

	weaponTracker.lastActiveWeaponKeypress = keyboard["e"] || middleButtonDown;
}

function switchPlayerGun() {
	weaponTracker.activeWeapon += 1;

	gunShotRotationAnimation[3] = 1;

	if (weaponTracker.activeWeapon > 1) {
		weaponTracker.activeWeapon = 0;
	}

	let gunIDHolder = weaponTracker.offHandWeapon;

	weaponTracker.offHandWeapon = weaponTracker.gunID;
	weaponTracker.gunID = gunIDHolder;

	document.getElementById("gunNameDisplay").innerText = gunManager[weaponTracker.gunID].name;
	document.getElementById("gunAmmoDisplay").innerText = gunManager[weaponTracker.gunID].ammoCount + " | " + gunManager[weaponTracker.gunID].ammo;

	modelNumberLoad = gunManager[weaponTracker.gunID].gunModel; // Update loaded model

	// Refill ammo if it is empty

	if (gunManager[weaponTracker.gunID].ammoCount < 1) {
		canReloadGunWithR = false;
		document.getElementById("gunAmmoDisplay").innerText = "Reloading...";
		let ammoRefillWait = setTimeout(refillAmmoSlot, Number(gunManager[weaponTracker.gunID].reload) * 1000);

		gunShotRotationAnimation[2] = 0.5;

		reloadSounds[weaponTracker.gunID].currentTime = 0;
		reloadSounds[weaponTracker.gunID].play();
	}
}

window.addEventListener("keydown", e => {
	keyboard[e.key.toLowerCase()] = true;
})

window.addEventListener("keyup", e => {
	keyboard[e.key.toLowerCase()] = false;
})

function checkPlayerHitbox() {

	for (var i = 0; i < gameMap.length; i++) {

		if (gameMap[i] == null) {
			continue;
		}

		let cubeSizeZ = (gameMap[i].scale.z) / 2;
		let cubeSizeX = (gameMap[i].scale.x) / 2;
		let cubeSizeY = (gameMap[i].scale.y) / 2;

		let cubePostionZ = gameMap[i].position.z;
		let cubePostionX = gameMap[i].position.x;
		let cubePostionY = gameMap[i].position.y;

		let camX = camera.position.x;
		let camZ = camera.position.z;
		let camY = camera.position.y;

		let padding = -1;

		let collision = false;

		if (cubePostionX + cubeSizeX >= camX + padding && cubePostionX - cubeSizeX <= camX - padding) {
			if (cubePostionZ + cubeSizeZ >= camZ + padding && cubePostionZ - cubeSizeZ <= camZ - padding) {
				if (cubePostionY + cubeSizeY >= camY - player.height + 0.5 && cubePostionY - cubeSizeY <= camY) {
					collision = true;
				}
			}
		}

		if (collision) {

			controls.moveForward(-player.velocity.x)
			controls.moveRight(-player.velocity.z)

			player.velocity.x = 0;
			player.velocity.z = 0;
		}

		// Detect if player has jumped into a cube above

		let raycastPosition = new THREE.Vector3(camera.position.x, camera.position.y - 1, camera.position.z);
		let raycaster = new THREE.Raycaster(raycastPosition, new THREE.Vector3(0, 1, 0), 0, 1.2);

		let intersects = raycaster.intersectObjects(scene.children);

		if (intersects.length > 0) {
			player.velocity.y = -0.1;
		}
	}
}

function setupMouseLook() {

	controls = new PointerLockControls(camera, renderer.domElement)

	renderer.domElement.addEventListener('mousedown', () => {
		controls.lock()
	});

}

// Gravity

function physicsUpdate(delta) {

	player.velocity.y -= gravity * delta;
	camera.position.y += player.velocity.y * delta;

	player.canJump = false;

	// Ground check

	let playerSize = 0.73;
	let distanceToRaycast = 1.6;

	let raycastPos1 = new THREE.Vector3(camera.position.x + playerSize, camera.position.y - player.height + 1.5, camera.position.z);
	let raycastPos2 = new THREE.Vector3(camera.position.x - playerSize, camera.position.y - player.height + 1.5, camera.position.z);
	let raycastPos3 = new THREE.Vector3(camera.position.x, camera.position.y - player.height + 1.5, camera.position.z + playerSize);
	let raycastPos4 = new THREE.Vector3(camera.position.x, camera.position.y - player.height + 1.5, camera.position.z - playerSize);
	let raycastPos5 = new THREE.Vector3(camera.position.x, camera.position.y - player.height + 1.5, camera.position.z);

	let raycaster = new THREE.Raycaster(raycastPos1, new THREE.Vector3(0, -1, 0), 0, distanceToRaycast);
	let raycaster2 = new THREE.Raycaster(raycastPos2, new THREE.Vector3(0, -1, 0), 0, distanceToRaycast);
	let raycaster3 = new THREE.Raycaster(raycastPos3, new THREE.Vector3(0, -1, 0), 0, distanceToRaycast);
	let raycaster4 = new THREE.Raycaster(raycastPos4, new THREE.Vector3(0, -1, 0), 0, distanceToRaycast);
	let raycaster5 = new THREE.Raycaster(raycastPos5, new THREE.Vector3(0, -1, 0), 0, distanceToRaycast);

	let intersects1 = raycaster.intersectObjects(scene.children);
	let intersects2 = raycaster2.intersectObjects(scene.children);
	let intersects3 = raycaster3.intersectObjects(scene.children);
	let intersects4 = raycaster4.intersectObjects(scene.children);
	let intersects5 = raycaster5.intersectObjects(scene.children);

	let intersects = intersects1.length + intersects2.length + intersects3.length + intersects4.length + intersects5.length;

	if (player.groundHeight > camera.position.y - player.height) {
		intersects += 1
	}

	if (intersects > 0) {
		while (intersects > 0) {
			camera.position.y += player.collisionAccuracy;

			raycastPos1 = new THREE.Vector3(camera.position.x + playerSize, camera.position.y - player.height + 1.5, camera.position.z);
			raycastPos2 = new THREE.Vector3(camera.position.x - playerSize, camera.position.y - player.height + 1.5, camera.position.z);
			raycastPos3 = new THREE.Vector3(camera.position.x, camera.position.y - player.height + 1.5, camera.position.z + playerSize);
			raycastPos4 = new THREE.Vector3(camera.position.x, camera.position.y - player.height + 1.5, camera.position.z - playerSize);
			raycastPos5 = new THREE.Vector3(camera.position.x, camera.position.y - player.height + 1.5, camera.position.z);

			raycaster = new THREE.Raycaster(raycastPos1, new THREE.Vector3(0, -1, 0), 0, distanceToRaycast - 0.1);
			raycaster2 = new THREE.Raycaster(raycastPos2, new THREE.Vector3(0, -1, 0), 0, distanceToRaycast - 0.1);
			raycaster3 = new THREE.Raycaster(raycastPos3, new THREE.Vector3(0, -1, 0), 0, distanceToRaycast - 0.1);
			raycaster4 = new THREE.Raycaster(raycastPos4, new THREE.Vector3(0, -1, 0), 0, distanceToRaycast - 0.1);
			raycaster5 = new THREE.Raycaster(raycastPos5, new THREE.Vector3(0, -1, 0), 0, distanceToRaycast - 0.1);

			intersects1 = raycaster.intersectObjects(scene.children);
			intersects2 = raycaster2.intersectObjects(scene.children);
			intersects3 = raycaster3.intersectObjects(scene.children);
			intersects4 = raycaster4.intersectObjects(scene.children);
			intersects5 = raycaster5.intersectObjects(scene.children);

			intersects = intersects1.length + intersects2.length + intersects3.length + intersects4.length + intersects5.length;

			if (player.groundHeight > camera.position.y - player.height) {
				intersects += 1
			}
		}
		player.velocity.y = 0;
		player.canJump = true;
	}

	if (player.canJump && keyboard[" "] && !player.lastPressedSpace) {
		player.canJump = false;
		player.velocity.y = player.jumpHeight;
		// Play sound
		gameSound[gameSound.length - 1].currentTime = 0;
		gameSound[gameSound.length - 1].play();
	}

	if (player.lastJump != player.canJump && player.velocity.y > 0.1) {
		// Play sound
		gameSound[gameSound.length - 1].currentTime = 0;
		gameSound[gameSound.length - 1].play();
	}

	player.lastJump = player.canJump;
	player.lastPressedSpace = keyboard[" "];

	// Reduce friction when in air

	if (player.canJump) {
		player.friction = 0.8;
	}
	else {
		player.friction = 0.82;
	}

}

// Other block calculations

function updateBulletPositions() {

	let bulletsToDelete = [];

	for (var i = 0; i < bullets.length; i++) {

		// Check if bullet has existed for more than 10 seconds
		if (Date.now() - bullets[i][1] > 10000) {
			// Remove bullet
			bulletsToDelete.push(i);
		}

		bullets[i][0].translateZ(bulletSpeed);

		if (bullets[i][0].bulletType == 3) {
			// Slow down bazooka rockets
			bullets[i][0].translateZ(-bulletSpeed * 0.7);
		}
	}

	for (var i = 0; i < bulletsToDelete.length; i++) {
		scene.remove(bullets[bulletsToDelete[i][0]]);
		areaDamageBullet(bullets[bulletsToDelete[i]][0]);
		bullets.splice(bulletsToDelete[i], 1);

		i += 1
	}

}

function areaDamageBullet(bulletModel) {

	if (bulletModel.hasExploded == true) {
		return;
	}

	if (bulletModel.bulletType == 3) {

		// Spawn explosion particles

		spawnInBulletParticles(bulletModel);

		let explodedSound = new Audio("/sounds/bazookaExplode.wav");
		explodedSound.volume = (Math.max(0, 60 - calcDist(bulletModel, camera)) / 60);
		explodedSound.play();

		let playerDistance = calcDist(camera, bulletModel);

		if (playerDistance < 15) {

			player.velocity.y += (Number(gunManager[4].knockBack) * ((15 - playerDistance) / 15));

			player.health -= Math.min(Number(gunManager[4].damage), Math.floor(Number(gunManager[4].damage) * ((15 - playerDistance) / 15)));
			healthBar.value = player.health;
			healthBarCounter.innerText = player.health + " / " + player.maxHealth;

			socket.emit("playerHitByBullet", bulletModel.bulletsOwner, socket.id, room);

			if (player.health < 1) {

				player.health = player.maxHealth;
				healthBar.value = player.health;
				socket.emit("playerHit", bulletModel.bulletsOwner, player.name, socket.id, room);

				// respawn player

				document.getElementById("respawnScreen").style.display = "flex";
				document.getElementById("respawnScreenMessage").innerText = "You were killed by " + playerNames[bulletModel.bulletsOwner];

				gravity = 0;

				camera.position.z = 80;
				camera.position.y = 60;
				camera.position.x = 40;

				camera.rotation.x = -1.3;
				camera.rotation.y = 0;
				camera.rotation.z = 0;

				let respawnTimerMenuScreen = setTimeout(beginRespawnPlayer, 5000);

			}
		}
	}
}

function calcDist(object1, object2) {
	let xs = (object2.position.x - object1.position.x) * (object2.position.x - object1.position.x)
	let ys = (object2.position.y - object1.position.y) * (object2.position.y - object1.position.y)
	let zs = (object2.position.z - object1.position.z) * (object2.position.z - object1.position.z)

	let hypotenuse = xs + ys;

	return Math.sqrt(hypotenuse + zs);
}

function spawnInBulletParticles(bulletModel) {
	for (var e = 0; e < 20; e++) {

		let randomSize = (Math.random() * 10) + 1;

		let randomColours = [0xe69155, 0xEEEE87, 0xe6c255, 0x211e1e, 0xa19494, 0xdb5a51];
		let randomNum = Math.floor(Math.random() * (randomColours.length - 1));

		let geometry = new THREE.BoxGeometry(randomSize, randomSize, randomSize);
		let material = new THREE.MeshLambertMaterial({ color: randomColours[randomNum] });

		let explosionObj = new THREE.Mesh(geometry, material);

		explosionObj.position.x = bulletModel.position.x + ((Math.random() * 15) - 7.5);
		explosionObj.position.y = bulletModel.position.y + ((Math.random() * 15) - 7.5);
		explosionObj.position.z = bulletModel.position.z + ((Math.random() * 15) - 7.5);

		scene.add(explosionObj);

		explosionParticleHolder.push(explosionObj);
	}
}

function runExplosionParticles(deltaTime) {
	let iMinus = 0;

	for (var i = 0; i < explosionParticleHolder.length; i++) {
		explosionParticleHolder[i - iMinus].scale.x -= 1 * deltaTime;
		explosionParticleHolder[i - iMinus].scale.y -= 1 * deltaTime;
		explosionParticleHolder[i - iMinus].scale.z -= 1 * deltaTime;

		if (explosionParticleHolder[i].scale.x < 0.001) {
			scene.remove(explosionParticleHolder[i]);
			explosionParticleHolder.splice(i, 1);

			iMinus += 1;
		}
	}
}

function checkCollisionsPlayer() {
	for (var i = 1; i < bullets.length; i += 1) {

		let camX = camera.position.x;
		let camY = camera.position.y;
		let camZ = camera.position.z;

		let cubePostionX = bullets[i][0].position.x;
		let cubePostionY = bullets[i][0].position.y;
		let cubePostionZ = bullets[i][0].position.z;

		let sphereRadius = 1;
		let bulletWidth = 2;

		let collisionBullet = false;

		let bulletDirection = bullets[i][0].getWorldDirection();
		let bullVectors = bulletDirection.multiplyScalar(bulletWidth);

		if (bullets[i][0].bulletsOwner != socket.id) {
			if (cubePostionX >= camX - (sphereRadius + Math.abs(bullVectors.x)) && cubePostionX <= camX + (sphereRadius + Math.abs(bullVectors.x))) {
				if (cubePostionZ >= camZ - (sphereRadius + Math.abs(bullVectors.z)) && cubePostionZ <= camZ + (sphereRadius + Math.abs(bullVectors.z))) {
					if (cubePostionY >= camY - player.height && cubePostionY <= camY) {
						collisionBullet = true;
						console.log("player hit")

						player.health -= Number(bullets[i][0].bulletDamageForPlayer);
						healthBar.value = player.health;
						healthBarCounter.innerText = player.health + " / " + player.maxHealth;

						scene.remove(bullets[i][0]);

						socket.emit("playerHitByBullet", bullets[i][0].bulletsOwner, socket.id, room);

						if (player.health < 1) {
							player.health = player.maxHealth;
							healthBar.value = player.health;
							socket.emit("playerHit", bullets[i][0].bulletsOwner, player.name, socket.id, room);

							// respawn player

							document.getElementById("respawnScreen").style.display = "flex";
							document.getElementById("respawnScreenMessage").innerText = "You were killed by " + playerNames[bullets[i][0].bulletsOwner];

							gravity = 0;

							camera.position.z = 80;
							camera.position.y = 60;
							camera.position.x = 40;

							camera.rotation.x = -1.3;
							camera.rotation.y = 0;
							camera.rotation.z = 0;

							let respawnTimerMenuScreen = setTimeout(beginRespawnPlayer, 5000);

						}
						// Clear the name
						bullets[i][0].bulletsOwner = socket.id;
					}
				}
			}
		}
	}
}

function checkBulletToMapCollisions() {
	for (var i = 1; i < bullets.length; i += 1) {
		for (var z = 0; z < gameMap.length; z++) {

			if (gameMap[z] == null) {
				continue;
			}

			let cubeSizeZ = (gameMap[z].scale.z) / 2;
			let cubeSizeX = (gameMap[z].scale.x) / 2;
			let cubeSizeY = (gameMap[z].scale.y) / 2;

			let cubePostionZ = gameMap[z].position.z;
			let cubePostionX = gameMap[z].position.x;
			let cubePostionY = gameMap[z].position.y;

			let camX = bullets[i][0].position.x;
			let camZ = bullets[i][0].position.z;
			let camY = bullets[i][0].position.y;

			let padding = -1;

			if (cubePostionX + cubeSizeX >= camX + padding && cubePostionX - cubeSizeX <= camX - padding) {
				if (cubePostionZ + cubeSizeZ >= camZ + padding && cubePostionZ - cubeSizeZ <= camZ - padding) {
					if (cubePostionY + cubeSizeY >= camY + padding && cubePostionY - cubeSizeY <= camY - padding) {
						// Remove bullet from the scene
						bullets[i][0].name = socket.id;
						bullets[i][0].bulletsOwner = socket.id;

						scene.remove(bullets[i][0]);

						areaDamageBullet(bullets[i][0]);
						bullets[i][0].hasExploded = true;

						console.log("Bullet hit scene " + i)
					}
				}
			}
		}
	}
}

// Events

window.addEventListener("resize", onWindowResize, false);

// Main Game Loop

function animate() {
	requestAnimationFrame(animate);

	FPSCounter++; // Add to FPS

	let delta = clock.getDelta();

	if (!canReloadGunWithR) {
		gunRotateTimerAddition -= (6.1 * delta) / (gunManager[weaponTracker.gunID].reload / 2);
	}
	else {
		gunRotateTimerAddition = 0;
	}

	gunSwayAdditionTimer[0] += 0.05;

	if (Math.abs(player.velocity.x + player.velocity.z) > 0.05) {
		gunSwayAdditionTimer[0] += 0.1;
		gunSwayAdditionTimer[1] = 0.03;

		if (keyboard["shift"] && keyboard["w"]) {
			gunSwayAdditionTimer[0] += 0.1;
			gunSwayAdditionTimer[1] = 0.05;
		}
	}
	else {
		gunSwayAdditionTimer[1] = 0.008;

		if (weaponTracker.gunID == 1) gunSwayAdditionTimer[0] -= 0.04;
	}

	// Slow down player mouse movement if scoping on sniper

	if (slowMovement == "sniper") {
		// Slow movement
		controls.speedFactor = 0.0003;
	}
	else if (slowMovement == "others") {
		// Slow movement
		controls.speedFactor = 0.001;
	}
	else {
		controls.speedFactor = 0.002;
	}

	processKeyboard(delta);

	physicsUpdate(delta);

	animateGrassObjects(delta);

	updateBulletPositions();
	checkCollisionsPlayer();
	checkBulletToMapCollisions();

	checkPlayerHitbox();

	updateLoadedModelsPositionAndRotation();

	pointHealthAtPlayer();

	runExplosionParticles(delta);

	if (gravity == 0) {
		moveCameraAroundMap();

		if (localPlayerArms != null) {
			localPlayerArms.visible = false;
		}
	}
	else {
		if (localPlayerArms != null) {
			localPlayerArms.visible = true;
		}
	}

	// Update player scores

	playerScoreDisplay.innerHTML = '<h3>Kills</h3>';

	for (let itemName in playerScores) {

		let itemValue = playerScores[itemName];

		if (itemName == null || itemValue == null) {
			continue;
		}

		let playerNameHolder = playerNames[itemName];

		let itemToAppend = document.createElement("p");
		itemToAppend.innerText = playerNameHolder + " : " + itemValue;

		if (itemName == socket.id) {
			itemToAppend.classList.add("players-name")
		}

		playerScoreDisplay.appendChild(itemToAppend);
	}

	// Add player kill count
	let playerKillCountDisplay = document.createElement("span");
	playerKillCountDisplay.innerText = "☠️ " + kills;
	playerScoreDisplay.appendChild(playerKillCountDisplay);

	// Shooting

	if (playerHasShot) {
		playerHasShot = false;

		player.height = player.savedHeight;
	}

	if (isShooting && gunManager[weaponTracker.gunID].ammoCount > 0 && canReloadGunWithR) {

		let waitPeriod = gunManager[weaponTracker.gunID].shootDelay;
		waitPeriod *= 1000; // Convert to milliseconds

		if (waitPeriod + lastShootTime < Date.now()) {
			lastShootTime = Date.now();

			gunManager[weaponTracker.gunID].ammoCount -= 1;

			// Play shoot sound

			gameSound[weaponTracker.gunID].currentTime = 0;
			gameSound[weaponTracker.gunID].play();

			moveGunToShoot = true; // Tell guns to animate

			document.getElementById("gunAmmoDisplay").innerText = `${gunManager[weaponTracker.gunID].ammoCount} | ${gunManager[weaponTracker.gunID].ammo}`;

			// Gun fires when the delay of shooting has been followed
			socket.emit("bullet", {
				socketID: socket.id,
				position: {
					x: round(camera.position.x),
					y: round(camera.position.y),
					z: round(camera.position.z)
				},
				rotation: camera.rotation,
				gunDamage: gunManager[weaponTracker.gunID].damage,
				gunID: weaponTracker.gunID,
				roomID: room
			})

		}

		// Refill ammo if it is empty

		if (gunManager[weaponTracker.gunID].ammoCount < 1) {
			canReloadGunWithR = false;
			document.getElementById("gunAmmoDisplay").innerText = "Reloading...";
			let ammoRefillWait = setTimeout(refillAmmoSlot, Number(gunManager[weaponTracker.gunID].reload) * 1000);

			gunShotRotationAnimation[2] = 0.5;

			reloadSounds[weaponTracker.gunID].currentTime = 0;
			reloadSounds[weaponTracker.gunID].play();
		}

		playerHasShot = true;
		player.height = player.savedHeight + 0.1;
	}

	// Communicate the data

	socket.emit("position", {
		position: {
			x: round(camera.position.x),
			y: round(camera.position.y),
			z: round(camera.position.z)
		},
		socketID: socket.id,
		kills: kills,
		name: player.name,
		gun: gunManager[weaponTracker.gunID].gunModel,
		currentDate: Date.now(),
		health: player.health,
		rotation: camera.rotation.y,
		roomID: room
	})

	renderer.render(scene, camera);
}

init();
setupMouseLook();
animate();

// Round values

function round(value) {
	return Math.round(value * 100) / 100;
}

// Respawn player

function beginRespawnPlayer() {
	document.getElementById("respawnScreen").style.display = "none";

	gravity = player.gravity;
	// Spawn player at position
	camera.position.x = 5;
	camera.position.y = 5;
	camera.position.z = 5;

	camera.rotation.x = 0;
	camera.rotation.y = 0;
	camera.rotation.z = 0;

	changePlayerWeaponOnRespawn()

	player.health = player.maxHealth
	healthBar.value = player.health;
	healthBarCounter.innerText = player.health + " / " + player.maxHealth;
	gunManager[weaponTracker.gunID].ammoCount = gunManager[weaponTracker.gunID].ammo;
	document.getElementById("gunNameDisplay").innerText = gunManager[weaponTracker.gunID].name;
}

// Refill ammo

function refillAmmoSlot() {
	gunManager[weaponTracker.gunID].ammoCount = Number(gunManager[weaponTracker.gunID].ammo);
	document.getElementById("gunAmmoDisplay").innerText = `${gunManager[weaponTracker.gunID].ammoCount} | ${gunManager[weaponTracker.gunID].ammo}`;

	canReloadGunWithR = true;
}

// Move camera around the map

function moveCameraAroundMap() {
	tempTimer += 0.01
	controls.moveRight(Math.sin(tempTimer) / 5);
	controls.moveForward(Math.cos(tempTimer) / 5);
}

// Join or create room setup

document.getElementById("begin-game").addEventListener("click", () => {
	let roomName = document.getElementById("room-name").value;

	room = roomName;

	uiData.playButtonSound();

	socket.emit("roomChange", [roomName, socket.id, worldMap]);

	for (var playerCharacter in playerHolders) {
		scene.remove(playerHolders[playerCharacter]);
	}

	gunManager[weaponTracker.gunID].ammoCount = Number(gunManager[weaponTracker.gunID].ammo);
	localStorage.setItem("gun", weaponTracker.gunID);

	document.getElementById("gunNameDisplay").innerText = gunManager[weaponTracker.gunID].name;
	document.getElementById("gunAmmoDisplay").innerText = gunManager[weaponTracker.gunID].ammo + " | " + gunManager[weaponTracker.gunID].ammo;

	document.getElementById("menu").classList.add("hidden");
	document.getElementById("menu").classList.remove("menu");

	document.getElementById("onJoinedRoomDisplay").style.display = "block";
	document.getElementById("roomNameDisplay").innerText = "Room Name: " + room;

	camera.position.x = 5;
	camera.position.y = 5;
	camera.position.z = 5;

	// Update footstep cache
	footstepCache.x = 5;
	footstepCache.y = 5;
	footstepCache.z = 5;

	player.name = document.getElementById("player-name").value;
	localStorage.setItem("username", player.name);

	playerScores = {};

	//Setup gravity
	gravity = player.gravity;

	// Load 3D models into scene
	setupGBLModelsAndAdd()

	if (window.innerWidth < 1200) {
		document.getElementById("mobile-controller").style.display = "flex";

		camera.rotation.x = 0;
	}
})

function updateFPS() {
	FPS = FPSCounter;
	FPSCounter = 0;
	FPSDisplay.innerText = `FPS: ${FPS}`;
}

FPSInterval = setInterval(updateFPS, 1000);

/* --------------------- */

let isCheckedBool = sessionStorage.getItem("antialiasing");

if (isCheckedBool == null) {
	isCheckedBool = "1"
}

if (isCheckedBool == "1") {
	document.getElementById("antialias-toggle").checked = true;
}
else {
	document.getElementById("antialias-toggle").checked = false;
}

document.getElementById("pixel-toggle").addEventListener("click", e => {
	if (!document.getElementById("pixel-toggle").checked) {
		renderer.setPixelRatio(window.devicePixelRatio * 0.7);
	}
	else {
		renderer.setPixelRatio(window.devicePixelRatio);
	}

	let inter = setTimeout(loadMap, 100);
})

document.getElementById("shadow-quality-toggle").addEventListener("click", e => {
	if (!document.getElementById("shadow-quality-toggle").checked) {
		renderer.shadowMap.type = THREE.BasicShadowMap;
	}
	else {
		renderer.shadowMap.type = THREE.PCFShadowMap;
	}

	let inter = setTimeout(loadMap, 100);
})

document.getElementById("antialias-toggle").addEventListener("click", e => {
	if (!document.getElementById("antialias-toggle").checked) {
		sessionStorage.setItem("antialiasing", "0");
	}
	else {
		sessionStorage.setItem("antialiasing", "1");
	}

	window.location.href = window.location.href;
})

/* renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor("#87CEEB")
	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap; */

// THREE.BasicShadowMap, THREE.PCFShadowMap, THREE.PCFSoftShadowMap, THREE.VSMShadowMap

function addMobileSupport() {
	document.getElementById("up-arrow-mobile").addEventListener("touchstart", e => {
		keyboard["w"] = true;
		keyboard["shift"] = true;
	})

	document.getElementById("up-arrow-mobile").addEventListener("touchend", e => {
		keyboard["w"] = false;
		keyboard["shift"] = false;
	})


	document.getElementById("down-arrow-mobile").addEventListener("touchstart", e => {
		keyboard["s"] = true;
	})

	document.getElementById("down-arrow-mobile").addEventListener("touchend", e => {
		keyboard["s"] = false;
	})


	document.getElementById("left-arrow-mobile").addEventListener("touchstart", e => {
		keyboard["a"] = true;
	})

	document.getElementById("left-arrow-mobile").addEventListener("touchend", e => {
		keyboard["a"] = false;
	})


	document.getElementById("right-arrow-mobile").addEventListener("touchstart", e => {
		keyboard["d"] = true;
	})

	document.getElementById("right-arrow-mobile").addEventListener("touchend", e => {
		keyboard["d"] = false;
	})


	document.getElementById("jump-arrow-mobile").addEventListener("touchstart", e => {
		keyboard[" "] = true;
	})

	document.getElementById("jump-arrow-mobile").addEventListener("touchend", e => {
		keyboard[" "] = false;
	})

	document.getElementById("shoot-mobile").addEventListener("touchstart", e => {
		isShooting = true;
	})

	document.getElementById("shoot-mobile").addEventListener("touchend", e => {
		isShooting = false;
	})

	document.getElementById("switch-gun-mobile").addEventListener("touchstart", e => {
		if (!weaponTracker.lastActiveWeaponKeypress) {
			switchPlayerGun();
		}
	})
}
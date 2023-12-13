const mainMenu = document.getElementById("menu");
const settingsMenu = document.getElementById("settings-menu");

document.getElementById("settings-menu-move").addEventListener("click", e => {
	settingsMenu.style.transform = "scale(1)";

	mainMenu.style.transform = "scale(0)";
})

document.getElementById("main-menu-move").addEventListener("click", e => {
	settingsMenu.style.transform = "scale(0)";

	mainMenu.style.transform = "scale(1)";
})
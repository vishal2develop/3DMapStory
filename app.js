const Wrld = require("wrld.js")
const story = require("./story")
const tracks = require("./tracks")

const keys = {
    wrld: "your_wrld_api_key",
    google: "your_google_api_key",
}

//you have to get your google map api keys 

window.addEventListener("load", async () => {
    //const address = encodeURIComponent("empire state building, new york")

    //const endpoint = "https://maps.googleapis.com/maps/api/geocode/json?"
      //  + "key=" + keys.google + "&address=" + address

     //console.log(endpoint)

    //const response = await fetch(endpoint)
//    const lookup = await response.json()

//     console.log(lookup) 
	 

    //const { lat, lng } = story[0]
	 const { lat, lng, zoom, color, seconds, image, text, time } = story[0]

    const map = Wrld.map("map", keys.wrld, {
        center: [lat, lng],
        zoom,
    })
	
	if (time) {
    map.themes.setTime(time)
}
	
	 map.on("initialstreamingcomplete", () => {
		 highlightBuildingAt(lat, lng, color,
		 elevation => showPopup(lat, lng, image, text, elevation)
		 )
		 
		 if (story.length > 1) {
        setTimeout(() => showNextEvent(1), seconds * 1000)
    }
       
    })
	
	let highlight = null
	//If no building at specified location, remove highlight
	const highlightBuildingAt = (lat, lng, color, onElevation) => {
		waitForElevation(onElevation)
    if (highlight) {
        highlight.remove()
    }
	
	highlight=  Wrld.buildings
            .buildingHighlight(
                Wrld.buildings
                    .buildingHighlightOptions()
                    .highlightBuildingAtLocation([lat, lng])
                    .color([125, 255, 125, 128]),
            )
            .addTo(map)
			
}

const showNextEvent = index => {
    const { lat, lng, zoom, degrees, color, seconds, image, text, time } = story[index]

    map.setView([lat, lng], zoom, {
        headingDegrees: degrees,
        animate: true,
        durationSeconds: 2.5,
    })

    setTimeout(() => {
		 if (time) {
            map.themes.setTime(time)
        }
        highlightBuildingAt(lat, lng, color,
		elevation => showPopup(lat, lng, image, text, elevation)
		)

        if (story.length > index + 1) {
            setTimeout(() => showNextEvent(index + 1), seconds * 1000)
        }
    }, 2.5 * 1000)
}

let elevation = 0

const waitForElevation = onElevation => {
    const listener = event => {
        map.buildings.off("buildinginformationreceived", listener)

        const information = event.buildingHighlight.getBuildingInformation()

        if (!information) {
            onElevation(0)
        } else {
            const dimensions = information.getBuildingDimensions()
            const ground = dimensions.getBaseAltitude()
            const elevation = dimensions.getTopAltitude() - ground

            onElevation(elevation)
        }
    }

    map.buildings.on("buildinginformationreceived", listener)
}

const nextTrack = () => {
    const index = Math.floor(Math.random() * tracks.length)

    const audio = new Audio(document.querySelector(tracks[index]).src)
    audio.addEventListener("ended", () => nextTrack())
    audio.play()
}

nextTrack()

let popup = null

const showPopup = (lat, lng, image, text, elevation) => {
    const src = document.querySelector(image).src

    const element1 = "<img class='image' src='" + src + "' />"
    const element2 = "<span class='text'>" + text + "</span>"
    const element3 = "<div class='popup'>" + element1 + element2 + "</div>"

    popup = L.popup({
        closeButton: false,
        autoPanPaddingTopLeft: 100,
        elevation: Math.max(20, elevation / 2),
    })
        .setLatLng(L.latLng(lat, lng))
        .setContent(element3)
        .openOn(map)
}

map.themes.setWeather(Wrld.themes.weather.Snowy)
})
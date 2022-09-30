"use strict";
// Selektory
const form = document.querySelector("form");
const vzdialenost = document.querySelector("#vzdialenost");
const cas = document.querySelector("#cas");
const typ = document.querySelector(".input-typ");
const infoVzdialenost = document.querySelector("#info-vzdialenost");
const infoCas = document.querySelector("#info-cas");
const infoVzdialenostzaMin = document.querySelector("#info-vzdialenostzaminutu");
const maptyInfo = document.querySelector(".maptyinfo");

class Trening{
    //získa čas
    casTeraz = new Date();
    //Vytvorí ID objektu podľa času vyrezaním posledných 10 čísiel.
    id = (`${Date.now()}`).slice(-10);
    //Vytvorí objekt tréning s parametrami
    constructor(vzdialenost,cas,coords){
        this.vzdialenost = vzdialenost;
        this.cas = cas;
        this.coords = coords;
    }
    //Vytvorí popis tréningu
    _popis(){
    const mesiace = ["Január", "Február", "Marec", "Apríl", "Máj","Jún", "Júl", "August","September", "Október", "November","December"];
    this.popis = `${this.typ[0].toUpperCase() +this.typ.slice(1)} ${this.casTeraz.getDate()}. ${mesiace[this.casTeraz.getMonth() + 1]}`
    }
}

class Beh extends Trening{
    //určí typ objektu
    typ = "beh";
    constructor(vzdialenost,cas,coords){
        //konštuktor prototypu Trening
        super(vzdialenost,cas,coords);
        //Vyráta rychlosť behu
        this.vyratajRychlost();
        //vytvorí popis ku konkrétnemu tréningu
        this._popis();
    };
    vyratajRychlost(){
        this.rychlost = this.cas / this.vzdialenost ;
        return this.rychlost;
    }
}

class Bicykel extends Trening{
    //určí typ objektu
    typ = "bicykel";
    constructor(vzdialenost,cas,coords){
        //konštuktor prototypu Trening
        super(vzdialenost,cas,coords);
        //Vyráta rychlosť behu
       this.vyratajRychlost();
       //vytvorí popis ku konkrétnemu tréningu
       this._popis();
    };
    vyratajRychlost(){
        this.rychlost = this.vzdialenost / (this.cas / 60) ;
        return this.rychlost;
    }}


// ARCHITECTURA APLIKÁCIE
class App{
    #map;
    #mapEvent;
    //Array s tréningami, vloží sa tú každý objekt-tréning
    #treningy = [];
    //Pri zapnutí aplikácie sa spustí konštruktor
    constructor(){
    //získa našu pozíciu
    this._ziskajPoziciu();
    //zobrazí už existujúce tréningy
    this._zobrazTreningyPamat();
    //Previaže odoslanie formy s novým tréningom
    form.addEventListener("submit", this._novyTrening.bind(this));
    //Previaže okno s centrovanim tréningu
    maptyInfo.addEventListener("click", this._centrujTrening.bind(this));
    
    };
    _ziskajPoziciu(){
        //Ak je povolená geolokácie v prehliadači
        if(navigator.geolocation){
            //tak získa našu pozíciu a načíta mapu
            navigator.geolocation.getCurrentPosition( this._nacitajMapu.bind(this),function(){
            //Ak geolokácia nie je povoľená tak hodí alert
            alert("Povoľte geolokáciu pre správne fungovanie aplikácie 💣.")}
            )
        }
    };
    _nacitajMapu(pozicia){
        //Načíta mapu s parametrom objektu z funkcie _ziskajPoziciu(this) - geolokácia
        const {latitude} = pozicia.coords;
        const {longitude} = pozicia.coords;
        //Súradnice z geolokácie uživateľa
        const coords = [latitude,longitude];

        //Leaflet Api mapa
        this.#map = L.map('map').setView(coords, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 20 ,
        attribution: '© OpenStreetMap'
        }).addTo(this.#map);  

        //po kliknutí na mapu spustí funkciu zobrazFormu
        this.#map.on("click", this._zobrazForm.bind(this))
        //pridá marker na mapu pre každý tréning(slúži pre zobrazenie markerov z local storage)
        this.#treningy.forEach(work => {
            this._pridajMarker(work);
          });
    };

    //Zobrazí form s parametrom kliknutia na mapku
    _zobrazForm(mapE){
            form.classList.remove("hidden");
            form.style.display = "block";
            //uloží kliknutie na mapke do - mapEventu
            this.#mapEvent = mapE;
            //Pri zobrazení formy sa sústredi na okno vzdialenosti
            vzdialenost.focus();
    };
    _schovajForm(){
        vzdialenost.value = cas.value = "";
        form.classList.add("hidden");
        form.style.display = "none";
    };
    _novyTrening(e){
        // zabráni aby sa forma odoslala
        e.preventDefault();
        //vytvorí let tréningu
        let trening;
        //Overí či zadané hodnoty pre tréning sú správne = Viac ako 0, Musí byť číslo
        const spravneHodnoty = (...hodnoty) => hodnoty.every(hodnota => Number.isFinite(hodnota));
        const plusHodnoty = (...hodnoty) => hodnoty.every(hodnota => hodnota > 0);

        //uloží zadané hodnoty do premenných a + ich premení na Číslo
        const typVal = typ.value;
        const vzdialenostVal = +vzdialenost.value; 
        const casVal = +cas.value;

        //Z kliknutia získa súradnice 
        const {lat,lng} = this.#mapEvent.latlng;
        const latlng = [lat,lng]

        //Ak sú zadané hodnoty čísla tak pokračujeme
        if(spravneHodnoty(vzdialenostVal,casVal) && plusHodnoty(vzdialenostVal,casVal)){
            //Ak je to beh 
               if(typVal === "Beh"){
                trening = new Beh(vzdialenostVal,casVal,latlng)
             } 
            //Ak je to bicykel
                if(typVal === "Bicykel"){
                    trening = new Bicykel(vzdialenostVal,casVal,latlng)
                 }  
                 //Zobrazí tréning na ľavej strane(html)
                 this._zobrazTrening(trening)
                 //Vloží vytvorený tréning objekt do array s tréningami
                 this.#treningy.push(trening);
             }
            //Ak zadané hodnoty nie sú čísla tak nás upozorní a vráti
            else {
                alert("Nesprávne hodnoty, zadajte čísla ktoré sú viac ako 0 😶‍🌫️");
                form.classList.add("hidden");
                return;
            }
            //Pridá marker na Stránku s parametrami
            this._pridajMarker(trening);

            //Pridá tréning do lokálnej pamäťe prehliadača
            this._pridajNaPamat()
    };
    //Pridá značku na mapu
_pridajMarker(trening){
    L.marker(trening.coords).addTo(this.#map).bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${trening.typ}-popup`,
    })).setPopupContent(`${trening.typ === "beh" ? "🏃‍♂️" : "🚴"} ${trening.popis}`) 
    .openPopup()
    //Schová form
    this._schovajForm();
};
//Zobrazenie tréningu naľavo (html)
_zobrazTrening(trening){
let html;

html = `
<div class="workout-info" data-id=${trening.id}>
<h4 class="text-center">${trening.typ === "beh" ? "🏃‍♂️" : "🚴"} ${trening.popis}</h4>
<div class="flexik">
<p id="info-vzdialenost">🛣️ ${trening.vzdialenost} km</p>
<p id="info-cas">⏱️ ${trening.cas} min</p>
<p id="info-vzdialenostzaminutu">⚡${trening.rychlost.toFixed(1)} ${trening.typ === "beh" ? "min/km" : "km/h"}</p>
</div>
</div>
` 
//Vloží html do okna
form.insertAdjacentHTML("afterend",html);

};
//Vycentruje tréning na mape po kliknutí v okne 
_centrujTrening(e){
    //Po kliknutí na element uloží kliknutý element do premennej
    const treningEl = e.target.closest('.workout-info');
    //Ak neuloží do premmenej ten element tak nás vráti
    if(!treningEl) return;
    //Premenná do ktorej úloží objekt ktorý nájde podľa zadaného ID
    const trening = this.#treningy.find(tren => 
        tren.id === treningEl.dataset.id
        );
    //Vycentruje mapu podľa objektu
        this.#map.setView(trening.coords,13 ,{
            animate: true,
            pan: {
                duration:1 ,
            },
        })
};
_pridajNaPamat(){
    //Vloží tréningy do lokálnej pamäte prehliadača
    localStorage.setItem("treningy", JSON.stringify(this.#treningy));
};
_zobrazTreningyPamat(){
    //získa data z lokálnej pomäte prehliadača
    const data = JSON.parse(localStorage.getItem("treningy"));
    //Ak nezíska žiadne dáta tak sa vráti (guard clause)
    if(!data) return;
    //vloží data do array s treningami
    this.#treningy = data;
    //Zobrazí tréningy z pamäti
    this.#treningy.forEach(tren =>
       this._zobrazTrening(tren) )
};
}

const app = new App();





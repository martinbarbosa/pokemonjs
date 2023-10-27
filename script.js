document.addEventListener("DOMContentLoaded", function(){
const boton_busqueda= document.getElementById("searchButton")
const boton_evolution= document.getElementById("evolutionbutton")
const boton_home= document.getElementById("homebutton")
let pokemonName= null


async function consultaPokemon(pokemonName){
boton_home.style.display='block'
//Consumo la funcion que extrae la info basica del pokemon en base al nombre
const data = await extractPokemodDetails(pokemonName)
//Consumo la funcion para extraer la descripcion y la url de evolucion
const dataDescription = await getPokemonDescription(data.idPokemon)
//Consumo la tercer funcion para obtener las posibles evoluciones del pokemon
const pokemonEvolutions = await getEvolutions(dataDescription.evolutionChain)

//Pintamos en el front la informacion basica extraida del pokemon
pokemonInfo.innerHTML = `
    <h2>${data.name}</h2>
    <img src="${data.img}" alt="${data.name}">
    <p>Descripción: ${dataDescription.flavorText}</p>
    <p>Habilidades: ${data.abilities.map((ability) => ability.ability.name).join(', ')}</p>`;

console.log(pokemonEvolutions)
console.log(pokemonEvolutions.length)
if(pokemonEvolutions.length> 1){

    const posicionPokemon= pokemonEvolutions.indexOf(pokemonName)

if (posicionPokemon+1==pokemonEvolutions.length){
    boton_evolution.style.display='none'
}else{
    boton_evolution.style.display= 'flex'
}

    
}else{
    boton_evolution.style.display= 'none'
}

boton_evolution.addEventListener("click", async function (){

evolucionarPokemon(pokemonEvolutions, pokemonName)


})

if (data.evolutions && data.evolutions.length > 0) {
    pokemonInfo.innerHTML += `<button id="evolutionButton">Evolucionar</button>`;
    document.getElementById("evolutionButton").addEventListener("click", function () {
        window.location.href = `evolution.html?pokemon=${data.evolutions[0].name}`;
    });
}


}


boton_busqueda.addEventListener("click", async function () {
     pokemonName = document.getElementById("pokemonName").value.toLowerCase();

    consultaPokemon(pokemonName)
    
});

async function evolucionarPokemon(arregloEvolucion, pokemonName){

const posicionPokemon= arregloEvolucion.indexOf(pokemonName)
console.log("esta es la posicion del pokemon" + posicionPokemon+ pokemonName)
console.log(arregloEvolucion.length)
if (posicionPokemon+1==arregloEvolucion.length){
    boton_evolution.style.display='none'
}
if (posicionPokemon+1< arregloEvolucion.length){
    pokemonName= arregloEvolucion[posicionPokemon+1]
consultaPokemon(pokemonName)
    console.log(pokemonName)
}else {
    boton_evolution.style.display='none'
}
}
//Funcion para obtener la informacion basica del pokemon
async function extractPokemodDetails(pokemonName){
    try{

        //se realiza el consumo de la API principal
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const pokemonData = response.data;

        // Extraigo los datos de interés
        const data = {
            name: pokemonData.name,
            abilities: pokemonData.abilities,
            img: pokemonData.sprites.other['official-artwork'].front_default,
            species: pokemonData.species,
            idPokemon: pokemonData.id
        };

        //retorno lo datos extraido
        return data
    }catch(error){
        console.log('Error al obtener el pokemon ' + error)
        const pokemonInfo = document.getElementById("pokemonInfo");
        pokemonInfo.innerHTML = "¡Pokémon no encontrado!";
    }
}

//Funcion para obtener la descripcion del pokemon en español y la url de la cadena de evolucion
async function getPokemonDescription(id_pokemon){
    try{
        // Consumo el API de species para obtener descripción y URL de cadena de evolución
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id_pokemon}`);

        // Depuración necesaria para ir entendiendo y saber cómo manejar los datos que recibes
        console.log(`La petición a la API se completó correctamente con status: ${response.status}`);

        // Filtra el primer flavor text en inglés
        const flavorTextEntries = response.data['flavor_text_entries'];
        let spanishFlavorText = '';
        for (const entry of flavorTextEntries) {
            if (entry.language.name === 'es') {
                spanishFlavorText = entry.flavor_text;
                break; // Al encontrar el primer entry en ingles, lo extraigo
            }
        }

        // Extraigo los datos de interés
        const data = {
            flavorText: spanishFlavorText,
            evolutionChain: response.data['evolution_chain']['url'],
        };

        // Los retorno de la función
        return data;

    } catch(error){
        //Mostrar error de campo vacio
        console.error(`fallo la petición a la api con error: ${error.message}`);
    }    
}

async function getEvolutions(evolutionChainUrl) {
    try {
        //Consumo el API de de cadena de evolucion
        const response = await axios.get(evolutionChainUrl);

        //depuracion necesaria para ir entendiendo y saber como manejar los datos que recibia 
        console.log(`La petición a la cadena de evolución se completó correctamente con status: ${response.status}`);
        
        //Extraer el arreglo con la cadena de evolucion
        const chainData = response.data.chain;
        const evolutions = [];
        
        //Funcion para extraer los nombres de los pokemons en orden de evolucion
        function extractEvolutions(chain) {
            if (chain.species && chain.species.name) {
                evolutions.push(chain.species.name);
            }
            if (chain.evolves_to && chain.evolves_to.length > 0) {
                chain.evolves_to.forEach(subchain => {
                    extractEvolutions(subchain);
                });
            }
        }
        
        //Ejecutamos la funcion
        extractEvolutions(chainData);
        
        //Retorno el arreglo con la lista ordenada de evolucion del pokemon
        return evolutions;

    } catch (error) {
        //Mostrar error de campo vacio
        console.error(`fallo la petición a la api con error: ${error.message}`);
    }
}

})
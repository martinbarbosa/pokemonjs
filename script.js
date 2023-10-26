document.getElementById("searchButton").addEventListener("click", function () {
    const pokemonName = document.getElementById("pokemonName").value.toLowerCase();
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}/`;

    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            const pokemonInfo = document.getElementById("pokemonInfo");
            pokemonInfo.innerHTML = `
                <h2>${data.name}</h2>
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <p>Descripción: ${data.species.name}</p>
                <p>Habilidades: ${data.abilities.map((ability) => ability.ability.name).join(', ')}</p>
            `;
            if (data.evolutions && data.evolutions.length > 0) {
                pokemonInfo.innerHTML += `<button id="evolutionButton">Evolucionar</button>`;
                document.getElementById("evolutionButton").addEventListener("click", function () {
                    window.location.href = `evolution.html?pokemon=${data.evolutions[0].name}`;
                });
            }
        })
        .catch((error) => {
            const pokemonInfo = document.getElementById("pokemonInfo");
            pokemonInfo.innerHTML = "¡Pokémon no encontrado!";
        });
});
